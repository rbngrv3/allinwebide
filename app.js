import { AcademyEngine } from './academy.js';
import { PluginHost } from './plugin-host.js';

const WORKSPACE_KEY = 'all-in-studio.workspace.v3';
const SETTINGS_KEY = 'all-in-studio.settings.v3';
const HISTORY_KEY = 'all-in-studio.history.v3';
const PLUGINS_KEY = 'all-in-studio.plugins.v3';
const PLUGIN_STORAGE_PREFIX = 'all-in-studio.plugin-data.v1.';
const PROJECT_BRIEF_KEY = 'all-in-studio.project-brief.v1';
const VISUAL_HISTORY_KEY = 'all-in-studio.visual-history.v1';
const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/rbngrv3/allinwebide/main/plugins.json';

const seedFiles = [
  {
    path: 'index.html', 
    content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Atlas - Launch workspace</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body>
  <div class="ambient ambient-one"></div>
  <div class="ambient ambient-two"></div>
  
  <main class="page-shell fade-in">
    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Atlas home">
        <span class="wordmark-mark"></span>atlas
      </a>
      <nav aria-label="Main navigation">
        <a href="#today">Today</a>
        <a href="#projects">Projects</a>
        <a href="#notes">Notes</a>
      </nav>
      <button class="avatar" type="button" aria-label="Open profile">MR</button>
    </header>

    <section class="hero" id="top">
      <div class="hero-content">
        <p class="eyebrow">THURSDAY, 09:42</p>
        <h1>Make space for<br><span class="gradient-text">the work that matters.</span></h1>
        <p class="lede">Atlas turns a busy launch into a clear, focused plan. This is your editable starting point.</p>
        <div class="hero-actions">
          <button class="focus-button" id="focus-button">
            <i class="ph ph-target"></i> Start focus session
          </button>
          <a class="quiet-link" href="#today">See today's plan <i class="ph ph-arrow-right"></i></a>
        </div>
        <p class="focus-message" id="focus-message" aria-live="polite"></p>
      </div>
      
      <aside class="signal-card" aria-label="Weekly momentum">
        <div class="signal-top">
          <span>WEEKLY PULSE</span>
          <span class="live-badge"><i class="ph-fill ph-circle"></i> LIVE</span>
        </div>
        <div class="signal-number"><strong id="progress-number">68</strong><span>%</span></div>
        <div class="signal-track"><span id="progress-bar"></span></div>
        <p><b id="completed-count">3</b> of 5 priority moves complete</p>
        <div class="mini-chart" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i class="active"></i>
        </div>
      </aside>
    </section>

    <section class="content-grid" id="today">
      <section class="plan-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">TODAY'S FOCUS</p>
            <h2>Move the launch forward.</h2>
          </div>
          <span class="count-pill" id="task-count">2 left</span>
        </div>
        <ul class="task-list" id="task-list">
          <li class="task done">
            <button class="task-toggle" aria-label="Toggle task" aria-pressed="true"><i class="ph ph-check"></i></button>
            <div><strong>Research wrap-up</strong><span>Share the final customer notes with the team.</span></div>
            <time>09:30</time>
          </li>
          <li class="task done">
            <button class="task-toggle" aria-label="Toggle task" aria-pressed="true"><i class="ph ph-check"></i></button>
            <div><strong>Product narrative</strong><span>Frame the value in one sharp sentence.</span></div>
            <time>11:00</time>
          </li>
          <li class="task">
            <button class="task-toggle" aria-label="Toggle task" aria-pressed="false"><i class="ph ph-check"></i></button>
            <div><strong>Landing page review</strong><span>Resolve the last three content notes.</span></div>
            <time>14:00</time>
          </li>
          <li class="task">
            <button class="task-toggle" aria-label="Toggle task" aria-pressed="false"><i class="ph ph-check"></i></button>
            <div><strong>Launch note</strong><span>Draft the update people will actually read.</span></div>
            <time>16:30</time>
          </li>
        </ul>
      </section>
      
      <aside class="side-stack" id="projects">
        <article class="project-card hover-lift">
          <div class="project-orb violet"></div>
          <div>
            <span class="project-label">ACTIVE PROJECT</span>
            <h3>Signal / v1</h3>
            <p>Interface direction and final copy</p>
          </div>
          <span class="project-arrow"><i class="ph ph-caret-right"></i></span>
        </article>
        <article class="project-card hover-lift">
          <div class="project-orb mint"></div>
          <div>
            <span class="project-label">NEXT UP</span>
            <h3>Member moments</h3>
            <p>First-run experience</p>
          </div>
          <span class="project-arrow"><i class="ph ph-caret-right"></i></span>
        </article>
      </aside>
    </section>

    <footer id="notes">
      <span>ATLAS WORKSPACE</span>
      <span>Less noise. More signal.</span>
    </footer>
  </main>
  <script src="script.js"></script>
</body>
</html>`
  },
  {
    path: 'style.css', 
    content: `:root {
  --ink: #eef2ff;
  --muted: #aab4cb;
  --line: rgba(196, 210, 255, 0.15);
  --violet: #a78bfa;
  --mint: #70e0bd;
  --night: #0a0f1e;
  --glass: rgba(17, 25, 47, 0.62);
  --glass-hover: rgba(25, 35, 65, 0.8);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  min-width: 320px; min-height: 100vh;
  margin: 0; overflow-x: hidden;
  color: var(--ink); background: var(--night);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
}

/* Ambient Background Animations */
.ambient {
  position: fixed; z-index: -1;
  width: 42rem; height: 42rem;
  border-radius: 50%; filter: blur(20px);
  opacity: 0.35; pointer-events: none;
  animation: float 10s ease-in-out infinite alternate;
}
.ambient-one {
  top: -20rem; right: -10rem;
  background: radial-gradient(circle, #594aa2, transparent 66%);
}
.ambient-two {
  bottom: -25rem; left: -15rem;
  background: radial-gradient(circle, #196d69, transparent 64%);
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, 30px) scale(1.05); }
}

/* Layout */
.page-shell {
  width: min(1120px, calc(100% - 40px));
  margin: auto;
}
.fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 88px; border-bottom: 1px solid var(--line);
}
.wordmark {
  display: inline-flex; align-items: center; gap: 0.55rem;
  color: var(--ink); text-decoration: none;
  font-size: 1.18rem; font-weight: 800; letter-spacing: -0.06em;
}
.wordmark-mark {
  width: 18px; height: 18px;
  border: 2px solid var(--violet);
  border-radius: 5px 9px 5px 9px;
  transform: rotate(45deg);
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.55);
}
.topbar nav { display: flex; gap: 1.5rem; }
.topbar nav a, .quiet-link {
  color: var(--muted); text-decoration: none;
  font-size: 0.85rem; font-weight: 600;
  transition: color 0.2s;
}
.topbar nav a:hover, .quiet-link:hover { color: var(--ink); }
.avatar {
  display: grid; place-items: center;
  width: 36px; height: 36px; padding: 0;
  border: 1px solid var(--line); border-radius: 50%;
  color: #24163f; background: linear-gradient(135deg, #d6c7ff, #8df0d2);
  font-size: 0.75rem; font-weight: 800; cursor: pointer;
  transition: transform 0.2s;
}
.avatar:hover { transform: scale(1.05); }

/* Hero Section */
.hero {
  display: grid; grid-template-columns: 1.18fr 0.82fr; gap: 4rem;
  align-items: center; padding: 6.4rem 0 5.4rem;
}
.eyebrow {
  margin: 0 0 0.7rem; color: #aaa1ff;
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.16em;
}
.hero h1 {
  max-width: 680px; margin: 0;
  font-size: clamp(3rem, 6vw, 5.5rem);
  letter-spacing: -0.04em; line-height: 1;
}
.gradient-text {
  color: transparent;
  background: linear-gradient(100deg, #bdabff, #80e7cf);
  -webkit-background-clip: text; background-clip: text;
}
.lede {
  max-width: 520px; margin: 1.45rem 0 0;
  color: var(--muted); font-size: 1.06rem; line-height: 1.72;
}

/* Buttons */
.hero-actions {
  display: flex; align-items: center; gap: 1.5rem;
  margin-top: 2.5rem;
}
.focus-button {
  display: inline-flex; align-items: center; gap: 0.8rem;
  padding: 0.8rem 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.6rem;
  color: #1b1531; background: linear-gradient(135deg, #c3b0ff, #7ee4ce);
  box-shadow: 0 12px 34px rgba(104, 92, 196, 0.25);
  cursor: pointer; font: 700 0.9rem inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.focus-button i { font-size: 1.2rem; }
.focus-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(104, 92, 196, 0.4);
}
.focus-message {
  min-height: 1.25rem; margin: 1rem 0 0;
  color: var(--mint); font-size: 0.85rem; font-weight: 600;
  transition: opacity 0.3s;
}

/* Signal Card (Pulse) */
.signal-card {
  padding: 1.8rem; border: 1px solid var(--line); border-radius: 1.2rem;
  background: linear-gradient(145deg, rgba(31, 39, 72, 0.85), rgba(14, 21, 42, 0.78));
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.22), inset 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
.signal-top, .section-heading {
  display: flex; justify-content: space-between; align-items: center;
}
.signal-top > span:first-child, .project-label {
  color: var(--muted); font-size: 0.65rem; font-weight: 800; letter-spacing: 0.14em;
}
.live-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 0.3rem 0.5rem; border-radius: 99px;
  color: #90f4d9; background: rgba(112, 224, 189, 0.15);
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em;
}
.live-badge i { font-size: 0.5rem; animation: pulse-dot 2s infinite; }

@keyframes pulse-dot {
  0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; }
}

