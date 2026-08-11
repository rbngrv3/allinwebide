IDE.registerPanel({
  id: 'http-lab',
  title: 'HTTP Lab',
  icon: 'HT',
  description: 'Saved requests and a response inspector'
});

const escape = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const headerObject = (text) => String(text || '').split('\n').reduce((headers, line) => { const point = line.indexOf(':'); if (point > 0) headers[line.slice(0, point).trim()] = line.slice(point + 1).trim(); return headers; }, {});
const safeHeaders = (headers) => Object.fromEntries(Object.entries(headers).filter(([key]) => !/^(authorization|cookie|x-api-key)$/i.test(key)));

async function renderPanel() {
  const root = IDE.getPanelRoot(); if (!root) return;
  root.innerHTML = `<style>*{box-sizing:border-box}main{min-height:100%;padding:22px;background:#111a29;color:#eaf0ff;font:13px system-ui,sans-serif}.eyebrow{color:#91a6ff;font:800 10px ui-monospace,monospace;letter-spacing:.11em}h1{margin:5px 0;font-size:24px;letter-spacing:-.04em}.copy{margin:0 0 18px;color:#afbed8;line-height:1.5}.request{display:grid;grid-template-columns:115px minmax(0,1fr) auto;gap:8px}.field,textarea,select{width:100%;border:1px solid #34435f;border-radius:8px;background:#0c1423;color:#eef4ff;padding:10px;font:12px ui-monospace,monospace;outline:0}.field:focus,textarea:focus,select:focus{border-color:#7694f4}textarea{min-height:92px;resize:vertical;margin-top:8px}.send{border:1px solid #7694f4;border-radius:8px;background:#6680df;color:white;padding:0 16px;font-weight:800;cursor:pointer}.labels{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.labels label{color:#91a4c4;font-size:10px;font-weight:800;letter-spacing:.08em}.labels textarea{margin-top:5px}.bar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:18px 0 8px}.bar strong{font-size:12px}.save{border:1px solid #34435f;border-radius:7px;background:#18253d;color:#d7e3fb;padding:7px 9px;font-size:11px;cursor:pointer}.result{min-height:220px;margin:0;padding:13px;overflow:auto;border:1px solid #2d3b55;border-radius:9px;background:#0a111e;color:#c9d7ed;font:11px/1.55 ui-monospace,monospace;white-space:pre-wrap}.result.error{color:#ffb0bf}.status{color:#8ca5df;font:11px ui-monospace,monospace}</style><main><div class="eyebrow">HTTP LAB</div><h1>Test the edge of your app.</h1><p class="copy">Requests run through the Studio host. The first request to each domain needs your approval for this session.</p><div class="request"><select class="method"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select><input class="field url" placeholder="https://api.example.com/v1/status"><button class="send">Send</button></div><div class="labels"><label>HEADERS<textarea class="headers" placeholder="Accept: application/json"></textarea></label><label>BODY<textarea class="body" placeholder='{"example": true}'></textarea></label></div><div class="bar"><div><strong>Response</strong><div class="status">Ready for a request.</div></div><button class="save">Save non-secret fields</button></div><pre class="result">Send a request to inspect the response here.</pre></main>`;
  const method = root.querySelector('.method'), url = root.querySelector('.url'), headers = root.querySelector('.headers'), body = root.querySelector('.body'), result = root.querySelector('.result'), status = root.querySelector('.status');
  const saved = await IDE.storage.get('last-request', null); if (saved) { method.value = saved.method || 'GET'; url.value = saved.url || ''; headers.value = saved.headers || ''; body.value = saved.body || ''; }
  root.querySelector('.save').addEventListener('click', async () => { const parsed = safeHeaders(headerObject(headers.value)); await IDE.storage.set('last-request', { method: method.value, url: url.value.trim(), headers: Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join('\n'), body: body.value }); IDE.showMessage('Saved non-secret request fields.', 'success'); });
  root.querySelector('.send').addEventListener('click', async () => {
    if (!url.value.trim()) return IDE.showMessage('Enter a request URL first.', 'error');
    result.classList.remove('error'); result.textContent = 'Sending request...'; status.textContent = 'Waiting for the host…';
    try { const response = await IDE.request({ method: method.value, url: url.value.trim(), headers: headerObject(headers.value), body: body.value }); status.textContent = `${response.status} ${response.statusText}${response.truncated ? ' · response truncated' : ''}`; let display = response.body || '(empty response)'; try { display = JSON.stringify(JSON.parse(display), null, 2); } catch {} result.textContent = display; IDE.addStatusBarItem(`<span>HTTP ${response.status}</span>`); }
    catch (error) { status.textContent = 'Request failed'; result.classList.add('error'); result.textContent = error.message; }
  });
}

if (IDE.getSurface() === 'panel') renderPanel();
else IDE.addStatusBarItem('<span>HTTP Lab</span>');

return { activate() {} };
