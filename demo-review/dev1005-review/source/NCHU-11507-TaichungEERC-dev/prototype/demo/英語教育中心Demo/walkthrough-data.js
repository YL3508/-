/* 規則確認會的資料與匯出格式。討論選項不會改變 Demo 的業務判斷。 */
(function (root) {
  const steps = [
    { id: 'workspace', title: '共用學校工作區', role: 'host', page: 'host-home', kind: '可操作導覽', source: '已確認的團隊決議', task: '以具承辦權限的學校帳號進入，查看「學校作業」及「競賽承辦」兩組選單。', question: '承辦者保留一般學校功能時，這樣的入口是否清楚？', options: ['清楚，維持同一工作區', '需要調整選單名稱或位置', '待小組討論'] },
    { id: 'competition', title: '建立競賽', role: 'host', page: 'competition-settings', kind: '展示草稿', source: 'PDF 第 4 頁；REQ-038', task: '套用一筆歷史設定，修改本屆資料；檢查須知、評分標準是否必填，並在確認視窗核對後儲存。', question: '重辦同類競賽時，歷史設定應怎麼使用？', options: ['複製成新草稿，再逐項確認', '只帶入部分欄位', '待小組討論'] },
    { id: 'rules', title: '組別、名額與時窗', role: 'host', page: 'group-settings', kind: '展示草稿', source: 'PDF 第 3–5 頁；REQ-023、040–044', task: '查看班級數判組、兩類教師上限及三段時間；競賽總名額與學校上限在上一頁，皆未套用核心報名。', question: '報名名額何時被占用？', options: ['送出後即占用（含待審與補件）', '審核通過後才占用', '由每場競賽另訂', '待小組討論'] },
    { id: 'submit', title: '學校送出報名', role: 'school', page: 'application', kind: '可操作核心流程', source: 'PDF 第 4–5 頁；REQ-041–046', task: '先故意漏填，再填假資料按送出；在預覽視窗核對、返回修改一次，最後確定送出並確認完成提示。', question: '「一筆報名」應代表什麼？', options: ['一名參賽者', '一支隊伍（隊內可多人）', '每場競賽自行設定', '待小組討論'] },
    { id: 'supplement', title: '承辦要求補件', role: 'host', page: 'review', kind: '可操作核心流程', source: 'PDF 第 5 頁；REQ-045', task: '查看剛才那筆案件，寫具體審核意見並按「要求補件」。', question: '如果承辦學校也報名同一場競賽，誰能審自己的案件？', options: ['承辦人迴避，由其他人審', '改由系統管理員審', '可自審，但留操作紀錄', '待小組討論'] },
    { id: 'roster-before', title: '補件中的名冊', role: 'host', page: 'reports', kind: '摘要示例', source: 'PDF 第 5 頁；REQ-045–046；團隊已選名冊 A', task: '補件狀態時查看全部報名摘要與目前審核通過名冊；待補件案件應只出現在摘要。', question: '是否符合已確認的名冊 A：只列目前審核通過案件？', options: ['符合', '不符合，請記錄問題', '尚未測試'] },
    { id: 'resubmit', title: '學校查看並重送', role: 'school', page: 'application', kind: '可操作核心流程', source: 'PDF 第 5 頁；REQ-045', task: '檢查補件意見，換一個示範附件後重送，再看案件是否回到待審。', question: '補件時學校可以改哪些內容？', options: ['只可補附件', '可改附件與參賽資料', '由競賽設定可改範圍', '待小組討論'] },
    { id: 'approve', title: '再次審核並核准', role: 'host', page: 'review', kind: '可操作核心流程', source: 'PDF 第 5 頁；REQ-045', task: '檢查重送後仍是同一筆案件，確認歷程仍在，再按「核准報名」。', question: '核准後如發現資料錯誤，應如何處理？', options: ['禁止學校修改，承辦另開修正流程', '退回補件並重審', '依時窗允許學校自行修改', '待小組討論'] },
    { id: 'roster', title: '核准後的名冊', role: 'host', page: 'reports', kind: '摘要示例', source: 'PDF 第 5 頁；REQ-046', task: '再次查看名冊預覽：剛核准的案件應立即出現。此版尚未輸出 PDF、Excel、Word。', question: '名冊匯出前還需要哪些確認？', options: ['承辦確認後可匯出', '管理員另行確認後可匯出', '待小組討論'] },
    { id: 'closed', title: '已結案歷史查詢', role: 'host', page: 'closed', kind: '預建情境', source: '團隊已選結案 C；結案方式待決', task: '查看預建歷史競賽；確認只能查閱，不能把目前案件直接標成已結案。', question: '目前只讀的歷史畫面能否支援承辦回查？', options: ['可先使用', '需要補欄位或搜尋，請記錄', '尚未測試'] },
    { id: 'public', title: '發布並查看公開結果', role: 'host', page: 'awards', kind: '預建情境', source: 'PDF 第 5 頁；REQ-047–049', task: '先按「發布固定示範公告」，再按「以訪客查看公告」。此頁與剛才的報名案件、抽籤及計分無關。', question: '得獎公告的對外欄位如何決定？', options: ['每場競賽發布前勾選', '全站固定相同欄位', '待小組討論'] },
  ];
  const blank = () => ({ version: 1, step: 0, choices: {}, remarks: {}, issues: [] });
  function normalize(input) {
    const base = blank();
    if (!input || typeof input !== 'object') return base;
    base.step = Number.isInteger(input.step) && input.step >= 0 && input.step < steps.length ? input.step : 0;
    base.choices = input.choices && typeof input.choices === 'object' && !Array.isArray(input.choices) ? input.choices : {};
    base.remarks = input.remarks && typeof input.remarks === 'object' && !Array.isArray(input.remarks) ? input.remarks : {};
    base.issues = Array.isArray(input.issues) ? input.issues.filter(x => x && typeof x.text === 'string').slice(0, 100) : [];
    return base;
  }
  const tidy = value => String(value ?? '').replace(/\r/g, '').trim();
  function feedback(data, caseStatus) {
    const state = normalize(data);
    const lines = ['# Demo 3 小組確認回饋', '', '此為小組走查紀錄；選項不會改變 Demo，未標示正式核定的內容不得當作正式需求。', '', `Demo 案件狀態：${caseStatus || '尚無案件'}。`, '', '## 逐步討論', ''];
    steps.forEach((step, i) => {
      lines.push(`${i + 1}. **${step.title}**（${step.kind}；${step.source}）`);
      lines.push(`   - 問題：${step.question}`);
      lines.push(`   - 小組選項：${step.options.includes(state.choices[step.id]) ? state.choices[step.id] : '未選擇／待確認'}`);
      if (tidy(state.remarks[step.id])) lines.push(`   - 補充：${tidy(state.remarks[step.id])}`);
    });
    lines.push('', '## 操作時發現的問題', '');
    if (!state.issues.length) lines.push('目前未記錄問題。');
    state.issues.forEach((issue, i) => {
      const step = steps.find(x => x.id === issue.stepId);
      lines.push(`${i + 1}. [${tidy(issue.kind) || '問題'}] ${step?.title || '未指定步驟'}：${tidy(issue.text)}`);
      if (tidy(issue.expected)) lines.push(`   - 希望的行為：${tidy(issue.expected)}`);
    });
    lines.push('', '## 請 Codex 協助', '', '請先區分 PDF 明載、已確認決議、走查建議與待決規則；不要把上面未確認的選項直接寫成正式需求。先回覆問題分類與影響，再修改 Demo 或規格。', '');
    return lines.join('\n');
  }
  root.RuleWalkthroughCore = { steps, blank, normalize, feedback };
})(typeof window !== 'undefined' ? window : globalThis);
