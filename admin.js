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
   - 12-hour TOTP MFA gate for admin dashboard

   IMPORTANT:
   Supabase `resources` table uses:
   `resource_category`
   instead of:
   `category`
========================================================= */

(function(){
"use strict";

const $ = id => document.getElementById(id);
const cfg = window.AGU_CONFIG || {};

let db = null;
let currentSession = null;
let students = [];
let resources = [];
let mfaOpen = false;

const TABLE = window.AGU_RESOURCE_TABLE || "resources";
const BUCKET = window.AGU_BUCKET || window.BUCKET || "agu-library";

/* =========================================================
   HELPERS
========================================================= */

function esc(v){
  return String(v ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      "\"":"&quot;",
      "'":"&#039;"
    }[c])
  );
}

function showLoginMessage(text,type="error"){
  const x = $("loginMessage");
  if(!x) return;
  x.textContent = text;
  x.className = "message show " + type;
}

function showMessage(text,type="success"){
  const x = $("message");
  if(!x) return;
  x.textContent = text;
  x.className = "message show " + type;
}

function hideMessage(){
  const x = $("message");
  if(x) x.className = "message";
}

function getDB(){
  if(db) return db;

  if(typeof getSupabase === "function"){
    return db = getSupabase();
  }

  if(
    window.supabase &&
    cfg.supabaseUrl &&
    cfg.supabaseAnonKey
  ){
    return db = window.supabase.createClient(
      cfg.supabaseUrl,
      cfg.supabaseAnonKey
    );
  }

  throw new Error("Supabase configuration is unavailable.");
}

function profileName(p){
  return [
    p.first_name,
    p.middle_name,
    p.last_name
  ].filter(Boolean).join(" ")
  || p.full_name
  || p.name
  || "Student";
}

function profileEmail(p){
  return p.email
    || p.email_address
    || p.student_email
    || "";
}

function profilePhone(p){
  return p.phone
    || p.phone_number
    || p.mobile
    || "";
}

function getId(p){
  return p.id
    || p.user_id
    || p.student_id
    || "";
}

/* =========================================================
   ADMIN AUTHORIZATION
========================================================= */

async function isAdmin(session){
  const d = getDB();

  const {
    data,
    error
  } = await d
    .from("admin_users")
    .select("user_id")
    .eq("user_id",session.user.id)
    .maybeSingle();

  if(error) throw error;

  return !!data;
}

/* =========================================================
   ADMIN MFA
========================================================= */

