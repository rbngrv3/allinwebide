const STORAGE_PREFIX = 'all-in-studio.plugin-data.v1.';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export class PluginHost {
  constructor(studio) {
    this.studio = studio;
    this.instances = new Map();
    this.panels = new Map();
    this.commands = new Map();
    this.activePanelKey = null;
    this.networkApprovals = new Set();
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  encode(value) {
    const bytes = new TextEncoder().encode(String(value)); let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  permissionsFor(plugin) {
    const source = plugin?.permissions && typeof plugin.permissions === 'object' ? plugin.permissions : {};
    return {
      panel: Boolean(source.panel), storage: Boolean(source.storage), workspaceRead: Boolean(source.workspaceRead),
      activeEditor: Object.hasOwn(source, 'activeEditor') ? Boolean(source.activeEditor) : this.studio.settings.legacyExtensionEditorAccess,
      networkDomains: Array.isArray(source.networkDomains) ? source.networkDomains.map((item) => String(item).toLowerCase()).filter(Boolean).slice(0, 20) : []
    };
  }

  contextFor(plugin) {
    const activeFile = this.studio.activeFile;
    const permissions = this.permissionsFor(plugin);
    const workspaceFiles = [];
    if (permissions.workspaceRead) {
      let used = 0;
      for (const file of this.studio.state.files) {
        const content = String(file.content || '');
        if (used + content.length > 650_000) break;
        workspaceFiles.push({ path: file.path, content }); used += content.length;
      }
    }
    return { activeFilePath: activeFile?.path || '', editorValue: permissions.activeEditor ? (activeFile?.content || '') : '', workspaceFiles };
  }

  makeFrame(plugin, surface, panelKey = '') {
    const nonce = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const source = this.encode(plugin.source);
    const context = this.encode(JSON.stringify(this.contextFor(plugin)));
    const frame = document.createElement('iframe');
    frame.className = surface === 'status' ? 'plugin-widget-frame' : 'extension-panel-frame';
    frame.sandbox = 'allow-scripts';
    frame.title = `${plugin.name} ${surface === 'status' ? 'status' : 'Hub'} sandbox`;
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'">
<style>html,body{margin:0;width:100%;height:100%;background:${surface === 'status' ? 'transparent' : '#111a29'};color:#dbe5fa;font:12px ui-sans-serif,system-ui,sans-serif;${surface === 'status' ? 'white-space:nowrap;overflow:hidden' : 'overflow:auto'}}#plugin-root{display:block;min-height:${surface === 'status' ? '20px' : '100%'};padding:${surface === 'status' ? '3px 0' : '0'};overflow:hidden;text-overflow:ellipsis}i{color:#91a6ff;font-style:normal}</style><div id="plugin-root"></div>
<script>
(() => {
  const pluginId=${JSON.stringify(plugin.id)}, nonce=${JSON.stringify(nonce)}, surface=${JSON.stringify(surface)}, panelKey=${JSON.stringify(panelKey)};
  const decode=value=>new TextDecoder().decode(Uint8Array.from(atob(value),char=>char.charCodeAt(0)));
  const source=decode(${JSON.stringify(source)}), initialContext=JSON.parse(decode(${JSON.stringify(context)}));
  const commands=new Map(), pending=new Map(); let sequence=0, context=Object.freeze(initialContext), instance;
  const send=(type,detail={})=>parent.postMessage({studioExtension:true,pluginId,nonce,surface,panelKey,type,...detail},'*');
  const request=(type,detail={})=>new Promise((resolve,reject)=>{const requestId=pluginId+':'+(++sequence)+':'+Date.now();pending.set(requestId,{resolve,reject});send(type,{...detail,requestId});setTimeout(()=>{if(pending.has(requestId)){pending.delete(requestId);reject(new Error('Extension host did not respond in time.'));}},25000);});
  const IDE=Object.freeze({
    version:3,
    context:Object.freeze({pluginId,host:'all-in-studio',apiVersion:3,sandbox:true,surface}),
    getSurface:()=>surface,
    getPanelRoot:()=>surface==='panel'?document.getElementById('plugin-root'):null,
    getActiveEditorValue:()=>context.editorValue,
    getActiveFilePath:()=>context.activeFilePath,
    getWorkspaceFiles:()=>Array.isArray(context.workspaceFiles)?context.workspaceFiles.map(file=>({...file})):[],
    registerPanel:definition=>send('panel',{id:String(definition?.id||'main').slice(0,80),title:String(definition?.title||pluginId).slice(0,80),icon:String(definition?.icon||'◈').slice(0,4),description:String(definition?.description||'').slice(0,180)}),
    registerCommand(id,label,handler){if(typeof label==='function'){handler=label;label=id;}if(typeof handler!=='function')throw new Error('A command needs a handler function.');commands.set(id,handler);send('command',{id,label:String(label||id)});},
    addStatusBarItem(markup){if(surface!=='status')return;const template=document.createElement('template');template.innerHTML=String(markup).slice(0,600);const root=document.getElementById('plugin-root');root.replaceChildren(template.content.cloneNode(true));const label=root.innerText.trim().replace(/\\s+/g,' ').slice(0,80);send('widget',{label,width:Math.max(86,Math.min(220,28+label.length*6.5))});},
    storage:Object.freeze({get:(key,fallback=null)=>request('storage-get',{key:String(key).slice(0,100),fallback}),set:(key,value)=>request('storage-set',{key:String(key).slice(0,100),value})}),
    request:options=>request('request',{options:options&&typeof options==='object'?options:{}}),
    showMessage:(message,kind='info')=>send('message',{message:String(message).slice(0,220),kind}),
    log:message=>send('log',{message:String(message).slice(0,500)})
  });
  addEventListener('message',event=>{const data=event.data;if(!data?.studioExtensionCommand)return;if(data.type==='response'&&data.requestId){const waiting=pending.get(data.requestId);if(!waiting)return;pending.delete(data.requestId);data.ok===false?waiting.reject(new Error(data.error||'Extension request failed.')):waiting.resolve(data.value);return;}if(data.type==='context')context=Object.freeze({...context,...data.context});if(data.type==='run'){try{const result=commands.get(data.id)?.();if(result?.catch)result.catch(error=>send('error',{message:error.message}));}catch(error){send('error',{message:error.message});}}if(data.type==='deactivate'){try{instance?.deactivate?.();}catch(error){send('error',{message:error.message});}}});
  try{const factory=new Function('IDE','"use strict";\\n'+source);instance=factory(IDE);if(instance&&typeof instance.activate==='function')instance.activate();send('ready');}catch(error){send('error',{message:error.message||String(error)});}
})();
<\/script>`;
    return { frame, nonce };
  }

  async enable(plugin) {
    if (this.instances.has(plugin.id)) return true;
    if (!plugin.source) throw new Error('This extension has no source code to run.');
    if (plugin.source.length > 300000) throw new Error('This extension is too large for the sandbox limit.');
    const sandbox = this.makeFrame(plugin, 'status');
    this.instances.set(plugin.id, { ...plugin, ...sandbox });
    document.getElementById('plugin-widgets')?.appendChild(sandbox.frame);
    this.updateContext();
    return true;
  }

  disable(id) {
    const instance = this.instances.get(id); if (!instance) return;
    instance.frame.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'deactivate' }, '*'); instance.frame.remove();
    [...this.panels.entries()].filter(([, panel]) => panel.pluginId === id).forEach(([key, panel]) => { panel.frame.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'deactivate' }, '*'); panel.frame.remove(); this.panels.delete(key); });
    [...this.commands.entries()].filter(([, command]) => command.pluginId === id).forEach(([key]) => this.commands.delete(key));
    this.instances.delete(id); if (this.activePanelKey && !this.panels.has(this.activePanelKey)) this.activePanelKey = null; this.renderHub();
  }

  updateContext() {
    this.instances.forEach((instance) => {
      const context = this.contextFor(instance);
      instance.frame.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'context', context }, '*');
      this.panels.forEach((panel) => { if (panel.pluginId === instance.id) panel.frame.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'context', context }, '*'); });
    });
  }

  runCommand(key) { const command = this.commands.get(key); command?.frame?.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'run', id: command.id }, '*'); }

  recordForEvent(message, event) {
    const instance = this.instances.get(message.pluginId);
    if (instance && event.source === instance.frame.contentWindow && message.nonce === instance.nonce) return { instance, frame: instance.frame, status: true };
    const panel = [...this.panels.values()].find((item) => item.pluginId === message.pluginId && event.source === item.frame.contentWindow && message.nonce === item.nonce);
    return panel ? { instance: this.instances.get(panel.pluginId), frame: panel.frame, panel } : null;
  }
  respond(frame, requestId, value, error = '') { frame.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'response', requestId, ok: !error, value, error }, '*'); }

  registerPanel(instance, message) {
    if (!this.permissionsFor(instance).panel) return this.studio.log('warn', `${instance.name} requested a Hub panel without permission.`);
    const panelId = String(message.id || 'main').replace(/[^a-z0-9_-]/gi, '').slice(0, 80) || 'main'; const key = `${instance.id}:${panelId}`;
    if (this.panels.has(key)) return;
    const sandbox = this.makeFrame(instance, 'panel', key);
    const panel = { key, pluginId: instance.id, panelId, title: String(message.title || instance.name).slice(0, 80), icon: String(message.icon || '◈').slice(0, 4), description: String(message.description || instance.description || '').slice(0, 180), ...sandbox };
    this.panels.set(key, panel); this.studio.dom.extensionHubPanels?.appendChild(panel.frame); if (!this.activePanelKey) this.activePanelKey = key; this.renderHub();
  }

  renderHub() {
    const list = this.studio.dom.extensionHubList; if (!list) return;
    const panels = [...this.panels.values()];
    list.innerHTML = panels.length ? panels.map((panel) => `<button class="extension-hub-item ${panel.key === this.activePanelKey ? 'active' : ''}" data-plugin-panel="${escapeHtml(panel.key)}"><span class="extension-mark">${escapeHtml(panel.icon)}</span><span><strong>${escapeHtml(panel.title)}</strong><span>${escapeHtml(panel.description || 'Open extension workspace')}</span></span></button>`).join('') : '<p class="side-copy">Installed extensions with a Hub workspace will appear here.</p>';
    this.studio.dom.extensionHubEmpty?.classList.toggle('hidden', Boolean(this.activePanelKey && this.panels.has(this.activePanelKey)));
    this.panels.forEach((panel) => panel.frame.classList.toggle('active', panel.key === this.activePanelKey));
  }

  showPanel(key) { if (!this.panels.has(key)) return; this.activePanelKey = key; this.renderHub(); }

  async handleStorage(instance, frame, message) {
    if (!this.permissionsFor(instance).storage) return this.respond(frame, message.requestId, null, 'This extension was not granted local storage access.');
    const storeKey = `${STORAGE_PREFIX}${instance.id}`; const store = this.studio.readStorage(storeKey, {}); const key = String(message.key || '').slice(0, 100);
    if (!key) return this.respond(frame, message.requestId, null, 'A storage key is required.');
    if (message.type === 'storage-get') return this.respond(frame, message.requestId, Object.hasOwn(store, key) ? store[key] : message.fallback);
    try { if (JSON.stringify(message.value).length > 120000) throw new Error('Values are limited to 120 KB.'); store[key] = message.value; localStorage.setItem(storeKey, JSON.stringify(store)); this.respond(frame, message.requestId, true); } catch (error) { this.respond(frame, message.requestId, null, error.message); }
  }

  async handleRequest(instance, frame, message) {
    const permissions = this.permissionsFor(instance); const options = message.options && typeof message.options === 'object' ? message.options : {}; let target;
    try { target = new URL(String(options.url || '')); } catch { return this.respond(frame, message.requestId, null, 'Enter a complete request URL.'); }
    const hostname = target.hostname.toLowerCase(); const declared = permissions.networkDomains.includes('*') || permissions.networkDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    if (!declared) return this.respond(frame, message.requestId, null, `${instance.name} was not installed with access to ${hostname}.`);
    const approvalKey = `${instance.id}:${hostname}`;
    if (!this.networkApprovals.has(approvalKey)) {
      if (!window.confirm(`${instance.name} wants to connect to ${hostname}. Allow this connection for this session?`)) return this.respond(frame, message.requestId, null, 'Connection was not approved.');
      this.networkApprovals.add(approvalKey);
    }
    try {
      const payload = { url: target.toString(), method: String(options.method || 'GET').toUpperCase(), headers: options.headers || {}, body: options.body || '', allowedDomains: permissions.networkDomains };
      const result = window.studio?.pluginRequest ? await window.studio.pluginRequest(payload) : await this.browserRequest(payload);
      if (!result?.ok) return this.respond(frame, message.requestId, null, result?.error || 'The host could not complete the request.');
      this.respond(frame, message.requestId, result);
    } catch (error) { this.respond(frame, message.requestId, null, error.message || 'The request failed.'); }
  }

  async browserRequest(payload) {
    const response = await fetch(payload.url, { method: payload.method, headers: payload.headers, body: ['GET', 'DELETE'].includes(payload.method) ? undefined : payload.body });
    return { ok: true, status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()), body: (await response.text()).slice(0, 700000), truncated: false };
  }

  handleMessage(event) {
    const message = event.data; if (!message?.studioExtension) return;
    const record = this.recordForEvent(message, event); if (!record?.instance) return;
    const { instance, frame, status } = record;
    if (message.type === 'ready') return this.studio.log('info', `${instance.name} is ready in its sandbox.`);
    if (message.type === 'error') { this.studio.log('error', `${instance.name}: ${message.message}`); return this.studio.toast(`${instance.name} could not run.`, 'error'); }
    if (message.type === 'message') return this.studio.toast(message.message, message.kind === 'error' ? 'error' : 'success');
    if (message.type === 'log') return this.studio.log('info', `[${instance.name}] ${message.message}`);
    if (message.type === 'widget' && status) { frame.style.width = `${Math.max(86, Math.min(220, Number(message.width) || 118))}px`; frame.setAttribute('aria-label', message.label || `${instance.name} status item`); return; }
    if (message.type === 'command' && message.id) this.commands.set(`${instance.id}:${message.id}`, { pluginId: instance.id, id: message.id, label: message.label, frame });
    if (message.type === 'panel') this.registerPanel(instance, message);
    if (message.type === 'storage-get' || message.type === 'storage-set') this.handleStorage(instance, frame, message);
    if (message.type === 'request') this.handleRequest(instance, frame, message);
  }
}