.signal-number {
  display: flex; align-items: baseline; gap: 0.2rem;
  margin: 1.5rem 0 0.8rem;
}
.signal-number strong { font-size: 4.5rem; letter-spacing: -0.06em; line-height: 1; }
.signal-number span { color: #9fa9c6; font-size: 1.25rem; }

.signal-track {
  height: 8px; overflow: hidden; border-radius: 9px;
  background: rgba(255, 255, 255, 0.08);
}
.signal-track span {
  display: block; width: 0%; height: 100%; border-radius: inherit;
  background: linear-gradient(90deg, var(--violet), var(--mint));
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.signal-card p { color: var(--muted); font-size: 0.85rem; margin-top: 1rem; }
.signal-card p b { color: var(--ink); }

.mini-chart {
  display: flex; align-items: flex-end; gap: 6px;
  height: 54px; margin-top: 1.5rem;
}
.mini-chart i {
  display: block; flex: 1;
  border-radius: 4px 4px 1px 1px;
  background: linear-gradient(180deg, rgba(167, 139, 250, 0.6), rgba(112, 224, 189, 0.2));
  transition: height 0.3s, background 0.3s;
}
.mini-chart i.active { background: linear-gradient(180deg, var(--violet), var(--mint)); }
.mini-chart i:nth-child(1) { height: 32%; } .mini-chart i:nth-child(2) { height: 48%; }
.mini-chart i:nth-child(3) { height: 42%; } .mini-chart i:nth-child(4) { height: 73%; }
.mini-chart i:nth-child(5) { height: 55%; } .mini-chart i:nth-child(6) { height: 86%; }
.mini-chart i:nth-child(7) { height: 100%; }

/* Content Grid & Tasks */
.content-grid {
  display: grid; grid-template-columns: 1.45fr 0.78fr; gap: 1.5rem;
  padding-bottom: 4rem;
}
.plan-card, .project-card {
  border: 1px solid var(--line); border-radius: 1.2rem;
  background: var(--glass); backdrop-filter: blur(10px);
}
.plan-card { padding: 2rem; }
.section-heading h2 { margin: 0.4rem 0 0; font-size: 1.6rem; letter-spacing: -0.04em; }
.count-pill {
  padding: 0.4rem 0.8rem; border-radius: 99px;
  color: #c7beff; background: rgba(167, 139, 250, 0.12);
  font-size: 0.75rem; font-weight: 700; transition: all 0.3s;
}

.task-list { display: grid; gap: 0.5rem; margin: 1.5rem 0 0; padding: 0; list-style: none; }
.task {
  display: grid; grid-template-columns: 28px 1fr auto; gap: 1rem;
  align-items: center; padding: 1rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: opacity 0.3s;
}
.task:last-child { border-bottom: none; }
.task-toggle {
  width: 26px; height: 26px; padding: 0; display: grid; place-items: center;
  border: 1px solid rgba(190, 203, 242, 0.4); border-radius: 50%;
  color: transparent; background: transparent; cursor: pointer;
  transition: all 0.2s;
}
.task-toggle i { font-size: 14px; opacity: 0; transition: opacity 0.2s; }
.task-toggle:hover { border-color: var(--mint); }

.task.done .task-toggle {
  color: #152638; border-color: var(--mint); background: var(--mint);
}
.task.done .task-toggle i { opacity: 1; }

.task strong { display: block; font-size: 0.95rem; transition: color 0.3s; }
.task.done strong { color: #64748b; text-decoration: line-through; }
.task span { display: block; margin-top: 0.3rem; color: var(--muted); font-size: 0.8rem; }
.task time { color: #8f9bbb; font: 0.75rem ui-monospace, SFMono-Regular, Consolas, monospace; }

/* Side Stack / Projects */
.side-stack { display: grid; gap: 1.2rem; align-content: start; }
.project-card {
  display: flex; align-items: center; gap: 1rem;
  min-height: 120px; padding: 1.2rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}
.hover-lift:hover {
  background: var(--glass-hover);
  transform: translateY(-3px);
  border-color: rgba(167, 139, 250, 0.3);
}
.project-orb { width: 40px; height: 40px; flex: 0 0 auto; border-radius: 12px; }
.project-orb.violet {
  background: linear-gradient(135deg, #bda7ff, #5843a0);
  box-shadow: 0 0 24px rgba(167, 139, 250, 0.38);
}
.project-orb.mint {
  background: linear-gradient(135deg, #8df0d2, #27756a);
  box-shadow: 0 0 24px rgba(112, 224, 189, 0.26);
}
.project-card h3 { margin: 0.3rem 0; font-size: 0.95rem; }
.project-card p { margin: 0; color: var(--muted); font-size: 0.8rem; }
.project-arrow {
  margin-left: auto; color: #bac6e5;
  transition: transform 0.2s; font-size: 1.2rem;
}
.project-card:hover .project-arrow { transform: translateX(4px); color: var(--violet); }

/* Footer */
footer {
  display: flex; justify-content: space-between;
  padding: 1.5rem 0 3rem; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
}

/* Focus Mode State */
body.focus-mode .ambient-one { background: radial-gradient(circle, #2e845f, transparent 66%); }
body.focus-mode .focus-button {
  background: linear-gradient(135deg, #a8f0d4, #5dbfa2);
  color: #0b1f17;
}

button:focus-visible, a:focus-visible {
  outline: 2px solid var(--violet); outline-offset: 4px;
}

/* Responsive */
@media (max-width: 850px) {
  .page-shell { width: min(100% - 32px, 620px); }
  .topbar { min-height: 68px; }
  .topbar nav { display: none; }
  .hero, .content-grid { grid-template-columns: 1fr; gap: 2rem; }
  .hero { padding: 4rem 0 3rem; }
  .hero h1 { font-size: clamp(3.2rem, 12vw, 4.5rem); }
  .signal-card { max-width: 100%; }
  .content-grid { padding-bottom: 2rem; }
}

@media (max-width: 480px) {
  .hero-actions { align-items: flex-start; flex-direction: column; gap: 1rem; }
  .task { grid-template-columns: 26px 1fr; }
  .task time { grid-column: 2; margin-top: -0.5rem; }
  .section-heading { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .section-heading h2 { font-size: 1.3rem; }
  footer { gap: 0.8rem; flex-direction: column; text-align: center; }
}
`
  },
  {
    path: 'script.js', 
    content: `const focusButton = document.querySelector('#focus-button');
const focusMessage = document.querySelector('#focus-message');
const taskList = document.querySelector('#task-list');

// Utility to create a tiny burst effect for checking tasks
function createBurst(x, y) {
  const burst = document.createElement('div');
  burst.style.position = 'fixed';
  burst.style.left = x + 'px';
  burst.style.top = y + 'px';
  burst.style.width = '10px';
  burst.style.height = '10px';
  burst.style.background = 'var(--mint)';
  burst.style.borderRadius = '50%';
  burst.style.pointerEvents = 'none';
  burst.style.transform = 'translate(-50%, -50%) scale(1)';
  burst.style.opacity = '1';
  burst.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  burst.style.zIndex = '100';
  document.body.appendChild(burst);

  requestAnimationFrame(() => {
    burst.style.transform = 'translate(-50%, -50%) scale(4)';
    burst.style.opacity = '0';
  });

  setTimeout(() => burst.remove(), 400);
}

function refreshProgress() {
  const tasks = [...document.querySelectorAll('.task')];
  const completed = tasks.filter((task) => task.classList.contains('done')).length;
  const progress = Math.round((completed / tasks.length) * 100);
  
  // Update text values
  document.querySelector('#completed-count').textContent = completed;
  
  // Animate number counting up/down
  const progressEl = document.querySelector('#progress-number');
  progressEl.textContent = progress;
  
  // Set bar width with a small delay for smoother initial load
  setTimeout(() => {
    document.querySelector('#progress-bar').style.width = progress + '%';
  }, 50);
  
  // Update remaining pill
  const remaining = tasks.length - completed;
  const countPill = document.querySelector('#task-count');
  countPill.textContent = remaining === 0 ? 'All done!' : remaining + ' left';
  
  if (remaining === 0) {
    countPill.style.background = 'var(--mint)';
    countPill.style.color = '#152638';
  } else {
    countPill.style.background = 'rgba(167, 139, 250, 0.12)';
    countPill.style.color = '#c7beff';
  }
}

focusButton.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
  const active = document.body.classList.contains('focus-mode');
  
  focusButton.innerHTML = active 
    ? '<i class="ph ph-target"></i> Focus session running' 
    : '<i class="ph ph-target"></i> Start focus session';
    
  focusMessage.style.opacity = '0';
  setTimeout(() => {
    focusMessage.textContent = active 
      ? 'Focus mode is on. Protect the next 25 minutes.' 
      : 'Focus mode paused. Your plan is waiting.';
    focusMessage.style.opacity = '1';
  }, 200);
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('.task-toggle');
  if (!button) return;
  
  const task = button.closest('.task');
  const isDone = task.classList.toggle('done');
  button.setAttribute('aria-pressed', String(isDone));
  
  if (isDone) {
    const rect = button.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
  
  refreshProgress();
});

// Initialize
refreshProgress();`
  }
];

const defaultSettings = {
  theme: 'midnight', accent: '#6d7cff', density: 'comfortable', reducedMotion: false,
  fontSize: 14, fontFamily: 'Cascadia Code, Consolas, monospace', lineHeight: 21, tabSize: 2, insertSpaces: true,
  wordWrap: 'off', minimap: false, lineNumbers: 'on', renderWhitespace: 'selection', cursorStyle: 'line', cursorBlinking: 'blink',
  smoothScrolling: true, stickyScroll: true, indentationGuides: true, bracketColorization: true, codeFolding: true, autoClosingBrackets: 'languageDefined', formatOnSave: false,
  previewDelay: 450, autoPreview: true, previewDevice: 'desktop', previewConsole: true, previewForms: true,
  historyLimit: 50, autoSave: true, autoSaveDelay: 800, terminalStart: false, terminalWelcome: true, terminalProfile: 'default', terminalFontSize: 12, terminalScrollback: 2000,
  showStatusBar: true, showActivityBar: true, sidebarWidth: 272, registryUrl: DEFAULT_REGISTRY, restorePlugins: true, legacyExtensionEditorAccess: true,
  showStartupOnLaunch: true, githubRepo: '', githubBranch: 'main'
};

const languageByExtension = {
  html: 'html', htm: 'html', css: 'css', scss: 'scss', js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', json: 'json', md: 'markdown', xml: 'xml', svg: 'xml', yml: 'yaml', yaml: 'yaml', py: 'python', java: 'java', c: 'c', cpp: 'cpp', h: 'cpp', cs: 'csharp', php: 'php', rb: 'ruby', go: 'go', rs: 'rust', sql: 'sql', sh: 'shell', ps1: 'powershell', txt: 'plaintext'
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const emptyProjectBrief = () => ({ goal: '', audience: '', stack: '', notes: '', tasks: [] });
const normalizePath = (value) => String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').replace(/^\.\//, '');
const extensionOf = (path) => (normalizePath(path).split('.').pop() || '').toLowerCase();
const languageFor = (path) => languageByExtension[extensionOf(path)] || 'plaintext';
const fileIcon = (path) => ({ html: '◇', css: '◆', js: '◈', ts: '◈', json: '{}', md: '≡' }[extensionOf(path)] || '·');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
const cleanMessage = (value) => String(value ?? '').replace(/\x1B\[[0-?]*[ -\/]*[@-~]/g, '');
const pluginPermissionSummary = (plugin) => {
  const permissions = plugin?.permissions && typeof plugin.permissions === 'object' ? plugin.permissions : {};
  const labels = [];
  if (permissions.panel) labels.push('Hub panel'); if (permissions.storage) labels.push('local extension storage'); if (permissions.workspaceRead) labels.push('workspace read access');
  if (Object.hasOwn(permissions, 'activeEditor') ? permissions.activeEditor : true) labels.push('active editor text');
  if (Array.isArray(permissions.networkDomains) && permissions.networkDomains.length) labels.push(`network: ${permissions.networkDomains.join(', ')}`);
  return labels.length ? labels.join('; ') : 'commands and status only';
};
const isLocalDevelopmentUrl = (url) => url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
const isAllowedExtensionUrl = (url) => url.protocol === 'https:' || isLocalDevelopmentUrl(url);
const encodeBase64 = (value) => {
  const bytes = new TextEncoder().encode(String(value)); let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};
const decodeBase64 = (value) => {
  const binary = atob(String(value || '').replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
};
const githubPath = (path) => normalizePath(path).split('/').map((part) => encodeURIComponent(part)).join('/');

function migrateWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY));
    if (saved?.files?.length) return saved;
  } catch { /* start clean */ }
  try {
    const legacy = JSON.parse(localStorage.getItem('AllInStudio_VFS'));
    if (legacy?.files && typeof legacy.files === 'object') {
      return {
        name: legacy.projectName || 'Migrated Project',
        files: Object.entries(legacy.files).map(([path, file]) => ({ path: normalizePath(path), content: typeof file?.content === 'string' ? file.content : '' })),
        activePath: legacy.activeFileId || 'index.html', openPaths: [legacy.activeFileId || 'index.html']
      };
    }
  } catch { /* start with seed */ }
  return { name: 'Welcome project', files: clone(seedFiles), activePath: 'index.html', openPaths: ['index.html'] };
}

function normalizeWorkspace(value) {
  const sourceFiles = Array.isArray(value?.files) ? value.files : clone(seedFiles);
  const seen = new Set();
  const files = sourceFiles.map((file) => ({ path: normalizePath(file.path), content: String(file.content ?? '') }))
    .filter((file) => file.path && !seen.has(file.path) && seen.add(file.path));
  if (!files.length) files.push(...clone(seedFiles));
  const activePath = files.some((file) => file.path === value?.activePath) ? value.activePath : files[0].path;
  const openPaths = Array.from(new Set((Array.isArray(value?.openPaths) ? value.openPaths : [activePath]).filter((path) => files.some((file) => file.path === path))));
  return { name: String(value?.name || 'Untitled Project'), files, activePath, openPaths: openPaths.length ? openPaths : [activePath] };
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const crcTable = Array.from({ length: 256 }, (_, index) => {
    let c = index;
    for (let bit = 0; bit < 8; bit += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    return c >>> 0;
  });
  const crc32 = (bytes) => {
    let value = 0xffffffff;
    for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
    return (value ^ 0xffffffff) >>> 0;
  };
  const u16 = (value) => Uint8Array.of(value & 255, (value >>> 8) & 255);
  const u32 = (value) => Uint8Array.of(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255);
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const chunks = []; const central = []; let offset = 0;
  for (const file of files) {
    const name = encoder.encode(normalizePath(file.path)); const content = encoder.encode(String(file.content)); const checksum = crc32(content);
    const local = [u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(checksum), u32(content.length), u32(content.length), u16(name.length), u16(0), name, content];
    chunks.push(...local);
    const entry = [u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(checksum), u32(content.length), u32(content.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name];
    central.push(...entry); offset += local.reduce((total, part) => total + part.length, 0);
  }
  const centralSize = central.reduce((total, part) => total + part.length, 0);
  const end = [u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralSize), u32(offset), u16(0)];
  return new Blob([...chunks, ...central, ...end], { type: 'application/zip' });
}

class LegacyPluginHost {
  constructor(studio) {
    this.studio = studio;
    this.instances = new Map();
    this.commands = new Map();
    this.boundMessage = (event) => this.handleMessage(event);
    window.addEventListener('message', this.boundMessage);
  }

  sourceToBase64(source) {
    const bytes = new TextEncoder().encode(source);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  getContext() {
    const activeFile = this.studio.activeFile;
    return { activeFilePath: activeFile?.path || '', editorValue: this.studio.settings.legacyExtensionEditorAccess ? (activeFile?.content || '') : '' };
  }

  updateContext() {
    const context = this.getContext();
    this.instances.forEach((instance) => instance.iframe.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'context', context }, '*'));
  }

  async enable(plugin) {
    if (this.instances.has(plugin.id)) return true;
    if (!plugin.source) throw new Error('This extension has no source code to run.');
    if (plugin.source.length > 300000) throw new Error('This extension is too large for the sandbox limit.');
    const payload = this.sourceToBase64(plugin.source);
    const contextPayload = this.sourceToBase64(JSON.stringify(this.getContext()));
    const nonce = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const iframe = document.createElement('iframe');
    iframe.className = 'plugin-widget-frame';
    iframe.sandbox = 'allow-scripts';
    iframe.title = `${plugin.name} extension sandbox`;
    // A srcdoc frame may execute as soon as its document is assigned, before it is appended.
    this.instances.set(plugin.id, { ...plugin, iframe, nonce });
    iframe.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'">
<style>html,body{margin:0;width:100%;min-height:20px;background:transparent;color:#b5c1d8;font:10px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden}#widget-root{display:block;min-height:20px;padding:3px 0;overflow:hidden;text-overflow:ellipsis}i{color:#91a6ff;font-style:normal}span{color:#e8eeff}</style>
<div id="widget-root"></div>
<script>
(() => {
  const pluginId = ${JSON.stringify(plugin.id)};
  const hostNonce = ${JSON.stringify(nonce)};
  const bytes = Uint8Array.from(atob(${JSON.stringify(payload)}), c => c.charCodeAt(0));
  const source = new TextDecoder().decode(bytes);
  const contextBytes = Uint8Array.from(atob(${JSON.stringify(contextPayload)}), c => c.charCodeAt(0));
  const initialContext = JSON.parse(new TextDecoder().decode(contextBytes));
  const commands = new Map();
  const send = (type, detail = {}) => parent.postMessage({ studioExtension: true, pluginId, nonce: hostNonce, type, ...detail }, '*');
  let context = Object.freeze(initialContext);
  const api = Object.freeze({
    version: 2,
    registerCommand(id, label, handler) {
      if (typeof label === 'function') { handler = label; label = id; }
      if (typeof handler !== 'function') throw new Error('A command needs a handler function.');
      commands.set(id, handler); send('command', { id, label: String(label || id) });
    },
    addStatusBarItem(markup) {
      const template = document.createElement('template');
      template.innerHTML = String(markup).slice(0, 600);
      const root = document.getElementById('widget-root');
      root.replaceChildren(template.content.cloneNode(true));
      const label = root.innerText.trim().replace(/\\s+/g, ' ').slice(0, 80);
      send('widget', { label, width: Math.max(86, Math.min(220, 28 + label.length * 6.5)) });
    },
    getActiveEditorValue() { return context.editorValue; },
    getActiveFilePath() { return context.activeFilePath; },
    showMessage(message, kind = 'info') { send('message', { message: String(message).slice(0, 220), kind }); },
    log(message) { send('log', { message: String(message).slice(0, 500) }); },
    context: Object.freeze({ pluginId, host: 'all-in-studio', apiVersion: 2, sandbox: true })
  });
  let instance;
  addEventListener('message', event => {
    if (!event.data || event.data.studioExtensionCommand !== true) return;
    if (event.data.type === 'run') {
      try { const result = commands.get(event.data.id)?.(); if (result?.catch) result.catch(error => send('error', { message: error.message })); }
      catch (error) { send('error', { message: error.message }); }
    }
    if (event.data.type === 'deactivate') { try { instance?.deactivate?.(); } catch (error) { send('error', { message: error.message }); } }
    if (event.data.type === 'context') context = Object.freeze({ ...context, ...event.data.context });
  });
  try {
    const factory = new Function('IDE', '"use strict";\\n' + source);
    instance = factory(api);
    if (instance && typeof instance.activate === 'function') instance.activate();
    send('ready');
  } catch (error) { send('error', { message: error.message || String(error) }); }
})();
<\/script>`;
    document.getElementById('plugin-widgets')?.appendChild(iframe);
    this.updateContext();
    return true;
  }

  disable(id) {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.iframe.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'deactivate' }, '*');
    instance.iframe.remove();
    [...this.commands.entries()].filter(([, command]) => command.pluginId === id).forEach(([commandId]) => this.commands.delete(commandId));
    this.instances.delete(id);
  }

  runCommand(id) { const command = this.commands.get(id); command?.iframe?.contentWindow?.postMessage({ studioExtensionCommand: true, type: 'run', id }, '*'); }

  handleMessage(event) {
    const message = event.data;
    if (!message?.studioExtension || !this.instances.has(message.pluginId)) return;
    const instance = this.instances.get(message.pluginId);
    if (message.nonce !== instance.nonce) return;
    if (message.type === 'ready') { this.studio.log('info', `${instance.name} is ready in its sandbox.`); return; }
    if (message.type === 'error') { this.studio.log('error', `${instance.name}: ${message.message}`); this.studio.toast(`${instance.name} could not run.`, 'error'); return; }
    if (message.type === 'message') { this.studio.toast(message.message, message.kind === 'error' ? 'error' : 'success'); return; }
    if (message.type === 'log') { this.studio.log('info', `[${instance.name}] ${message.message}`); return; }
    if (message.type === 'widget') { instance.iframe.style.width = `${Math.max(86, Math.min(220, Number(message.width) || 118))}px`; instance.iframe.setAttribute('aria-label', message.label || `${instance.name} status item`); return; }
    if (message.type === 'command' && message.id) this.commands.set(`${message.pluginId}:${message.id}`, { pluginId: message.pluginId, id: message.id, label: message.label, iframe: instance.iframe });
  }
}

class Studio {
  constructor() {
    this.state = normalizeWorkspace(migrateWorkspace());
    this.upgradeWelcomeStarter();
    this.settings = { ...defaultSettings, ...this.readStorage(SETTINGS_KEY, {}) };
    if (this.settings.theme === 'graphite') this.settings.theme = 'slate';
    if (this.settings.theme === 'dawn') this.settings.theme = 'paper';
    this.history = this.readStorage(HISTORY_KEY, []);
    const storedBriefs = this.readStorage(PROJECT_BRIEF_KEY, {});
    this.projectBriefStore = storedBriefs && typeof storedBriefs === 'object' && !Array.isArray(storedBriefs) && !('goal' in storedBriefs) ? storedBriefs : { [this.state.name]: storedBriefs };
    this.projectBrief = emptyProjectBrief();
    this.visualHistory = [];
    this.refreshProjectArtifacts();
    this.installedPlugins = this.readStorage(PLUGINS_KEY, []);
    this.registry = [];
    this.monaco = null; this.editor = null; this.models = new Map(); this.disposables = new Map();
    this.dirty = false; this.snapshotTimer = null; this.previewTimer = null; this.autoSaveTimer = null; this.terminalId = null; this.pendingTerminalData = ''; this.terminalReady = false;
    this.commandSelection = 0; this.promptResolver = null; this.githubUser = null; this.inspectorMode = false; this.inspectedElement = null; this.lastShippingResults = []; this.pluginHost = new PluginHost(this);
    this.dom = this.collectDom();
    this.sidebarCollapsed = localStorage.getItem('all-in-studio.sidebar-collapsed') === 'true';
    this.applySidebarState();
    this.applySettings();
    this.bindEvents();
    this.renderAll();
    this.initEditor();
    this.academy = new AcademyEngine(this);
    this.startPreview();
    this.restorePlugins();
    if (this.settings.terminalStart) this.startTerminal();
    this.log('info', 'Studio ready. Your workspace is stored locally.');
    if (this.settings.showStartupOnLaunch) setTimeout(() => this.showStartup(), 0);
  }

  readStorage(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
  refreshProjectArtifacts() {
    this.projectBrief = { ...emptyProjectBrief(), ...(this.projectBriefStore[this.state.name] || {}) };
    this.projectBrief.tasks = Array.isArray(this.projectBrief.tasks) ? this.projectBrief.tasks : [];
    this.visualHistory = this.readStorage(VISUAL_HISTORY_KEY, []).filter((entry) => entry && entry.previewHtml && entry.projectName === this.state.name).slice(-12);
  }
  persistProjectBrief() { this.projectBriefStore[this.state.name] = clone(this.projectBrief); localStorage.setItem(PROJECT_BRIEF_KEY, JSON.stringify(this.projectBriefStore)); }
  upgradeWelcomeStarter() {
    const index = this.state.files.find((file) => file.path === 'index.html');
    const isPreviousStarter = this.state.name === 'Welcome project' && this.state.files.length === 3 && /Ideas deserve a beautiful first draft|<title>Momentum<\/title>/.test(index?.content || '');
    if (isPreviousStarter) this.state = normalizeWorkspace({ name: 'Welcome project', files: clone(seedFiles), activePath: 'index.html', openPaths: ['index.html'] });
  }
  collectDom() {
    const toCamel = (id) => id.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
    return Object.fromEntries(['app-shell', 'project-label', 'save-state', 'side-panel', 'file-tree', 'file-filter', 'workspace-search', 'search-match-case', 'search-regex', 'search-results', 'tabs', 'editor-preview', 'editor-host', 'editor-empty', 'preview-group', 'preview-frame', 'preview-stage', 'bottom-panel', 'output-log', 'issue-count', 'terminal-output', 'terminal-input', 'terminal-prompt', 'status-mode', 'status-file', 'cursor-status', 'language-status', 'storage-status', 'command-modal', 'command-input', 'command-results', 'settings-modal', 'marketplace-modal', 'marketplace-search', 'marketplace-list', 'installed-extensions', 'extension-hub-modal', 'extension-hub-list', 'extension-hub-empty', 'extension-hub-panels', 'history-modal', 'history-list', 'prompt-modal', 'prompt-title', 'prompt-description', 'prompt-input', 'confirm-modal', 'confirm-title', 'confirm-description', 'confirm-accept', 'github-modal', 'github-token', 'github-repo', 'github-branch', 'github-status', 'startup-screen', 'startup-project-name', 'startup-project-meta', 'project-modal', 'project-goal', 'project-audience', 'project-stack', 'project-notes', 'project-tasks', 'inspector-modal', 'inspector-summary', 'inspector-element', 'inspector-styles', 'inspector-source', 'shipping-modal', 'shipping-summary', 'shipping-results', 'visual-modal', 'visual-list', 'visual-title', 'visual-meta', 'visual-before-frame', 'visual-after-frame', 'handoff-modal', 'handoff-output', 'toast-region'].map((id) => [toCamel(id), document.getElementById(id)]));
  }
  getFile(path) { return this.state.files.find((file) => file.path === normalizePath(path)); }
  get activeFile() { return this.getFile(this.state.activePath); }

  bindEvents() {
    document.addEventListener('click', (event) => this.handleClick(event));
    document.querySelectorAll('[data-window]').forEach((button) => button.addEventListener('click', () => window.studio?.controlWindow(button.dataset.window)));
    this.dom.fileTree.addEventListener('click', (event) => { const item = event.target.closest('[data-file]'); if (item) this.openFile(item.dataset.file); });
    this.dom.fileFilter.addEventListener('input', () => this.renderFileTree());
    this.dom.workspaceSearch.addEventListener('input', () => this.searchWorkspace());
    this.dom.searchResults.addEventListener('click', (event) => { const hit = event.target.closest('[data-file]'); if (!hit) return; this.openFile(hit.dataset.file, Number(hit.dataset.line)); });
    this.dom.tabs.addEventListener('click', (event) => { const tab = event.target.closest('[data-tab]'); if (!tab) return; if (event.target.closest('.tab-close')) this.closeFile(tab.dataset.tab); else this.openFile(tab.dataset.tab); });
    this.dom.commandInput.addEventListener('input', () => { this.commandSelection = 0; this.renderCommands(); });
    this.dom.commandResults.addEventListener('click', (event) => { const row = event.target.closest('[data-command-index]'); if (row) this.runCommandAt(Number(row.dataset.commandIndex)); });
    this.dom.marketplaceSearch.addEventListener('input', () => this.renderMarketplace());
    document.querySelectorAll('.activity-btn[data-view]').forEach((button) => button.addEventListener('click', () => this.setActiveView(button.dataset.view)));
    document.querySelectorAll('.panel-tab').forEach((button) => button.addEventListener('click', () => this.setPanelTab(button.dataset.panelTab)));
    document.querySelectorAll('.device-btn').forEach((button) => button.addEventListener('click', () => this.setDevice(button.dataset.device)));
    document.querySelectorAll('.settings-nav-btn').forEach((button) => button.addEventListener('click', () => this.setSettingsPanel(button.dataset.settingsPanel)));
    this.dom.terminalInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { const command = this.dom.terminalInput.value; this.dom.terminalInput.value = ''; this.executeTerminalCommand(command); } });
    this.dom.terminalInput.addEventListener('focus', () => this.startTerminal());
    this.makeSplitter(document.getElementById('preview-splitter'), 'preview');
    this.makeSplitter(document.getElementById('bottom-splitter'), 'bottom');
    window.addEventListener('message', (event) => this.handlePreviewMessage(event));
    window.addEventListener('keydown', (event) => this.handleKeys(event));
    window.addEventListener('beforeunload', () => { this.persistWorkspace(); if (this.terminalId) window.studio?.closeTerminal(this.terminalId); });
  }

  handleClick(event) {
    const hubPanel = event.target.closest('[data-plugin-panel]');
    if (hubPanel) { this.pluginHost.showPanel(hubPanel.dataset.pluginPanel); return; }
    const taskButton = event.target.closest('[data-project-task]');
    if (taskButton) { this.toggleProjectTask(Number(taskButton.dataset.projectTask)); return; }
    const sourceHit = event.target.closest('[data-source-file]');
    if (sourceHit) { this.openFile(sourceHit.dataset.sourceFile, Number(sourceHit.dataset.sourceLine)); return; }
    const visualItem = event.target.closest('[data-visual-index]');
    if (visualItem) { this.showVisualSnapshot(Number(visualItem.dataset.visualIndex)); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    const actions = {
      'run-preview': () => this.renderPreview(), 'refresh-preview': () => this.renderPreview(), save: () => this.saveProject(), 'open-project': () => this.openProject(), 'export-project': () => this.exportProject(), 'new-file': () => this.promptFile(false), 'new-folder': () => this.promptFile(true), 'toggle-sidebar': () => this.toggleSidebar(), 'toggle-preview': () => this.togglePreview(), 'toggle-bottom': () => this.toggleBottom(), history: () => this.openHistory(), settings: () => this.openSettings(), 'close-settings': () => this.closeModal('settings-modal'), 'save-settings': () => this.saveSettings(), 'open-marketplace': () => this.openMarketplace(), 'close-marketplace': () => this.closeModal('marketplace-modal'), 'open-extension-hub': () => this.openExtensionHub(), 'close-extension-hub': () => this.closeModal('extension-hub-modal'), 'refresh-marketplace': () => this.loadRegistry(), 'clear-output': () => { this.dom.outputLog.textContent = ''; this.updateIssues(); }, format: () => this.formatCurrent(), 'academy-reset': () => this.academy?.reset(), 'close-history': () => this.closeModal('history-modal'), 'reset-workspace': () => this.resetWorkspace(), 'command-palette': () => this.openCommandPalette(), 'prompt-cancel': () => this.resolvePrompt(null), 'prompt-confirm': () => this.resolvePrompt(this.dom.promptInput.value), 'confirm-cancel': () => this.resolveConfirmation(false), 'confirm-accept': () => this.resolveConfirmation(true),
      github: () => this.openGitHub(), 'close-github': () => this.closeModal('github-modal'), 'github-connect': () => this.connectGitHub(), 'github-import': () => this.importFromGitHub(), 'github-publish': () => this.publishToGitHub(),
      'project-cockpit': () => this.openProjectCockpit(), 'close-project': () => this.closeModal('project-modal'), 'save-project-brief': () => this.saveProjectBrief(), 'project-add-task': () => this.addProjectTask(),
      'toggle-inspector': () => this.toggleInspector(), 'close-inspector': () => { this.setInspectorMode(false); this.closeModal('inspector-modal'); },
      'shipping-review': () => this.openShippingReview(), 'close-shipping': () => this.closeModal('shipping-modal'), 'run-shipping-checks': () => this.runShippingChecks(),
      'visual-timeline': () => this.openVisualTimeline(), 'close-visual': () => this.closeModal('visual-modal'), 'capture-visual': () => this.captureVisualSnapshot(),
      handoff: () => this.openHandoff(), 'close-handoff': () => this.closeModal('handoff-modal'), 'copy-handoff': () => this.copyHandoff(), 'download-handoff': () => this.downloadHandoff(),
      'startup-continue': () => this.dismissStartup(), 'startup-new': () => this.createStarterWorkspace(), 'startup-open': async () => { if (await this.openProject()) this.dismissStartup(); }, 'startup-academy': () => { this.dismissStartup(); this.setActiveView('academy'); }, 'startup-settings': () => { this.dismissStartup(); this.openSettings(); }, 'startup-marketplace': () => { this.dismissStartup(); this.openMarketplace(); }, 'startup-github': () => { this.dismissStartup(); this.openGitHub(); }
    };
    actions[action]?.();
  }

  handleKeys(event) {
    const commandOpen = this.dom.commandModal.classList.contains('open');
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); this.saveProject(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); this.openCommandPalette(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); this.openCommandPalette(); return; }
    if (event.key === 'Escape') { if (commandOpen) this.closeModal('command-modal'); else document.querySelectorAll('.modal-backdrop.open').forEach((modal) => modal.classList.remove('open')); return; }
    if (commandOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
      event.preventDefault(); const rows = this.getCommandItems();
      if (event.key === 'ArrowDown') this.commandSelection = Math.min(rows.length - 1, this.commandSelection + 1);
      if (event.key === 'ArrowUp') this.commandSelection = Math.max(0, this.commandSelection - 1);
      if (event.key === 'Enter') this.runCommandAt(this.commandSelection); else this.renderCommands();
    }
  }

  makeSplitter(element, kind) {
    if (!element) return;
    element.addEventListener('pointerdown', (event) => {
      event.preventDefault(); element.setPointerCapture(event.pointerId); element.classList.add('dragging');
      const move = (moveEvent) => {
        if (kind === 'preview') {
          const rect = this.dom.editorPreview.getBoundingClientRect(); const width = Math.max(280, Math.min(rect.width - 260, rect.right - moveEvent.clientX));
          this.dom.editorPreview.style.gridTemplateColumns = `minmax(260px, 1fr) 4px ${width}px`;
        } else {
          const rect = document.querySelector('.workbench').getBoundingClientRect(); const height = Math.max(120, Math.min(rect.height - 180, rect.bottom - moveEvent.clientY));
          document.documentElement.style.setProperty('--bottom-height', `${height}px`);
        }
        this.editor?.layout();
      };
      const end = () => { element.classList.remove('dragging'); element.removeEventListener('pointermove', move); element.removeEventListener('pointerup', end); element.removeEventListener('pointercancel', end); };
      element.addEventListener('pointermove', move); element.addEventListener('pointerup', end); element.addEventListener('pointercancel', end);
    });
  }

  initEditor() {
    if (!window.require) { this.log('error', 'The editor engine could not be loaded.'); return; }
    window.require.config({ paths: { vs: './node_modules/monaco-editor/min/vs' } });
    window.require(['vs/editor/editor.main'], (monaco) => {
      this.monaco = monaco;
      monaco.editor.defineTheme('studio-midnight', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#111a29', 'editor.lineHighlightBackground': '#1b2940', 'editorCursor.foreground': '#b2c0ff', 'editor.selectionBackground': '#5b72af66' } });
      monaco.editor.defineTheme('studio-slate', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#181c23', 'editor.lineHighlightBackground': '#262c36', 'editorCursor.foreground': '#bcd0ff', 'editor.selectionBackground': '#6d7d9d66' } });
      monaco.editor.defineTheme('studio-aurora', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#10222c', 'editor.lineHighlightBackground': '#18333c', 'editorCursor.foreground': '#8af0d7', 'editor.selectionBackground': '#3da99455' } });
      monaco.editor.defineTheme('studio-paper', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#ffffff', 'editor.lineHighlightBackground': '#edf2fb', 'editorCursor.foreground': '#3650b8', 'editor.selectionBackground': '#cbd7ff99' } });
      monaco.editor.defineTheme('studio-contrast', { base: 'hc-black', inherit: true, rules: [], colors: { 'editor.background': '#020406', 'editor.lineHighlightBackground': '#15253a', 'editorCursor.foreground': '#00e5ff', 'editor.selectionBackground': '#006d7d88' } });
      this.editor = monaco.editor.create(this.dom.editorHost, { automaticLayout: true, fontFamily: 'DM Mono, Cascadia Code, Consolas, monospace', fontLigatures: true, scrollBeyondLastLine: false, smoothScrolling: true, padding: { top: 16, bottom: 16 }, renderWhitespace: 'selection', guides: { indentation: true }, bracketPairColorization: { enabled: true } });
      this.editor.onDidChangeCursorPosition(() => this.updateCursor());
      this.applyEditorSettings(); this.openFile(this.state.activePath); this.renderAll();
    }, (error) => this.log('error', `Editor loading failed: ${error?.message || error}`));
  }

  modelFor(file) {
    if (!this.monaco || !file) return null;
    if (!this.models.has(file.path)) {
      const uri = this.monaco.Uri.parse(`inmemory://all-in-studio/${encodeURIComponent(file.path)}`);
      const model = this.monaco.editor.createModel(file.content, languageFor(file.path), uri);
      const disposable = model.onDidChangeContent(() => {
        if (this.suppressModelChanges) return;
        file.content = model.getValue(); this.markDirty(); this.queueWork(); this.pluginHost.updateContext(); this.academy?.onWorkspaceChanged();
      });
      this.models.set(file.path, model); this.disposables.set(file.path, disposable);
    }
    return this.models.get(file.path);
  }

  openFile(path, line) {
    const file = this.getFile(path); if (!file) return;
    this.state.activePath = file.path; if (!this.state.openPaths.includes(file.path)) this.state.openPaths.push(file.path);
    if (this.editor) { this.editor.setModel(this.modelFor(file)); if (line) this.editor.revealLineInCenter(line); this.editor.focus(); }
    this.renderAll(); this.pluginHost.updateContext(); this.persistWorkspace();
  }

  closeFile(path) {
    if (this.state.openPaths.length <= 1) return;
    this.state.openPaths = this.state.openPaths.filter((item) => item !== path);
    if (this.state.activePath === path) this.state.activePath = this.state.openPaths[this.state.openPaths.length - 1];
    this.openFile(this.state.activePath);
  }

  createFile(path, content = '', options = {}) {
    const normalized = normalizePath(path);
    if (!normalized) return false;
    const existing = this.getFile(normalized);
    if (existing) { if (options.open !== false) this.openFile(normalized); return false; }
    const file = { path: normalized, content: String(content) }; this.state.files.push(file); this.state.files.sort((a, b) => a.path.localeCompare(b.path)); this.markDirty(); this.queueWork(); this.renderFileTree(); if (options.open !== false) this.openFile(normalized); return true;
  }

  setFileContent(path, content) {
    const file = this.getFile(path); if (!file) return;
    file.content = String(content); const model = this.models.get(file.path);
    if (model && model.getValue() !== file.content) { this.suppressModelChanges = true; model.setValue(file.content); this.suppressModelChanges = false; }
    this.markDirty(); this.queueWork(); this.pluginHost.updateContext(); this.academy?.onWorkspaceChanged();
  }

  renderAll() { this.renderFileTree(); this.renderTabs(); this.renderHeader(); this.updateStatus(); this.updateEmptyState(); }
  renderHeader() { const projectName = this.dom.projectLabel?.querySelector('[data-project-name]') || this.dom.projectLabel; if (projectName) projectName.textContent = this.state.name; this.dom.saveState.textContent = this.dirty ? 'Unsaved changes' : 'Saved'; this.dom.saveState.classList.toggle('dirty', this.dirty); }
  renderFileTree() {
    const query = this.dom.fileFilter.value.trim().toLowerCase(); const files = this.state.files.filter((file) => file.path.toLowerCase().includes(query));
    let lastFolder = null; this.dom.fileTree.innerHTML = files.map((file) => { const folder = file.path.includes('/') ? file.path.split('/').slice(0, -1).join('/') : 'workspace'; const folderMarkup = folder !== lastFolder ? (lastFolder = folder, `<div class="tree-folder">${escapeHtml(folder)}</div>`) : ''; const type = extensionOf(file.path); return `${folderMarkup}<div class="file-item ${file.path === this.state.activePath ? 'active' : ''}" data-file="${escapeHtml(file.path)}" role="treeitem"><span class="file-icon ${type}">${fileIcon(file.path)}</span><span class="file-name">${escapeHtml(file.path.split('/').pop())}</span></div>`; }).join('') || '<p class="side-copy">No matching files.</p>';
  }
  renderTabs() { this.dom.tabs.innerHTML = this.state.openPaths.map((path) => { const file = this.getFile(path); if (!file) return ''; return `<div class="tab ${path === this.state.activePath ? 'active' : ''}" data-tab="${escapeHtml(path)}" role="tab"><span class="file-icon ${extensionOf(path)}">${fileIcon(path)}</span><span>${escapeHtml(path.split('/').pop())}</span><span class="tab-close" title="Close">×</span></div>`; }).join(''); }
  updateStatus() { const file = this.activeFile; this.dom.statusFile.textContent = file?.path || 'No file open'; this.dom.languageStatus.textContent = file ? languageFor(file.path) : 'Plain text'; this.dom.statusMode.textContent = this.dirty ? 'Editing' : 'Ready'; this.dom.storageStatus.textContent = window.studio?.isDesktop ? 'Desktop workspace' : 'Browser workspace'; }
  updateEmptyState() { this.dom.editorEmpty.classList.toggle('visible', !this.activeFile); }
  updateCursor() { const position = this.editor?.getPosition(); if (position) this.dom.cursorStatus.textContent = `Ln ${position.lineNumber}, Col ${position.column}`; }

  setActiveView(view) { if (this.sidebarCollapsed) { this.sidebarCollapsed = false; this.applySidebarState(); } document.querySelectorAll('.activity-btn[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view)); document.querySelectorAll('.side-view').forEach((panel) => panel.classList.toggle('active', panel.dataset.sideView === view)); if (window.innerWidth <= 680) this.dom.sidePanel.classList.add('mobile-open'); }
  setPanelTab(tab) { document.querySelectorAll('.panel-tab').forEach((button) => button.classList.toggle('active', button.dataset.panelTab === tab)); document.querySelectorAll('.panel-content').forEach((panel) => panel.classList.toggle('active', panel.dataset.panelContent === tab)); if (tab === 'terminal') this.startTerminal(); }
  setDevice(device) { document.querySelectorAll('.device-btn').forEach((button) => button.classList.toggle('active', button.dataset.device === device)); this.dom.previewStage.classList.remove('tablet', 'mobile'); if (device !== 'desktop') this.dom.previewStage.classList.add(device); }
  togglePreview() {
    const hidden = this.dom.editorPreview.classList.toggle('preview-hidden');
    if (hidden) {
      this.previewGridBeforeHide = this.dom.editorPreview.style.gridTemplateColumns;
      this.dom.editorPreview.style.gridTemplateColumns = 'minmax(0, 1fr)';
    } else {
      this.dom.editorPreview.style.gridTemplateColumns = this.previewGridBeforeHide || '';
    }
    requestAnimationFrame(() => this.editor?.layout());
  }
  applySidebarState() { document.getElementById('workspace')?.classList.toggle('sidebar-collapsed', this.sidebarCollapsed); const button = document.querySelector('[data-action="toggle-sidebar"]'); if (button) { button.textContent = this.sidebarCollapsed ? 'Show explorer' : 'Explorer'; button.setAttribute('aria-pressed', String(this.sidebarCollapsed)); } requestAnimationFrame(() => this.editor?.layout()); }
  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; localStorage.setItem('all-in-studio.sidebar-collapsed', String(this.sidebarCollapsed)); this.applySidebarState(); }
  toggleBottom() { document.querySelector('.workbench').classList.toggle('panel-hidden'); this.editor?.layout(); }

  queueWork() {
    clearTimeout(this.previewTimer); clearTimeout(this.autoSaveTimer);
    if (this.settings.autoSave) this.autoSaveTimer = setTimeout(() => this.persistWorkspace(), Number(this.settings.autoSaveDelay) || 800);
    this.previewTimer = setTimeout(() => { if (this.settings.autoPreview) this.renderPreview(); this.captureSnapshot(); this.updateDiagnostics(); }, Number(this.settings.previewDelay) || 450);
  }
  markDirty() { this.dirty = true; this.renderHeader(); this.updateStatus(); }
  persistWorkspace() { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(this.state)); this.dirty = false; this.renderHeader(); this.updateStatus(); }
  startPreview() { this.renderPreview(); }

  buildPreviewDocument() {
    const htmlFile = this.getFile('index.html') || this.state.files.find((file) => /\.html?$/i.test(file.path));
    const css = this.state.files.filter((file) => /\.css$/i.test(file.path)).map((file) => file.content).join('\n\n');
    const js = this.state.files.filter((file) => /\.(?:js|mjs|cjs)$/i.test(file.path)).map((file) => `// ${file.path}\n${file.content}`).join('\n\n');
    const safeCss = css.replace(/<\/style/gi, '<\\/style'); const safeJs = js.replace(/<\/script/gi, '<\\/script');
    let html = htmlFile?.content || '<main style="font-family:system-ui;padding:2rem"><h1>Nothing to preview yet</h1><p>Create an <code>index.html</code> file to start.</p></main>';
    html = html.replace(/<link\b[^>]*rel\s*=\s*["']?stylesheet["']?[^>]*>/gi, '');
    html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*(["'])(.*?)\2([^>]*)>\s*<\/script>/gi, (match, before, _quote, source) => {
      const localPath = normalizePath(String(source).split(/[?#]/, 1)[0]);
      return this.state.files.some((file) => file.path === localPath) ? '' : match;
    });
    const bridge = `<script>
(() => {
  const send=(level,args)=>parent.postMessage({studioPreview:true,type:'console',level,args:args.map(value=>{try{return typeof value==='string'?value:JSON.stringify(value)}catch{return String(value)}})},'*');
  ['log','info','warn','error'].forEach(level=>{const original=console[level];console[level]=(...args)=>{original.apply(console,args);send(level,args)}});
  addEventListener('error',event=>send('error',[event.message+' at '+(event.lineno||0)+':'+(event.colno||0)]));
  addEventListener('unhandledrejection',event=>send('error',['Unhandled promise: '+(event.reason?.message||event.reason)]));
  let inspecting=false; let outlined=null; let previousOutline='';
  const selectorFor=node=>{if(node.id)return '#'+CSS.escape(node.id);const parts=[];let current=node;while(current&&current.nodeType===1&&parts.length<4){let part=current.tagName.toLowerCase();if(current.classList.length)part+='.'+[...current.classList].slice(0,2).map(CSS.escape).join('.');const children=current.parentElement?[...current.parentElement.children]:[];const siblings=children.filter(item=>item.tagName===current.tagName);if(siblings.length>1)part+=':nth-of-type('+(siblings.indexOf(current)+1)+')';parts.unshift(part);current=current.parentElement;}return parts.join(' > ')};
  const report=node=>{const style=getComputedStyle(node);parent.postMessage({studioPreview:true,type:'inspect',element:{tag:node.tagName.toLowerCase(),id:node.id,classes:[...node.classList],selector:selectorFor(node),text:(node.textContent||'').trim().replace(/\\s+/g,' ').slice(0,140)},styles:{display:style.display,position:style.position,color:style.color,background:style.backgroundColor,font:style.font,margin:style.margin,padding:style.padding,width:style.width,height:style.height,borderRadius:style.borderRadius}},'*')};
  addEventListener('click',event=>{if(!inspecting)return;const node=event.target instanceof Element?event.target:null;if(!node)return;event.preventDefault();event.stopPropagation();if(outlined)outlined.style.outline=previousOutline;outlined=node;previousOutline=node.style.outline;node.style.outline='2px solid #6d7cff';report(node)},true);
  addEventListener('message',event=>{if(!event.data?.studioPreviewCommand||event.data.type!=='inspect')return;inspecting=Boolean(event.data.enabled);document.documentElement.style.cursor=inspecting?'crosshair':'';if(!inspecting&&outlined){outlined.style.outline=previousOutline;outlined=null}parent.postMessage({studioPreview:true,type:'inspect-mode',enabled:inspecting},'*')});
})();
<\/script>`;
    const styles = `<style>${safeCss}</style>`;
    const scripts = `${bridge}<script>${safeJs}<\/script>`;
    if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `${styles}</head>`); else html = `${styles}${html}`;
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${scripts}</body>`); else html += scripts;
    return html;
  }

  renderPreview() {
    const html = this.buildPreviewDocument();
    this.lastPreviewDocument = html;
    this.dom.previewFrame.setAttribute('sandbox', `allow-scripts allow-modals${this.settings.previewForms ? ' allow-forms' : ''}`);
    this.dom.previewFrame.onload = () => { if (this.inspectorMode) this.dom.previewFrame.contentWindow?.postMessage({ studioPreviewCommand: true, type: 'inspect', enabled: true }, '*'); };
    this.dom.previewFrame.srcdoc = html;
  }

  handlePreviewMessage(event) { if (event.source !== this.dom.previewFrame.contentWindow || !event.data?.studioPreview) return; if (event.data.type === 'console' && this.settings.previewConsole) { this.log(event.data.level, event.data.args.join(' ')); this.updateIssues(); } if (event.data.type === 'inspect') this.renderInspection(event.data); }
  setInspectorMode(enabled) {
    this.inspectorMode = Boolean(enabled);
    document.querySelectorAll('[data-action="toggle-inspector"]').forEach((button) => { button.classList.toggle('active', this.inspectorMode); button.textContent = this.inspectorMode ? 'Inspecting…' : (button.classList.contains('inspect-trigger') ? 'Inspect' : 'Pick another element'); });
    this.dom.previewFrame.contentWindow?.postMessage({ studioPreviewCommand: true, type: 'inspect', enabled: this.inspectorMode }, '*');
  }
  toggleInspector() { const next = !this.inspectorMode; if (next) this.closeModal('inspector-modal'); this.setInspectorMode(next); if (next) this.toast('Inspect is active. Click any element in Live Preview.'); }
  renderInspection(payload) {
    this.inspectedElement = payload;
    this.setInspectorMode(false);
    const element = payload.element || {}; const styles = payload.styles || {};
    this.dom.inspectorSummary.textContent = `${element.selector || element.tag || 'Element'} selected in the isolated preview.`;
    this.dom.inspectorElement.textContent = `<${element.tag || 'element'}${element.id ? ` id="${element.id}"` : ''}${element.classes?.length ? ` class="${element.classes.join(' ')}"` : ''}>\n${element.text || 'No text content'}`;
    this.dom.inspectorStyles.textContent = Object.entries(styles).map(([name, value]) => `${name}: ${value};`).join('\n') || 'No computed style details.';
    const hits = this.findSourceHits(element);
    this.dom.inspectorSource.innerHTML = hits.length ? hits.map((hit) => `<button class="source-hit" data-source-file="${escapeHtml(hit.path)}" data-source-line="${hit.line}"><strong>${escapeHtml(hit.path)}:${hit.line}</strong><span>${escapeHtml(hit.text)}</span></button>`).join('') : '<p class="modal-copy">No exact local match found. Try a class or id that exists in your source files.</p>';
    this.openModal('inspector-modal');
  }
  findSourceHits(element) {
    const terms = [element.id ? `#${element.id}` : '', element.id ? `id="${element.id}"` : '', ...(element.classes || []).map((name) => `.${name}`), ...(element.classes || []).map((name) => `class="${name}`), element.tag || ''].filter(Boolean);
    const hits = [];
    this.state.files.filter((file) => /\.(?:html?|css|scss|js|jsx|tsx)$/i.test(file.path)).forEach((file) => file.content.split('\n').forEach((line, index) => {
      if (hits.length >= 12 || !terms.some((term) => line.includes(term))) return;
      hits.push({ path: file.path, line: index + 1, text: line.trim().slice(0, 140) || '(empty line)' });
    }));
    return hits;
  }

  openProjectCockpit() {
    this.dom.projectGoal.value = this.projectBrief.goal; this.dom.projectAudience.value = this.projectBrief.audience; this.dom.projectStack.value = this.projectBrief.stack; this.dom.projectNotes.value = this.projectBrief.notes;
    this.renderProjectTasks(); this.openModal('project-modal');
  }
  saveProjectBrief() {
    this.projectBrief = { ...this.projectBrief, goal: this.dom.projectGoal.value.trim(), audience: this.dom.projectAudience.value.trim(), stack: this.dom.projectStack.value.trim(), notes: this.dom.projectNotes.value.trim() };
    this.persistProjectBrief(); this.academy?.onWorkspaceChanged(); this.closeModal('project-modal'); this.toast('Project memory saved locally.', 'success');
  }
  renderProjectTasks() {
    this.dom.projectTasks.innerHTML = this.projectBrief.tasks.length ? this.projectBrief.tasks.map((task, index) => `<div class="project-task ${task.done ? 'done' : ''}"><button data-project-task="${index}" aria-label="Toggle ${escapeHtml(task.text)}">✓</button><span>${escapeHtml(task.text)}</span><button class="mini-btn" data-project-task-remove="${index}" title="Remove task">×</button></div>`).join('') : '<p class="modal-copy">No milestones yet. Keep them small and concrete.</p>';
    this.dom.projectTasks.querySelectorAll('[data-project-task-remove]').forEach((button) => button.addEventListener('click', () => { this.projectBrief.tasks.splice(Number(button.dataset.projectTaskRemove), 1); this.persistProjectBrief(); this.renderProjectTasks(); }));
  }
  addProjectTask() { this.ask('Add milestone', 'Write one clear, verifiable delivery step.', 'Test the site on mobile').then((value) => { if (!value) return; this.projectBrief.tasks.push({ text: value.slice(0, 180), done: false }); this.persistProjectBrief(); this.renderProjectTasks(); }); }
  toggleProjectTask(index) { const task = this.projectBrief.tasks[index]; if (!task) return; task.done = !task.done; this.persistProjectBrief(); this.renderProjectTasks(); }

  collectShippingChecks() {
    const htmlFile = this.getFile('index.html') || this.state.files.find((file) => /\.html?$/i.test(file.path));
    const html = htmlFile?.content || ''; const cssFiles = this.state.files.filter((file) => /\.(?:css|scss)$/i.test(file.path)); const jsFiles = this.state.files.filter((file) => /\.(?:js|mjs|cjs)$/i.test(file.path)); const bytes = new TextEncoder().encode(this.state.files.map((file) => file.content).join('')).length;
    const checks = [];
    const add = (kind, title, detail) => checks.push({ kind, title, detail });
    /<!doctype html>/i.test(html) ? add('pass', 'Document type', 'An HTML doctype is present.') : add('fail', 'Document type', 'Add <!doctype html> at the start of your entry HTML.');
    /<html\b[^>]*\blang=/i.test(html) ? add('pass', 'Language metadata', 'The root HTML element declares a language.') : add('warn', 'Language metadata', 'Add lang="en" (or the correct language) to <html>.');
    /<meta\b[^>]*name=["']viewport["']/i.test(html) ? add('pass', 'Mobile viewport', 'A viewport tag is present.') : add('warn', 'Mobile viewport', 'Add a viewport meta tag for mobile layout.');
    /<title>[^<]+<\/title>/i.test(html) ? add('pass', 'Page title', 'A non-empty page title is present.') : add('warn', 'Page title', 'Add a concise <title> for the browser tab and search previews.');
    /<meta\b[^>]*name=["']description["']/i.test(html) ? add('pass', 'Description metadata', 'A meta description is present.') : add('warn', 'Description metadata', 'Add a meta description before publishing.');
    const images = [...html.matchAll(/<img\b[^>]*>/gi)]; const missingAlt = images.filter((match) => !/\balt\s*=/i.test(match[0])).length;
    !images.length ? add('pass', 'Image alternatives', 'No image elements found.') : !missingAlt ? add('pass', 'Image alternatives', `All ${images.length} image element${images.length === 1 ? '' : 's'} declare alt text.`) : add('warn', 'Image alternatives', `${missingAlt} of ${images.length} image element${images.length === 1 ? '' : 's'} need alt text.`);
    cssFiles.length ? add('pass', 'Stylesheet', `${cssFiles.length} local style file${cssFiles.length === 1 ? '' : 's'} found.`) : add('warn', 'Stylesheet', 'No local CSS file was found.');
    jsFiles.length ? add('pass', 'Client scripts', `${jsFiles.length} local script file${jsFiles.length === 1 ? '' : 's'} found.`) : add('warn', 'Client scripts', 'No local JavaScript file was found.');
    const errors = this.dom.outputLog.querySelectorAll('.log-row.error').length; errors ? add('fail', 'Preview errors', `${errors} error${errors === 1 ? '' : 's'} currently appear in Output.`) : add('pass', 'Preview errors', 'No captured preview errors are currently listed.');
    bytes < 500000 ? add('pass', 'Workspace size', `${Math.round(bytes / 1024)} KB of editable source.`) : add('warn', 'Workspace size', `${Math.round(bytes / 1024)} KB of source; review large assets before publishing.`);
    this.projectBrief.goal ? add('pass', 'Project goal', 'A local project goal is recorded in Project cockpit.') : add('warn', 'Project goal', 'Record a goal in Project cockpit so the handoff is useful.');
    return checks;
  }
  renderShippingChecks(checks) {
    const counts = checks.reduce((total, check) => ({ ...total, [check.kind]: total[check.kind] + 1 }), { pass: 0, warn: 0, fail: 0 });
    this.dom.shippingSummary.innerHTML = `<span>${counts.pass} passed</span><span>${counts.warn} attention</span><span>${counts.fail} blocking</span>`;
    this.dom.shippingResults.innerHTML = checks.map((check) => `<article class="shipping-result ${check.kind}"><strong>${check.kind === 'pass' ? 'PASS' : check.kind === 'warn' ? 'REVIEW' : 'BLOCKED'}</strong><p><b>${escapeHtml(check.title)}</b><br>${escapeHtml(check.detail)}</p></article>`).join('');
  }
  openShippingReview() { this.openModal('shipping-modal'); this.runShippingChecks(); }
  runShippingChecks() { this.lastShippingResults = this.collectShippingChecks(); this.renderShippingChecks(this.lastShippingResults); }

  captureVisualSnapshot() {
    const previewHtml = this.lastPreviewDocument || this.buildPreviewDocument(); const latest = this.visualHistory.at(-1);
    if (latest?.previewHtml === previewHtml) { this.toast('The current preview matches the latest checkpoint.'); return; }
    const entry = { at: Date.now(), projectName: this.state.name, activePath: this.state.activePath, fileCount: this.state.files.length, previewHtml };
    this.visualHistory = [...this.visualHistory, entry].slice(-12); localStorage.setItem(VISUAL_HISTORY_KEY, JSON.stringify(this.visualHistory)); this.renderVisualList(this.visualHistory.length - 1); this.showVisualSnapshot(this.visualHistory.length - 1); this.toast('Visual checkpoint captured locally.', 'success');
  }
  openVisualTimeline() { this.openModal('visual-modal'); this.renderVisualList(this.visualHistory.length - 1); if (this.visualHistory.length) this.showVisualSnapshot(this.visualHistory.length - 1); else { this.dom.visualBeforeFrame.srcdoc = '<main style="font:14px system-ui;padding:2rem">Capture a checkpoint to start a visual timeline.</main>'; this.dom.visualAfterFrame.srcdoc = this.lastPreviewDocument || this.buildPreviewDocument(); } }
  renderVisualList(activeIndex = -1) { this.dom.visualList.innerHTML = this.visualHistory.length ? this.visualHistory.map((entry, index) => `<button class="visual-item ${index === activeIndex ? 'active' : ''}" data-visual-index="${index}"><strong>Checkpoint ${index + 1}</strong><span>${new Date(entry.at).toLocaleString()} · ${entry.fileCount} files</span></button>`).join('') : '<p class="visual-empty">No visual checkpoints yet. Capture one before a meaningful change, then compare it with the current preview.</p>'; }
  showVisualSnapshot(index) { const entry = this.visualHistory[index]; if (!entry) return; this.dom.visualBeforeFrame.srcdoc = entry.previewHtml; this.dom.visualAfterFrame.srcdoc = this.lastPreviewDocument || this.buildPreviewDocument(); this.dom.visualTitle.textContent = `Checkpoint ${index + 1} vs current`; this.dom.visualMeta.textContent = `${new Date(entry.at).toLocaleString()} · ${entry.activePath || 'Workspace'} · ${entry.fileCount} files at capture`; this.renderVisualList(index); }

  buildHandoff() {
    const checks = this.lastShippingResults.length ? this.lastShippingResults : this.collectShippingChecks(); const completed = this.projectBrief.tasks.filter((task) => task.done).length;
    return `# ${this.state.name}\n\n## Project brief\n- Goal: ${this.projectBrief.goal || 'Not recorded'}\n- Audience: ${this.projectBrief.audience || 'Not recorded'}\n- Stack / constraints: ${this.projectBrief.stack || 'Not recorded'}\n\n${this.projectBrief.notes ? `## Notes\n${this.projectBrief.notes}\n\n` : ''}## Delivery board (${completed}/${this.projectBrief.tasks.length} complete)\n${this.projectBrief.tasks.length ? this.projectBrief.tasks.map((task) => `- [${task.done ? 'x' : ' '}] ${task.text}`).join('\n') : '- No milestones recorded'}\n\n## Workspace\n- Active file: ${this.state.activePath}\n- Files (${this.state.files.length}):\n${this.state.files.map((file) => `  - ${file.path}`).join('\n')}\n\n## Local release review\n${checks.map((check) => `- ${check.kind.toUpperCase()}: ${check.title} — ${check.detail}`).join('\n')}\n\n## Handoff notes\n- Open the workspace in All-In Studio or any editor.\n- Run the Live Preview and recheck the local release review before publishing.\n- This summary was generated locally; it contains no remote project analysis.\n`;
  }
  openHandoff() { this.dom.handoffOutput.value = this.buildHandoff(); this.openModal('handoff-modal'); }
  async copyHandoff() { try { await navigator.clipboard.writeText(this.dom.handoffOutput.value); this.toast('Handoff Markdown copied.', 'success'); } catch { this.dom.handoffOutput.select(); document.execCommand('copy'); this.toast('Handoff Markdown copied.', 'success'); } }
  downloadHandoff() { const blob = new Blob([this.dom.handoffOutput.value || this.buildHandoff()], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${this.state.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'project'}-handoff.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); this.toast('Handoff Markdown downloaded.', 'success'); }

  log(level, text) { const row = document.createElement('div'); row.className = `log-row ${level}`; const tag = document.createElement('span'); tag.className = 'log-level'; tag.textContent = level; const message = document.createElement('span'); message.textContent = cleanMessage(text); row.append(tag, message); this.dom.outputLog.append(row); this.dom.outputLog.scrollTop = this.dom.outputLog.scrollHeight; }
  updateIssues() { const errors = this.dom.outputLog.querySelectorAll('.log-row.error').length; const warnings = this.dom.outputLog.querySelectorAll('.log-row.warn').length; this.dom.issueCount.textContent = errors + warnings; }
  updateDiagnostics() { const file = this.activeFile; if (!file) return; if (languageFor(file.path) === 'json') { try { JSON.parse(file.content); } catch (error) { this.log('error', `${file.path}: ${error.message}`); } } this.updateIssues(); }

  async startTerminal() {
    if (this.terminalReady) return true;
    if (!window.studio?.executeTerminal) { this.dom.terminalInput.placeholder = 'Terminal is available in the desktop app.'; return false; }
    this.terminalReady = true; this.dom.terminalInput.placeholder = 'Type a command and press Enter'; this.dom.terminalPrompt.textContent = '›';
    if (this.settings.terminalWelcome && !this.dom.terminalOutput.textContent) this.dom.terminalOutput.textContent = 'All-In Studio command terminal ready. Commands run in the active project folder.\n';
    return true;
  }
  async executeTerminalCommand(command) {
    const normalized = String(command || '').trim(); if (!normalized) return;
    if (!await this.startTerminal()) return;
    this.dom.terminalOutput.textContent += `\n$ ${normalized}\n`;
    this.dom.terminalInput.disabled = true;
    try {
      const result = await window.studio.executeTerminal(normalized, this.settings.terminalProfile);
      this.dom.terminalOutput.textContent += cleanMessage(result?.output || (result?.ok ? '' : 'Command failed without output.'));
      if (result?.exitCode && !String(result?.output || '').includes('Command stopped')) this.dom.terminalOutput.textContent += `\n[exit ${result.exitCode}]\n`;
    } catch (error) { this.dom.terminalOutput.textContent += `Terminal error: ${error.message}\n`; }
    finally {
      const limit = Math.max(500, Number(this.settings.terminalScrollback) || 2000) * 100;
      if (this.dom.terminalOutput.textContent.length > limit) this.dom.terminalOutput.textContent = this.dom.terminalOutput.textContent.slice(-limit);
      this.dom.terminalOutput.parentElement.scrollTop = this.dom.terminalOutput.parentElement.scrollHeight; this.dom.terminalInput.disabled = false; this.dom.terminalInput.focus();
    }
  }

  showStartup() {
    if (!this.dom.startupScreen) return;
    this.dom.startupProjectName.textContent = this.state.name;
    this.dom.startupProjectMeta.textContent = `${this.state.files.length} local files · ${this.state.activePath || 'No file selected'}`;
    this.dom.startupScreen.classList.add('open');
  }
  dismissStartup() { this.dom.startupScreen?.classList.remove('open'); requestAnimationFrame(() => this.editor?.layout()); }
  createStarterWorkspace() {
    if (!window.confirm('Start a fresh workspace? Your current local project will remain available in History.')) return;
    this.captureSnapshot(); this.disposeModels(); this.state = normalizeWorkspace({ name: 'Untitled project', files: clone(seedFiles), activePath: 'index.html', openPaths: ['index.html'] }); this.refreshProjectArtifacts(); this.markDirty(); this.persistWorkspace(); this.renderAll(); this.openFile('index.html'); this.renderPreview(); this.dismissStartup(); this.toast('Fresh starter workspace created.', 'success');
  }

  githubConfig() {
    const rawRepository = String(this.dom.githubRepo?.value || '').trim().replace(/^https?:\/\/(?:www\.)?github\.com\//i, '').replace(/^github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
    const branch = String(this.dom.githubBranch?.value || 'main').trim();
    if (!/^[^/\s]+\/[^/\s]+$/.test(rawRepository)) throw new Error('Enter a repository as owner/repository.');
    if (!branch || /[\s?#[\]\\]/.test(branch)) throw new Error('Enter a valid branch name.');
    const [owner, repository] = rawRepository.split('/');
    return { repository: rawRepository, repositoryPath: `${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, branch };
  }
  rememberGitHubTarget(config) {
    this.settings = { ...this.settings, githubRepo: config.repository, githubBranch: config.branch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
  }
  setGitHubStatus(message, kind = 'info') {
    if (!this.dom.githubStatus) return;
    this.dom.githubStatus.textContent = message;
    this.dom.githubStatus.dataset.kind = kind;
  }
  openGitHub() {
    if (!this.dom.githubModal) return;
    this.dom.githubRepo.value = this.settings.githubRepo || '';
    this.dom.githubBranch.value = this.settings.githubBranch || 'main';
    this.dom.githubToken.value = sessionStorage.getItem('all-in-studio.github-token') || '';
    this.setGitHubStatus(this.githubUser ? `Connected as ${this.githubUser.login}. Your token is held only for this app session.` : 'Use a fine-grained token with Contents: Read and write for the repository you choose. The token is never saved to disk.');
    this.openModal('github-modal');
  }
  async githubRequest(apiPath, { method = 'GET', body } = {}) {
    const token = String(this.dom.githubToken?.value || '').trim();
    if (!token) throw new Error('Paste a GitHub personal access token first.');
    const response = await fetch(`https://api.github.com${apiPath}`, {
      method,
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await response.text(); let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) { const error = new Error(data?.message || `GitHub returned ${response.status}.`); error.status = response.status; throw error; }
    return data;
  }
  async connectGitHub() {
    try {
      const profile = await this.githubRequest('/user');
      this.githubUser = profile;
      sessionStorage.setItem('all-in-studio.github-token', this.dom.githubToken.value.trim());
      this.setGitHubStatus(`Connected as ${profile.login}. This token will be cleared when the app session ends.`, 'success');
      this.toast(`GitHub connected as ${profile.login}.`, 'success');
    } catch (error) { this.setGitHubStatus(error.message, 'error'); this.toast(`GitHub connection failed: ${error.message}`, 'error'); }
  }
  async publishToGitHub() {
    let config;
    try { config = this.githubConfig(); } catch (error) { this.setGitHubStatus(error.message, 'error'); return; }
    const files = this.state.files.filter((file) => { const filePath = normalizePath(file.path); return filePath && !filePath.split('/').includes('..'); });
    if (!files.length) { this.setGitHubStatus('There are no safe text files to publish.', 'error'); return; }
    if (!window.confirm(`Publish ${files.length} file${files.length === 1 ? '' : 's'} to ${config.repository} on ${config.branch}? Existing files with the same paths will be updated.`)) return;
    try {
      this.rememberGitHubTarget(config); sessionStorage.setItem('all-in-studio.github-token', this.dom.githubToken.value.trim()); let completed = 0;
      for (const file of files) {
        const path = githubPath(file.path); let sha;
        try { sha = (await this.githubRequest(`/repos/${config.repositoryPath}/contents/${path}?ref=${encodeURIComponent(config.branch)}`))?.sha; } catch (error) { if (error.status !== 404) throw error; }
        await this.githubRequest(`/repos/${config.repositoryPath}/contents/${path}`, { method: 'PUT', body: { message: `Sync ${file.path} from All-In Studio`, content: encodeBase64(file.content), branch: config.branch, ...(sha ? { sha } : {}) } });
        completed += 1; this.setGitHubStatus(`Publishing ${completed}/${files.length}: ${file.path}`);
      }
      this.setGitHubStatus(`Published ${completed} files to ${config.repository}/${config.branch}.`, 'success'); this.toast('Workspace published to GitHub.', 'success');
    } catch (error) { this.setGitHubStatus(`Publish stopped: ${error.message}`, 'error'); this.toast(`GitHub publish failed: ${error.message}`, 'error'); }
  }
  async importFromGitHub() {
    let config;
    try { config = this.githubConfig(); } catch (error) { this.setGitHubStatus(error.message, 'error'); return; }
    if (!window.confirm(`Replace this local workspace with text files from ${config.repository}/${config.branch}? Your current workspace remains in local History.`)) return;
    try {
      this.setGitHubStatus('Reading repository tree…');
      const tree = await this.githubRequest(`/repos/${config.repositoryPath}/git/trees/${encodeURIComponent(config.branch)}?recursive=1`);
      if (tree?.truncated) throw new Error('This repository is too large for the safe one-shot importer. Open it locally instead.');
      const entries = (tree?.tree || []).filter((entry) => entry.type === 'blob' && entry.path && entry.size <= 1024 * 1024 && languageFor(entry.path) !== 'plaintext').slice(0, 250);
      if (!entries.length) throw new Error('No supported text files were found on that branch.');
      const files = [];
      for (const [index, entry] of entries.entries()) {
        this.setGitHubStatus(`Importing ${index + 1}/${entries.length}: ${entry.path}`);
        const blob = await this.githubRequest(`/repos/${config.repositoryPath}/git/blobs/${entry.sha}`);
        files.push({ path: normalizePath(entry.path), content: decodeBase64(blob.content) });
      }
      this.rememberGitHubTarget(config); sessionStorage.setItem('all-in-studio.github-token', this.dom.githubToken.value.trim()); this.captureSnapshot(); this.disposeModels();
      this.state = normalizeWorkspace({ name: config.repository.split('/').pop(), files, activePath: files.find((file) => /index\.html?$/i.test(file.path))?.path || files[0].path, openPaths: [] }); this.state.openPaths = [this.state.activePath]; this.refreshProjectArtifacts(); this.markDirty(); this.persistWorkspace(); this.renderAll(); this.openFile(this.state.activePath); this.renderPreview(); this.setGitHubStatus(`Imported ${files.length} files from ${config.repository}/${config.branch}.`, 'success'); this.toast('GitHub workspace imported.', 'success');
    } catch (error) { this.setGitHubStatus(`Import failed: ${error.message}`, 'error'); this.toast(`GitHub import failed: ${error.message}`, 'error'); }
  }

  searchWorkspace() {
    const query = this.dom.workspaceSearch.value; if (!query) { this.dom.searchResults.innerHTML = ''; return; }
    let expression; try { expression = this.dom.searchRegex.checked ? new RegExp(query, this.dom.searchMatchCase.checked ? 'g' : 'gi') : null; } catch { this.dom.searchResults.innerHTML = '<p class="side-copy">Invalid regular expression.</p>'; return; }
    const compare = this.dom.searchMatchCase.checked ? query : query.toLowerCase(); const results = [];
    this.state.files.forEach((file) => file.content.split('\n').forEach((line, index) => { const haystack = this.dom.searchMatchCase.checked ? line : line.toLowerCase(); const found = expression ? (expression.lastIndex = 0, expression.test(line)) : haystack.includes(compare); if (found && results.length < 100) results.push({ file: file.path, line: index + 1, text: line.trim() || ' ' }); }));
    this.dom.searchResults.innerHTML = results.map((item) => `<div class="search-hit" data-file="${escapeHtml(item.file)}" data-line="${item.line}"><div class="search-hit-file">${escapeHtml(item.file)}:${item.line}</div><div class="search-hit-line">${escapeHtml(item.text)}</div></div>`).join('') || '<p class="side-copy">No results.</p>';
  }

  captureSnapshot() {
    clearTimeout(this.snapshotTimer); this.snapshotTimer = setTimeout(() => {
      const snapshot = { at: Date.now(), name: this.state.name, activePath: this.state.activePath, files: clone(this.state.files) }; const latest = this.history.at(-1);
      if (latest && JSON.stringify(latest.files) === JSON.stringify(snapshot.files)) return;
      this.history.push(snapshot); this.history = this.history.slice(-Number(this.settings.historyLimit || 50)); localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    }, 850);
  }
  openHistory() { this.renderHistory(); this.openModal('history-modal'); }
  renderHistory() { this.dom.historyList.innerHTML = this.history.length ? this.history.slice().reverse().map((snapshot, index) => { const actualIndex = this.history.length - index - 1; return `<div class="history-item"><div class="extension-mark">↶</div><div class="history-item-info"><div class="history-item-title">${escapeHtml(snapshot.activePath || 'Workspace snapshot')}</div><div class="history-item-meta">${new Date(snapshot.at).toLocaleString()} · ${snapshot.files.length} files</div></div><button class="toolbar-btn" data-restore-history="${actualIndex}">Restore</button></div>`; }).join('') : '<p class="modal-copy">Your first snapshot appears after you edit a file.</p>'; this.dom.historyList.querySelectorAll('[data-restore-history]').forEach((button) => button.addEventListener('click', () => this.restoreSnapshot(Number(button.dataset.restoreHistory)))); }
  restoreSnapshot(index) { const snapshot = this.history[index]; if (!snapshot || !window.confirm('Restore this snapshot? Current workspace changes will be replaced.')) return; this.disposeModels(); this.state = normalizeWorkspace({ ...snapshot, openPaths: [snapshot.activePath] }); this.refreshProjectArtifacts(); this.markDirty(); this.persistWorkspace(); this.renderAll(); this.openFile(this.state.activePath); this.renderPreview(); this.closeModal('history-modal'); this.toast('Snapshot restored.', 'success'); }

  promptFile(folder) { this.ask(folder ? 'New folder' : 'New file', folder ? 'Enter a relative folder name. A .gitkeep file will be added.' : 'Enter a relative file path, for example components/card.html.', folder ? 'components' : 'about.html').then((value) => { if (!value) return; const path = normalizePath(value); if (!path || path.startsWith('..')) return this.toast('Use a path inside this workspace.', 'error'); if (folder) this.createFile(`${path.replace(/\/$/, '')}/.gitkeep`, '', { open: false }); else if (!this.createFile(path, '')) this.toast('That file already exists.', 'error'); }); }
  ask(title, description, value = '') { this.dom.promptTitle.textContent = title; this.dom.promptDescription.textContent = description; this.dom.promptInput.value = value; this.openModal('prompt-modal'); setTimeout(() => this.dom.promptInput.focus(), 0); return new Promise((resolve) => { this.promptResolver = resolve; }); }
  resolvePrompt(value) { if (!this.promptResolver) return; const resolve = this.promptResolver; this.promptResolver = null; this.closeModal('prompt-modal'); resolve(value?.trim() || null); }
  confirm(title, description, acceptLabel = 'Continue') { this.dom.confirmTitle.textContent = title; this.dom.confirmDescription.textContent = description; this.dom.confirmAccept.textContent = acceptLabel; this.openModal('confirm-modal'); setTimeout(() => this.dom.confirmAccept.focus(), 0); return new Promise((resolve) => { this.confirmResolver = resolve; }); }
  resolveConfirmation(accepted) { if (!this.confirmResolver) return; const resolve = this.confirmResolver; this.confirmResolver = null; this.closeModal('confirm-modal'); resolve(Boolean(accepted)); }

  async openProject() {
    if (!window.studio?.openProject) { this.toast('Opening folders is available in the desktop app.', 'error'); return false; }
    const result = await window.studio.openProject(); if (result?.canceled) return false;
    if (!Array.isArray(result?.files) || !result.files.length) { this.toast('No supported text files were found in that folder.', 'error'); return false; }
    this.disposeModels(); this.state = normalizeWorkspace({ name: result.rootName, files: result.files, activePath: result.files.find((file) => /index\.html?$/i.test(file.path))?.path || result.files[0].path, openPaths: [] }); this.state.openPaths = [this.state.activePath]; this.refreshProjectArtifacts(); this.markDirty(); this.persistWorkspace(); this.renderAll(); this.openFile(this.state.activePath); this.renderPreview(); this.toast(`Opened ${this.state.files.length} files from ${this.state.name}.`, 'success'); return true;
  }
  async saveProject() { if (this.settings.formatOnSave) this.formatCurrent(); this.persistWorkspace(); if (!window.studio?.saveProject) { this.toast('Saved to this browser profile.', 'success'); return; } const result = await window.studio.saveProject({ files: this.state.files }); if (result?.ok) this.toast('Saved to the selected project folder.', 'success'); else this.toast(result?.reason || 'Saved locally; choose a folder to write files to disk.'); }
  exportProject() { const blob = makeZip(this.state.files); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${this.state.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'all-in-project'}.zip`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); this.toast('Project zip downloaded.', 'success'); }
  resetWorkspace() { if (!window.confirm('Reset the local workspace, history, and installed extensions?')) return; this.pluginHost.instances.forEach((_item, id) => this.pluginHost.disable(id)); localStorage.removeItem(WORKSPACE_KEY); localStorage.removeItem(HISTORY_KEY); localStorage.removeItem(PLUGINS_KEY); this.disposeModels(); this.state = normalizeWorkspace({ name: 'Welcome project', files: clone(seedFiles), activePath: 'index.html', openPaths: ['index.html'] }); this.history = []; this.installedPlugins = []; this.refreshProjectArtifacts(); this.markDirty(); this.persistWorkspace(); this.renderAll(); this.openFile('index.html'); this.renderPreview(); this.renderInstalled(); this.toast('Local workspace reset.', 'success'); }
  disposeModels() { this.disposables.forEach((item) => item.dispose()); this.models.forEach((model) => model.dispose()); this.disposables.clear(); this.models.clear(); }

  formatCurrent() { const file = this.activeFile; if (!file) return; let content = file.content; try { if (languageFor(file.path) === 'json') content = JSON.stringify(JSON.parse(content), null, Number(this.settings.tabSize)); else if (languageFor(file.path) === 'html') content = content.replace(/>\s*</g, '>\n<').split('\n').map((line) => line.trim()).join('\n'); else { this.toast('Use a language formatter extension for this file type.'); return; } this.setFileContent(file.path, content); this.toast(`Formatted ${file.path}.`, 'success'); } catch (error) { this.toast(`Could not format: ${error.message}`, 'error'); } }

  openCommandPalette() { this.dom.commandInput.value = ''; this.commandSelection = 0; this.renderCommands(); this.openModal('command-modal'); setTimeout(() => this.dom.commandInput.focus(), 0); }
  getCommandItems() {
    const commands = [
      ['Run live preview', 'Run preview', () => this.renderPreview()], ['Save workspace', 'Ctrl S', () => this.saveProject()], ['Open folder', 'Project', () => this.openProject()], ['Create new file', 'Explorer', () => this.promptFile(false)], ['Export project zip', 'Project', () => this.exportProject()], ['Format active document', 'Editor', () => this.formatCurrent()], ['Open settings', 'Workspace', () => this.openSettings()], ['Open extension marketplace', 'Extensions', () => this.openMarketplace()], ['Open project history', 'Workspace', () => this.openHistory()], ['Open project cockpit', 'Project', () => this.openProjectCockpit()], ['Open visual timeline', 'Project', () => this.openVisualTimeline()], ['Run shipping review', 'Project', () => this.openShippingReview()], ['Create project handoff', 'Project', () => this.openHandoff()], ['Toggle preview inspector', 'Preview', () => this.toggleInspector()], ['Toggle preview', 'Layout', () => this.togglePreview()], ['Toggle bottom panel', 'Layout', () => this.toggleBottom()]
    ];
    this.pluginHost.commands.forEach((command, key) => commands.push([command.label, 'Extension', () => this.pluginHost.runCommand(key)]));
    this.state.files.forEach((file) => commands.push([file.path, 'File', () => this.openFile(file.path)]));
    const query = this.dom.commandInput.value.trim().toLowerCase(); return commands.filter(([title, hint]) => !query || `${title} ${hint}`.toLowerCase().includes(query));
  }
  renderCommands() { const items = this.getCommandItems(); this.commandSelection = Math.min(this.commandSelection, Math.max(0, items.length - 1)); this.dom.commandResults.innerHTML = items.map(([title, hint], index) => `<div class="command-item ${index === this.commandSelection ? 'selected' : ''}" data-command-index="${index}"><span class="command-item-icon">${hint === 'File' ? fileIcon(title) : '›'}</span><span class="command-item-title">${escapeHtml(title)}</span><span class="command-item-hint">${escapeHtml(hint)}</span></div>`).join('') || '<p class="side-copy">No matching commands.</p>'; }
  runCommandAt(index) { const item = this.getCommandItems()[index]; if (!item) return; this.closeModal('command-modal'); item[2](); }

  openSettings() { this.populateSettings(); this.openModal('settings-modal'); }
  setSettingsPanel(panel) { document.querySelectorAll('.settings-nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.settingsPanel === panel)); document.querySelectorAll('.settings-section').forEach((section) => section.classList.toggle('active', section.dataset.settingsContent === panel)); }
  populateSettings() {
    const map = {
      'setting-theme': 'theme', 'setting-accent': 'accent', 'setting-density': 'density', 'setting-sidebar-width': 'sidebarWidth', 'setting-reduced-motion': 'reducedMotion', 'setting-show-activity-bar': 'showActivityBar', 'setting-show-status-bar': 'showStatusBar',
      'setting-font-size': 'fontSize', 'setting-font-family': 'fontFamily', 'setting-line-height': 'lineHeight', 'setting-tab-size': 'tabSize', 'setting-insert-spaces': 'insertSpaces', 'setting-word-wrap': 'wordWrap', 'setting-line-numbers': 'lineNumbers', 'setting-cursor-style': 'cursorStyle', 'setting-cursor-blinking': 'cursorBlinking', 'setting-render-whitespace': 'renderWhitespace', 'setting-auto-closing-brackets': 'autoClosingBrackets', 'setting-minimap': 'minimap', 'setting-smooth-scrolling': 'smoothScrolling', 'setting-sticky-scroll': 'stickyScroll', 'setting-indent-guides': 'indentationGuides', 'setting-bracket-colorization': 'bracketColorization', 'setting-code-folding': 'codeFolding', 'setting-format-on-save': 'formatOnSave',
      'setting-auto-save': 'autoSave', 'setting-auto-save-delay': 'autoSaveDelay', 'setting-history-limit': 'historyLimit', 'setting-terminal-start': 'terminalStart',
      'setting-preview-delay': 'previewDelay', 'setting-preview-device': 'previewDevice', 'setting-auto-preview': 'autoPreview', 'setting-preview-console': 'previewConsole', 'setting-preview-forms': 'previewForms',
      'setting-terminal-profile': 'terminalProfile', 'setting-terminal-font-size': 'terminalFontSize', 'setting-terminal-scrollback': 'terminalScrollback', 'setting-terminal-welcome': 'terminalWelcome',
      'setting-registry-url': 'registryUrl', 'setting-plugin-restore': 'restorePlugins', 'setting-legacy-editor-access': 'legacyExtensionEditorAccess'
    };
    Object.entries(map).forEach(([id, key]) => { const input = document.getElementById(id); if (!input) return; if (input.type === 'checkbox') input.checked = Boolean(this.settings[key]); else input.value = String(this.settings[key]); });
  }
  saveSettings() {
    const value = (id) => document.getElementById(id).value;
    const number = (id) => Number(value(id));
    const checked = (id) => document.getElementById(id).checked;
    this.settings = {
      ...this.settings,
      theme: value('setting-theme'), accent: value('setting-accent'), density: value('setting-density'), sidebarWidth: number('setting-sidebar-width'), reducedMotion: checked('setting-reduced-motion'), showActivityBar: checked('setting-show-activity-bar'), showStatusBar: checked('setting-show-status-bar'),
      fontSize: number('setting-font-size'), fontFamily: value('setting-font-family'), lineHeight: number('setting-line-height'), tabSize: number('setting-tab-size'), insertSpaces: checked('setting-insert-spaces'), wordWrap: value('setting-word-wrap'), lineNumbers: value('setting-line-numbers'), cursorStyle: value('setting-cursor-style'), cursorBlinking: value('setting-cursor-blinking'), renderWhitespace: value('setting-render-whitespace'), autoClosingBrackets: value('setting-auto-closing-brackets'), minimap: checked('setting-minimap'), smoothScrolling: checked('setting-smooth-scrolling'), stickyScroll: checked('setting-sticky-scroll'), indentationGuides: checked('setting-indent-guides'), bracketColorization: checked('setting-bracket-colorization'), codeFolding: checked('setting-code-folding'), formatOnSave: checked('setting-format-on-save'),
      autoSave: value('setting-auto-save') === 'true', autoSaveDelay: number('setting-auto-save-delay'), historyLimit: number('setting-history-limit'), terminalStart: checked('setting-terminal-start'),
      previewDelay: number('setting-preview-delay'), previewDevice: value('setting-preview-device'), autoPreview: checked('setting-auto-preview'), previewConsole: checked('setting-preview-console'), previewForms: checked('setting-preview-forms'),
      terminalProfile: value('setting-terminal-profile'), terminalFontSize: number('setting-terminal-font-size'), terminalScrollback: number('setting-terminal-scrollback'), terminalWelcome: checked('setting-terminal-welcome'),
      registryUrl: value('setting-registry-url').trim() || DEFAULT_REGISTRY, restorePlugins: checked('setting-plugin-restore'), legacyExtensionEditorAccess: checked('setting-legacy-editor-access')
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); this.applySettings(); this.pluginHost.updateContext(); this.closeModal('settings-modal'); this.toast('Settings saved.', 'success');
  }
  applySettings() {
    document.body.dataset.theme = this.settings.theme; document.body.dataset.density = this.settings.density; document.documentElement.style.setProperty('--accent', this.settings.accent); document.documentElement.style.setProperty('--side-width', `${this.settings.sidebarWidth}px`); document.documentElement.style.setProperty('--terminal-font-size', `${this.settings.terminalFontSize}px`);
    document.body.classList.toggle('reduced-motion', this.settings.reducedMotion); document.body.classList.toggle('activitybar-hidden', !this.settings.showActivityBar); document.body.classList.toggle('statusbar-hidden', !this.settings.showStatusBar); this.setDevice(this.settings.previewDevice); this.applyEditorSettings();
  }
  applyEditorSettings() {
    if (!this.editor) return;
    this.editor.updateOptions({ fontFamily: this.settings.fontFamily, fontSize: this.settings.fontSize, lineHeight: this.settings.lineHeight, tabSize: this.settings.tabSize, insertSpaces: this.settings.insertSpaces, wordWrap: this.settings.wordWrap, minimap: { enabled: this.settings.minimap }, lineNumbers: this.settings.lineNumbers, renderWhitespace: this.settings.renderWhitespace, cursorStyle: this.settings.cursorStyle, cursorBlinking: this.settings.cursorBlinking, smoothScrolling: this.settings.smoothScrolling, stickyScroll: { enabled: this.settings.stickyScroll }, guides: { indentation: this.settings.indentationGuides }, bracketPairColorization: { enabled: this.settings.bracketColorization }, folding: this.settings.codeFolding, autoClosingBrackets: this.settings.autoClosingBrackets });
    const themes = { midnight: 'studio-midnight', slate: 'studio-slate', aurora: 'studio-aurora', paper: 'studio-paper', contrast: 'studio-contrast' }; this.monaco?.editor.setTheme(themes[this.settings.theme] || 'studio-midnight');
  }

  openExtensionHub() { this.pluginHost.renderHub(); this.openModal('extension-hub-modal'); }
  async openMarketplace() { this.closeModal('extension-hub-modal'); this.openModal('marketplace-modal'); if (!this.registry.length) await this.loadRegistry(); else this.renderMarketplace(); }
  async loadRegistry() {
    this.dom.marketplaceList.innerHTML = '<p class="modal-copy">Loading extension registry…</p>';
    try {
      const url = new URL(this.settings.registryUrl); if (!isAllowedExtensionUrl(url)) throw new Error('The extension registry must use HTTPS (or a localhost development URL).');
      const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error(`Registry returned ${response.status}.`);
      const payload = await response.json(); const entries = Array.isArray(payload) ? payload : (payload.plugins || payload.extensions || []);
      this.registry = entries.filter((entry) => entry && entry.id && entry.name && entry.url).map((entry) => ({ id: String(entry.id), name: String(entry.name), version: String(entry.version || '1.0.0'), author: String(entry.author || 'Community'), description: String(entry.description || 'No description provided.'), category: String(entry.category || 'Extension'), url: String(entry.url), permissions: entry.permissions && typeof entry.permissions === 'object' ? entry.permissions : {} })); this.renderMarketplace(); this.log('info', `Loaded ${this.registry.length} extension entries from the registry.`);
    } catch (error) { this.registry = []; this.dom.marketplaceList.innerHTML = `<p class="modal-copy">Could not load the extension registry: ${escapeHtml(error.message)}<br><br>Check the Registry URL in Settings, then try again.</p>`; this.log('error', `Extension registry: ${error.message}`); }
  }
  renderMarketplace() {
    const query = this.dom.marketplaceSearch.value.trim().toLowerCase(); const plugins = this.registry.filter((plugin) => !query || `${plugin.name} ${plugin.description} ${plugin.author} ${plugin.category}`.toLowerCase().includes(query));
    this.dom.marketplaceList.innerHTML = plugins.map((plugin) => { const installed = this.installedPlugins.some((item) => item.id === plugin.id); return `<article class="extension-card"><div class="extension-mark">${escapeHtml(plugin.name.slice(0, 2).toUpperCase())}</div><div><h3>${escapeHtml(plugin.name)}</h3><div class="extension-meta">${escapeHtml(plugin.category)} · v${escapeHtml(plugin.version)} · ${escapeHtml(plugin.author)}</div><p>${escapeHtml(plugin.description)}</p><div class="extension-meta">Permissions: ${escapeHtml(pluginPermissionSummary(plugin))}</div></div><div class="extension-actions">${installed ? `<button class="toolbar-btn" data-plugin-remove="${escapeHtml(plugin.id)}">Remove</button>` : `<button class="primary-btn" data-plugin-install="${escapeHtml(plugin.id)}">Install</button>`}</div></article>`; }).join('') || '<p class="modal-copy">No extensions match that search.</p>';
    this.dom.marketplaceList.querySelectorAll('[data-plugin-install]').forEach((button) => button.addEventListener('click', () => this.installPlugin(button.dataset.pluginInstall))); this.dom.marketplaceList.querySelectorAll('[data-plugin-remove]').forEach((button) => button.addEventListener('click', () => this.removePlugin(button.dataset.pluginRemove)));
  }
  async installPlugin(id) {
    const manifest = this.registry.find((plugin) => plugin.id === id); if (!manifest) return;
    const accepted = await this.confirm(`Install ${manifest.name}?`, `Permissions: ${pluginPermissionSummary(manifest)}.\n\nThis extension runs in a restricted sandbox and cannot use Electron or your terminal. Any network domain needs separate approval for this session when it connects.`, 'Install extension');
    if (!accepted) return;
    try {
      const url = new URL(manifest.url); if (!isAllowedExtensionUrl(url)) throw new Error('Extension sources must use HTTPS (or a localhost development URL).');
      const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error(`Extension source returned ${response.status}.`);
      const source = await response.text(); const plugin = { ...manifest, source, installedAt: Date.now() }; await this.pluginHost.enable(plugin); this.installedPlugins = [...this.installedPlugins.filter((item) => item.id !== plugin.id), plugin]; localStorage.setItem(PLUGINS_KEY, JSON.stringify(this.installedPlugins)); this.renderInstalled(); this.renderMarketplace(); this.toast(`${plugin.name} installed in a sandbox.`, 'success');
    } catch (error) { this.log('error', `Could not install ${manifest.name}: ${error.message}`); this.toast(`Could not install ${manifest.name}.`, 'error'); }
  }
  removePlugin(id) { const plugin = this.installedPlugins.find((item) => item.id === id); this.pluginHost.disable(id); this.installedPlugins = this.installedPlugins.filter((item) => item.id !== id); localStorage.setItem(PLUGINS_KEY, JSON.stringify(this.installedPlugins)); this.renderInstalled(); this.renderMarketplace(); this.toast(`${plugin?.name || 'Extension'} removed.`, 'success'); }
  restorePlugins() { this.renderInstalled(); if (!this.settings.restorePlugins) return; this.installedPlugins.forEach((plugin) => this.pluginHost.enable(plugin).catch((error) => this.log('error', `Could not restore ${plugin.name}: ${error.message}`))); }
  renderInstalled() { this.dom.installedExtensions.innerHTML = this.installedPlugins.length ? this.installedPlugins.map((plugin) => `<div class="installed-item"><span class="extension-mark">${escapeHtml(plugin.name.slice(0, 1))}</span><span class="installed-item-name">${escapeHtml(plugin.name)}<small>v${escapeHtml(plugin.version)}</small></span><button class="mini-btn" data-remove-installed="${escapeHtml(plugin.id)}" title="Remove extension">×</button></div>`).join('') : '<p class="side-copy">No installed extensions.</p>'; this.dom.installedExtensions.querySelectorAll('[data-remove-installed]').forEach((button) => button.addEventListener('click', () => this.removePlugin(button.dataset.removeInstalled))); }

  openModal(id) { document.getElementById(id)?.classList.add('open'); }
  closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
  toast(message, kind = 'info') { const toast = document.createElement('div'); toast.className = `toast ${kind}`; toast.textContent = message; this.dom.toastRegion.append(toast); setTimeout(() => toast.remove(), 3800); }
}

document.addEventListener('DOMContentLoaded', () => { window.AllInStudio = new Studio(); });