async function adminMfaGate(){

  if(mfaOpen) return true;

  const d = getDB();

  const stampKey = "AGU_ADMIN_MFA_VERIFIED_AT";

  const last = Number(
    localStorage.getItem(stampKey) || 0
  );

  if(
    Date.now() - last <
    12 * 60 * 60 * 1000
  ){
    mfaOpen = true;
    return true;
  }

  let factors;

  try{

    factors = await d.auth.mfa.listFactors();

  }catch(e){

    console.error(e);

    alert(
      "Administrator MFA could not be checked: " +
      (e.message || "Unknown error")
    );

    return false;
  }

  const totp =
    (factors.data?.totp || [])
      .find(f => f.status === "verified")
    || factors.data?.totp?.[0];

  if(!totp){

    alert(
      "Administrator Google Authenticator is not enrolled. " +
      "Open Supabase Auth → MFA and enroll a TOTP authenticator " +
      "for this administrator before using the Admin dashboard."
    );

    return false;
  }

  const overlay = document.createElement("div");

  overlay.style.cssText =
    "position:fixed;" +
    "inset:0;" +
    "background:rgba(0,0,0,.58);" +
    "z-index:99999;" +
    "display:grid;" +
    "place-items:center;" +
    "padding:20px";

  overlay.innerHTML = `
    <div style="
      width:min(440px,100%);
      background:#fff;
      border-radius:22px;
      padding:28px;
      box-shadow:0 20px 60px rgba(0,0,0,.25)
    ">
      <h2 style="margin-top:0">
        🔐 Admin verification
      </h2>

      <p style="
        color:#718079;
        line-height:1.6
      ">
        Enter the current 6-digit Google Authenticator
        code to continue.
      </p>

      <input
        id="aguMfaCode"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        placeholder="000000"
        style="
          width:100%;
          padding:14px;
          border:1px solid #cfe5da;
          border-radius:10px;
          font-size:20px;
          letter-spacing:5px;
          text-align:center
        "
      >

      <button
        id="aguMfaVerify"
        style="
          width:100%;
          margin-top:12px;
          border:0;
          border-radius:10px;
          padding:13px;
          background:#087a4b;
          color:#fff;
          font-weight:900
        "
        type="button"
      >
        Verify & Continue
      </button>

      <p
        id="aguMfaError"
        style="
          color:#b42323;
          font-size:13px
        "
      ></p>
    </div>
  `;

  document.body.appendChild(overlay);

  mfaOpen = true;

  $("aguMfaVerify").onclick = async () => {

    const code =
      ($("aguMfaCode").value || "")
        .replace(/\D/g,"");

    if(code.length !== 6){

      $("aguMfaError").textContent =
        "Enter the 6-digit code.";

      return;
    }

    $("aguMfaVerify").disabled = true;

    try{

      const r =
        await d.auth.mfa.challengeAndVerify({
          factorId: totp.id,
          code
        });

      if(r.error) throw r.error;

      localStorage.setItem(
        stampKey,
        String(Date.now())
      );

      overlay.remove();

      await finishAdmin();

    }catch(e){

      $("aguMfaError").textContent =
        e.message || "Verification failed.";

      $("aguMfaVerify").disabled = false;
    }
  };

  $("aguMfaCode").focus();

  return false;
}

/* =========================================================
   STUDENTS
========================================================= */

async function loadStudents(){

  const d = getDB();
  const list = $("aguStudentList");

  if(!list) return;

  list.innerHTML =
    '<div class="empty">Loading students...</div>';

  try{

    /*
     * student_profiles uses the profile primary key
     * as the student's Supabase user id.
     *
     * Do not require created_at because that column
     * is not guaranteed to exist.
     */

    let r =
      await d
        .from("student_profiles")
        .select("*");

    if(r.error) throw r.error;

    students =
      Array.isArray(r.data)
        ? r.data
        : [];

    /*
     * Keep the list useful even when the table
     * has no timestamp column.
     */

    students.sort((a,b) => {

      const ad =
        String(
          a.created_at ||
          a.updated_at ||
          a.createdAt ||
          ""
        );

      const bd =
        String(
          b.created_at ||
          b.updated_at ||
          b.createdAt ||
          ""
        );

      return bd.localeCompare(ad);
    });

    if($("aguStudentCount")){
      $("aguStudentCount").textContent =
        students.length;
    }

    renderStudents();
    updateTargets();

  }catch(e){

    console.error(
      "Student loading error:",
      e
    );

    if($("aguStudentCount")){
      $("aguStudentCount").textContent = "0";
    }

    list.innerHTML =
      '<div class="empty">' +
      '❌ Unable to load students.<br>' +
      '<small>' +
      esc(e.message || "Unknown database error") +
      '</small></div>';
  }
}

