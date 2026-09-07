/* =========================================================
   AGULIBRARY — COMPLETE ADMIN.JS
   Existing systems preserved:
   - Administrator sign-in + MFA
   - Student management
   - Resource upload/delete
   - Notifications

   Examination Room + Result & Certification:
   - Permanent Supabase examination settings
   - Examination create/edit/publish/delete
   - Question create/edit/delete
   - Registration review and approval/rejection
   - Permanent attempt/result review
   - Certificate review/printing
   - Fixed 5-second question time (not editable)
   ========================================================= */

(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const cfg = window.AGU_CONFIG || {};

  let db = null;
  let currentSession = null;
  let students = [];
  let resources = [];
  let mfaOpen = false;
  let examinations = [];
  let examQuestions = [];
  let examRegistrations = [];
  let examResults = [];
  let examCertificates = [];

  const TABLE = window.AGU_RESOURCE_TABLE || "resources";
  const BUCKET = window.AGU_BUCKET || window.BUCKET || "agu-library";
  const EXAM_SECONDS = 5;

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function showLoginMessage(text, type = "error") {
    const x = $("loginMessage");
    if (!x) return;
    x.textContent = text;
    x.className = "message show " + type;
  }

  function showMessage(text, type = "success") {
    const x = $("message");
    if (!x) return;
    x.textContent = text;
    x.className = "message show " + type;
  }

  function getDB() {
    if (db) return db;

    if (typeof getSupabase === "function") {
      return db = getSupabase();
    }

    if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
      return db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    }

    throw new Error("Supabase configuration is unavailable.");
  }

  /* ---------------- STUDENT HELPERS ---------------- */

  function profileName(p) {
    return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ")
      || p.full_name || p.name || "Student";
  }

  function profileEmail(p) {
    return p.email || p.email_address || p.student_email || "";
  }

  function profilePhone(p) {
    return p.phone || p.phone_number || p.mobile || "";
  }

  function getId(p) {
    return p.id || p.user_id || p.student_id || "";
  }

  function studentById(id) {
    return students.find(p => String(getId(p)) === String(id)) || null;
  }

  function studentLabel(id) {
    const p = studentById(id);
    if (!p) return String(id || "Student");
    const name = profileName(p);
    const email = profileEmail(p);
    return email ? `${name} — ${email}` : name;
  }

  /* ---------------- ADMIN AUTHORIZATION ---------------- */

  async function isAdmin(session) {
    const r = await getDB()
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (r.error) throw r.error;
    return !!r.data;
  }

  /* ---------------- MFA ---------------- */

  async function adminMfaGate() {
    if (mfaOpen) return true;

    const d = getDB();
    let aal;

    try {
      const r = await d.auth.mfa.getAuthenticatorAssuranceLevel();
      if (r.error) throw r.error;
      aal = r.data || {};
    } catch (e) {
      console.error(e);
      alert("Administrator MFA status could not be checked: " + (e.message || "Unknown error"));
      return false;
    }

    if (aal.currentLevel === "aal2") {
      mfaOpen = true;
      return true;
    }

    if (aal.nextLevel !== "aal2") {
      alert("MFA is not enrolled for this administrator. Enroll and verify a TOTP authenticator before using the Admin Dashboard.");
      return false;
    }

    let factors;
    try {
      factors = await d.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
    } catch (e) {
      console.error(e);
      alert("Administrator MFA could not be checked: " + (e.message || "Unknown error"));
      return false;
    }

    const totp = (factors.data?.totp || []).find(f => f.status === "verified");

    if (!totp) {
      alert("No verified TOTP authenticator was found for this administrator.");
      return false;
    }

    const overlay = document.createElement("div");
    overlay.id = "aguMfaOverlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:99999;display:grid;place-items:center;padding:20px";

    overlay.innerHTML = `
      <div style="width:min(440px,100%);background:#fff;border-radius:22px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)">
        <h2 style="margin-top:0;color:#123d2d">🔐 Admin MFA Verification</h2>
        <p style="color:#718079;line-height:1.6">Enter the current 6-digit code from your authenticator app to continue.</p>
        <input id="aguMfaCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"
          style="width:100%;padding:14px;border:1px solid #cfe5da;border-radius:10px;font-size:20px;letter-spacing:5px;text-align:center">
        <button id="aguMfaVerify" type="button" style="width:100%;margin-top:12px;border:0;border-radius:10px;padding:13px;background:#087a4b;color:#fff;font-weight:900">Verify & Continue</button>
        <button id="aguMfaCancel" type="button" style="width:100%;margin-top:8px;border:1px solid #cfe5da;border-radius:10px;padding:13px;background:#edf7f2;color:#17352a;font-weight:800">Cancel & Sign Out</button>
        <p id="aguMfaError" style="color:#b42323;font-size:13px;min-height:18px"></p>
      </div>`;

    document.body.appendChild(overlay);

    const codeInput = $("aguMfaCode");
    const verifyButton = $("aguMfaVerify");
    const cancelButton = $("aguMfaCancel");
    const errorBox = $("aguMfaError");

    cancelButton.onclick = async () => {
      overlay.remove();
      mfaOpen = false;
      try { await d.auth.signOut(); } catch (e) { console.error(e); }
      currentSession = null;
      $("dashboardPanel")?.classList.add("hidden");
      $("loginPanel")?.classList.remove("hidden");
      showLoginMessage("Administrator MFA verification was cancelled. Please sign in again.", "error");
    };

    verifyButton.onclick = async () => {
      const code = (codeInput.value || "").replace(/\D/g, "");
      if (code.length !== 6) {
        errorBox.textContent = "Enter the 6-digit authenticator code.";
        return;
      }

      verifyButton.disabled = true;
      cancelButton.disabled = true;
      errorBox.textContent = "Verifying...";

      try {
        const r = await d.auth.mfa.challengeAndVerify({ factorId: totp.id, code });
        if (r.error) throw r.error;

        const after = await d.auth.mfa.getAuthenticatorAssuranceLevel();
        if (after.error) throw after.error;
        if (after.data?.currentLevel !== "aal2") {
          throw new Error("MFA verification completed, but this session is not at AAL2. Please try again.");
        }

        const sessionResult = await d.auth.getSession();
        if (sessionResult.error) throw sessionResult.error;

        currentSession = sessionResult.data?.session || currentSession;
        mfaOpen = true;
        overlay.remove();
        await finishAdmin();
      } catch (e) {
        console.error(e);
        errorBox.textContent = e.message || "MFA verification failed. Check the code and try again.";
        verifyButton.disabled = false;
        cancelButton.disabled = false;
        codeInput.focus();
        codeInput.select();
      }
    };

    codeInput.addEventListener("input", () => {
      codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
      if (codeInput.value.length === 6) errorBox.textContent = "";
    });

    codeInput.addEventListener("keydown", e => {
      if (e.key === "Enter") verifyButton.click();
    });

    codeInput.focus();
    return false;
  }

  /* ---------------- STUDENTS ---------------- */

  async function loadStudents() {
    const list = $("aguStudentList");
    if (!list) return;

    list.innerHTML = '<div class="empty">Loading students...</div>';

    try {
      const r = await getDB().from("student_profiles").select("*");
      if (r.error) throw r.error;

      students = Array.isArray(r.data) ? r.data : [];
      students.sort((a, b) => String(b.created_at || b.updated_at || "").localeCompare(String(a.created_at || a.updated_at || "")));

      if ($("aguStudentCount")) $("aguStudentCount").textContent = students.length;
      renderStudents();
      updateTargets();
    } catch (e) {
      console.error("Student loading error:", e);
      if ($("aguStudentCount")) $("aguStudentCount").textContent = "0";
      list.innerHTML = `<div class="empty">❌ Unable to load students.<br><small>${esc(e.message || "Unknown database error")}</small></div>`;
    }
  }

  function renderStudents() {
    const list = $("aguStudentList");
    if (!list) return;

    const q = ($("aguStudentSearch")?.value || "").toLowerCase().trim();
    const rows = students.filter(p => [profileName(p), profileEmail(p), profilePhone(p), p.education_level, p.class_level].filter(Boolean).join(" ").toLowerCase().includes(q));

    if (!rows.length) {
      list.innerHTML = '<div class="empty">No students found.</div>';
      return;
    }

    list.innerHTML = rows.map(p => {
      const n = profileName(p);
      const id = getId(p);
      const initials = n.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
      return `
        <div class="item">
          <div class="item-main"><div class="avatar">${esc(initials || "ST")}</div><div class="item-text">
            <strong>${esc(n)}</strong><div class="small">${esc(profileEmail(p))}</div><div class="small">${esc(profilePhone(p))}</div>
            ${p.education_level ? `<div class="small">Education: ${esc(p.education_level)}</div>` : ""}
            ${p.class_level ? `<div class="small">Class: ${esc(p.class_level)}</div>` : ""}
          </div></div>
          <button class="btn blue agu-message-student" data-id="${esc(id)}" type="button">Message</button>
        </div>`;
    }).join("");

    list.querySelectorAll(".agu-message-student").forEach(button => {
      button.onclick = () => {
        const target = $("aguNotifyTarget");
        if (target) target.value = "student:" + button.dataset.id;
        $("aguNotifyTitle")?.focus();
      };
    });
  }

  function updateTargets() {
    const s = $("aguNotifyTarget");
    if (!s) return;
    s.innerHTML = '<option value="all">👥 All students</option>' + students.map(p => {
      const id = getId(p);
      const name = profileName(p);
      const email = profileEmail(p);
      return `<option value="student:${esc(id)}">${esc(name)}${email ? " — " + esc(email) : ""}</option>`;
    }).join("");
  }

  /* ---------------- ACADEMIC CLASSIFICATION ---------------- */

  const CLASS_OPTIONS = {
    "Early Years": [["Early Years 1","Early Years 1"],["Early Years 2","Early Years 2"],["Early Years 3","Early Years 3"]],
    "Primary": [["Primary 1","Primary 1"],["Primary 2","Primary 2"],["Primary 3","Primary 3"],["Primary 4","Primary 4"],["Primary 5","Primary 5"],["Primary 6","Primary 6"]],
    "Junior Secondary": [["JSS 1","JSS 1"],["JSS 2","JSS 2"],["JSS 3","JSS 3"]],
    "Senior Secondary": [["SSS 1","SSS 1"],["SSS 2","SSS 2"],["SSS 3","SSS 3"]],
    "Tertiary": [["100 Level","100 Level"],["200 Level","200 Level"],["300 Level","300 Level"],["400 Level","400 Level"],["500 Level","500 Level"],["Postgraduate","Postgraduate"]]
  };

  function updateClassLevels() {
    const level = $("educationLevel")?.value || "";
    const select = $("classLevel");
    if (!select) return;
    const options = CLASS_OPTIONS[level] || [];
    if (!options.length) {
      select.disabled = true;
      select.required = false;
      select.innerHTML = '<option value="">Select education level first</option>';
      return;
    }
    select.disabled = false;
    select.required = true;
    select.innerHTML = '<option value="">Select class / level</option>' + options.map(([value,label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("");
  }

  function updateDigitalBookFields() {
    const type = $("resourceType");
    const normal = $("normalFileField");
    const digital = $("digitalBookFields");
    const file = $("file");
    if (!type) return;
    const isDigital = type.value === "digital_book";
    digital?.classList.toggle("hidden", !isDigital);
    normal?.classList.toggle("hidden", isDigital);
    if (file) file.required = !isDigital;
    if (isDigital && $("bookEntry") && !$("bookEntry").value) $("bookEntry").value = "index.html";
  }

  /* ---------------- RESOURCES ---------------- */

  async function loadResources() {
    const list = $("aguResourceList");
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading resources...</div>';
    try {
      const r = await getDB().from(TABLE).select("*").order("created_at", { ascending: false });
      if (r.error) throw r.error;
      resources = r.data || [];
      if ($("aguResourceCount")) $("aguResourceCount").textContent = resources.length;
      renderResources();
    } catch (e) {
      console.error("Resource loading error:", e);
      list.innerHTML = `<div class="empty">❌ Unable to load resources.<br><small>${esc(e.message || "Unknown database error")}</small></div>`;
    }
  }

  function renderResources() {
    const list = $("aguResourceList");
    if (!list) return;
    const q = ($("aguResourceSearch")?.value || "").toLowerCase().trim();
    const rows = resources.filter(r => [r.title,r.subject,r.level,r.class_level,r.term,r.resource_category,r.type,r.folder_path].filter(Boolean).join(" ").toLowerCase().includes(q));
    if (!rows.length) {
      list.innerHTML = '<div class="empty">No resources found.</div>';
      return;
    }
    list.innerHTML = rows.slice(0,200).map((r,i) => {
      const url = r.file_url || "";
      const path = r.folder_path || r.storage_path || "";
      const key = r.id ?? path ?? url ?? `${r.title || "resource"}-${i}`;
      return `
        <div class="item"><div class="item-text"><strong>${esc(r.title || "Untitled Resource")}</strong>
        <div class="small">Subject: ${esc(r.subject || r.resource_category || "—")}${r.level ? " • Level: " + esc(r.level) : ""}${r.class_level ? " • Class: " + esc(r.class_level) : ""}${r.term ? " • " + esc(r.term) : ""}${r.type ? " • " + esc(r.type) : ""}</div>
        <div class="small">${esc(path)}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap">
        ${url ? `<a class="btn blue" href="${esc(url)}" target="_blank" rel="noopener">Open</a>` : ""}
        <button class="btn danger agu-delete-resource" data-resource-key="${esc(key)}" type="button">🗑 Delete</button></div></div>`;
    }).join("");
    list.querySelectorAll(".agu-delete-resource").forEach(button => { button.onclick = () => deleteResource(button.dataset.resourceKey); });
  }

  async function deleteResource(resourceKey) {
    const d = getDB();
    const resource = resources.find(r => String(r.id ?? r.folder_path ?? r.storage_path ?? r.file_url ?? "") === String(resourceKey));
    if (!resource) { showMessage("Resource could not be found. Refresh the resource list and try again.", "error"); return; }
    const title = resource.title || "this resource";
    if (!confirm(`Delete "${title}"?\n\nThis action removes the published resource from AGULIBRARY. It cannot be undone.`)) return;
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      showMessage(`Deleting "${title}"...`, "success");
      const storagePath = resource.folder_path || resource.storage_path || resource.path || "";
      let storageError = null;
      if (storagePath) {
        const sr = await d.storage.from(BUCKET).remove([storagePath]);
        if (sr.error) storageError = sr.error;
      }
      let dbResult;
      if (resource.id !== undefined && resource.id !== null) dbResult = await d.from(TABLE).delete().eq("id", resource.id);
      else if (storagePath) dbResult = await d.from(TABLE).delete().eq("folder_path", storagePath);
      else if (resource.file_url) dbResult = await d.from(TABLE).delete().eq("file_url", resource.file_url);
      else throw new Error("This resource has no safe database identifier.");
      if (dbResult.error) throw dbResult.error;
      showMessage(storageError ? `"${title}" was removed from the library, but its stored file could not be deleted: ${storageError.message || "Storage error"}.` : `"${title}" was deleted successfully.`, storageError ? "error" : "success");
      await loadResources();
    } catch (e) {
      console.error(e);
      showMessage(e.message || "Resource deletion failed.", "error");
    }
  }

  /* ---------------- UPLOAD ---------------- */

  async function uploadFile(e) {
    e.preventDefault();
    const d = getDB();
    const title = $("title")?.value.trim() || "";
    const category = $("category")?.value.trim() || "";
    const level = $("educationLevel")?.value || "";
    const classLevel = $("classLevel")?.value || "";
    const term = $("term")?.value || "";
    const type = $("resourceType")?.value || "";
    const status = $("uploadStatus");
    const button = $("uploadButton");
    if (!title) { if (status) status.textContent = "Please enter a resource title."; return; }
    if (!category || !level || !classLevel || !term) {
      if (status) status.textContent = "Please select the subject, education level, class / level and term / semester.";
      showMessage("Please complete the resource classification before uploading.", "error");
      return;
    }
    if (button) button.disabled = true;
    if (status) status.textContent = "Preparing...";
    try {
      if (type === "digital_book") {
        let bookPath = $("bookPath")?.value.trim() || "";
        let bookEntry = $("bookEntry")?.value.trim() || "index.html";
        bookPath = bookPath.replace(/^[\/\\]+|[\/\\]+$/g, "");
        bookEntry = bookEntry.replace(/^[\/\\]+/, "");
        if (!bookPath) { if (status) status.textContent = "Please enter the digital book folder path."; return; }
        if (!bookEntry) bookEntry = "index.html";
        const payload = {title,subject:category,level,class_level:classLevel,term,type:"digital_book",file_url:"/"+bookPath+"/"+bookEntry,resource_category:category,folder_path:bookPath};
        const result = await d.from(TABLE).insert(payload);
        if (result.error) throw result.error;
        if (status) status.textContent = "✅ Digital book published successfully.";
        showMessage("Digital book published successfully.", "success");
        $("uploadForm")?.reset(); updateClassLevels(); updateDigitalBookFields(); await loadResources(); return;
      }
      const file = $("file")?.files?.[0];
      if (!file) { if (status) status.textContent = "Please select a file."; return; }
      if (status) status.textContent = "Uploading...";
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `resources/${Date.now()}-${safe}`;
      const up = await d.storage.from(BUCKET).upload(filename, file, {upsert:false});
      if (up.error) throw up.error;
      const url = d.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
      const payload = {title,subject:category,level,class_level:classLevel,term,type,file_url:url,folder_path:filename,resource_category:category};
      const result = await d.from(TABLE).insert(payload);
      if (result.error) { try { await d.storage.from(BUCKET).remove([filename]); } catch (_) {} throw result.error; }
      if (status) status.textContent = "✅ Upload successful.";
      showMessage("Resource uploaded successfully.", "success");
      $("uploadForm")?.reset(); updateClassLevels(); updateDigitalBookFields(); await loadResources();
    } catch (err) {
      console.error("AGULIBRARY upload error:", err);
      if (status) status.textContent = "❌ " + (err.message || "Upload failed.");
      showMessage(err.message || "Upload failed.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  }

  /* ---------------- NOTIFICATIONS ---------------- */

  async function insertNotification(d, recipientId, title, message) {
    const variants = [
      {student_id:recipientId,title,message,is_read:false},
      {user_id:recipientId,title,message,is_read:false},
      {recipient_id:recipientId,title,message,is_read:false},
      {student_id:recipientId,message,is_read:false},
      {user_id:recipientId,message,is_read:false}
    ];
    let last = null;
    for (const payload of variants) {
      const r = await d.from("student_notifications").insert(payload);
      if (!r.error) return true;
      last = r.error;
      const m = (r.error.message || "").toLowerCase();
      if (!(m.includes("column") || m.includes("schema cache") || m.includes("could not find"))) throw r.error;
    }
    throw last || new Error("Could not insert notification.");
  }

  async function sendNotification() {
    const d = getDB();
    const target = $("aguNotifyTarget")?.value || "all";
    const title = $("aguNotifyTitle")?.value.trim();
    const message = $("aguNotifyMessage")?.value.trim();
    const status = $("aguNotifyStatus");
    if (!title || !message) { if (status) status.textContent = "Please enter a title and message."; return; }
    if (status) status.textContent = "Sending...";
    try {
      const recipients = target === "all" ? students : students.filter(p => getId(p) === target.replace("student:", ""));
      if (!recipients.length) throw new Error("No student recipient was found.");
      let sent = 0;
      for (const p of recipients) { const id = getId(p); if (!id) continue; await insertNotification(d,id,title,message); sent++; }
      if (status) status.textContent = `✅ Notification sent to ${sent} student${sent === 1 ? "" : "s"}.`;
      $("aguNotifyTitle").value = ""; $("aguNotifyMessage").value = ""; await loadNotificationCount();
    } catch (e) { console.error(e); if (status) status.textContent = "❌ " + (e.message || "Notification could not be sent."); }
  }

  async function loadNotificationCount() {
    try {
      const r = await getDB().from("student_notifications").select("*", {count:"exact",head:true});
      if (!r.error && $("aguNotificationCount")) $("aguNotificationCount").textContent = r.count ?? 0;
    } catch (_) {}
  }

  /* =========================================================
     EXAMINATION ROOM — ADMIN CONTROL
     ========================================================= */

  function examTitle(examId) {
    return examinations.find(x => String(x.id) === String(examId))?.title || "Examination";
  }

  function boolValue(id, fallback = false) {
    const v = $(id)?.value;
    if (v === undefined || v === null || v === "") return fallback;
    return v === true || v === "true" || v === "1";
  }

  function setSelectValue(id, value) {
    const el = $(id);
    if (el) el.value = String(value);
  }

  async function loadExamSettings() {
    const status = $("examSettingsStatus");
    try {
      const r = await getDB().from("agu_exam_settings").select("*").eq("id", true).maybeSingle();
      if (r.error) throw r.error;
      const s = r.data;
      if (!s) {
        if (status) status.textContent = "No examination settings record was found. Apply the examination SQL migration first.";
        return;
      }
      setSelectValue("examEnabled", s.enabled !== false);
      setSelectValue("examRegistrationEnabled", s.registration_enabled !== false);
      if ($("examDefaultPass")) $("examDefaultPass").value = Number(s.default_pass_percentage ?? 50);
      if ($("examQuestionSeconds")) $("examQuestionSeconds").value = `${EXAM_SECONDS} seconds`;
      if (status) status.textContent = `Current settings loaded. Question time is permanently fixed at ${EXAM_SECONDS} seconds.`;
    } catch (e) {
      console.error("Exam settings error:", e);
      if (status) status.textContent = "❌ " + (e.message || "Unable to load examination settings.");
    }
  }

  async function saveExamSettings() {
    const status = $("examSettingsStatus");
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const pass = Number($("examDefaultPass")?.value);
      if (!Number.isFinite(pass) || pass < 0 || pass > 100) throw new Error("Default pass percentage must be between 0 and 100.");
      const payload = {
        id: true,
        enabled: boolValue("examEnabled", true),
        registration_enabled: boolValue("examRegistrationEnabled", true),
        question_seconds: EXAM_SECONDS,
        default_pass_percentage: pass,
        updated_at: new Date().toISOString(),
        updated_by: currentSession?.user?.id || null
      };
      const r = await getDB().from("agu_exam_settings").upsert(payload, {onConflict:"id"});
      if (r.error) throw r.error;
      if (status) status.textContent = "✅ Examination settings saved successfully.";
      showMessage("Examination settings saved successfully.", "success");
      await loadExamSettings();
    } catch (e) {
      console.error(e);
      if (status) status.textContent = "❌ " + (e.message || "Unable to save examination settings.");
      showMessage(e.message || "Unable to save examination settings.", "error");
    }
  }

  function clearExamForm() {
    $("examEditId").value = "";
    $("examTitle").value = "";
    $("examSubject").value = "";
    $("examEducationLevel").value = "";
    $("examClassLevel").value = "";
    $("examTerm").value = "";
    $("examPassPercentage").value = "";
    $("examRegistrationRequired").value = "true";
    $("examPublished").value = "false";
    $("examDescription").value = "";
    $("saveExam").textContent = "➕ Create Examination";
    if ($("examFormStatus")) $("examFormStatus").textContent = "Ready to create a new examination.";
  }

  function fillExamForm(exam) {
    if (!exam) return;
    $("examEditId").value = exam.id || "";
    $("examTitle").value = exam.title || "";
    $("examSubject").value = exam.subject || "";
    $("examEducationLevel").value = exam.education_level || "";
    $("examClassLevel").value = exam.class_level || "";
    $("examTerm").value = exam.term || "";
    $("examPassPercentage").value = Number(exam.pass_percentage ?? 50);
    $("examRegistrationRequired").value = String(exam.registration_required !== false);
    $("examPublished").value = String(exam.is_published === true);
    $("examDescription").value = exam.description || "";
    $("saveExam").textContent = "💾 Save Examination Changes";
    if ($("examFormStatus")) $("examFormStatus").textContent = `Editing: ${exam.title || "Examination"}`;
    $("examTitle")?.focus();
  }

  async function loadExaminations() {
    const list = $("adminExamList");
    if (list) list.innerHTML = '<div class="empty">Loading examinations...</div>';
    try {
      const r = await getDB().from("agu_examinations").select("*").order("created_at", {ascending:false});
      if (r.error) throw r.error;
      examinations = Array.isArray(r.data) ? r.data : [];
      renderExaminations();
      populateExamSelects();
      await loadQuestionsForSelectedExam();
      await loadRegistrations();
      await loadResults();
    } catch (e) {
      console.error("Examination loading error:", e);
      if (list) list.innerHTML = `<div class="empty">❌ Unable to load examinations.<br><small>${esc(e.message || "Database error")}</small></div>`;
    }
  }

  function renderExaminations() {
    const list = $("adminExamList");
    if (!list) return;
    const q = ($("adminExamSearch")?.value || "").toLowerCase().trim();
    const rows = examinations.filter(x => [x.title,x.subject,x.education_level,x.class_level,x.term,x.description].filter(Boolean).join(" ").toLowerCase().includes(q));
    if (!rows.length) { list.innerHTML = '<div class="empty">No examinations found.</div>'; return; }
    list.innerHTML = rows.map(exam => `
      <div class="exam-row">
        <h3>${esc(exam.title || "Untitled Examination")}</h3>
        <div class="small">${esc(exam.subject || "—")} • ${esc(exam.education_level || "—")} • ${esc(exam.class_level || "—")} • ${esc(exam.term || "—")}</div>
        <div class="exam-meta">
          <span class="${exam.is_published ? "" : "badge off"}">${exam.is_published ? "PUBLISHED" : "DRAFT"}</span>
          <span>Pass: ${esc(exam.pass_percentage ?? 50)}%</span>
          <span>Registration: ${exam.registration_required ? "Required" : "Not required"}</span>
          <span>${EXAM_SECONDS}s/question</span>
        </div>
        ${exam.description ? `<div class="small">${esc(exam.description)}</div>` : ""}
        <div class="actions">
          <button class="btn light agu-edit-exam" data-id="${esc(exam.id)}" type="button">✏ Edit</button>
          <button class="btn blue agu-select-exam" data-id="${esc(exam.id)}" type="button">📝 Questions</button>
          <button class="btn light agu-toggle-publish" data-id="${esc(exam.id)}" type="button">${exam.is_published ? "Unpublish" : "Publish"}</button>
          <button class="btn danger agu-delete-exam" data-id="${esc(exam.id)}" type="button">🗑 Delete</button>
        </div>
      </div>`).join("");

    list.querySelectorAll(".agu-edit-exam").forEach(b => b.onclick = () => fillExamForm(examinations.find(x => String(x.id) === String(b.dataset.id))));
    list.querySelectorAll(".agu-select-exam").forEach(b => {
      b.onclick = () => { setSelectValue("questionExamSelect", b.dataset.id); loadQuestionsForSelectedExam(); document.getElementById("adminQuestionList")?.scrollIntoView({behavior:"smooth",block:"center"}); };
    });
    list.querySelectorAll(".agu-toggle-publish").forEach(b => b.onclick = () => toggleExamPublished(b.dataset.id));
    list.querySelectorAll(".agu-delete-exam").forEach(b => b.onclick = () => deleteExam(b.dataset.id));
  }

  function populateExamSelects() {
    const currentQuestion = $("questionExamSelect")?.value || "";
    const currentRegistration = $("registrationExamFilter")?.value || "";
    const currentResult = $("resultExamFilter")?.value || "";
    const options = '<option value="">Select an examination</option>' + examinations.map(x => `<option value="${esc(x.id)}">${esc(x.title || "Untitled")}</option>`).join("");
    if ($("questionExamSelect")) $("questionExamSelect").innerHTML = options;
    if (currentQuestion && examinations.some(x => String(x.id) === String(currentQuestion))) $("questionExamSelect").value = currentQuestion;
    else if (examinations[0]) $("questionExamSelect").value = examinations[0].id;

    const filters = '<option value="">All examinations</option>' + examinations.map(x => `<option value="${esc(x.id)}">${esc(x.title || "Untitled")}</option>`).join("");
    if ($("registrationExamFilter")) { $("registrationExamFilter").innerHTML = filters; if (currentRegistration) $("registrationExamFilter").value = currentRegistration; }
    if ($("resultExamFilter")) { $("resultExamFilter").innerHTML = filters; if (currentResult) $("resultExamFilter").value = currentResult; }
  }

  async function saveExam() {
    const status = $("examFormStatus");
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const id = $("examEditId")?.value.trim();
      const title = $("examTitle")?.value.trim();
      const subject = $("examSubject")?.value.trim();
      const educationLevel = $("examEducationLevel")?.value.trim();
      const classLevel = $("examClassLevel")?.value.trim();
      const term = $("examTerm")?.value.trim();
      const description = $("examDescription")?.value.trim() || null;
      const pass = Number($("examPassPercentage")?.value);
      if (!title || !subject || !educationLevel || !classLevel || !term) throw new Error("Title, subject, education level, class level and term are required.");
      if (!Number.isFinite(pass) || pass < 0 || pass > 100) throw new Error("Pass percentage must be between 0 and 100.");
      const payload = {
        title, description, subject, education_level: educationLevel, class_level: classLevel, term,
        pass_percentage: pass,
        registration_required: boolValue("examRegistrationRequired", true),
        is_published: boolValue("examPublished", false)
      };
      let r;
      if (id) r = await getDB().from("agu_examinations").update(payload).eq("id", id);
      else r = await getDB().from("agu_examinations").insert({...payload,created_by:currentSession?.user?.id || null});
      if (r.error) throw r.error;
      if (status) status.textContent = id ? "✅ Examination updated successfully." : "✅ Examination created successfully.";
      showMessage(id ? "Examination updated successfully." : "Examination created successfully.", "success");
      clearExamForm();
      await loadExaminations();
    } catch (e) {
      console.error(e);
      if (status) status.textContent = "❌ " + (e.message || "Unable to save examination.");
      showMessage(e.message || "Unable to save examination.", "error");
    }
  }

  async function toggleExamPublished(id) {
    const exam = examinations.find(x => String(x.id) === String(id));
    if (!exam) return;
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const next = !exam.is_published;
      if (!confirm(`${next ? "Publish" : "Unpublish"} "${exam.title}"?`)) return;
      const r = await getDB().from("agu_examinations").update({is_published:next}).eq("id",id);
      if (r.error) throw r.error;
      showMessage(next ? "Examination published." : "Examination unpublished.", "success");
      await loadExaminations();
    } catch (e) { console.error(e); showMessage(e.message || "Unable to change publication status.", "error"); }
  }

  async function deleteExam(id) {
    const exam = examinations.find(x => String(x.id) === String(id));
    if (!exam) return;
    if (!confirm(`Delete "${exam.title}"?\n\nThis can fail if permanent attempts/results already reference this examination. Existing permanent records should not be destroyed accidentally.`)) return;
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const r = await getDB().from("agu_examinations").delete().eq("id",id);
      if (r.error) throw r.error;
      showMessage("Examination deleted successfully.", "success");
      clearExamForm();
      await loadExaminations();
    } catch (e) { console.error(e); showMessage(e.message || "Unable to delete examination. Permanent records may prevent deletion.", "error"); }
  }

  /* ---------------- QUESTIONS ---------------- */

  function clearQuestionForm() {
    $("questionEditId").value = "";
    $("questionPosition").value = "";
    $("questionMarks").value = "1";
    $("questionText").value = "";
    ["optionA","optionB","optionC","optionD","optionE"].forEach(id => { if ($(id)) $(id).value = ""; });
    $("correctOption").value = "A";
    if ($("questionFormStatus")) $("questionFormStatus").textContent = "Ready to add a new question.";
    $("saveQuestion").textContent = "➕ Save Question";
  }

  function fillQuestionForm(q) {
    if (!q) return;
    $("questionEditId").value = q.id || "";
    $("questionPosition").value = q.position ?? "";
    $("questionMarks").value = q.marks ?? 1;
    $("questionText").value = q.question_text || "";
    const opts = Array.isArray(q.options) ? q.options : [];
    ["optionA","optionB","optionC","optionD","optionE"].forEach((id,i) => { if ($(id)) $(id).value = opts[i] ?? ""; });
    $("correctOption").value = q.correct_option || "A";
    $("saveQuestion").textContent = "💾 Save Question Changes";
    if ($("questionFormStatus")) $("questionFormStatus").textContent = `Editing question ${q.position ?? ""}.`;
  }

  async function loadQuestionsForSelectedExam() {
    const list = $("adminQuestionList");
    const examId = $("questionExamSelect")?.value || "";
    if (!examId) {
      if (list) list.innerHTML = '<div class="empty">Select an examination to manage its questions.</div>';
      return;
    }
    if (list) list.innerHTML = '<div class="empty">Loading questions...</div>';
    try {
      const r = await getDB().from("agu_exam_questions").select("*").eq("exam_id",examId).order("position",{ascending:true});
      if (r.error) throw r.error;
      examQuestions = Array.isArray(r.data) ? r.data : [];
      renderQuestions();
      if ($("questionFormStatus")) $("questionFormStatus").textContent = `${examQuestions.length} question${examQuestions.length === 1 ? "" : "s"} loaded. Each student question remains fixed at ${EXAM_SECONDS} seconds.`;
    } catch (e) {
      console.error(e);
      if (list) list.innerHTML = `<div class="empty">❌ Unable to load questions.<br><small>${esc(e.message || "Database error")}</small></div>`;
    }
  }

  function renderQuestions() {
    const list = $("adminQuestionList");
    if (!list) return;
    if (!examQuestions.length) { list.innerHTML = '<div class="empty">No questions yet. Add the first question above.</div>'; return; }
    list.innerHTML = examQuestions.map(q => {
      const opts = Array.isArray(q.options) ? q.options : [];
      return `<div class="question-row">
        <h3>Question ${esc(q.position ?? "")}</h3>
        <div>${esc(q.question_text || "")}</div>
        <div class="question-options">${opts.map((o,i) => `<div class="question-option ${String.fromCharCode(65+i) === q.correct_option ? "correct" : ""}"><strong>${String.fromCharCode(65+i)}.</strong> ${esc(o)}${String.fromCharCode(65+i) === q.correct_option ? " ✅" : ""}</div>`).join("")}</div>
        <div class="small" style="margin-top:8px">Marks: ${esc(q.marks ?? 1)} • Correct option: ${esc(q.correct_option || "—")}</div>
        <div class="actions"><button class="btn light agu-edit-question" data-id="${esc(q.id)}" type="button">✏ Edit</button><button class="btn danger agu-delete-question" data-id="${esc(q.id)}" type="button">🗑 Delete</button></div>
      </div>`;
    }).join("");
    list.querySelectorAll(".agu-edit-question").forEach(b => b.onclick = () => fillQuestionForm(examQuestions.find(q => String(q.id) === String(b.dataset.id))));
    list.querySelectorAll(".agu-delete-question").forEach(b => b.onclick = () => deleteQuestion(b.dataset.id));
  }

  async function saveQuestion() {
    const status = $("questionFormStatus");
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const examId = $("questionExamSelect")?.value || "";
      const id = $("questionEditId")?.value.trim();
      const position = Number($("questionPosition")?.value);
      const marks = Number($("questionMarks")?.value);
      const questionText = $("questionText")?.value.trim();
      const options = ["optionA","optionB","optionC","optionD","optionE"].map(id => $(id)?.value.trim() || "");
      const correct = $("correctOption")?.value || "A";
      if (!examId) throw new Error("Select an examination first.");
      if (!Number.isInteger(position) || position < 1) throw new Error("Question position must be a whole number starting from 1.");
      if (!Number.isFinite(marks) || marks < 0) throw new Error("Marks must be zero or greater.");
      if (!questionText) throw new Error("Enter the question text.");
      if (options.some(x => !x)) throw new Error("All five answer options A–E are required.");
      const payload = {exam_id:examId,position,question_text:questionText,options,correct_option:correct,marks};
      let r;
      if (id) r = await getDB().from("agu_exam_questions").update(payload).eq("id",id);
      else r = await getDB().from("agu_exam_questions").insert(payload);
      if (r.error) throw r.error;
      if (status) status.textContent = id ? "✅ Question updated successfully." : "✅ Question added successfully.";
      showMessage(id ? "Question updated successfully." : "Question added successfully.", "success");
      clearQuestionForm();
      await loadQuestionsForSelectedExam();
    } catch (e) {
      console.error(e);
      if (status) status.textContent = "❌ " + (e.message || "Unable to save question.");
      showMessage(e.message || "Unable to save question.", "error");
    }
  }

  async function deleteQuestion(id) {
    const q = examQuestions.find(x => String(x.id) === String(id));
    if (!q) return;
    if (!confirm(`Delete question ${q.position ?? ""}?\n\nThis cannot be undone.`)) return;
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const r = await getDB().from("agu_exam_questions").delete().eq("id",id);
      if (r.error) throw r.error;
      showMessage("Question deleted successfully.", "success");
      clearQuestionForm();
      await loadQuestionsForSelectedExam();
    } catch (e) { console.error(e); showMessage(e.message || "Unable to delete question.", "error"); }
  }

  /* ---------------- REGISTRATIONS ---------------- */

  async function loadRegistrations() {
    const list = $("adminRegistrationList");
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading registrations...</div>';
    try {
      let query = getDB().from("agu_exam_registrations").select("*").order("registered_at",{ascending:false});
      const examId = $("registrationExamFilter")?.value || "";
      const status = $("registrationStatusFilter")?.value || "";
      if (examId) query = query.eq("exam_id",examId);
      if (status) query = query.eq("status",status);
      const r = await query;
      if (r.error) throw r.error;
      examRegistrations = Array.isArray(r.data) ? r.data : [];
      renderRegistrations();
    } catch (e) {
      console.error(e);
      list.innerHTML = `<div class="empty">❌ Unable to load registrations.<br><small>${esc(e.message || "Database error")}</small></div>`;
    }
  }

  function renderRegistrations() {
    const list = $("adminRegistrationList");
    if (!list) return;
    if (!examRegistrations.length) { list.innerHTML = '<div class="empty">No examination registrations found.</div>'; return; }
    list.innerHTML = examRegistrations.map(r => {
      const p = studentById(r.student_id);
      const name = p ? profileName(p) : String(r.student_id || "Student");
      const email = p ? profileEmail(p) : "";
      const state = r.status || "registered";
      const cls = state === "approved" ? "" : state === "rejected" ? "badge off" : "badge blue";
      return `<div class="exam-row"><h3>${esc(examTitle(r.exam_id))}</h3>
        <div class="small"><strong>${esc(name)}</strong>${email ? " • " + esc(email) : ""}</div>
        <div class="exam-meta"><span class="${cls}">${esc(state.toUpperCase())}</span><span>Registered: ${esc(r.registered_at ? new Date(r.registered_at).toLocaleString() : "—")}</span>${r.approved_at ? `<span>Approved: ${esc(new Date(r.approved_at).toLocaleString())}</span>` : ""}</div>
        <div class="small">Student ID: ${esc(r.student_id || "—")}</div>
        <div class="actions">
          <button class="btn primary agu-registration-status" data-id="${esc(r.id)}" data-status="approved" type="button">✓ Approve</button>
          <button class="btn danger agu-registration-status" data-id="${esc(r.id)}" data-status="rejected" type="button">✕ Reject</button>
          ${state !== "registered" ? `<button class="btn light agu-registration-status" data-id="${esc(r.id)}" data-status="registered" type="button">↺ Set Registered</button>` : ""}
        </div>
      </div>`;
    }).join("");
    list.querySelectorAll(".agu-registration-status").forEach(b => b.onclick = () => updateRegistrationStatus(b.dataset.id,b.dataset.status));
  }

  async function updateRegistrationStatus(id, status) {
    try {
      const verified = await adminMfaGate();
      if (!verified) return;
      const payload = {status, approved_at:status === "approved" ? new Date().toISOString() : null};
      const r = await getDB().from("agu_exam_registrations").update(payload).eq("id",id);
      if (r.error) throw r.error;
      showMessage(`Registration ${status}.`, "success");
      await loadRegistrations();
    } catch (e) { console.error(e); showMessage(e.message || "Unable to update registration.", "error"); }
  }

  /* ---------------- RESULTS & CERTIFICATES ---------------- */

  async function loadResults() {
    const list = $("adminResultList");
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading results...</div>';
    try {
      let query = getDB().from("agu_exam_attempts").select("*").order("created_at",{ascending:false});
      const examId = $("resultExamFilter")?.value || "";
      if (examId) query = query.eq("exam_id",examId);
      const r = await query;
      if (r.error) throw r.error;
      examResults = Array.isArray(r.data) ? r.data : [];

      const cert = await getDB().from("agu_exam_certificates").select("*").order("issued_at",{ascending:false});
      if (cert.error) throw cert.error;
      examCertificates = Array.isArray(cert.data) ? cert.data : [];
      renderResults();
    } catch (e) {
      console.error(e);
      list.innerHTML = `<div class="empty">❌ Unable to load examination results.<br><small>${esc(e.message || "Database error")}</small></div>`;
    }
  }

  function resultStatus(result) {
    if (result.status === "completed") return result.passed ? "PASSED" : "FAILED";
    if (result.status === "in_progress") return "IN PROGRESS";
    if (result.status === "abandoned") return "ABANDONED";
    return String(result.status || "UNKNOWN").toUpperCase();
  }

  function renderResults() {
    const list = $("adminResultList");
    if (!list) return;
    const q = ($("adminResultSearch")?.value || "").toLowerCase().trim();
    const rows = examResults.filter(r => {
      const cert = examCertificates.find(c => String(c.attempt_id) === String(r.id));
      const text = [studentLabel(r.student_id),examTitle(r.exam_id),cert?.certificate_number,r.status,r.passed ? "passed" : "failed"].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
    if (!rows.length) { list.innerHTML = '<div class="empty">No examination results found.</div>'; return; }
    list.innerHTML = rows.map(r => {
      const cert = examCertificates.find(c => String(c.attempt_id) === String(r.id));
      const passed = r.passed === true;
      return `<div class="result-row"><h3>${esc(examTitle(r.exam_id))}</h3>
        <div class="small"><strong>Student:</strong> ${esc(studentLabel(r.student_id))}</div>
        <div class="exam-meta"><span class="${r.status === "completed" && !passed ? "badge off" : ""}">${esc(resultStatus(r))}</span><span>Score: ${esc(r.score ?? 0)}</span><span>Percentage: ${esc(r.percentage ?? 0)}%</span><span>Questions: ${esc(r.total_questions ?? 0)}</span></div>
        <div class="small">Correct: ${esc(r.correct_count ?? 0)} • Wrong: ${esc(r.wrong_count ?? 0)} • Unanswered: ${esc(r.unanswered_count ?? 0)}</div>
        <div class="small">Started: ${esc(r.started_at ? new Date(r.started_at).toLocaleString() : "—")} • Finished: ${esc(r.finished_at ? new Date(r.finished_at).toLocaleString() : "—")}</div>
        ${cert ? `<div class="small" style="margin-top:8px"><strong>Certificate:</strong> ${esc(cert.certificate_number)} • Issued: ${esc(cert.issued_at ? new Date(cert.issued_at).toLocaleString() : "—")}</div>` : `<div class="small" style="margin-top:8px">Certificate: ${passed ? "Not found" : "Not issued — student did not pass"}</div>`}
        <div class="actions">${cert ? `<button class="btn blue agu-print-certificate" data-id="${esc(cert.id)}" type="button">🖨 Print Certificate</button>` : ""}</div>
      </div>`;
    }).join("");
    list.querySelectorAll(".agu-print-certificate").forEach(b => b.onclick = () => printCertificate(b.dataset.id));
  }

  function certificateHtml(cert, attempt) {
    const student = studentLabel(attempt?.student_id);
    const exam = examTitle(attempt?.exam_id);
    const percentage = attempt?.percentage ?? "—";
    const date = cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString() : new Date().toLocaleDateString();
    return `<!doctype html><html><head><meta charset="utf-8"><title>Certificate ${esc(cert?.certificate_number || "")}</title><style>body{font-family:Georgia,serif;margin:0;padding:40px;background:#f7fbf9;color:#17352a}.certificate{max-width:900px;margin:auto;background:#fff;border:10px solid #087a4b;padding:70px 55px;text-align:center;min-height:620px;box-shadow:0 10px 35px #0001}.brand{font:900 18px Arial;letter-spacing:3px;color:#087a4b}.title{font-size:48px;margin:35px 0 15px}.subtitle{font:700 20px Arial}.student{font-size:36px;font-weight:bold;margin:28px 0 18px}.exam{font-size:22px;margin:10px 0}.meta{margin-top:45px;display:flex;justify-content:space-between;font:14px Arial}.certno{font:900 15px Arial;margin-top:30px}@media print{body{background:#fff;padding:0}.certificate{box-shadow:none;margin:0;max-width:none;min-height:0}}</style></head><body><div class="certificate"><div class="brand">AGULIBRARY</div><div class="title">Certificate of Achievement</div><div class="subtitle">This certificate is proudly presented to</div><div class="student">${esc(student)}</div><div class="exam">for successfully completing</div><div class="exam"><strong>${esc(exam)}</strong></div><div class="exam">with a result of <strong>${esc(percentage)}%</strong></div><div class="certno">Certificate No.: ${esc(cert?.certificate_number || "—")}</div><div class="meta"><span>Issued: ${esc(date)}</span><span>Owner: Umar Mohammed</span></div></div><script>window.onload=()=>window.print();<\/script></body></html>`;
  }

  async function printCertificate(certId) {
    try {
      const cert = examCertificates.find(c => String(c.id) === String(certId));
      if (!cert) throw new Error("Certificate was not found.");
      const attempt = examResults.find(r => String(r.id) === String(cert.attempt_id));
      if (!attempt) {
        const r = await getDB().from("agu_exam_attempts").select("*").eq("id",cert.attempt_id).maybeSingle();
        if (r.error) throw r.error;
        if (!r.data) throw new Error("The certificate's examination attempt could not be found.");
        const w = window.open("", "_blank", "noopener,noreferrer");
        if (!w) throw new Error("Please allow pop-ups to print the certificate.");
        w.document.write(certificateHtml(cert,r.data)); w.document.close();
        return;
      }
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) throw new Error("Please allow pop-ups to print the certificate.");
      w.document.write(certificateHtml(cert,attempt)); w.document.close();
    } catch (e) { console.error(e); showMessage(e.message || "Unable to print certificate.", "error"); }
  }

  /* ---------------- DASHBOARD ---------------- */

  async function finishAdmin() {
    $("loginPanel")?.classList.add("hidden");
    $("dashboardPanel")?.classList.remove("hidden");
    if (currentSession && $("adminIdentity")) $("adminIdentity").textContent = "Signed in as " + (currentSession.user.email || "administrator");

    await Promise.all([
      loadStudents(),
      loadResources(),
      loadNotificationCount(),
      loadExamSettings(),
      loadExaminations()
    ]);
  }

  async function checkSession() {
    try {
      const d = getDB();
      const r = await d.auth.getSession();
      if (r.error) throw r.error;
      currentSession = r.data?.session || null;
      if (!currentSession) {
        $("loginPanel")?.classList.remove("hidden");
        $("dashboardPanel")?.classList.add("hidden");
        return;
      }
      if (!(await isAdmin(currentSession))) {
        await d.auth.signOut();
        showLoginMessage("This account is not authorized as an AGULIBRARY administrator.", "error");
        return;
      }
      if (await adminMfaGate()) await finishAdmin();
    } catch (e) {
      console.error(e);
      showLoginMessage(e.message || "Unable to initialize administrator access.", "error");
    }
  }

  async function login(e) {
    e.preventDefault();
    const button = $("adminLoginButton");
    if (button) button.disabled = true;
    showLoginMessage("Signing in...", "success");
    try {
      const d = getDB();
      const r = await d.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});
      if (r.error) throw r.error;
      currentSession = r.data.session;
      if (!(await isAdmin(currentSession))) { await d.auth.signOut(); throw new Error("This account is not authorized as an AGULIBRARY administrator."); }
      showLoginMessage("Authentication successful. Checking administrator verification...", "success");
      if (await adminMfaGate()) await finishAdmin();
    } catch (e) { console.error(e); showLoginMessage(e.message || "Sign in failed.", "error"); }
    finally { if (button) button.disabled = false; }
  }

  async function logout() {
    try { await getDB().auth.signOut(); } catch (e) { console.error(e); }
    localStorage.removeItem("AGU_ADMIN_MFA_VERIFIED_AT");
    mfaOpen = false;
    currentSession = null;
    location.reload();
  }

  /* ---------------- EVENTS ---------------- */

  function bind() {
    $("adminLoginForm")?.addEventListener("submit", login);
    $("uploadForm")?.addEventListener("submit", uploadFile);
    $("logoutButton")?.addEventListener("click", logout);

    $("educationLevel")?.addEventListener("change", updateClassLevels);
    $("resourceType")?.addEventListener("change", updateDigitalBookFields);
    updateClassLevels();
    updateDigitalBookFields();

    $("aguStudentSearch")?.addEventListener("input", renderStudents);
    $("aguResourceSearch")?.addEventListener("input", renderResources);
    $("aguRefreshStudents")?.addEventListener("click", loadStudents);
    $("aguRefreshResources")?.addEventListener("click", loadResources);

    $("refreshAll")?.addEventListener("click", async () => {
      await Promise.all([loadStudents(),loadResources(),loadNotificationCount(),loadExamSettings(),loadExaminations()]);
    });

    $("aguSendNotification")?.addEventListener("click", sendNotification);
    $("adminMfaReset")?.addEventListener("click", logout);

    /* Examination controls */
    $("saveExamSettings")?.addEventListener("click", saveExamSettings);
    $("refreshExamAdmin")?.addEventListener("click", async () => { await loadExamSettings(); await loadExaminations(); });
    $("saveExam")?.addEventListener("click", saveExam);
    $("clearExamForm")?.addEventListener("click", clearExamForm);
    $("refreshExams")?.addEventListener("click", loadExaminations);
    $("adminExamSearch")?.addEventListener("input", renderExaminations);
    $("questionExamSelect")?.addEventListener("change", async () => { clearQuestionForm(); await loadQuestionsForSelectedExam(); });
    $("saveQuestion")?.addEventListener("click", saveQuestion);
    $("clearQuestionForm")?.addEventListener("click", clearQuestionForm);
    $("registrationExamFilter")?.addEventListener("change", loadRegistrations);
    $("registrationStatusFilter")?.addEventListener("change", loadRegistrations);
    $("refreshRegistrations")?.addEventListener("click", loadRegistrations);
    $("resultExamFilter")?.addEventListener("change", loadResults);
    $("adminResultSearch")?.addEventListener("input", renderResults);
    $("refreshResults")?.addEventListener("click", loadResults);

    document.querySelectorAll("[data-target]").forEach(button => {
      button.addEventListener("click", () => {
        const input = $(button.dataset.target);
        if (input) input.type = input.type === "password" ? "text" : "password";
      });
    });

    if ($("year")) $("year").textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    bind();
    checkSession();
  });

  window.AGU_ADMIN = {
    loadStudents,
    loadResources,
    sendNotification,
    uploadFile,
    deleteResource,
    loadExamSettings,
    saveExamSettings,
    loadExaminations,
    saveExam,
    deleteExam,
    loadQuestionsForSelectedExam,
    saveQuestion,
    deleteQuestion,
    loadRegistrations,
    updateRegistrationStatus,
    loadResults,
    printCertificate,
    logout
  };

})();
