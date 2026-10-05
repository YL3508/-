/* Fictional administrator tasks for the offline prototype. No API or real accounts. */
(function(){
 const today='2026-10-02';
 const definitions=[
  {id:'content-check',kind:'deadline',title:'確認競賽公告內容',detail:'示範公告預定發布前，核對標題、內容、相關連結與附件。',route:'admin-content',due:'2026-10-02 17:00'},
  {id:'survey-close',kind:'deadline',title:'檢查調查表填報進度',detail:'示範調查表即將截止，檢視尚未填報學校。',route:'admin-surveys',due:'2026-10-05 17:00'},
  {id:'role-request',kind:'request',title:'示範國小 C 申請承辦權限',detail:'收到一筆承辦權限申請，需檢視學校身分與授權資料。',route:'admin-system',received:'2026-10-02 09:20'},
  {id:'plan-request',kind:'request',title:'示範國小 A 的計畫申請待審',detail:'收到一筆計畫填報，需進入審查頁查看資料。',route:'admin-plans',received:'2026-10-02 11:05'}
 ];
 const done=new Set();
 const copy=value=>JSON.parse(JSON.stringify(value));
 window.AdminDemoRepository={
  today,
  all:()=>copy(definitions.map(task=>({...task,done:done.has(task.id)}))),
  pending:()=>copy(definitions.filter(task=>!done.has(task.id))),
  complete(id){if(!definitions.some(task=>task.id===id))throw Error('找不到這筆示範事項。');done.add(id);},
  visitors:()=>({current:12,day:86,month:320,year:1280}),
  reset(){done.clear();}
 };
})();
