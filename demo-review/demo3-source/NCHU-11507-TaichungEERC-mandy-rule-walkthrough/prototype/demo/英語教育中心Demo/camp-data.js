/* In-memory mock adapter. Replace with server transactions and unique constraints for production. */
(function () {
  const schools = [{ id:'school-a', name:'示範國小 A' }, { id:'school-b', name:'示範國小 B' }];
  const common = { grades:['三年級','四年級','五年級','六年級'], fee:'免費（示範設定）', location:'示範學校活動教室（非真實地點）', pickup:'家長自行接送；開始前 15 分鐘報到，結束後 15 分鐘內接回。', start:'2026-09-25T09:00:00+08:00', end:'2026-10-15T17:00:00+08:00' };
  const events = [
    {id:'story',title:'英語故事探索營',type:'半日',content:'透過繪本共讀、角色討論與口語遊戲，練習用英語表達。',extras:[],sessions:[{id:'story-am',name:'上午梯次',dates:'2026/10/24',hours:'09:00–12:00',capacity:2,waitCapacity:1},{id:'story-pm',name:'下午梯次',dates:'2026/10/24',hours:'13:00–16:00',capacity:1,waitCapacity:2,used:1}]},
    {id:'explore',title:'生活英語任務營',type:'一日',content:'透過小組任務、情境對話與成果分享，將英語帶入生活。',extras:[{id:'diet',label:'飲食需求',required:true,options:['一般餐','素食','其他（現場向承辦說明）']}],sessions:[{id:'explore-day',name:'全日梯次',dates:'2026/10/25',hours:'09:00–16:00',capacity:1,waitCapacity:1,used:1,waitUsed:1}]},
    {id:'create',title:'英語創作五日營',type:'五日・不過夜',content:'五天依序進行故事發想、角色創作、對話練習、小組排練及分享。須全程參與。',extras:[{id:'pickup',label:'接送安排',required:true,options:['家長自行接送','指定親友接送']}],sessions:[{id:'create-week',name:'第一梯次',dates:'2026/11/02–11/06（週一至週五，共五天）',hours:'每日 09:00–16:00，不含住宿',capacity:2,waitCapacity:1},{id:'create-closed',name:'已截止梯次',dates:'2026/10/05–10/09（週一至週五，共五天）',hours:'每日 09:00–16:00，不含住宿',capacity:2,waitCapacity:1,end:'2026-09-30T17:00:00+08:00'}]}
  ].map(e=>({...common,...e}));
  let registrations=[], tokens=new Map(), sequence=0, epoch=0;
  const copy=x=>JSON.parse(JSON.stringify(x));
  function find(id){for(const event of events){const session=event.sessions.find(s=>s.id===id);if(session)return {event,session};}throw Error('找不到這個梯次，請返回活動列表。');}
  function availability(id,now=Date.parse('2026-10-01T15:00:00+08:00')){
    const {event,session:s}=find(id), rows=registrations.filter(r=>r.sessionId===id);
    const regular=Math.max(0,s.capacity-(s.used||0)-rows.filter(r=>r.status==='regular').length);
    const waiting=Math.max(0,s.waitCapacity-(s.waitUsed||0)-rows.filter(r=>r.status==='waiting').length);
    const start=Date.parse(s.start||event.start),end=Date.parse(s.end||event.end);
    const open=now>=start&&now<=end;
    return {regular,waiting,open,label:now<start?'尚未開放':now>end?'報名已截止':regular?'開放正取':waiting?'開放備取':'已額滿',canApply:open&&(regular+waiting>0)};
  }
  function validate(id,input){
    const {event}=find(id);const data={};
    for(const key of ['child','schoolId','studentId','grade','contact','phone']){data[key]=String(input[key]||'').trim();if(!data[key])throw Error('請填妥孩子與聯絡人的所有基本資料。');if(data[key].length>80)throw Error('欄位內容過長，請確認填寫資料。');}
    if(!schools.some(s=>s.id===data.schoolId))throw Error('請從清單選擇學校。');
    if(!event.grades.includes(data.grade))throw Error('請選擇本活動適用年級。');
    if(!/^[0-9+()\s-]{6,24}$/.test(data.phone))throw Error('請確認聯絡電話格式。');
    // Student ID remains a string: 00123 is distinct from 123. No assumed cross-school format.
    for(const field of event.extras){const value=String(input[field.id]||'').trim();if(field.required&&!value)throw Error('請填寫「'+field.label+'」。');if(value&&!field.options.includes(value))throw Error('請重新選擇活動額外資料。');data[field.id]=value;}
    return data;
  }
  function submit(id,input,token,expectedEpoch,now){
    if(expectedEpoch!==epoch)throw Error('情境已重設，請重新填寫。');
    if(!token)throw Error('缺少送出識別，請重新預覽。');
    if(tokens.has(token))return copy(tokens.get(token));
    const data=validate(id,input), a=availability(id,now);
    if(!a.canApply)throw Error(a.open?'此梯次已額滿，未建立報名。請選擇其他梯次。':'目前不在報名期間，未建立報名。');
    if(registrations.some(r=>r.sessionId===id&&r.data.schoolId===data.schoolId&&r.data.studentId===data.studentId))throw Error('此學生已報名本梯次，請勿重複送出。');
    const receipt={id:'CAMP-DEMO-'+String(++sequence).padStart(4,'0'),sessionId:id,data,status:a.regular>0?'regular':'waiting'};
    registrations.push(receipt);tokens.set(token,receipt);return copy(receipt);
  }
  window.CampRepository={schools:()=>copy(schools),events:()=>copy(events),find:id=>copy(find(id)),availability,validate,submit,epoch:()=>epoch,reset(){registrations=[];tokens.clear();sequence=0;epoch++;}};
})();
