/* AGULIBRARY STUDENT DASHBOARD SAFE ENHANCEMENTS
   Loaded after the existing student dashboard code.
   Existing resources, AI Teacher, search, save and logout logic remain intact.
*/
(function(){
  'use strict';
  let db=null, student=null, poll=null;
  const INVITE_KEY='AGU_STUDENT_INVITATION_CREATED';
  const LAST_NOTICE_KEY='AGU_LAST_NOTICE_SEEN';

  function getDB(){try{return typeof getSupabase==='function'?getSupabase():null}catch(e){return null}}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function css(){
    if(document.getElementById('aguStudentEnhanceStyles'))return;
    const s=document.createElement('style');s.id='aguStudentEnhanceStyles';s.textContent=`
      .agu-menu-button{border:1px solid #bcdccc;background:#fff;color:#087a4b;border-radius:12px;padding:10px 13px;font-size:20px;font-weight:900;cursor:pointer;line-height:1}
      .agu-menu-button:hover{background:#087a4b;color:#fff}
      .agu-notice-button{position:relative;border:1px solid #bcdccc;background:#fff;color:#087a4b;border-radius:12px;padding:10px 13px;font-size:18px;font-weight:900;cursor:pointer}
      .agu-notice-badge{position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;padding:2px 5px;border-radius:20px;background:#c62828;color:#fff;font-size:10px;display:none;text-align:center}
      .agu-side-menu{position:fixed;top:0;right:0;width:min(360px,88vw);height:100vh;background:#fff;z-index:3000;box-shadow:-15px 0 45px rgba(0,0,0,.18);transform:translateX(105%);transition:.25s ease;padding:22px;overflow:auto}
      .agu-side-menu.show{transform:translateX(0)}
      .agu-menu-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:2999;display:none}.agu-menu-backdrop.show{display:block}
      .agu-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}.agu-menu-head h2{margin:0;color:#173b2d}.agu-close{border:0;background:#eef7f2;border-radius:10px;padding:8px 12px;font-size:20px;cursor:pointer}
      .agu-menu-item{display:flex;align-items:center;gap:12px;width:100%;padding:15px;margin-top:10px;border:1px solid #dceee6;background:#f8fcfa;border-radius:14px;text-align:left;color:#173b2d;font-weight:900;cursor:pointer}.agu-menu-item:hover{border-color:#087a4b}
      .agu-panel{display:none;margin-top:18px;padding:20px;background:#fff;border:1px solid #dceee6;border-radius:18px;box-shadow:0 10px 30px rgba(8,122,75,.06)}.agu-panel.show{display:block}.agu-panel h3{margin-top:0;color:#173b2d}.agu-panel p{color:#71847b;line-height:1.6}.agu-panel input,.agu-panel textarea,.agu-panel select{width:100%;padding:12px 13px;border:1px solid #cfe5da;border-radius:10px;margin-top:7px}.agu-panel button{border:0;border-radius:10px;padding:11px 15px;background:#087a4b;color:#fff;font-weight:900;cursor:pointer;margin-top:10px}
      .agu-notice{padding:14px;margin-top:10px;border:1px solid #dceee6;border-radius:13px;background:#f8fcfa}.agu-notice.unread{border-color:#087a4b;background:#eaf8f1}.agu-notice small{color:#71847b}
      .agu-invite-code{font-family:monospace;font-size:22px;letter-spacing:3px;font-weight:900;text-align:center;padding:14px;border:1px dashed #087f55;border-radius:12px;color:#087f55;background:#f8fcfa}
      .agu-teacher-short{font-size:11px;line-height:1.25;font-weight:800;color:#087a4b;text-align:center;max-width:105px;margin-top:5px}
      .ai-agent-header{display:grid!important;grid-template-columns:105px minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:18px;align-items:start}
      .ai-agent-header .ai-agent-avatar{grid-column:1;grid-row:1;width:90px;height:90px;object-fit:cover}
      .ai-agent-header .agu-teacher-short{grid-column:1;grid-row:2}
      .ai-agent-header .ai-agent-heading{grid-column:2;grid-row:1 / span 2;min-width:0}
      .ai-agent-header .ai-agent-status{grid-column:3;grid-row:1;white-space:nowrap}
      .agu-header-space{flex:1}
      .header-actions{gap:8px!important;align-items:center}
      @media(max-width:700px){.ai-agent-header{grid-template-columns:90px minmax(0,1fr);}.ai-agent-header .ai-agent-status{grid-column:2;grid-row:2;justify-self:start}.ai-agent-header .ai-agent-heading{grid-column:2;grid-row:1}.agu-teacher-short{max-width:88px}.header-actions{flex-wrap:wrap}}
    `;document.head.appendChild(s)
  }

  function mount(){
    const main=document.querySelector('main.dashboard'); if(!main||document.getElementById('aguStudentEnhancements'))return;
    css(); db=getDB();
    const headerActions=document.querySelector('.header-actions');
    if(headerActions){
      const menuBtn=document.createElement('button');menuBtn.className='agu-menu-button';menuBtn.id='aguMenuButton';menuBtn.title='Student menu';menuBtn.textContent='☰';headerActions.insertBefore(menuBtn,headerActions.firstChild);
      const noticeBtn=document.createElement('button');noticeBtn.className='agu-notice-button';noticeBtn.id='aguNoticeButton';noticeBtn.title='Notifications';noticeBtn.innerHTML='🔔<span id="aguNoticeBadge" class="agu-notice-badge">0</span>';headerActions.insertBefore(noticeBtn,menuBtn.nextSibling);
    }
    const backdrop=document.createElement('div');backdrop.id='aguMenuBackdrop';backdrop.className='agu-menu-backdrop';document.body.appendChild(backdrop);
    const menu=document.createElement('aside');menu.id='aguStudentEnhancements';menu.className='agu-side-menu';menu.innerHTML=`
      <div class="agu-menu-head"><h2>Student Menu</h2><button class="agu-close" id="aguCloseMenu">×</button></div>
      <button class="agu-menu-item" data-panel="profilePanel">👤 Student Profile</button>
      <button class="agu-menu-item" data-panel="settingsPanel">⚙️ Settings</button>
      <button class="agu-menu-item" data-panel="supportPanel">💬 Support</button>
      <button class="agu-menu-item" data-panel="invitationPanel">🎟️ My Invitation</button>
      <div id="profilePanel" class="agu-panel"><h3>Student Profile</h3><p>Manage the name shown in your AGULIBRARY account.</p><label>Full name<input id="aguProfileName" type="text" autocomplete="name"></label><p id="aguProfileEmailText"></p><label>Profile picture<input id="aguProfilePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><button id="aguSaveProfile">Save Profile</button><div id="aguProfileStatus"></div></div>
      <div id="settingsPanel" class="agu-panel"><h3>Settings</h3><p>Account and notification settings.</p><button id="aguResetPassword">🔑 Send Password Reset Email</button><p id="aguSettingsStatus"></p></div>
      <div id="supportPanel" class="agu-panel"><h3>Support</h3><p>Need help with your AGULIBRARY account, resources or learning experience?</p><p><strong>AGULIBRARY Support</strong><br>Use the support contact provided by the website administrator. Never share your password or authenticator code with anyone.</p></div>
      <div id="invitationPanel" class="agu-panel"><h3>Student Invitation</h3><p>Generate your personal invitation once. After it is created, the same code and link remain available here.</p><div id="aguInvitationContent"></div></div>
      <div id="notificationsPanel" class="agu-panel"><h3>🔔 Notifications</h3><div id="aguNoticeList"><p>Loading notifications...</p></div></div>
    `;document.body.appendChild(menu);
    const aiHeader=document.querySelector('.ai-agent-header');
    if(aiHeader&&!aiHeader.querySelector('.agu-teacher-short')){const x=document.createElement('div');x.className='agu-teacher-short';x.textContent='ASK YOUR AI TEACHER FOR ANY EDUCATIONAL QUESTIONS';aiHeader.appendChild(x)}
    bind(); loadStudent(); loadNotifications(); loadInvitation();
    poll=setInterval(loadNotifications,60000);
  }

  function bind(){
    document.getElementById('aguMenuButton')?.addEventListener('click',()=>toggleMenu(true));
    document.getElementById('aguNoticeButton')?.addEventListener('click',()=>{toggleMenu(true);showPanel('notificationsPanel')});
    document.getElementById('aguCloseMenu')?.addEventListener('click',()=>toggleMenu(false));
    document.getElementById('aguMenuBackdrop')?.addEventListener('click',()=>toggleMenu(false));
    document.querySelectorAll('.agu-menu-item').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
    document.getElementById('aguSaveProfile')?.addEventListener('click',saveProfile);
    document.getElementById('aguResetPassword')?.addEventListener('click',resetPassword);
  }
  function toggleMenu(show){document.getElementById('aguStudentEnhancements')?.classList.toggle('show',show);document.getElementById('aguMenuBackdrop')?.classList.toggle('show',show)}
  function showPanel(id){document.querySelectorAll('#aguStudentEnhancements .agu-panel').forEach(x=>x.classList.remove('show'));const p=document.getElementById(id);if(p){p.classList.add('show');p.scrollIntoView({behavior:'smooth',block:'nearest'})}}

  async function loadStudent(){
    if(!db)return;try{const r=await db.auth.getSession();student=r.data?.session?.user||null;if(!student)return;
      const email=student.email||'';const name=student.user_metadata?.full_name||student.user_metadata?.name||email.split('@')[0]||'Student';
      const pr=await db.from('student_profiles').select('avatar_url,full_name,first_name,last_name,middle_name,phone').eq('user_id',student.id).maybeSingle();
      if(pr.error) console.warn('Profile load:',pr.error);
      const profile=pr.data||{};
      const n=document.getElementById('aguProfileName');if(n)n.value=name;const e=document.getElementById('aguProfileEmailText');if(e)e.textContent='Email: '+email;
      const avatar=profile.avatar_url||student.user_metadata?.avatar_url||'';
      const av=document.getElementById('profileAvatar');
      if(avatar&&av){av.textContent='';av.style.backgroundImage='url("'+avatar.replace(/"/g,'&quot;')+'")';av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.style.color='transparent';}
    }catch(e){console.warn(e)}
  }
  async function saveProfile(){
    if(!db||!student)return;
    const status=document.getElementById('aguProfileStatus');
    const name=document.getElementById('aguProfileName').value.trim();
    const photo=document.getElementById('aguProfilePhoto')?.files?.[0];
    if(!name){status.textContent='Enter your name.';return}
    try{
      let avatarUrl=null;
      if(photo){
        if(photo.size>5*1024*1024) throw new Error('Profile picture must be 5 MB or smaller.');
        const ext=(photo.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
        const path='profiles/'+student.id+'/avatar-'+Date.now()+'.'+(ext||'jpg');
        const up=await db.storage.from((window.AGU_CONFIG&&window.AGU_CONFIG.bucket)||'agu-library').upload(path,photo,{upsert:true,cacheControl:'3600',contentType:photo.type||'image/jpeg'});
        if(up.error)throw up.error;
        avatarUrl=db.storage.from((window.AGU_CONFIG&&window.AGU_CONFIG.bucket)||'agu-library').getPublicUrl(path).data.publicUrl;
      }
      const metadata={full_name:name}; if(avatarUrl)metadata.avatar_url=avatarUrl;
      const r=await db.auth.updateUser({data:metadata}); if(r.error)throw r.error;
      const patch={full_name:name,updated_at:new Date().toISOString()}; if(avatarUrl)patch.avatar_url=avatarUrl;
      const pr=await db.from('student_profiles').update(patch).eq('user_id',student.id); if(pr.error)throw pr.error;
      document.getElementById('profileName')?.replaceChildren(document.createTextNode(name));
      document.getElementById('welcomeName')?.replaceChildren(document.createTextNode(name));
      if(avatarUrl){const av=document.getElementById('profileAvatar'); if(av){av.textContent='';av.style.backgroundImage='url("'+avatarUrl.replace(/"/g,'&quot;')+'")';av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.style.color='transparent';}}
      status.textContent='✅ Profile updated.';
    }catch(e){status.textContent='Unable to update profile: '+(e.message||'Unknown error')}
  }
  async function resetPassword(){
    if(!db||!student)return;const email=student.email;if(!email)return;const status=document.getElementById('aguSettingsStatus');try{const r=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth.html?reset=1'});if(r.error)throw r.error;status.textContent='✅ Password reset email sent to '+email+'.'}catch(e){status.textContent='Unable to send reset email: '+e.message}
  }

  async function loadNotifications(){
    if(!db)return;const list=document.getElementById('aguNoticeList');if(!list)return;
    try{const r=await db.from('admin_messages').select('id,title,body,created_at,send_to_all,recipient_user_id').order('created_at',{ascending:false}).limit(30);if(r.error)throw r.error;
      const rows=(r.data||[]);const last=Number(localStorage.getItem(LAST_NOTICE_KEY)||0);const unread=rows.filter(x=>new Date(x.created_at).getTime()>last).length;const badge=document.getElementById('aguNoticeBadge');if(badge){badge.textContent=unread>9?'9+':String(unread);badge.style.display=unread?'block':'none'}
      list.innerHTML=rows.length?rows.map(x=>`<article class="agu-notice ${new Date(x.created_at).getTime()>last?'unread':''}"><strong>${esc(x.title)}</strong><p>${esc(x.body).replace(/\n/g,'<br>')}</p><small>${new Date(x.created_at).toLocaleString()}</small></article>`).join(''):'<p>No notifications yet.</p>';
      localStorage.setItem(LAST_NOTICE_KEY,String(Date.now()));
    }catch(e){list.innerHTML='<p>Notifications are not available yet. Run the supplied system-upgrade.sql once.</p>'}
  }

  function makeCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<10;i++)c+=chars[Math.floor(Math.random()*chars.length)];return c}
  async function loadInvitation(){
    const box=document.getElementById('aguInvitationContent');if(!box||!db)return;
    try{const r=await db.from('student_invitations').select('id,code,created_at,used').eq('student_owner_id',student?.id||'').order('created_at',{ascending:false}).limit(1);if(r.error)throw r.error;
      if(r.data?.length){const x=r.data[0];renderInvitation(x);return}
      box.innerHTML='<button id="aguGenerateInvitation">🎟️ Generate My Invitation</button>';document.getElementById('aguGenerateInvitation').addEventListener('click',createInvitation);
    }catch(e){box.innerHTML='<p>Invitation support is not available yet. Run the supplied system-upgrade.sql once.</p>'}
  }
  function renderInvitation(x){const link=window.location.origin+'/auth.html?invite='+encodeURIComponent(x.code);document.getElementById('aguInvitationContent').innerHTML=`<div class="agu-invite-code">${esc(x.code)}</div><input id="aguInviteLink" value="${esc(link)}" readonly style="width:100%;padding:12px;margin-top:10px;border:1px solid #cfe5da;border-radius:10px"><button id="aguCopyInvite">📋 Copy Invitation Link</button><p>Created: ${new Date(x.created_at).toLocaleString()}</p>`;document.getElementById('aguCopyInvite').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(link);document.getElementById('aguCopyInvite').textContent='✅ Copied!'}catch(e){document.getElementById('aguInviteLink').select();document.execCommand('copy')}})}
  async function createInvitation(){
    if(!db||!student)return;const code=makeCode();try{const r=await db.from('student_invitations').insert({code,created_by:student.id,student_owner_id:student.id,student_name:student.user_metadata?.full_name||null,student_email:student.email||null,used:false}).select().single();if(r.error)throw r.error;renderInvitation(r.data)}catch(e){alert('Unable to create invitation: '+e.message)}
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,300));
})();
