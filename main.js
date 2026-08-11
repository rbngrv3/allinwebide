const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
let pty;
try { pty = require('node-pty'); } catch (error) { console.warn('node-pty is unavailable; using the stream terminal fallback.', error.message); }

let mainWindow;
let activeProjectRoot = null;
const terminals = new Map();
const terminalDirectories = new Map();

const TEXT_EXTENSIONS = new Set([
  '.html', '.htm', '.css', '.scss', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.json', '.md', '.txt', '.svg', '.xml', '.yml', '.yaml', '.toml', '.py', '.java',
  '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.sql', '.sh', '.ps1'
]);
const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache', 'coverage']);
const MAX_FILE_BYTES = 1_000_000;
const MAX_FILE_COUNT = 750;
const MAX_PLUGIN_RESPONSE_BYTES = 700_000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 620,
    frame: false,
    backgroundColor: '#0b1020',
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadFile(path.join(__dirname, 'studio.html'));
}

function safeRelativePath(value) {
  const normalized = path.normalize(String(value || '')).replace(/^([/\\])+/, '');
  if (!normalized || normalized === '.' || normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error('That file path is not valid for this workspace.');
  }
  return normalized;
}

async function readProject(root) {
  const files = [];
  async function visit(current, relative = '') {
    if (files.length >= MAX_FILE_COUNT) return;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= MAX_FILE_COUNT) return;
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) await visit(path.join(current, entry.name), path.join(relative, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!TEXT_EXTENSIONS.has(extension)) continue;
      const absolute = path.join(current, entry.name);
      const stats = await fs.stat(absolute);
      if (stats.size > MAX_FILE_BYTES) continue;
      files.push({ path: path.join(relative, entry.name).replace(/\\/g, '/'), content: await fs.readFile(absolute, 'utf8') });
    }
  }
  await visit(root);
  return files;
}

ipcMain.handle('window:control', (_event, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if (action === 'close') mainWindow.close();
});

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  activeProjectRoot = result.filePaths[0];
  return { canceled: false, rootName: path.basename(activeProjectRoot), files: await readProject(activeProjectRoot) };
});

ipcMain.handle('project:save', async (_event, payload) => {
  if (!activeProjectRoot) return { ok: false, reason: 'Choose a project folder before saving to disk.' };
  const files = Array.isArray(payload?.files) ? payload.files.slice(0, MAX_FILE_COUNT) : [];
  for (const file of files) {
    const relative = safeRelativePath(file.path);
    const destination = path.resolve(activeProjectRoot, relative);
    if (!destination.startsWith(path.resolve(activeProjectRoot) + path.sep)) throw new Error('Workspace path escaped the selected folder.');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, String(file.content ?? ''), 'utf8');
  }
  return { ok: true, path: activeProjectRoot };
});

ipcMain.handle('project:reveal', async () => {
  if (!activeProjectRoot) return false;
  const { shell } = require('electron');
  shell.showItemInFolder(activeProjectRoot);
  return true;
});

ipcMain.handle('plugin:request', async (_event, payload) => {
  const rawUrl = String(payload?.url || '').trim();
  const allowedDomains = Array.isArray(payload?.allowedDomains) ? payload.allowedDomains.map((item) => String(item).toLowerCase()) : [];
  let target;
  try { target = new URL(rawUrl); } catch { return { ok: false, error: 'Enter a complete URL.' }; }
  const localHttp = target.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(target.hostname);
  if (!(target.protocol === 'https:' || localHttp)) return { ok: false, error: 'Only HTTPS URLs are allowed, except local development servers.' };
  const hostname = target.hostname.toLowerCase();
  const allowed = allowedDomains.includes('*') || allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  if (!allowed) return { ok: false, error: `This extension is not approved for ${hostname}.` };
  const requestedHeaders = payload?.headers && typeof payload.headers === 'object' ? payload.headers : {};
  const headers = {};
  Object.entries(requestedHeaders).slice(0, 30).forEach(([key, value]) => {
    if (/^(host|content-length|connection|proxy-)/i.test(key)) return;
    headers[String(key).slice(0, 120)] = String(value).slice(0, 8_000);
  });
  const method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(payload?.method || 'GET').toUpperCase()) ? String(payload?.method || 'GET').toUpperCase() : 'GET';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(target, { method, headers, body: ['GET', 'DELETE'].includes(method) ? undefined : String(payload?.body || '').slice(0, 500_000), signal: controller.signal, redirect: 'follow' });
    const reader = response.body?.getReader(); let total = 0; const chunks = [];
    if (reader) {
      while (total < MAX_PLUGIN_RESPONSE_BYTES) {
        const { done, value } = await reader.read(); if (done) break;
        total += value.byteLength; chunks.push(value);
      }
    }
    const bytes = new Uint8Array(Math.min(total, MAX_PLUGIN_RESPONSE_BYTES)); let offset = 0;
    chunks.forEach((chunk) => { const remaining = bytes.length - offset; if (remaining > 0) { bytes.set(chunk.subarray(0, remaining), offset); offset += Math.min(chunk.length, remaining); } });
    return { ok: true, status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()), body: new TextDecoder().decode(bytes), truncated: total >= MAX_PLUGIN_RESPONSE_BYTES };
  } catch (error) { return { ok: false, error: error.name === 'AbortError' ? 'Request timed out after 20 seconds.' : error.message }; }
  finally { clearTimeout(timeout); }
});

