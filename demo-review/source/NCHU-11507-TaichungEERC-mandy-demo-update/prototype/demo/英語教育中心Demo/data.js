/* Mock repository: replace these methods with API calls when backend is ready. */
(function(){
const initial=()=>({application:null,results:false,organizerSettings:{}});
let state=initial();
const clone=x=>JSON.parse(JSON.stringify(x));
function record(text){state.application.history.push({time:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}),text});}
window.DemoRepository={
 get:()=>clone(state),getOrganizerSettings:()=>clone(state.organizerSettings),saveOrganizerSettings(values){state.organizerSettings={...state.organizerSettings,...clone(values)};},reset(){state=initial();},
 submit(data){if(state.application)throw Error('已有報名案件，請使用補件流程。');if(!data.student.trim()||!data.teacher.trim()||!data.attachment)throw Error('請填寫姓名、指導教師並選擇示範附件。');state.application={...data,id:'ENG-001',school:'示範國小 A',status:'pending',comment:'',history:[]};record('學校送出報名與文件');},
 review(action,comment){const a=state.application;if(!a||a.status!=='pending')throw Error('僅待審核案件可執行審核。');if(action==='revision'&&!comment.trim())throw Error('請填寫補件原因，讓學校知道如何修正。');a.status=action;a.comment=comment;record(action==='approved'?'承辦學校核准報名':'承辦學校要求補件：'+comment);},
 resubmit(attachment){const a=state.application;if(!a||a.status!=='revision')throw Error('目前案件不在補件階段。');if(!attachment)throw Error('請選擇補件用的示範附件。');a.attachment=attachment;a.status='pending';record('學校重新送出補件');},
 publish(){state.results=true;}
};
})();