function renderStudents(){

  const list = $("aguStudentList");

  const q =
    ($("aguStudentSearch")?.value || "")
      .toLowerCase()
      .trim();

  if(!list) return;

  const rows =
    students.filter(p => {

      const combined = [
        profileName(p),
        profileEmail(p),
        profilePhone(p)
      ]
      .join(" ")
      .toLowerCase();

      return combined.includes(q);
    });

  if(!rows.length){

    list.innerHTML =
      '<div class="empty">No students found.</div>';

    return;
  }

  list.innerHTML =
    rows.map(p => {

      const n = profileName(p);
      const id = getId(p);

      const initials =
        n
          .split(/\s+/)
          .filter(Boolean)
          .slice(0,2)
          .map(x => x[0])
          .join("")
          .toUpperCase();

      return `
        <div class="item">

          <div class="item-main">

            <div class="avatar">
              ${esc(initials || "ST")}
            </div>

            <div class="item-text">

              <strong>
                ${esc(n)}
              </strong>

              <div class="small">
                ${esc(profileEmail(p))}
              </div>

              <div class="small">
                ${esc(profilePhone(p))}
              </div>

            </div>

          </div>

          <button
            class="btn blue agu-message-student"
            data-id="${esc(id)}"
            type="button"
          >
            Message
          </button>

        </div>
      `;

    }).join("");

  list
    .querySelectorAll(".agu-message-student")
    .forEach(b => {

      b.onclick = () => {

        $("aguNotifyTarget").value =
          "student:" + b.dataset.id;

        $("aguNotifyTitle").focus();
      };

    });
}

function updateTargets(){

  const s = $("aguNotifyTarget");

  if(!s) return;

  s.innerHTML =
    '<option value="all">👥 All students</option>' +

    students.map(p => {

      return `
        <option value="student:${esc(getId(p))}">
          ${esc(profileName(p))}
          ${profileEmail(p)
            ? " — " + esc(profileEmail(p))
            : ""}
        </option>
      `;

    }).join("");
}

/* =========================================================
   DIGITAL BOOK FIELDS
========================================================= */

function updateDigitalBookFields(){

  const type = $("resourceType");
  const normal = $("normalFileField");
  const digital = $("digitalBookFields");
  const file = $("file");

  if(!type) return;

  const isDigital =
    type.value === "digital_book";

  digital?.classList.toggle(
    "hidden",
    !isDigital
  );

  normal?.classList.toggle(
    "hidden",
    isDigital
  );

  if(file){
    file.required = !isDigital;
  }

  if(
    isDigital &&
    $("bookEntry") &&
    !$("bookEntry").value
  ){
    $("bookEntry").value = "index.html";
  }
}

/* =========================================================
   RESOURCES
========================================================= */

async function loadResources(){

  const d = getDB();
  const list = $("aguResourceList");

  if(!list) return;

  list.innerHTML =
    '<div class="empty">Loading resources...</div>';

  try{

    const r =
      await d
        .from(TABLE)
        .select("*")
        .order(
          "created_at",
          {ascending:false}
        );

    if(r.error) throw r.error;

    resources = r.data || [];

    if($("aguResourceCount")){
      $("aguResourceCount").textContent =
        resources.length;
    }

    renderResources();

  }catch(e){

    console.error(
      "Resource loading error:",
      e
    );

    list.innerHTML =
      '<div class="empty">' +
      '❌ Unable to load resources.<br>' +
      '<small>' +
      esc(e.message || "Unknown error") +
      '</small></div>';
  }
}

