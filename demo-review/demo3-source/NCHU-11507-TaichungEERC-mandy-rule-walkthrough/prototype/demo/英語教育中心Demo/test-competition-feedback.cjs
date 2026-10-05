const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const context=vm.createContext({
  window:{},role:'host',page:'competition-settings',modules:[],
  heading:()=>'',button:()=>'',esc:value=>String(value??''),
  badge:value=>`<span>${value}</span>`,statusText:{pending:'待審核',approved:'審核通過'},
  publicNav:()=>[]
});
vm.runInContext(source('data.js'),context);
context.repo=context.window.DemoRepository;
vm.runInContext(source('organizer.js'),context);
vm.runInContext(source('organizer-feedback.js'),context);
const page=()=>vm.runInContext('organizerPage(repo.get().application)',context);
const initial=page();
assert.match(initial,/沿用歷史競賽設定/);
assert.match(initial,/競賽須知（必填）<textarea/);
assert.match(initial,/name="notice" required/);
assert.match(initial,/name="criteria" required/);
assert.match(initial,/參賽學校總上限/);
assert.match(initial,/選填示意/);
assert.match(initial,/再確認競賽設定/);
const repo=context.repo;
repo.saveOrganizerSettings({title:'新競賽',notice:'須知',criteria:'評分'});
repo.saveOrganizerTemplate();
const template=repo.getOrganizerHistory()[0];
repo.saveOrganizerSettings({title:'暫改'});
repo.useOrganizerTemplate(template.id);
assert.equal(repo.getOrganizerSettings().title,'新競賽');
assert.equal(repo.getOrganizerHistory()[0].settings.title,'新競賽');
context.page='reports';
repo.submit({student:'示範參賽者',teacher:'示範教師',attachment:'示範.pdf',group:'朗讀組'});
assert.match(page(),/roster-empty/,'待審核不得列入正式名冊預覽');
repo.review('revision','請補簽名');
assert.match(page(),/roster-empty/,'待補件不得列入正式名冊預覽');
repo.resubmit('補件示範.pdf');
repo.review('approved','');
assert.doesNotMatch(page(),/roster-empty/,'核准後列入正式名冊預覽');
context.page='closed';
assert.match(page(),/上屆英語朗讀競賽/);
assert.match(page(),/不提供結案操作/);
assert.doesNotMatch(page(),/mock-close/);
repo.reset();
assert.equal(repo.get().application,null);
const form={data:{student:'',teacher:'',attachment:'',group:'朗讀組'},events:{},addEventListener(type,callback){this.events[type]=callback;},insertAdjacentHTML(_position,html){this.previewMarkup=html;dialogExists=true;}};
const error={textContent:''};
const preview={shown:false,showModal(){this.shown=true;},close(){this.shown=false;},remove(){dialogExists=false;}};
const controls={'#school-preview-back':{},'#school-preview-confirm':{disabled:false},'#school-preview-error':{textContent:''},'#school-complete-close':{}};
let dialogExists=false,complete=null,renders=0;
context.document={
  querySelector(selector){if(selector==='#registration')return form;if(selector==='#error')return error;if(selector==='#school-preview')return dialogExists?preview:null;return controls[selector]??null;},
  createElement(){return {id:'',innerHTML:'',setAttribute(){},showModal(){this.shown=true;},close(){this.shown=false;},remove(){}};},
  body:{append(node){complete=node;}}
};
context.FormData=class{constructor(element){this.data=element.data;}*[Symbol.iterator](){yield* Object.entries(this.data);}};
context.render=()=>{renders++;};
vm.runInContext(source('school-registration.js'),context);
vm.runInContext('bindSchoolRegistration()',context);
const submit=()=>form.events.submit({preventDefault(){}});
submit();
assert.match(error.textContent,/請填寫/);
assert.equal(repo.get().application,null);
form.data={student:'示範學生',teacher:'示範教師',attachment:'示範.pdf',group:'朗讀組'};
submit();
assert.equal(preview.shown,true);
assert.match(form.previewMarkup,/示範學生/);
assert.equal(repo.get().application,null,'預覽不可先建立案件');
controls['#school-preview-back'].onclick();
assert.equal(preview.shown,false);
submit();
controls['#school-preview-confirm'].onclick();
assert.equal(repo.get().application.status,'pending');
assert.equal(renders,1);
assert.equal(complete.shown,true);
assert.match(complete.innerHTML,/送出完成/);
console.log('PASS: school preview and confirm, organizer required fields, history, approved roster, read-only closed history, reset');