function shellForPlatform(profile = 'default') {
  if (process.platform === 'win32') {
    if (profile === 'powershell') return { file: 'powershell.exe', args: ['-NoLogo'] };
    if (profile === 'command-prompt') return { file: process.env.ComSpec || 'cmd.exe', args: [] };
    return { file: process.env.ComSpec || 'powershell.exe', args: process.env.ComSpec ? [] : ['-NoLogo'] };
  }
  if (profile === 'zsh') return { file: '/bin/zsh', args: ['-l'] };
  if (profile === 'bash') return { file: '/bin/bash', args: ['-l'] };
  return { file: process.env.SHELL || '/bin/bash', args: ['-l'] };
}

function registerTerminal(id, event, terminal) {
  terminals.set(id, terminal);
  return { ok: true, id, mode: terminal.mode };
}

function createStreamTerminal(id, event, shell) {
  const child = spawn(shell.file, shell.args, {
    cwd: activeProjectRoot || __dirname,
    env: { ...process.env, TERM: 'xterm-256color' },
    windowsHide: true,
    stdio: 'pipe'
  });
  child.stdout.on('data', (data) => event.sender.send('terminal:data', { id, data: data.toString() }));
  child.stderr.on('data', (data) => event.sender.send('terminal:data', { id, data: data.toString() }));
  child.on('error', (error) => event.sender.send('terminal:data', { id, data: `Terminal error: ${error.message}\r\n` }));
  child.on('close', (exitCode) => {
    event.sender.send('terminal:exit', { id, exitCode: exitCode ?? 0 });
    terminals.delete(id);
  });
  return { mode: 'stream', write: (data) => child.stdin.write(String(data || '')), resize: () => {}, kill: () => child.kill() };
}

function commandSpec(command, profile = 'default') {
  if (process.platform === 'win32') {
    if (profile !== 'command-prompt') return { file: 'powershell.exe', args: ['-NoLogo', '-NoProfile', '-Command', command] };
    return { file: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', command] };
  }
  if (profile === 'zsh') return { file: '/bin/zsh', args: ['-lc', command] };
  return { file: '/bin/bash', args: ['-lc', command] };
}

ipcMain.handle('terminal:execute', async (event, payload) => {
  const command = String(payload?.command || '').trim();
  if (!command) return { ok: true, output: '', exitCode: 0 };
  const senderId = event.sender.id;
  let cwd = terminalDirectories.get(senderId) || activeProjectRoot || __dirname;
  const changeDirectory = command.match(/^cd\s+(.+)$/i);
  if (changeDirectory) {
    const requested = changeDirectory[1].trim().replace(/^("|')|("|')$/g, '');
    const candidate = path.resolve(cwd, requested || '.');
    try {
      const stats = await fs.stat(candidate);
      if (!stats.isDirectory()) throw new Error('Not a directory.');
      terminalDirectories.set(senderId, candidate);
      return { ok: true, output: `Directory changed to ${candidate}\n`, exitCode: 0, cwd: candidate };
    } catch (error) { return { ok: false, output: `cd: ${error.message}\n`, exitCode: 1, cwd }; }
  }
  const spec = commandSpec(command, payload?.profile);
  return new Promise((resolve) => {
    let output = ''; let finished = false;
    const processHandle = spawn(spec.file, spec.args, { cwd, env: { ...process.env, TERM: 'xterm-256color' }, windowsHide: true, stdio: 'pipe' });
    const finish = (ok, exitCode) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve({ ok, output: output.slice(-500000), exitCode: exitCode ?? 0, cwd });
    };
    const append = (data) => { output += data.toString(); if (output.length > 600000) output = output.slice(-500000); };
    processHandle.stdout.on('data', append);
    processHandle.stderr.on('data', append);
    processHandle.on('error', (error) => { output += `Terminal error: ${error.message}\n`; finish(false, 1); });
    processHandle.on('close', (exitCode) => finish(exitCode === 0, exitCode));
    const timeout = setTimeout(() => { output += '\nCommand stopped after 60 seconds.\n'; processHandle.kill(); finish(false, 124); }, 60000);
  });
});

ipcMain.handle('terminal:create', (event, profile) => {
  const id = `${event.sender.id}:${Date.now()}`;
  const shell = shellForPlatform(profile);
  if (pty) {
    try {
    const processHandle = pty.spawn(shell.file, shell.args, {
      name: 'xterm-256color',
      cols: 100,
      rows: 26,
      cwd: activeProjectRoot || __dirname,
      env: { ...process.env, TERM: 'xterm-256color' }
    });
    processHandle.onData((data) => event.sender.send('terminal:data', { id, data }));
    processHandle.onExit(({ exitCode }) => {
      event.sender.send('terminal:exit', { id, exitCode });
      terminals.delete(id);
    });
      return registerTerminal(id, event, { mode: 'pty', write: (data) => processHandle.write(String(data || '')), resize: (cols, rows) => processHandle.resize(cols, rows), kill: () => processHandle.kill() });
    } catch (error) {
      console.warn('PTY terminal failed; falling back to stream terminal.', error.message);
    }
  }
  try {
    return registerTerminal(id, event, createStreamTerminal(id, event, shell));
  } catch (error) {
    return { ok: false, message: `Could not start a local shell: ${error.message}` };
  }
});

ipcMain.on('terminal:write', (_event, id, data) => terminals.get(id)?.write(String(data || '')));
ipcMain.on('terminal:resize', (_event, id, cols, rows) => {
  const processHandle = terminals.get(id);
  if (processHandle?.mode === 'pty' && Number.isFinite(cols) && Number.isFinite(rows)) processHandle.resize(Math.max(20, cols), Math.max(5, rows));
});
ipcMain.on('terminal:close', (_event, id) => {
  const processHandle = terminals.get(id);
  if (processHandle) processHandle.kill();
  terminals.delete(id);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => terminals.forEach((terminal) => terminal.kill()));
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
