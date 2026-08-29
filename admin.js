/* =========================================================
   AGULIBRARY — COMPLETE ADMIN.JS
   Complete replacement for the original small uploader.
   Includes:
   - Supabase admin authentication
   - Admin-user authorization
   - Resource upload + database record
   - Student management/search
   - Student notifications
   - Resource management/search
   - Supabase AAL2 TOTP MFA gate for admin dashboard
========================================================= */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const cfg=window.AGU_CONFIG||{};
let db=null, currentSession=null, students=[], resources=[], mfaOpen=false;
const TABLE=window.AGU_RESOURCE_TABLE||"resources";
const BUCKET=window.AGU_BUCKET||window.BUCKET||"agu-library";

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}
function showLoginMessage(text,type="error"){const x=$("loginMessage");if(!x)return;x.textContent=text;x.className="message show "+type;}
function showMessage(text,type="success"){const x=$("message");if(!x)return;x.textContent=text;x.className="message show "+type;}
function hideMessage(){const x=$("message");if(x)x.className="message";}
function getDB(){if(db)return db;if(typeof getSupabase==="function")return db=getSupabase();if(window.supabase&&cfg.supabaseUrl&&cfg.supabaseAnonKey)return db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);throw new Error("Supabase configuration is unavailable.");}
function profileName(p){return [p.first_name,p.middle_name,p.last_name].filter(Boolean).join(" ")||p.full_name||p.name||"Student";}
function profileEmail(p){return p.email||p.email_address||p.student_email||"";}
function profilePhone(p){return p.phone||p.phone_number||p.mobile||"";}
function getId(p){return p.user_id||p.id||p.student_id||"";}

