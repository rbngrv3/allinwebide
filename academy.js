const STORAGE_KEY = 'all-in-studio.academy.v1';
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

const lessons = [
  {
    id: 'landing-structure', number: '01', title: 'Structure a landing page', level: 'Foundation', file: 'index.html',
    summary: 'Build a meaningful, accessible page skeleton.', xp: 80,
    starter: `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Focus</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <!-- Build your page here -->\n</body>\n</html>`,
    objectives: [
      ['main', 'Create a <main> landmark', (code) => /<main[\s>]/i.test(code)],
      ['heading', 'Add one descriptive <h1>', (code) => /<h1[^>]*>\s*[^<\s][\s\S]*?<\/h1>/i.test(code)],
      ['button', 'Include a button with a clear action', (code) => /<button[^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(code)]
    ],
    hints: ['Landmarks describe the job of a region. Start with <main>.', 'A page should have a single primary heading.', 'Buttons describe what happens: “Start free”, “Save draft”, and so on.']
  },
  {
    id: 'visual-system', number: '02', title: 'Create a visual system', level: 'Foundation', file: 'style.css',
    summary: 'Use variables and hierarchy to make the interface feel intentional.', xp: 100,
    starter: `:root {\n  --surface: #101827;\n  --ink: #f4f7ff;\n  --accent: #7c8cff;\n}\n\nbody {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n`,
    objectives: [
      ['variables', 'Define a reusable custom property', (code) => /--[\w-]+\s*:/i.test(code)],
      ['contrast', 'Give the page a background color', (code) => /background(?:-color)?\s*:/i.test(code)],
      ['focus', 'Style a button with an accent color', (code) => /button[\s\S]*?\{[\s\S]*?(?:background|color)[\s\S]*?\}/i.test(code)]
    ],
    hints: ['Custom properties begin with two dashes, such as --accent.', 'A background on body makes the visual foundation explicit.', 'Target the button selector, then use var(--accent) for a consistent accent.']
  },
  {
    id: 'first-interaction', number: '03', title: 'Make it respond', level: 'Interaction', file: 'script.js',
    summary: 'Wire a focused interaction without reaching for a framework.', xp: 120,
    starter: `const button = document.querySelector('button');\n\n// Make the page react to a click.\n`,
    objectives: [
      ['select', 'Select an element from the page', (code) => /document\.querySelector(?:All)?\s*\(/.test(code)],
      ['listen', 'Listen for a click event', (code) => /addEventListener\s*\(\s*['\"]click['\"]/.test(code)],
      ['change', 'Change visible page content', (code) => /(?:textContent|innerText|classList\.(?:add|toggle)|style\.)/.test(code)]
    ],
    hints: ['You already have a selector—save it in a variable.', 'The pattern is element.addEventListener("click", () => { ... }).', 'Try changing textContent, toggling a class, or updating a style.']
  },
  {
    id: 'inclusive-interface', number: '04', title: 'Design for everyone', level: 'Quality', file: 'index.html',
    summary: 'Strengthen a UI with labels, alternate text, and real controls.', xp: 140,
    starter: `<!-- Improve an existing page, or start with this small form. -->\n<label for="email">Email address</label>\n<input id="email" type="email">\n`,
    objectives: [
      ['label', 'Connect a label to an input', (code) => /<label[^>]*for\s*=\s*["'][^"']+["'][^>]*>/i.test(code)],
      ['alt', 'Add meaningful alternate text to an image', (code) => /<img[^>]*\balt\s*=\s*["'][^"']{2,}["'][^>]*>/i.test(code)],
      ['focus', 'Provide a visible :focus-visible style', (code) => /:focus-visible\s*\{[\s\S]*?(?:outline|box-shadow)[\s\S]*?\}/i.test(code)]
    ],
    hints: ['Use the same string for label “for” and input “id”.', 'An image alt should explain its purpose, not just say “image”.', 'Place a :focus-visible rule in style.css so keyboard focus is never invisible.']
  }
];

export class AcademyEngine {
  constructor(studio) {
    this.studio = studio;
    this.root = document.getElementById('academy-root');
    this.state = this.load();
    this.activeLessonId = null;
    this.hintIndex = 0;
    this.root.addEventListener('click', (event) => this.handleClick(event));
    this.render();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { completed: Array.isArray(saved?.completed) ? saved.completed : [], xp: Number(saved?.xp) || 0 };
    } catch { return { completed: [], xp: 0 }; }
  }

  persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); }
  reset() { this.state = { completed: [], xp: 0 }; this.activeLessonId = null; this.persist(); this.render(); this.studio.toast('Academy progress reset.'); }
  get activeLesson() { return lessons.find((lesson) => lesson.id === this.activeLessonId); }

  render() {
    if (!this.root) return;
    if (this.activeLesson) this.renderMission(); else this.renderOverview();
  }

  renderOverview() {
    const completed = this.state.completed.length;
    const percentage = Math.round((completed / lessons.length) * 100);
    const project = this.studio.projectBrief || {};
    const tasks = Array.isArray(project.tasks) ? project.tasks : [];
    const finishedTasks = tasks.filter((task) => task.done).length;
    const projectContext = project.goal
      ? `<section class="academy-project-bridge"><div><span class="academy-kicker">YOUR PROJECT</span><h3>${escapeHtml(project.goal)}</h3><p>${escapeHtml(project.audience || 'Audience not recorded yet.')} · ${finishedTasks}/${tasks.length} milestones complete</p></div><div class="academy-project-actions"><button class="toolbar-btn" data-academy="project">Project cockpit</button><button class="toolbar-btn" data-academy="review">Shipping review</button></div></section>`
      : `<section class="academy-project-bridge is-empty"><div><span class="academy-kicker">YOUR PROJECT</span><h3>Give your learning a destination.</h3><p>Add a local goal and a few milestones; Academy will keep them in view while you build.</p></div><button class="toolbar-btn" data-academy="project">Set project goal</button></section>`;
    this.root.innerHTML = `
      <div class="academy-hero">
        <div class="academy-kicker">BUILD BY DOING</div>
        <h2>Your practical path.</h2>
        <p>Short missions that change real files in your workspace.</p>
        <div class="academy-progress"><div class="academy-progress-top"><span>${this.state.xp} XP</span><span>${completed}/${lessons.length} complete</span></div><div class="progress-track"><div class="progress-fill" style="width:${percentage}%"></div></div></div>
      </div>
      ${projectContext}
      <div class="lesson-list">${lessons.map((lesson) => {
        const done = this.state.completed.includes(lesson.id);
        return `<article class="lesson-card ${done ? 'done' : ''}" data-lesson="${lesson.id}"><div class="lesson-number">${done ? '✓' : lesson.number} · ${lesson.level}</div><div class="lesson-title">${lesson.title}</div><div class="lesson-summary">${lesson.summary}</div></article>`;
      }).join('')}</div>`;
  }

  renderMission() {
    const lesson = this.activeLesson;
    const file = this.studio.getFile(lesson.file);
    const code = file?.content || '';
    const complete = lesson.objectives.map(([, , validate]) => validate(code));
    const allDone = complete.every(Boolean);
    const hint = lesson.hints[Math.min(this.hintIndex, lesson.hints.length - 1)];
    this.root.innerHTML = `
      <div class="academy-mission">
        <button class="mission-back" data-academy="back">← All missions</button>
        <div class="academy-kicker">${lesson.level.toUpperCase()} · ${lesson.xp} XP</div>
        <h2 class="mission-title">${lesson.title}</h2>
        <p class="mission-copy">${lesson.summary} Work in <strong>${lesson.file}</strong>; progress checks as you type.</p>
        <div class="objective-list">${lesson.objectives.map(([id, text], index) => `<div class="objective ${complete[index] ? 'complete' : ''}"><span class="objective-state">${complete[index] ? '✓' : '○'}</span><span>${text}</span></div>`).join('')}</div>
        ${this.hintIndex >= 0 ? `<div class="hint-box">Tip ${Math.min(this.hintIndex + 1, lesson.hints.length)}/${lesson.hints.length}: ${hint}</div>` : ''}
        <div class="academy-actions"><button class="toolbar-btn" data-academy="hint">Need a hint</button><button class="primary-btn" data-academy="check">${allDone ? (this.state.completed.includes(lesson.id) ? 'Complete ✓' : 'Claim XP') : 'Check mission'}</button></div>
      </div>`;
  }

  handleClick(event) {
    const lessonCard = event.target.closest('[data-lesson]');
    if (lessonCard) return this.start(lessonCard.dataset.lesson);
    const action = event.target.closest('[data-academy]')?.dataset.academy;
    if (action === 'back') { this.activeLessonId = null; this.hintIndex = 0; this.render(); }
    if (action === 'hint') { this.hintIndex = Math.min(this.hintIndex + 1, this.activeLesson.hints.length - 1); this.render(); }
    if (action === 'check') this.check();
    if (action === 'project') this.studio.openProjectCockpit();
    if (action === 'review') this.studio.openShippingReview();
  }

  start(id) {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return;
    this.activeLessonId = id;
    this.hintIndex = 0;
    if (!this.studio.getFile(lesson.file)) this.studio.createFile(lesson.file, lesson.starter, { open: false });
    this.studio.openFile(lesson.file);
    this.studio.setActiveView('academy');
    this.render();
  }

  check() {
    const lesson = this.activeLesson;
    if (!lesson) return;
    const code = this.studio.getFile(lesson.file)?.content || '';
    const finished = lesson.objectives.every(([, , validate]) => validate(code));
    if (!finished) { this.studio.toast('Keep going—one or more objectives still need attention.', 'error'); this.render(); return; }
    if (!this.state.completed.includes(lesson.id)) {
      this.state.completed.push(lesson.id);
      this.state.xp += lesson.xp;
      this.persist();
      this.studio.toast(`Mission complete. +${lesson.xp} XP`, 'success');
    } else this.studio.toast('That mission is already complete.', 'success');
    this.render();
  }

  onWorkspaceChanged() { if (this.activeLesson) this.renderMission(); else this.renderOverview(); }
}
