/* Demo 3 規則走查層：不修改核心模擬資料或驗證規則。 */
(function () {
  if (new URLSearchParams(location.search).get('walkthrough') !== '1') return;
  const core = window.RuleWalkthroughCore;
  if (!core || !window.DemoRepository) return;
  const key = 'eerc-demo3-rule-walkthrough-v1';
  let storageReady = true;
  let raw = null;
  let saved = null;
  try { raw = localStorage.getItem(key); }
  catch { storageReady = false; }
  if (raw) { try { saved = JSON.parse(raw); } catch { saved = null; } }
  const state = core.normalize(saved);
  const statusNames = { pending: '待審核', revision: '待補件', approved: '已核准' };
  const html = document.documentElement;
  html.classList.add('walkthrough-mode');
  const panel = document.createElement('aside');
  panel.id = 'walkthrough';
  panel.setAttribute('aria-label', 'Demo 3 規則確認會工具');
  panel.innerHTML = `
    <div class="wt-head"><div><strong>規則確認會</strong><small>搭配 Demo 3 · 僅供小組走查</small></div><button id="wt-collapse" type="button" aria-expanded="true">收起</button></div>
    <div class="wt-body">
      <div class="wt-progress"><span id="wt-count"></span><span id="wt-live" aria-live="polite"></span></div>
      <div class="wt-bar" aria-hidden="true"><span id="wt-fill"></span></div>
      <div class="wt-step"><span id="wt-kind"></span><h2 id="wt-title"></h2><p id="wt-source"></p><p id="wt-task"></p><button id="wt-open" type="button" class="wt-primary">打開本步畫面</button></div>
      <div class="wt-navigation"><button id="wt-prev" type="button">上一步</button><button id="wt-next" type="button">下一步</button></div>
      <section class="wt-section" aria-labelledby="wt-question-heading"><h3 id="wt-question-heading">這一步要確認</h3><p id="wt-question"></p><label for="wt-choice">小組回覆</label><select id="wt-choice"></select><label for="wt-remark">理由或仍不確定的地方</label><textarea id="wt-remark" rows="3" maxlength="1200" placeholder="例如：名額應依不同競賽設定；仍需確認補件是否占名額"></textarea><small>選項只記錄走查結果，不會改變 Demo 的判斷。</small></section>
      <section class="wt-section" aria-labelledby="wt-issue-heading"><h3 id="wt-issue-heading">操作時發現問題</h3><label for="wt-issue-kind">問題類型</label><select id="wt-issue-kind"><option>流程不符</option><option>規則待定</option><option>欄位缺漏</option><option>畫面看不懂</option><option>其他</option></select><label for="wt-issue-text">看到什麼問題？</label><textarea id="wt-issue-text" rows="3" maxlength="1200" placeholder="請寫具體操作與結果；不要輸入真實孩子資料"></textarea><label for="wt-issue-expected">希望怎麼運作？（可稍後補）</label><textarea id="wt-issue-expected" rows="2" maxlength="1200" placeholder="例如：要求補件後，學校應能看到原因及截止日"></textarea><button id="wt-add" type="button">記下這個問題</button><p id="wt-issue-count"></p><ol id="wt-issues"></ol></section>
      <div class="wt-footer"><button id="wt-copy" type="button" class="wt-primary">複製回饋摘要</button><button id="wt-download" type="button">下載 Markdown</button><button id="wt-reset-case" type="button">只重設 Demo 案件</button><button id="wt-clear" type="button">清空討論紀錄</button><button id="wt-leave" type="button">離開走查模式</button><p id="wt-message" role="status" aria-live="polite"></p><p class="wt-caveat">目前頁面只存假資料與走查筆記。競賽名額、時窗、抽籤與公告仍有展示假設；匯出後請把摘要貼回 Codex 討論。</p></div>
    </div>
    <dialog id="wt-copy-fallback"><h2>請手動複製回饋</h2><p>瀏覽器未開放一鍵複製，請選取下方全文。</p><textarea rows="12" readonly></textarea><button type="button">關閉</button></dialog>`;
  document.body.append(panel);
  const $ = id => panel.querySelector('#' + id);
  function tell(message) { $('wt-message').textContent = message; }
  function save() {
    if (!storageReady) return;
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageReady = false; tell('此瀏覽器無法保存筆記，請先下載 Markdown。'); }
  }
  function caseStatus() {
    const application = window.DemoRepository.get().application;
    return application ? `${application.id} · ${statusNames[application.status] || application.status}` : '尚無案件';
  }
  function updateLive() { $('wt-live').textContent = `Demo：${caseStatus()}`; }
  function issueList() {
    $('wt-issue-count').textContent = `${state.issues.length} 則問題`;
    const list = $('wt-issues');
    list.replaceChildren();
    state.issues.forEach((issue, index) => {
      const li = document.createElement('li');
      const detail = document.createElement('div');
      const step = core.steps.find(item => item.id === issue.stepId);
      detail.textContent = `${issue.kind} · ${step?.title || '未指定步驟'}：${issue.text}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '刪除';
      remove.setAttribute('aria-label', `刪除第 ${index + 1} 則問題`);
      remove.onclick = () => { state.issues.splice(index, 1); save(); issueList(); };
      li.append(detail, remove);
      list.append(li);
    });
  }
  function renderStep() {
    const step = core.steps[state.step];
    $('wt-count').textContent = `步驟 ${state.step + 1} / ${core.steps.length}`;
    $('wt-fill').style.width = `${((state.step + 1) / core.steps.length) * 100}%`;
    $('wt-kind').textContent = step.kind;
    $('wt-title').textContent = step.title;
    $('wt-source').textContent = step.source;
    $('wt-task').textContent = step.task;
    $('wt-question').textContent = step.question;
    $('wt-prev').disabled = state.step === 0;
    $('wt-next').disabled = state.step === core.steps.length - 1;
    const choice = $('wt-choice');
    choice.replaceChildren();
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '尚未選擇';
    choice.append(empty);
    step.options.forEach(text => { const option = document.createElement('option'); option.value = text; option.textContent = text; choice.append(option); });
    choice.value = step.options.includes(state.choices[step.id]) ? state.choices[step.id] : '';
    $('wt-remark').value = state.remarks[step.id] || '';
    updateLive();
  }
  $('wt-open').onclick = () => {
    const step = core.steps[state.step];
    role = step.role;
    navigate(step.page);
    updateLive();
    tell(`已打開「${step.title}」。請在 Demo 主畫面操作。`);
  };
  $('wt-prev').onclick = () => { state.step -= 1; save(); renderStep(); };
  $('wt-next').onclick = () => { state.step += 1; save(); renderStep(); };
  $('wt-choice').onchange = event => { state.choices[core.steps[state.step].id] = event.target.value; save(); };
  $('wt-remark').oninput = event => { state.remarks[core.steps[state.step].id] = event.target.value; save(); };
  $('wt-add').onclick = () => {
    const text = $('wt-issue-text').value.trim();
    if (!text) { tell('請先寫下看到的問題。'); $('wt-issue-text').focus(); return; }
    state.issues.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, stepId: core.steps[state.step].id, kind: $('wt-issue-kind').value, text, expected: $('wt-issue-expected').value.trim() });
    $('wt-issue-text').value = '';
    $('wt-issue-expected').value = '';
    save(); issueList(); tell('已記錄問題；可繼續操作 Demo。');
  };
  function summary() { return core.feedback(state, caseStatus()); }
  $('wt-copy').onclick = async () => {
    try { await navigator.clipboard.writeText(summary()); tell('已複製摘要，請貼回 Codex 對話。'); }
    catch {
      const dialog = $('wt-copy-fallback');
      dialog.querySelector('textarea').value = summary();
      dialog.showModal();
      dialog.querySelector('textarea').select();
    }
  };
  $('wt-copy-fallback button').onclick = () => $('wt-copy-fallback').close();
  $('wt-download').onclick = () => {
    const url = URL.createObjectURL(new Blob([summary()], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'Demo3_規則確認會回饋.md';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    tell('已下載 Markdown。');
  };
  $('wt-reset-case').onclick = () => {
    if (!confirm('只重設 Demo 的模擬案件與公告？走查筆記會保留。')) return;
    window.DemoRepository.reset(); role = 'visitor'; navigate('home'); updateLive(); tell('Demo 案件已重設，討論紀錄保留。');
  };
  $('wt-clear').onclick = () => {
    if (!confirm('清空所有走查選項與問題？此操作無法復原，建議先下載 Markdown。')) return;
    Object.assign(state, core.blank()); save(); renderStep(); issueList(); tell('討論紀錄已清空。');
  };
  $('wt-leave').onclick = () => {
    const url = new URL(location.href); url.searchParams.delete('walkthrough');
    history.replaceState(null, '', url);
    clearInterval(timer); html.classList.remove('walkthrough-mode', 'walkthrough-collapsed'); panel.remove();
  };
  $('wt-collapse').onclick = () => {
    const closed = html.classList.toggle('walkthrough-collapsed');
    $('wt-collapse').textContent = closed ? '展開走查' : '收起';
    $('wt-collapse').setAttribute('aria-expanded', String(!closed));
  };
  const timer = setInterval(updateLive, 700);
  renderStep(); issueList();
  if (!storageReady) tell('此瀏覽器不允許本機儲存；請在結束前下載 Markdown。');
  window.DemoRuleWalkthrough = { state, summary, openStep: index => { state.step = index; save(); renderStep(); $('wt-open').click(); } };
})();