function renderResources(){

  const list = $("aguResourceList");

  const q =
    ($("aguResourceSearch")?.value || "")
      .toLowerCase()
      .trim();

  if(!list) return;

  /*
   * IMPORTANT:
   * The Supabase table uses resource_category,
   * not category.
   */

  const rows =
    resources.filter(r => {

      return [
        r.title,
        r.name,
        r.subject,
        r.resource_category,
        r.class_level,
        r.type,
        r.folder_path
      ]
      .join(" ")
      .toLowerCase()
      .includes(q);
    });

  if(!rows.length){

    list.innerHTML =
      '<div class="empty">No resources found.</div>';

    return;
  }

  list.innerHTML =
    rows
      .slice(0,200)
      .map((r,i) => {

        const url =
          r.file_url ||
          r.url ||
          "";

        const key =
          r.id ||
          r.storage_path ||
          r.file_url ||
          r.url ||
          `${r.title || r.name || "resource"}-${i}`;

        return `
          <div class="item">

            <div class="item-text">

              <strong>
                ${esc(
                  r.title ||
                  r.name ||
                  "Untitled Resource"
                )}
              </strong>

              <div class="small">
                ${esc(
                  r.subject ||
                  r.resource_category ||
                  ""
                )}

                ${
                  r.class_level
                    ? " • " +
                      esc(r.class_level)
                    : ""
                }

                ${
                  r.type
                    ? " • " +
                      esc(r.type)
                    : ""
                }
              </div>

              <div class="small">
                ${esc(
                  r.folder_path ||
                  r.storage_path ||
                  ""
                )}
              </div>

            </div>

            <div style="
              display:flex;
              gap:8px;
              flex-wrap:wrap
            ">

              ${
                url
                  ? `
                    <a
                      class="btn blue"
                      href="${esc(url)}"
                      target="_blank"
                      rel="noopener"
                    >
                      Open
                    </a>
                  `
                  : ""
              }

              <button
                class="btn delete-resource agu-delete-resource"
                data-resource-key="${esc(key)}"
                type="button"
              >
                🗑 Delete
              </button>

            </div>

          </div>
        `;

      })
      .join("");

  list
    .querySelectorAll(".agu-delete-resource")
    .forEach(b => {

      b.onclick = () =>
        deleteResource(
          b.dataset.resourceKey
        );

    });
}

/* =========================================================
   DELETE RESOURCE
========================================================= */

async function deleteResource(resourceKey){

  const d = getDB();

  const resource =
    resources.find(r =>
      String(
        r.id ??
        r.storage_path ??
        r.file_url ??
        r.url ??
        `${r.title || r.name || ""}`
      ) === String(resourceKey)
    );

  if(!resource){

    showMessage(
      "Resource could not be found. Refresh the resource list and try again.",
      "error"
    );

    return;
  }

  const title =
    resource.title ||
    resource.name ||
    "this resource";

  if(
    !confirm(
      `Delete "${title}"?\n\n` +
      `This action removes the published resource ` +
      `from AGULIBRARY. It cannot be undone.`
    )
  ){
    return;
  }

  const list = $("aguResourceList");

  const buttons =
    list
      ? Array.from(
          list.querySelectorAll(
            ".agu-delete-resource"
          )
        )
      : [];

  const button =
    buttons.find(
      b =>
        String(b.dataset.resourceKey) ===
        String(resourceKey)
    );

  if(button){
    button.disabled = true;
  }

  try{

    showMessage(
      "Administrator verification required for deletion.",
      "success"
    );

    const verified =
      await adminMfaGate();

    if(!verified){

      if(button){
        button.disabled = false;
      }

      return;
    }

    showMessage(
      `Deleting "${title}"...`,
      "success"
    );

    let storageError = null;

    const storagePath =
      resource.storage_path ||
      resource.path ||
      "";

    if(storagePath){

      const sr =
        await d.storage
          .from(BUCKET)
          .remove([storagePath]);

      if(sr.error){
        storageError = sr.error;
      }
    }

    let dbResult;

    if(
      resource.id !== undefined &&
      resource.id !== null &&
      String(resource.id) !== ""
    ){

      dbResult =
        await d
          .from(TABLE)
          .delete()
          .eq("id",resource.id);

    }else if(storagePath){

      dbResult =
        await d
          .from(TABLE)
          .delete()
          .eq(
            "storage_path",
            storagePath
          );

    }else if(
      resource.file_url ||
      resource.url
    ){

      const field =
        resource.file_url
          ? "file_url"
          : "url";

      dbResult =
        await d
          .from(TABLE)
          .delete()
          .eq(
            field,
            resource[field]
          );

    }else{

      throw new Error(
        "This resource has no safe database identifier. Refresh the list and try again."
      );
    }

    if(dbResult.error){
      throw dbResult.error;
    }

    if(storageError){

      showMessage(
        `"${title}" was removed from the library, ` +
        `but its stored file could not be deleted: ` +
        `${storageError.message || "Storage error"}.`,
        "error"
      );

    }else{

      showMessage(
        `"${title}" was deleted successfully.`,
        "success"
      );
    }

    await loadResources();

  }catch(e){

    console.error(e);

    showMessage(
      e.message ||
      "Resource deletion failed. No further changes were made by the dashboard.",
      "error"
    );

    if(button){
      button.disabled = false;
    }
  }
}

