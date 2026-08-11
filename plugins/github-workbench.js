IDE.registerPanel({
  id: 'github-workbench',
  title: 'GitHub Workbench',
  icon: 'GH',
  description: 'Issues and pull requests beside your code'
});

const text = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const repositoryPattern = /^[^/\s]+\/[^/\s]+$/;

async function renderPanel() {
  const root = IDE.getPanelRoot(); if (!root) return;
  root.innerHTML = `<style>*{box-sizing:border-box}main{min-height:100%;padding:22px;background:radial-gradient(circle at 100% 0,#394e8b38,transparent 35%),#111a29;color:#eaf0ff;font:13px system-ui,sans-serif}.top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.eyebrow{color:#96ace3;font:800 10px ui-monospace,monospace;letter-spacing:.11em}h1{margin:5px 0;font-size:24px;letter-spacing:-.04em}.copy{margin:0;color:#b0bed7;line-height:1.5}.connection{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;margin:18px 0}.input{width:100%;border:1px solid #34435f;border-radius:8px;background:#0c1423;color:#eef4ff;padding:10px;font:12px ui-monospace,monospace;outline:0}.input:focus{border-color:#7694f4}.refresh{border:1px solid #7694f4;border-radius:8px;background:#6680df;color:#fff;padding:0 14px;font-weight:800;cursor:pointer}.hint{margin:0 0 14px;color:#8497b9;font-size:11px;line-height:1.45}.boards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.board{min-height:280px;border:1px solid #2e3c56;border-radius:10px;background:#142038;overflow:auto}.board h2{position:sticky;top:0;margin:0;padding:11px 12px;border-bottom:1px solid #2e3c56;background:#18263f;font-size:12px}.item{display:block;padding:11px 12px;border-bottom:1px solid #293852;color:#dce7fb;text-decoration:none}.item:hover{background:#1d2d49}.item strong{display:block;font-size:12px;line-height:1.4}.item span{display:block;margin-top:4px;color:#90a2c3;font:10px ui-monospace,monospace}.state{margin:14px 0;color:#9badcf;font:11px ui-monospace,monospace}@media(max-width:720px){.connection,.boards{grid-template-columns:1fr}.refresh{height:36px}}</style><main><div class="top"><div><div class="eyebrow">GITHUB WORKBENCH</div><h1>Keep the work connected.</h1><p class="copy">The built-in GitHub tool handles files. This workspace surfaces issues and pull requests.</p></div></div><div class="connection"><input class="input repo" placeholder="owner/repository"><input class="input token" type="password" placeholder="Fine-grained token (session only)"><button class="refresh">Refresh</button></div><p class="hint">Your token stays in this panel only. It is sent only to api.github.com when you refresh.</p><div class="state">Enter a repository to load its work.</div><section class="boards"><div class="board"><h2>Open issues</h2><div class="issues"></div></div><div class="board"><h2>Open pull requests</h2><div class="pulls"></div></div></section></main>`;
  const repo = root.querySelector('.repo'), token = root.querySelector('.token'), state = root.querySelector('.state'), issues = root.querySelector('.issues'), pulls = root.querySelector('.pulls');
  repo.value = await IDE.storage.get('repository', '');
  const headers = () => ({ Accept: 'application/vnd.github+json', ...(token.value.trim() ? { Authorization: `Bearer ${token.value.trim()}` } : {}) });
  const render = (target, entries, empty) => { target.innerHTML = entries.length ? entries.map((item) => `<a class="item" href="${text(item.html_url)}" target="_blank" rel="noreferrer"><strong>#${item.number} ${text(item.title)}</strong><span>${text(item.user?.login || 'unknown')} · ${text(item.state || 'open')}</span></a>`).join('') : `<div class="item"><span>${empty}</span></div>`; };
  root.querySelector('.refresh').addEventListener('click', async () => {
    const value = repo.value.trim(); if (!repositoryPattern.test(value)) return IDE.showMessage('Use owner/repository.', 'error');
    await IDE.storage.set('repository', value); state.textContent = 'Loading GitHub work…'; issues.innerHTML = pulls.innerHTML = '<div class="item"><span>Loading…</span></div>';
    try {
      const base = `https://api.github.com/repos/${value.split('/').map(encodeURIComponent).join('/')}`;
      const [issueResponse, pullResponse] = await Promise.all([IDE.request({ url: `${base}/issues?state=open&per_page=30`, headers: headers() }), IDE.request({ url: `${base}/pulls?state=open&per_page=30`, headers: headers() })]);
      const issueEntries = JSON.parse(issueResponse.body).filter((item) => !item.pull_request); const pullEntries = JSON.parse(pullResponse.body);
      render(issues, issueEntries, 'No open issues.'); render(pulls, pullEntries, 'No open pull requests.'); state.textContent = `${issueEntries.length} issues · ${pullEntries.length} pull requests`; IDE.addStatusBarItem(`<span>GitHub: ${issueEntries.length} issues</span>`);
    } catch (error) { issues.innerHTML = pulls.innerHTML = ''; state.textContent = error.message; IDE.showMessage('GitHub Workbench could not load this repository.', 'error'); }
  });
}

if (IDE.getSurface() === 'panel') renderPanel();
else IDE.addStatusBarItem('<span>GitHub Workbench</span>');

return { activate() {} };
