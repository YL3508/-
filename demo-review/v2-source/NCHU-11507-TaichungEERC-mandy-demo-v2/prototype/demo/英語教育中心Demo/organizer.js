/* Organizer views. All editable values are mock drafts behind a repository interface. */
const organizerItems=[['host-home','承辦工作台'],['competition-settings','競賽建立／編輯'],['group-settings','組別與報名設定'],['review','報名審核'],['reports','報名資料／報表'],['draw','出場序抽籤'],['scores','成績與序位'],['awards','得獎公告']];
const organizerRoutes=organizerItems.map(x=>x[0]).filter(x=>x!=='review');
const settingDefaults={title:'英語朗讀競賽',date:'2026-10-20T09:00',location:'示範活動中心',notice:'請依組別準備朗讀內容及報名資料。',criteria:'依正式競賽辦法提供評分標準；此為展示文字。',schoolLimit:'2',group:'國小朗讀組',classMin:'1',classMax:'24',mentorLimit:'2',supportLimit:'1',registrationStart:'2026-09-30T09:00',registrationEnd:'2026-10-05T17:00',editStart:'2026-10-06T09:00',editEnd:'2026-10-08T17:00',uploadStart:'2026-10-09T09:00',uploadEnd:'2026-10-12T17:00',student:true,song:true,duration:true,needs:true};
function workspaceNav(){
 const link=([id,label])=>`<button data-page="${id}" class="${id===page?'active':''}" ${id===page?'aria-current="page"':''}>${label}</button>`;
 const group=(title,items)=>`<div class="workspace-group"><h2>${title}</h2>${items.map(link).join('')}</div>`;
 if(role==='visitor')return publicNav().map(link).join('');
 if(role==='host')return group('學校作業',[['application','本校報名／補件'],['competition','競賽列表／詳情'],['survey','線上填報'],['resource','教學資源與成果'],['plan','計畫與經費填報']])+group('競賽承辦',organizerItems)+group('共用',[['home','公開網站'],['guide','展示說明']]);
 return (role==='admin'?[['admin','管理工作台']]:[['application','我的競賽案件']]).concat([['competition','競賽專區'],['results','出場序與成果']],modules.map(m=>[m[0],m[1]]),[['home','公開網站'],['guide','展示說明']]).map(link).join('');
}
function organizerField(label,name,type='text'){
 const value=repo.getOrganizerSettings()[name]??settingDefaults[name]??'';
 return `<label class="field">${label}${type==='textarea'?`<textarea name="${name}">${esc(value)}</textarea>`:`<input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0" step="1"':''} required>`}</label>`;
}
function organizerTable(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function organizerPage(a){
 if(role!=='host')return heading('ORGANIZER','競賽承辦功能','請以具承辦權限的學校帳號操作。')+button('模擬承辦登入','host','primary');
 const label=organizerItems.find(x=>x[0]===page)[1];
 const top=heading('COMPETITION · ORGANIZER',label,'示範國小 B｜同一學校帳號 · 一般學校＋競賽承辦權限');
 const preview='<div class="note warning">展示情境：所有日期、名額與內容均是假資料。設定只儲存在本次頁面記憶體，不影響核心報名案例；重新整理或重設後還原。</div>';
 if(page==='host-home')return top+`<div class="note">從左側「學校作業」處理本校事務，從「競賽承辦」管理所承辦競賽。團隊已確認採用此分組方式。</div><section class="card"><span class="badge green">已開通承辦權限 · 模擬</span><h2>${esc(repo.getOrganizerSettings().title||settingDefaults.title)}</h2><p>目前核心案件：${a?esc(a.school)+' · '+statusText[a.status]:'尚無報名'}。案件狀態與報名審核同步。</p><button data-page="review" class="primary">前往報名審核</button></section><div class="section-head"><h2>競賽辦理流程</h2></div><div class="grid">${organizerItems.slice(1).map(([id,title],i)=>`<button class="card link" data-page="${id}"><span class="number">${i+1}</span><h3>${title}</h3><span class="badge">${id==='review'?'可操作核心流程':id.includes('settings')?'可編輯展示草稿':'預建情境'}</span></button>`).join('')}</div>`;
 if(page==='competition-settings')return top+preview+`<form id="organizer-settings"><section class="card"><h2>比賽資訊</h2><p>需求來源：PDF 第 4 頁（四）競賽設定第 2 項；此處編輯預建競賽草稿。</p><div class="form-grid">${organizerField('比賽名稱','title')}${organizerField('比賽時間','date','datetime-local')}${organizerField('比賽地點','location')}${organizerField('每校報名人／組數上限（示範值）','schoolLimit','number')}</div>${organizerField('競賽須知','notice','textarea')}${organizerField('評分標準','criteria','textarea')}<div class="note">待決：名額按人或按組計算、跨組名額及哪些案件狀態占名額，尚未定案。</div><button class="primary" type="submit">儲存展示草稿</button> <button type="button" data-page="group-settings">前往組別與報名設定</button><p id="settings-status" role="status"></p></section></form>`;
 if(page==='group-settings')return top+preview+`<form id="organizer-settings"><section class="card"><h2>組別與報名資格</h2><div class="form-grid">${organizerField('組別名稱','group')}${organizerField('適用班級數下限（展示假設）','classMin','number')}${organizerField('適用班級數上限（展示假設）','classMax','number')}</div><p>PDF 明定依匯入班級數限制組別；班級數由管理員匯入。學年度、區間邊界及多組別條件待確認。</p><h2>參賽者報名欄位</h2><div class="setting-checks">${[['student','姓名'],['song','參賽曲目名稱'],['duration','預計演出時間'],['needs','競賽需求調查']].map(([key,label])=>`<label><input type="checkbox" name="${key}" ${(repo.getOrganizerSettings()[key]??settingDefaults[key])?'checked':''}>${label}</label>`).join('')}</div><p>勾選為展示配置；正式可關閉欄位及必填規則待確認。新增自訂欄位由管理員處理。</p><div class="form-grid">${organizerField('指導老師填報人數上限','mentorLimit','number')}${organizerField('行政支援老師填報人數上限','supportLimit','number')}</div><p>兩類教師資料均含：姓名、職稱（校長／正式教師／代理代課教師／其他）、獎勵方式（嘉獎／獎狀）。</p><h2>報名、修正與資料上傳期間</h2>${[['報名','registration'],['資料修正','edit'],['純上傳','upload']].map(([label,key])=>`<div class="form-grid">${organizerField(label+'開始',key+'Start','datetime-local')}${organizerField(label+'結束',key+'End','datetime-local')}</div>`).join('')}<div class="note">PDF 明定純上傳時段不可新增報名或修正資料。三段是否必須完全不重疊、補件截止與例外規則仍待確認；展示草稿僅檢查每段起訖。</div><button class="primary" type="submit">儲存展示草稿</button><p id="settings-status" role="status"></p></section></form>`;
 if(page==='reports')return top+`<div class="note">名冊摘要使用核心案件；文件版型為預覽，尚未產出正式 PDF、Excel 或 Word。</div><section class="card"><h2>目前報名摘要</h2>${a?organizerTable(['案件','學校','參賽者','狀態'],[[esc(a.id),esc(a.school),esc(a.student),badge(a.status)]]):'<p>尚無報名資料，請先完成核心報名案例。</p>'}<div class="section-head"><h2>文件與報表</h2></div>${organizerTable(['文件','正式需求','本版呈現'],[['報名表暨授權書','PDF','公版由教育局提供，尚待取得'],['參賽名冊','Excel','上方表格為資料摘要'],['評審評分表','Word','組別、學校、參賽者及評分欄位示意'],['成績總表／簽名','依序位合計由小至大','由成績頁預覽，尚未產出文件']])}</section>`;
 if(page==='draw')return top+`<div class="note warning">預建出場序；未執行隨機抽籤，與核心案件分開展示。</div><section class="card"><h2>國小朗讀組 · 出場序預覽</h2>${organizerTable(['出場序','學校'],[['01','示範國小 C'],['02','示範國小 D'],['03','示範國小 E']])}<p>正式功能：依該組全部報名資料隨機抽籤，並設定公告。重抽權限、鎖定時點及公告時機待確認。</p><span class="badge">抽籤及出場序發布尚未實作</span></section>`;
 if(page==='scores')return top+`<div class="note warning">預建評分情境；未實作登分、排序演算法或同分處理。</div><section class="card"><h2>成績與序位總表</h2>${organizerTable(['學校','評審一 分數／序位','評審二 分數／序位','序位合計'],[['示範國小 C','90／1','92／1','2'],['示範國小 D','88／2','89／2','4'],['示範國小 E','85／3','86／3','6']])}<p>PDF 第 5 頁：手動登錄各評審成績，依各評審成績產生序位，合計由小至大排序，產出總表供評審簽名。</p><div class="note">待決：評審人數、同分序位、同合計名次，以及缺分的處理方式。</div><button data-page="awards">查看得獎公告情境</button></section>`;
 if(page==='awards')return top+`<div class="note warning">名次登錄與公開欄位為預建設定；以下發布按鈕只發布固定假資料。</div><section class="card"><h2>名次與公開欄位</h2><p>PDF 名次選項：第一至第六名、佳作。正式功能可手動登錄名次，並勾選對外公開欄位。</p><p>本版固定公開：學校、組別、出場序、獎項；不公開學生姓名。</p>${organizerTable(['學校','預建名次'],[['示範國小 C','第一名'],['示範國小 D','第二名'],['示範國小 E','佳作']])}<div class="actions">${repo.get().results?'<span class="badge green">示範公告已發布</span>':button('發布固定示範公告','publish','primary')}${button('以訪客查看公告','public-results')}</div></section>`;
}
function bindOrganizer(){
 const form=document.querySelector('#organizer-settings');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();const values=Object.fromEntries(new FormData(form));
 const status=document.querySelector('#settings-status');
 if(page==='group-settings'){
  for(const k of ['student','song','duration','needs'])values[k]=form.elements[k].checked;
  if(Number(values.classMin)>Number(values.classMax)){status.textContent='班級數下限不能大於上限。';return;}
  for(const k of ['registration','edit','upload'])if(values[k+'Start']>=values[k+'End']){status.textContent='每個時段的結束時間需晚於開始時間。';return;}
 }
 repo.saveOrganizerSettings(values);status.textContent='已儲存展示草稿。切換頁面後仍保留；未套用至核心報名規則。';
 });
}