/* =========================================================
   UPLOAD RESOURCE
========================================================= */

async function uploadFile(e){

  e.preventDefault();

  const d = getDB();

  const title =
    $("title").value.trim();

  const category =
    $("category").value.trim();

  const type =
    $("resourceType").value;

  const status =
    $("uploadStatus");

  const button =
    $("uploadButton");

  if(!title){

    status.textContent =
      "Please enter a resource title.";

    return;
  }

  button.disabled = true;

  status.textContent =
    "Preparing...";

  try{

    /* =====================================================
       DIGITAL BOOK
    ===================================================== */

    if(type === "digital_book"){

      let bookPath =
        $("bookPath")?.value.trim() || "";

      let bookEntry =
        $("bookEntry")?.value.trim() ||
        "index.html";

      if(!bookPath){

        status.textContent =
          "Please enter the digital book folder path.";

        return;
      }

      bookPath =
        bookPath.replace(
          /^[\/\\]+|[\/\\]+$/g,
          ""
        );

      if(!bookPath){

        status.textContent =
          "Please enter the digital book folder path.";

        return;
      }

      bookEntry =
        bookEntry.replace(
          /^[\/\\]+/,
          ""
        );

      if(!bookEntry){
        bookEntry = "index.html";
      }

      const digitalBookURL =
        "/" +
        bookPath.replace(
          /[\/\\]+$/,
          ""
        ) +
        "/" +
        bookEntry;

      /*
       * FIX:
       * Use resource_category because that is the
       * actual column in the Supabase resources table.
       */

      const payload = {
        title,
        subject: category,
        type: "digital_book",
        file_url: digitalBookURL,
        name: title,
        resource_category: category,
        url: digitalBookURL
      };

      let result =
        await d
          .from(TABLE)
          .insert(payload);

      if(result.error){

        /*
         * Fallback for installations where only
         * a smaller set of fields exists.
         */

        const fallback = {
          name: title,
          resource_category: category,
          type: "digital_book",
          url: digitalBookURL
        };

        result =
          await d
            .from(TABLE)
            .insert(fallback);

        if(result.error){
          throw result.error;
        }
      }

      status.textContent =
        "✅ Digital book published successfully.";

      showMessage(
        "Digital book published successfully.",
        "success"
      );

      $("uploadForm").reset();

      updateDigitalBookFields();

      await loadResources();

      return;
    }

    /* =====================================================
       NORMAL FILE
    ===================================================== */

    const file =
      $("file").files[0];

    if(!file){

      status.textContent =
        "Please select a file.";

      return;
    }

    status.textContent =
      "Uploading...";

    const safe =
      file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

    const filename =
      `resources/${Date.now()}-${safe}`;

    const up =
      await d.storage
        .from(BUCKET)
        .upload(
          filename,
          file,
          {
            upsert:false
          }
        );

    if(up.error){
      throw up.error;
    }

    const pub =
      d.storage
        .from(BUCKET)
        .getPublicUrl(filename);

    const url =
      pub.data.publicUrl;

    /*
     * FIX:
     * Use resource_category instead of category.
     */

    const payload = {
      title,
      subject: category,
      type,
      file_url: url,
      storage_path: filename,
      name: title,
      resource_category: category,
      url
    };

    let result =
      await d
        .from(TABLE)
        .insert(payload);

    if(result.error){

      /*
       * Fallback for installations where some
       * optional columns are unavailable.
       */

      const fallback = {
        name: title,
        resource_category: category,
        type,
        url
      };

      result =
        await d
          .from(TABLE)
          .insert(fallback);

      if(result.error){
        throw result.error;
      }
    }

    status.textContent =
      "✅ Upload successful.";

    showMessage(
      "Resource uploaded successfully.",
      "success"
    );

    $("uploadForm").reset();

    updateDigitalBookFields();

    await loadResources();

  }catch(err){

    console.error(err);

    status.textContent =
      "❌ " +
      (err.message || "Upload failed.");

    showMessage(
      err.message || "Upload failed.",
      "error"
    );

  }finally{

    button.disabled = false;
  }
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

async function insertNotification(
  d,
  recipientId,
  title,
  message
){

  const variants = [

    {
      student_id:recipientId,
      title,
      message,
      is_read:false
    },

    {
      user_id:recipientId,
      title,
      message,
      is_read:false
    },

    {
      recipient_id:recipientId,
      title,
      message,
      is_read:false
    },

    {
      student_id:recipientId,
      message,
      is_read:false
    },

    {
      user_id:recipientId,
      message,
      is_read:false
    }

  ];

  let last = null;

  for(const payload of variants){

    const r =
      await d
        .from("student_notifications")
        .insert(payload);

    if(!r.error){
      return true;
    }

    last = r.error;

    const m =
      (r.error.message || "")
        .toLowerCase();

    if(
      !(
        m.includes("column") ||
        m.includes("schema cache") ||
        m.includes("could not find")
      )
    ){
      throw r.error;
    }
  }

  throw (
    last ||
    new Error(
      "Could not insert notification."
    )
  );
}

async function sendNotification(){

  const d = getDB();

  const target =
    $("aguNotifyTarget")?.value ||
    "all";

  const title =
    $("aguNotifyTitle")?.value.trim();

  const message =
    $("aguNotifyMessage")?.value.trim();

  const status =
    $("aguNotifyStatus");

  if(!title || !message){

    status.textContent =
      "Please enter a title and message.";

    return;
  }

  status.textContent =
    "Sending...";

  try{

    const recipients =
      target === "all"
        ? students
        : students.filter(
            p =>
              getId(p) ===
              target.replace(
                "student:",
                ""
              )
          );

    if(!recipients.length){

      throw new Error(
        "No student recipient was found."
      );
    }

    let sent = 0;

    for(const p of recipients){

      const id = getId(p);

      if(id){

        await insertNotification(
          d,
          id,
          title,
          message
        );

        sent++;
      }
    }

    status.textContent =
      `✅ Notification sent to ${sent} student${sent === 1 ? "" : "s"}.`;

    $("aguNotifyTitle").value = "";
    $("aguNotifyMessage").value = "";

    await loadNotificationCount();

  }catch(e){

    console.error(e);

    status.textContent =
      "❌ " +
      (
        e.message ||
        "Notification could not be sent."
      );
  }
}

async function loadNotificationCount(){

  try{

    const r =
      await getDB()
        .from("student_notifications")
        .select(
          "*",
          {
            count:"exact",
            head:true
          }
        );

    if(
      !r.error &&
      $("aguNotificationCount")
    ){

      $("aguNotificationCount")
        .textContent =
        r.count ?? 0;
    }

  }catch(_){}
}

/* =========================================================
   FINISH ADMIN
========================================================= */

async function finishAdmin(){

  $("loginPanel")
    .classList
    .add("hidden");

  $("dashboardPanel")
    .classList
    .remove("hidden");

  if(currentSession){

    $("adminIdentity")
      .textContent =
      "Signed in as " +
      (
        currentSession.user.email ||
        "administrator"
      );
  }

  await Promise.all([
    loadStudents(),
    loadResources(),
    loadNotificationCount()
  ]);
}

/* =========================================================
   SESSION
========================================================= */

async function checkSession(){

  try{

    const d = getDB();

    const r =
      await d.auth.getSession();

    if(r.error){
      throw r.error;
    }

    currentSession =
      r.data?.session || null;

    if(!currentSession){

      $("loginPanel")
        .classList
        .remove("hidden");

      $("dashboardPanel")
        .classList
        .add("hidden");

      return;
    }

    if(
      !(await isAdmin(currentSession))
    ){

      await d.auth.signOut();

      showLoginMessage(
        "This account is not authorized as an AGULIBRARY administrator.",
        "error"
      );

      return;
    }

    if(
      await adminMfaGate()
    ){

      await finishAdmin();
    }

  }catch(e){

    console.error(e);

    showLoginMessage(
      e.message ||
      "Unable to initialize administrator access.",
      "error"
    );
  }
}

/* =========================================================
   LOGIN
========================================================= */

async function login(e){

  e.preventDefault();

  const button =
    $("adminLoginButton");

  button.disabled = true;

  showLoginMessage(
    "Signing in...",
    "success"
  );

  try{

    const d = getDB();

    const r =
      await d.auth.signInWithPassword({
        email:
          $("adminEmail")
            .value
            .trim(),

        password:
          $("adminPassword")
            .value
      });

    if(r.error){
      throw r.error;
    }

    currentSession =
      r.data.session;

    if(
      !(await isAdmin(currentSession))
    ){

      await d.auth.signOut();

      throw new Error(
        "This account is not authorized as an AGULIBRARY administrator."
      );
    }

    showLoginMessage(
      "Authentication successful. Checking administrator verification...",
      "success"
    );

    if(
      await adminMfaGate()
    ){

      await finishAdmin();
    }

  }catch(e){

    console.error(e);

    showLoginMessage(
      e.message ||
      "Sign in failed.",
      "error"
    );

  }finally{

    button.disabled = false;
  }
}

/* =========================================================
   LOGOUT
========================================================= */

async function logout(){

  try{

    await getDB()
      .auth
      .signOut();

  }catch(e){

    console.error(e);
  }

  localStorage.removeItem(
    "AGU_ADMIN_MFA_VERIFIED_AT"
  );

  mfaOpen = false;
  currentSession = null;

  location.reload();
}

/* =========================================================
   EVENT BINDING
========================================================= */

function bind(){

  $("adminLoginForm")
    ?.addEventListener(
      "submit",
      login
    );

  $("uploadForm")
    ?.addEventListener(
      "submit",
      uploadFile
    );

  $("logoutButton")
    ?.addEventListener(
      "click",
      logout
    );

  $("resourceType")
    ?.addEventListener(
      "change",
      updateDigitalBookFields
    );

  updateDigitalBookFields();

  $("aguStudentSearch")
    ?.addEventListener(
      "input",
      renderStudents
    );

  $("aguResourceSearch")
    ?.addEventListener(
      "input",
      renderResources
    );

  $("aguRefreshStudents")
    ?.addEventListener(
      "click",
      loadStudents
    );

  $("aguRefreshResources")
    ?.addEventListener(
      "click",
      loadResources
    );

  $("refreshAll")
    ?.addEventListener(
      "click",
      () => {

        loadStudents();
        loadResources();
        loadNotificationCount();

      }
    );

  $("aguSendNotification")
    ?.addEventListener(
      "click",
      sendNotification
    );

  $("adminMfaReset")
    ?.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "AGU_ADMIN_MFA_VERIFIED_AT"
        );

        mfaOpen = false;

        alert(
          "Administrator verification has been reset. " +
          "The next protected action will request your Authenticator code."
        );
      }
    );

  document
    .querySelectorAll("[data-target]")
    .forEach(b => {

      b.addEventListener(
        "click",
        () => {

          const i =
            $(b.dataset.target);

          if(i){

            i.type =
              i.type === "password"
                ? "text"
                : "password";
          }
        }
      );
    });

  if($("year")){
    $("year").textContent =
      new Date().getFullYear();
  }
}

/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    bind();
    checkSession();

  }
);

/* =========================================================
   PUBLIC ADMIN API
========================================================= */

window.AGU_ADMIN = {

  loadStudents,
  loadResources,
  sendNotification,
  uploadFile,
  deleteResource,
  logout

};

})();
