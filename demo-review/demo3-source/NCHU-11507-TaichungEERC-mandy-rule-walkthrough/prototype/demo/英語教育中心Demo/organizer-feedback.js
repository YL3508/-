/* Teammate feedback shown as clearly labelled Demo-only flows. */
(function(){
  const originalPage=organizerPage;
  organizerPage=function(application){
    if(role!=='host')return originalPage(application);
    const title=heading('COMPETITION · ORGANIZER','已結案競賽','示範國小 B｜競賽承辦權限');
    if(page==='closed')return title+`<div class="note warning">團隊目前選擇先提供歷史查詢。結案方式、結案後修改及資料保留規則尚待討論，本版不提供結案操作。</div><section class="card"><h2>已結案競賽｜預建歷史示例</h2>${organizerTable(['競賽','記錄時間','核准案件數'],repo.getClosedCompetitions().map(item=>[esc(item.title),esc(item.closedAt),String(item.approved)]))}</section>`;
    if(page==='reports')return heading('COMPETITION · ORGANIZER','報名資料／報表','示範國小 B｜競賽承辦權限')+`<div class="note">正式名冊預覽隨核准狀態更新，只列目前審核通過的示範案件。尚未產出正式 PDF、Excel 或 Word。</div><section class="card"><h2>全部報名摘要</h2>${application?organizerTable(['案件','學校','參賽者','狀態'],[[esc(application.id),esc(application.school),esc(application.student),badge(application.status)]]):'<p>尚無報名資料。</p>'}<h2 style="margin-top:28px">正式名冊預覽｜僅通過案件</h2>${application?.status==='approved'?organizerTable(['案件','學校','組別','參賽者'],[[esc(application.id),esc(application.school),esc(application.group),esc(application.student)]]):'<div class="roster-empty">目前沒有通過案件；待審與待補件不列入。</div>'}<div class="section-head"><h2>文件與報表</h2></div>${organizerTable(['文件','需求格式','本版'],[['報名表暨授權書','PDF','公版尚待取得'],['參賽名冊','Excel','畫面預覽，未匯出'],['評審評分表','Word','欄位示意，未匯出']])}</section>`;
    let html=originalPage(application);
    if(page!=='competition-settings')return html;
    const history=repo.getOrganizerHistory();
    const templates=`<section class="card"><h2>沿用歷史競賽設定</h2><p>選用舊設定只帶入草稿，請再次核對本屆日期、須知、評分與名額。</p><div class="actions"><select id="template-choice" aria-label="歷史競賽設定">${history.map(item=>`<option value="${esc(item.id)}">${esc(item.settings.title)} · ${esc(item.savedAt)}</option>`).join('')}</select><button id="use-template" type="button">套用到草稿</button></div></section>`;
    html=html.replace('<form id="organizer-settings">',templates+'<form id="organizer-settings">');
    const settings=repo.getOrganizerSettings();
    const optionalCap=(label,key)=>`<label class="field">${label}（選填示意）<input name="${key}" type="number" min="0" step="1" value="${esc(settings[key]??'')}"></label>`;
    const remaining=(key)=>settings[key]===''||settings[key]==null?'未設定':Math.max(0,Number(settings[key])-(application?1:0));
    const capacity=`<h2>其他名額條件｜每場競賽選用（示範草稿）</h2><div class="form-grid">${optionalCap('參賽人／組總上限','participantLimit')}${optionalCap('參賽學校總上限','participatingSchoolsLimit')}${optionalCap('本組名額上限','groupLimit')}</div><p>未選用的上限請留空。依目前一筆示範案件計算的剩餘量：總名額 ${remaining('participantLimit')}、學校 ${remaining('participatingSchoolsLimit')}、本組 ${remaining('groupLimit')}。尚未套用報名限制。</p>`;
    html=html.replace('<div class="note">待決：名額',capacity+'<div class="note">待決：名額');
    html=html.replace('儲存展示草稿</button> <button type="button" data-page="group-settings">','預覽並儲存草稿</button> <button type="button" id="save-template">保留為歷史設定示例</button> <button type="button" data-page="group-settings">');
    html=html.replace('</form>',`<dialog id="organizer-confirm" aria-labelledby="organizer-confirm-title"><h2 id="organizer-confirm-title">再確認競賽設定</h2><p>請核對這次示範設定；確認後才儲存草稿，不會公告或開放真實報名。</p><div id="organizer-confirm-body"></div><div class="actions"><button type="button" id="organizer-confirm-back">返回修改</button><button type="button" id="organizer-confirm-save" class="primary">確認儲存草稿</button></div></dialog></form>`);
    return html;
  };

  bindOrganizer=function(){
    document.querySelector('#use-template')?.addEventListener('click',()=>{
      try{repo.useOrganizerTemplate(document.querySelector('#template-choice').value);render();notify('已套用歷史設定；請重新核對並儲存。');}catch(error){notify(error.message);}
    });
    document.querySelector('#save-template')?.addEventListener('click',()=>{
      try{repo.saveOrganizerTemplate();render();notify('已保留目前已儲存的競賽草稿為示範歷史設定。');}catch(error){notify(error.message);}
    });
    const form=document.querySelector('#organizer-settings');
    if(!form)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const values=Object.fromEntries(new FormData(form));
      const status=document.querySelector('#settings-status');
      if(page==='group-settings'){
        for(const key of ['student','song','duration','needs'])values[key]=form.elements[key].checked;
        if(Number(values.classMin)>Number(values.classMax)){status.textContent='班級數下限不能大於上限。';return;}
        for(const key of ['registration','edit','upload'])if(values[key+'Start']>=values[key+'End']){status.textContent='每個時段的結束時間需晚於開始時間。';return;}
      }
      if(page==='competition-settings'){
        if(!values.notice?.trim()||!values.criteria?.trim()){
          status.textContent='競賽須知與評分標準都必須填寫內容。';
          return;
        }
        values.notice=values.notice.trim();
        values.criteria=values.criteria.trim();
        const summary=document.querySelector('#organizer-confirm-body');
        summary.innerHTML=`<dl class="confirm-list">${[['競賽',values.title],['時間',values.date],['地點',values.location],['競賽須知',values.notice],['評分標準',values.criteria],['每校上限',values.schoolLimit],['參賽總上限',values.participantLimit],['學校總上限',values.participatingSchoolsLimit],['本組名額',values.groupLimit]].map(([name,value])=>`<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
        const dialog=document.querySelector('#organizer-confirm');
        document.querySelector('#organizer-confirm-back').onclick=()=>dialog.close();
        document.querySelector('#organizer-confirm-save').onclick=()=>{
          repo.saveOrganizerSettings(values);
          dialog.close();
          render();
          notify('展示草稿已儲存；名額與日期尚未套用核心報名案例。');
        };
        dialog.showModal();
      }else{
        repo.saveOrganizerSettings(values);
        status.textContent='已儲存展示草稿；未套用核心報名規則。';
      }
    });
  };
})();