async function isAdmin(session){const d=getDB();const {data,error}=await d.from("admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();if(error)throw error;return !!data;}

async function adminMfaGate(){
  if(mfaOpen) return true;

  const d=getDB();
  let aal;

  try{
    const r=await d.auth.mfa.getAuthenticatorAssuranceLevel();
    if(r.error) throw r.error;
    aal=r.data||{};
  }catch(e){
    console.error(e);
    alert("Administrator MFA status could not be checked: "+(e.message||"Unknown error"));
    return false;
  }

  /* AAL2 is Supabase's server-issued proof that MFA was completed.
     Do not use localStorage as proof of MFA. */
  if(aal.currentLevel==="aal2"){
    mfaOpen=true;
    return true;
  }

  if(aal.nextLevel!=="aal2"){
    alert("MFA is not enrolled for this administrator. Enroll and verify a TOTP authenticator before using the Admin Dashboard.");
    return false;
  }

  let factors;
  try{
    factors=await d.auth.mfa.listFactors();
    if(factors.error) throw factors.error;
  }catch(e){
    console.error(e);
    alert("Administrator MFA could not be checked: "+(e.message||"Unknown error"));
    return false;
  }

  const totp=(factors.data?.totp||[]).find(f=>f.status==="verified");

  if(!totp){
    alert("No verified TOTP authenticator was found for this administrator. Enroll and verify an authenticator before entering the Admin Dashboard.");
    return false;
  }

  const overlay=document.createElement("div");
  overlay.id="aguMfaOverlay";
  overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:99999;display:grid;place-items:center;padding:20px";
  overlay.innerHTML=`<div style="width:min(440px,100%);background:#fff;border-radius:22px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)">
    <h2 style="margin-top:0;color:#123d2d">🔐 Admin MFA Verification</h2>
    <p style="color:#718079;line-height:1.6">Enter the current 6-digit code from your authenticator app to open the AGULIBRARY Admin Dashboard.</p>
    <input id="aguMfaCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" style="width:100%;padding:14px;border:1px solid #cfe5da;border-radius:10px;font-size:20px;letter-spacing:5px;text-align:center">
    <button id="aguMfaVerify" style="width:100%;margin-top:12px;border:0;border-radius:10px;padding:13px;background:#087a4b;color:#fff;font-weight:900" type="button">Verify & Continue</button>
    <button id="aguMfaCancel" style="width:100%;margin-top:8px;border:1px solid #cfe5da;border-radius:10px;padding:13px;background:#edf7f2;color:#17352a;font-weight:800" type="button">Cancel & Sign Out</button>
    <p id="aguMfaError" style="color:#b42323;font-size:13px;min-height:18px"></p>
  </div>`;

  document.body.appendChild(overlay);

  const codeInput=$("aguMfaCode");
  const verifyButton=$("aguMfaVerify");
  const cancelButton=$("aguMfaCancel");
  const errorBox=$("aguMfaError");

  cancelButton.onclick=async()=>{
    overlay.remove();
    mfaOpen=false;
    try{await d.auth.signOut();}catch(e){console.error(e);}
    currentSession=null;
    $("dashboardPanel")?.classList.add("hidden");
    $("loginPanel")?.classList.remove("hidden");
    showLoginMessage("Administrator MFA verification was cancelled. Please sign in again.","error");
  };

  verifyButton.onclick=async()=>{
    const code=(codeInput.value||"").replace(/\D/g,"");

    if(code.length!==6){
      errorBox.textContent="Enter the 6-digit authenticator code.";
      return;
    }

    verifyButton.disabled=true;
    cancelButton.disabled=true;
    errorBox.textContent="Verifying...";

    try{
      const r=await d.auth.mfa.challengeAndVerify({
        factorId:totp.id,
        code
      });

      if(r.error) throw r.error;

      const after=await d.auth.mfa.getAuthenticatorAssuranceLevel();
      if(after.error) throw after.error;

      if(after.data?.currentLevel!=="aal2"){
        throw new Error("MFA verification completed, but this session is not at AAL2. Please try again.");
      }

      const sessionResult=await d.auth.getSession();
      if(sessionResult.error) throw sessionResult.error;
      currentSession=sessionResult.data?.session||currentSession;

      mfaOpen=true;
      overlay.remove();
      await finishAdmin();
    }catch(e){
      console.error(e);
      errorBox.textContent=e.message||"MFA verification failed. Check the code and try again.";
      verifyButton.disabled=false;
      cancelButton.disabled=false;
      codeInput.focus();
      codeInput.select();
    }
  };

  codeInput.addEventListener("input",()=>{
    codeInput.value=codeInput.value.replace(/\D/g,"").slice(0,6);
    if(codeInput.value.length===6) errorBox.textContent="";
  });

  codeInput.addEventListener("keydown",e=>{
    if(e.key==="Enter") verifyButton.click();
  });

  codeInput.focus();
  return false;
}

async function loadStudents(){const d=getDB(),list=$("aguStudentList");if(!list)return;list.innerHTML='<div class="empty">Loading students...</div>';try{const r=await d.from("student_profiles").select("*").order("created_at",{ascending:false});if(r.error)throw r.error;students=r.data||[];$("aguStudentCount").textContent=students.length;renderStudents();updateTargets();}catch(e){list.innerHTML='<div class="empty">❌ Unable to load students.<br><small>'+esc(e.message)+'</small></div>';}}
function renderStudents(){const list=$("aguStudentList"),q=($("aguStudentSearch")?.value||"").toLowerCase().trim();if(!list)return;const rows=students.filter(p=>![profileName(p),profileEmail(p),profilePhone(p)].join(" ").toLowerCase().includes(q)?false:true);if(!rows.length){list.innerHTML='<div class="empty">No students found.</div>';return;}list.innerHTML=rows.map(p=>{const n=profileName(p),id=getId(p),initials=n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();return `<div class="item"><div class="item-main"><div class="avatar">${esc(initials||"ST")}</div><div class="item-text"><strong>${esc(n)}</strong><div class="small">${esc(profileEmail(p))}</div><div class="small">${esc(profilePhone(p))}</div></div></div><button class="btn blue agu-message-student" data-id="${esc(id)}" type="button">Message</button></div>`;}).join("");list.querySelectorAll(".agu-message-student").forEach(b=>b.onclick=()=>{$("aguNotifyTarget").value="student:"+b.dataset.id;$('aguNotifyTitle').focus();});}
function updateTargets(){const s=$("aguNotifyTarget");if(!s)return;s.innerHTML='<option value="all">👥 All students</option>'+students.map(p=>`<option value="student:${esc(getId(p))}">${esc(profileName(p))}${profileEmail(p)?" — "+esc(profileEmail(p)):""}</option>`).join("");}

async function loadResources(){const d=getDB(),list=$("aguResourceList");if(!list)return;list.innerHTML='<div class="empty">Loading resources...</div>';try{const r=await d.from(TABLE).select("*").order("created_at",{ascending:false});if(r.error)throw r.error;resources=r.data||[];$("aguResourceCount").textContent=resources.length;renderResources();}catch(e){list.innerHTML='<div class="empty">❌ Unable to load resources.<br><small>'+esc(e.message)+'</small></div>';}}
function renderResources(){const list=$("aguResourceList"),q=($("aguResourceSearch")?.value||"").toLowerCase().trim();if(!list)return;const rows=resources.filter(r=>[r.title,r.name,r.subject,r.category,r.class_level,r.type,r.folder_path].join(" ").toLowerCase().includes(q));if(!rows.length){list.innerHTML='<div class="empty">No resources found.</div>';return;}list.innerHTML=rows.slice(0,200).map(r=>{const url=r.file_url||r.url||"";return `<div class="item"><div class="item-text"><strong>${esc(r.title||r.name||"Untitled Resource")}</strong><div class="small">${esc(r.subject||r.category||"")} ${r.class_level?"• "+esc(r.class_level):""} ${r.type?"• "+esc(r.type):""}</div><div class="small">${esc(r.folder_path||"")}</div></div>${url?`<a class="btn blue" href="${esc(url)}" target="_blank" rel="noopener">Open</a>`:""}</div>`;}).join("");}

async function uploadFile(e){e.preventDefault();const d=getDB(),title=$("title").value.trim(),category=$("category").value.trim(),type=$("resourceType").value,file=$("file").files[0],status=$("uploadStatus"),button=$("uploadButton");if(!file){status.textContent="Please select a file.";return;}button.disabled=true;status.textContent="Uploading...";try{const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const filename=`resources/${Date.now()}-${safe}`;const up=await d.storage.from(BUCKET).upload(filename,file,{upsert:false});if(up.error)throw up.error;const pub=d.storage.from(BUCKET).getPublicUrl(filename);const url=pub.data.publicUrl;const payload={title,subject:category,type,file_url:url,storage_path:filename,name:title,category,url};let result=await d.from(TABLE).insert(payload);if(result.error){const fallback={name:title,category,type,url};result=await d.from(TABLE).insert(fallback);if(result.error)throw result.error;}status.textContent="✅ Upload successful.";showMessage("Resource uploaded successfully.","success");$("uploadForm").reset();await loadResources();}catch(err){console.error(err);status.textContent="❌ "+(err.message||"Upload failed.");showMessage(err.message||"Upload failed.","error");}finally{button.disabled=false;}}

async function insertNotification(d,recipientId,title,message){const variants=[{student_id:recipientId,title,message,is_read:false},{user_id:recipientId,title,message,is_read:false},{recipient_id:recipientId,title,message,is_read:false},{student_id:recipientId,message,is_read:false},{user_id:recipientId,message,is_read:false}];let last=null;for(const payload of variants){const r=await d.from("student_notifications").insert(payload);if(!r.error)return true;last=r.error;const m=(r.error.message||"").toLowerCase();if(!(m.includes("column")||m.includes("schema cache")||m.includes("could not find")))throw r.error;}throw last||new Error("Could not insert notification.");}
async function sendNotification(){const d=getDB(),target=$("aguNotifyTarget")?.value||"all",title=$("aguNotifyTitle")?.value.trim(),message=$("aguNotifyMessage")?.value.trim(),status=$("aguNotifyStatus");if(!title||!message){status.textContent="Please enter a title and message.";return;}status.textContent="Sending...";try{const recipients=target==="all"?students:students.filter(p=>getId(p)===target.replace("student:",""));if(!recipients.length)throw new Error("No student recipient was found.");let sent=0;for(const p of recipients){const id=getId(p);if(id){await insertNotification(d,id,title,message);sent++;}}status.textContent=`✅ Notification sent to ${sent} student${sent===1?"":"s"}.`;$("aguNotifyTitle").value="";$("aguNotifyMessage").value="";await loadNotificationCount();}catch(e){status.textContent="❌ "+(e.message||"Notification could not be sent.");}}
async function loadNotificationCount(){try{const r=await getDB().from("student_notifications").select("*",{count:"exact",head:true});if(!r.error&&$("aguNotificationCount"))$("aguNotificationCount").textContent=r.count??0;}catch(_){} }

async function finishAdmin(){$("loginPanel").classList.add("hidden");$("dashboardPanel").classList.remove("hidden");if(currentSession)$("adminIdentity").textContent="Signed in as "+(currentSession.user.email||"administrator");await Promise.all([loadStudents(),loadResources(),loadNotificationCount()]);}
async function checkSession(){try{const d=getDB(),r=await d.auth.getSession();if(r.error)throw r.error;currentSession=r.data?.session||null;if(!currentSession){$("loginPanel").classList.remove("hidden");$("dashboardPanel").classList.add("hidden");return;}if(!(await isAdmin(currentSession))){await d.auth.signOut();showLoginMessage("This account is not authorized as an AGULIBRARY administrator.","error");return;}if(await adminMfaGate())await finishAdmin();}catch(e){console.error(e);showLoginMessage(e.message||"Unable to initialize administrator access.","error");}}
async function login(e){e.preventDefault();const button=$("adminLoginButton");button.disabled=true;showLoginMessage("Signing in...","success");try{const d=getDB(),r=await d.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});if(r.error)throw r.error;currentSession=r.data.session;if(!(await isAdmin(currentSession))){await d.auth.signOut();throw new Error("This account is not authorized as an AGULIBRARY administrator.");}showLoginMessage("Authentication successful. Checking administrator verification...","success");if(await adminMfaGate())await finishAdmin();}catch(e){console.error(e);showLoginMessage(e.message||"Sign in failed.","error");}finally{button.disabled=false;}}
async function logout(){try{await getDB().auth.signOut();}catch(e){console.error(e)}localStorage.removeItem("AGU_ADMIN_MFA_VERIFIED_AT");mfaOpen=false;currentSession=null;location.reload();}
function bind(){
 $("adminLoginForm")?.addEventListener("submit",login);$("uploadForm")?.addEventListener("submit",uploadFile);$("logoutButton")?.addEventListener("click",logout);
 $("aguStudentSearch")?.addEventListener("input",renderStudents);$("aguResourceSearch")?.addEventListener("input",renderResources);
 $("aguRefreshStudents")?.addEventListener("click",loadStudents);$("aguRefreshResources")?.addEventListener("click",loadResources);$("refreshAll")?.addEventListener("click",()=>{loadStudents();loadResources();loadNotificationCount();});$("aguSendNotification")?.addEventListener("click",sendNotification);
 $("adminMfaReset")?.addEventListener("click",async()=>{await logout();});
 document.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>{const i=$(b.dataset.target);if(i)i.type=i.type==="password"?"text":"password";}));
 $("year").textContent=new Date().getFullYear();
}
document.addEventListener("DOMContentLoaded",()=>{bind();checkSession();});
window.AGU_ADMIN={loadStudents,loadResources,sendNotification,uploadFile,logout};
})();
