/* Mock repository: replace these methods with API calls when backend is ready. */
(function(){
const initial=()=>({application:null,results:false,organizerSettings:{},organizerHistory:[{id:'T-SAMPLE',savedAt:'上屆示例',settings:{title:'英語朗讀競賽（上屆示例）',date:'2026-10-20T09:00',location:'示範活動中心',notice:'請依公告確認報名資格與參賽資料。',criteria:'評分項目以各屆公告為準。',schoolLimit:'2'}}],closedCompetitions:[{id:'C-SAMPLE',closedAt:'歷史示例',title:'上屆英語朗讀競賽',approved:24}]});
let state=initial();
const clone=x=>JSON.parse(JSON.stringify(x));
function record(text){state.application.history.push({time:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}),text});}
window.DemoRepository={
 get:()=>clone(state),getOrganizerSettings:()=>clone(state.organizerSettings),saveOrganizerSettings(values){state.organizerSettings={...state.organizerSettings,...clone(values)};},
 getOrganizerHistory:()=>clone(state.organizerHistory),saveOrganizerTemplate(){const settings=clone(state.organizerSettings);if(!settings.title?.trim())throw Error('請先儲存競賽名稱。');state.organizerHistory.unshift({id:'T-'+Date.now(),savedAt:new Date().toLocaleString('zh-TW'),settings});},
 useOrganizerTemplate(id){const template=state.organizerHistory.find(item=>item.id===id);if(!template)throw Error('找不到這筆歷史設定。');state.organizerSettings=clone(template.settings);},
 getClosedCompetitions:()=>clone(state.closedCompetitions),reset(){state=initial();},
 submit(data){if(state.application)throw Error('已有報名案件，請使用補件流程。');if(!data.student.trim()||!data.teacher.trim()||!data.attachment)throw Error('請填寫姓名、指導教師並選擇示範附件。');state.application={...data,id:'ENG-001',school:'示範國小 A',status:'pending',comment:'',history:[]};record('學校送出報名與文件');},
 review(action,comment){const a=state.application;if(!a||a.status!=='pending')throw Error('僅待審核案件可執行審核。');if(action==='revision'&&!comment.trim())throw Error('請填寫補件原因，讓學校知道如何修正。');a.status=action;a.comment=comment;record(action==='approved'?'承辦學校核准報名':'承辦學校要求補件：'+comment);},
 resubmit(attachment){const a=state.application;if(!a||a.status!=='revision')throw Error('目前案件不在補件階段。');if(!attachment)throw Error('請選擇補件用的示範附件。');a.attachment=attachment;a.status='pending';record('學校重新送出補件');},
 publish(){state.results=true;}
};
})();
