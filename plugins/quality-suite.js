IDE.registerPanel({
  id: 'quality-suite',
  title: 'Quality Suite',
  icon: 'QS',
  description: 'Local accessibility and release checks'
});

const html = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

function checksForWorkspace() {
  const files = IDE.getWorkspaceFiles();
  const page = files.find((file) => /(^|\/)index\.html?$/i.test(file.path)) || files.find((file) => /\.html?$/i.test(file.path));
  const markup = page?.content || '';
  const styles = files.filter((file) => /\.(css|scss)$/i.test(file.path)).map((file) => file.content).join('\n');
  const scripts = files.filter((file) => /\.(js|mjs|cjs)$/i.test(file.path)).map((file) => file.content).join('\n');
  const results = [];
  const add = (level, title, detail) => results.push({ level, title, detail });
  /<!doctype html>/i.test(markup) ? add('pass', 'HTML document type', 'A doctype is present.') : add('warn', 'HTML document type', 'Add <!doctype html> before publishing.');
  /<html\b[^>]*\blang=/i.test(markup) ? add('pass', 'Document language', 'The root element declares a language.') : add('warn', 'Document language', 'Add lang to the <html> element.');
  /<meta\b[^>]*name=["']viewport["']/i.test(markup) ? add('pass', 'Viewport', 'Mobile viewport metadata is present.') : add('warn', 'Viewport', 'Add a viewport meta tag for mobile layouts.');
  /<title>[^<]+<\/title>/i.test(markup) ? add('pass', 'Page title', 'A non-empty title is present.') : add('warn', 'Page title', 'Add a concise page title.');
  const images = [...markup.matchAll(/<img\b[^>]*>/gi)]; const missingAlt = images.filter((match) => !/\balt\s*=/i.test(match[0])).length;
  !images.length ? add('pass', 'Image alternatives', 'No image elements found.') : !missingAlt ? add('pass', 'Image alternatives', `All ${images.length} images declare alt text.`) : add('warn', 'Image alternatives', `${missingAlt} image${missingAlt === 1 ? '' : 's'} need alt text.`);
  /:focus-visible\s*\{/i.test(styles) ? add('pass', 'Keyboard focus', 'A visible focus rule is present.') : add('warn', 'Keyboard focus', 'Add a :focus-visible rule so keyboard focus is visible.');
  /--[\w-]+\s*:/i.test(styles) ? add('pass', 'Design tokens', 'Reusable CSS custom properties were found.') : add('info', 'Design tokens', 'Consider CSS custom properties for repeated colors and spacing.');
  /console\.error\s*\(/.test(scripts) ? add('info', 'Debug output', 'console.error calls remain in project scripts.') : add('pass', 'Debug output', 'No console.error calls were found.');
  return results;
}

function renderPanel() {
  const root = IDE.getPanelRoot(); if (!root) return;
  root.innerHTML = `<style>*{box-sizing:border-box}main{min-height:100%;padding:24px;background:radial-gradient(circle at 100% 0,#253b6830,transparent 34%),#111a29;color:#eaf0ff;font:13px system-ui,sans-serif}.top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:20px}.eyebrow{color:#94a9dd;font:800 10px ui-monospace,monospace;letter-spacing:.11em}.title{margin:5px 0 0;font-size:25px;letter-spacing:-.04em}.copy{margin:7px 0 0;color:#adbbd4;line-height:1.55}.run{border:1px solid #6f88d6;border-radius:8px;padding:9px 12px;background:#6680df;color:white;font-weight:800;cursor:pointer}.summary{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.pill{padding:5px 8px;border:1px solid #34435f;border-radius:999px;color:#c5d3ec;background:#172238;font:800 10px ui-monospace,monospace}.list{display:grid;gap:8px}.check{display:grid;grid-template-columns:76px 1fr;gap:12px;padding:13px;border:1px solid #2d3a53;border-radius:10px;background:#162238}.check b{font:800 10px ui-monospace,monospace;letter-spacing:.08em}.pass b{color:#69d8ad}.warn b{color:#f3c66e}.info b{color:#91a6ff}.check strong{display:block;margin-bottom:4px}.check p{margin:0;color:#aebdd6;font-size:12px;line-height:1.45}</style><main><div class="top"><div><div class="eyebrow">LOCAL QUALITY SUITE</div><h1 class="title">Build with fewer surprises.</h1><p class="copy">Static checks run entirely against the files in this workspace.</p></div><button class="run">Run checks</button></div><div class="summary"></div><div class="list"></div></main>`;
  const run = () => {
    const results = checksForWorkspace(); const counts = results.reduce((all, item) => ({ ...all, [item.level]: all[item.level] + 1 }), { pass: 0, warn: 0, info: 0 });
    root.querySelector('.summary').innerHTML = `<span class="pill">${counts.pass} passed</span><span class="pill">${counts.warn} review</span><span class="pill">${counts.info} notes</span>`;
    root.querySelector('.list').innerHTML = results.map((item) => `<article class="check ${item.level}"><b>${item.level === 'pass' ? 'PASS' : item.level === 'warn' ? 'REVIEW' : 'NOTE'}</b><div><strong>${html(item.title)}</strong><p>${html(item.detail)}</p></div></article>`).join('');
    IDE.addStatusBarItem(`<span>Quality: ${counts.warn} review</span>`);
  };
  root.querySelector('.run').addEventListener('click', run); run();
}

if (IDE.getSurface() === 'panel') renderPanel();
else IDE.addStatusBarItem('<span>Quality Suite</span>');

return { activate() {} };
