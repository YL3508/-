/* Two-step registration confirmation for the fictional competition case. */
function bindSchoolRegistration(){
  const form=document.querySelector('#registration');
  if(!form)return;
  const error=document.querySelector('#error');
  form.addEventListener('input',()=>{error.textContent='';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form));
    if(!data.student?.trim()||!data.teacher?.trim()||!data.attachment){
      error.textContent='請填寫參賽者、指導教師並選擇示範附件。';
      return;
    }
    const existing=document.querySelector('#school-preview');
    existing?.remove();
    form.insertAdjacentHTML('beforeend',`<dialog id="school-preview" aria-labelledby="school-preview-title">
      <h2 id="school-preview-title">確認競賽報名資料</h2>
      <p>請逐項核對；按「確定送出」後才會建立模擬案件。</p>
      <dl class="confirm-list">
        <div><dt>學校</dt><dd>示範國小 A</dd></div>
        <div><dt>參賽組別</dt><dd>${esc(data.group)}</dd></div>
        <div><dt>參賽者</dt><dd>${esc(data.student.trim())}</dd></div>
        <div><dt>指導教師</dt><dd>${esc(data.teacher.trim())}</dd></div>
        <div><dt>示範附件</dt><dd>${esc(data.attachment)}</dd></div>
      </dl>
      <div class="error" id="school-preview-error" role="alert"></div>
      <div class="actions"><button type="button" id="school-preview-back">返回修改</button><button type="button" id="school-preview-confirm" class="primary">確定送出</button></div>
    </dialog>`);
    const dialog=document.querySelector('#school-preview');
    document.querySelector('#school-preview-back').onclick=()=>dialog.close();
    document.querySelector('#school-preview-confirm').onclick=()=>{
      const button=document.querySelector('#school-preview-confirm');
      button.disabled=true;
      try{repo.submit(data);}catch(err){
        document.querySelector('#school-preview-error').textContent=err.message;
        button.disabled=false;
        return;
      }
      render();
      const complete=document.createElement('dialog');
      complete.id='school-complete';
      complete.setAttribute('aria-labelledby','school-complete-title');
      complete.innerHTML='<h2 id="school-complete-title">送出完成</h2><p>模擬案件 ENG-001 已建立，狀態為待審核。可切到承辦工作區查看同一筆案件。</p><div class="actions"><button type="button" class="primary" id="school-complete-close">查看案件</button></div>';
      document.body.append(complete);
      complete.showModal();
      document.querySelector('#school-complete-close').onclick=()=>{complete.close();complete.remove();};
    };
    dialog.showModal();
  });
}
