/* =========================================================
AGULIBRARY — COMPLETE ADMIN.JS
Resource classification:

Subject
Education level
Class / level
Term / semester

IMPORTANT:
The resources table uses folder_path, not storage_path.
The upload system therefore writes folder_path.
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

const TABLE = window.AGU_RESOURCE_TABLE || "resources";
const BUCKET = window.AGU_BUCKET || window.BUCKET || "agu-library";

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
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
    return db = window.supabase.createClient(
      cfg.supabaseUrl,
      cfg.supabaseAnonKey
    );
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
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:99999;display:grid;place-items:center;padding:20px";

  overlay.innerHTML = `
    <div style="width:min(440px,100%);background:#fff;border-radius:22px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)">
      <h2 style="margin-top:0;color:#123d2d"> Admin MFA Verification</h2>
      <p style="color:#718079;line-height:1.6">Enter the current 6-digit code from your authenticator app to continue.</p>
      <input id="aguMfaCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"
        style="width:100%;padding:14px;border:1px solid #cfe5da;border-radius:10px;font-size:20px;letter-spacing:5px;text-align:center">
      <button id="aguMfaVerify" type="button"
        style="width:100%;margin-top:12px;border:0;border-radius:10px;padding:13px;background:#087a4b;color:#fff;font-weight:900">
        Verify & Continue
      </button>
      <button id="aguMfaCancel" type="button"
        style="width:100%;margin-top:8px;border:1px solid #cfe5da;border-radius:10px;padding:13px;background:#edf7f2;color:#17352a;font-weight:800">
        Cancel & Sign Out
      </button>
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
      const r = await d.auth.mfa.challengeAndVerify({
        factorId: totp.id,
        code
      });
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

    students.sort((a, b) => {
      const ad = String(a.created_at || a.updated_at || "");
      const bd = String(b.created_at || b.updated_at || "");
      return bd.localeCompare(ad);
    });

    if ($("aguStudentCount")) $("aguStudentCount").textContent = students.length;
    renderStudents();
    updateTargets();
  } catch (e) {
    console.error("Student loading error:", e);
    if ($("aguStudentCount")) $("aguStudentCount").textContent = "0";
    list.innerHTML = `<div class="empty"> Unable to load students.<br><small>${esc(e.message || "Unknown database error")}</small></div>`;
  }
}

function renderStudents() {
  const list = $("aguStudentList");
  if (!list) return;

  const q = ($("aguStudentSearch")?.value || "").toLowerCase().trim();

  const rows = students.filter(p => {
    const text = [
      profileName(p), profileEmail(p), profilePhone(p),
      p.education_level, p.class_level
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(q);
  });

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
        <div class="item-main">
          <div class="avatar">${esc(initials || "ST")}</div>
          <div class="item-text">
            <strong>${esc(n)}</strong>
            <div class="small">${esc(profileEmail(p))}</div>
            <div class="small">${esc(profilePhone(p))}</div>
            ${p.education_level ? `<div class="small">Education: ${esc(p.education_level)}</div>` : ""}
            ${p.class_level ? `<div class="small">Class: ${esc(p.class_level)}</div>` : ""}
          </div>
        </div>
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

  s.innerHTML =
    '<option value="all"> All students</option>' +
    students.map(p => {
      const id = getId(p);
      const name = profileName(p);
      const email = profileEmail(p);
      return `<option value="student:${esc(id)}">${esc(name)}${email ? " — " + esc(email) : ""}</option>`;
    }).join("");
}

/* ---------------- ACADEMIC CLASSIFICATION ---------------- */

const CLASS_OPTIONS = {
  "Early Years": [
    ["Early Years 1", "Early Years 1"],
    ["Early Years 2", "Early Years 2"],
    ["Early Years 3", "Early Years 3"]
  ],
  "Primary": [
    ["Primary 1", "Primary 1"], ["Primary 2", "Primary 2"],
    ["Primary 3", "Primary 3"], ["Primary 4", "Primary 4"],
    ["Primary 5", "Primary 5"], ["Primary 6", "Primary 6"]
  ],
  "Junior Secondary": [
    ["JSS 1", "JSS 1"], ["JSS 2", "JSS 2"], ["JSS 3", "JSS 3"]
  ],
  "Senior Secondary": [
    ["SSS 1", "SSS 1"], ["SSS 2", "SSS 2"], ["SSS 3", "SSS 3"]
  ],
  "Tertiary": [
    ["100 Level", "100 Level"], ["200 Level", "200 Level"],
    ["300 Level", "300 Level"], ["400 Level", "400 Level"],
    ["500 Level", "500 Level"], ["Postgraduate", "Postgraduate"]
  ]
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
  select.innerHTML =
    '<option value="">Select class / level</option>' +
    options.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("");
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

  if (isDigital && $("bookEntry") && !$("bookEntry").value) {
    $("bookEntry").value = "index.html";
  }
}

/* ---------------- RESOURCES ---------------- */

async function loadResources() {
  const list = $("aguResourceList");
  if (!list) return;

  list.innerHTML = '<div class="empty">Loading resources...</div>';

  try {
    const r = await getDB()
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (r.error) throw r.error;

    resources = r.data || [];

    if ($("aguResourceCount")) $("aguResourceCount").textContent = resources.length;
    renderResources();
  } catch (e) {
    console.error("Resource loading error:", e);
    list.innerHTML = `<div class="empty"> Unable to load resources.<br><small>${esc(e.message || "Unknown database error")}</small></div>`;
  }
}

function renderResources() {
  const list = $("aguResourceList");
  if (!list) return;

  const q = ($("aguResourceSearch")?.value || "").toLowerCase().trim();

  const rows = resources.filter(r => {
    const text = [
      r.title, r.subject, r.level, r.class_level, r.term,
      r.resource_category, r.type, r.folder_path
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(q);
  });

  if (!rows.length) {
    list.innerHTML = '<div class="empty">No resources found.</div>';
    return;
  }

  list.innerHTML = rows.slice(0, 200).map((r, i) => {
    const url = r.file_url || "";
    const path = r.folder_path || r.storage_path || "";
    const key = r.id ?? path ?? url ?? `${r.title || "resource"}-${i}`;

    return `
      <div class="item">
        <div class="item-text">
          <strong>${esc(r.title || "Untitled Resource")}</strong>
          <div class="small">
            Subject: ${esc(r.subject || r.resource_category || "—")}
            ${r.level ? " • Level: " + esc(r.level) : ""}
            ${r.class_level ? " • Class: " + esc(r.class_level) : ""}
            ${r.term ? " • " + esc(r.term) : ""}
            ${r.type ? " • " + esc(r.type) : ""}
          </div>
          <div class="small">${esc(path)}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${url ? `<a class="btn blue" href="${esc(url)}" target="_blank" rel="noopener">Open</a>` : ""}
          <button class="btn delete-resource agu-delete-resource" data-resource-key="${esc(key)}" type="button"> Delete</button>
        </div>
      </div>`;
  }).join("");

  list.querySelectorAll(".agu-delete-resource").forEach(button => {
    button.onclick = () => deleteResource(button.dataset.resourceKey);
  });
}

async function deleteResource(resourceKey) {
  const d = getDB();

  const resource = resources.find(r =>
    String(r.id ?? r.folder_path ?? r.storage_path ?? r.file_url ?? "") === String(resourceKey)
  );

  if (!resource) {
    showMessage("Resource could not be found. Refresh the resource list and try again.", "error");
    return;
  }

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

    if (resource.id !== undefined && resource.id !== null) {
      dbResult = await d.from(TABLE).delete().eq("id", resource.id);
    } else if (storagePath) {
      dbResult = await d.from(TABLE).delete().eq("folder_path", storagePath);
    } else if (resource.file_url) {
      dbResult = await d.from(TABLE).delete().eq("file_url", resource.file_url);
    } else {
      throw new Error("This resource has no safe database identifier.");
    }

    if (dbResult.error) throw dbResult.error;

    if (storageError) {
      showMessage(`"${title}" was removed from the library, but its stored file could not be deleted: ${storageError.message || "Storage error"}.`, "error");
    } else {
      showMessage(`"${title}" was deleted successfully.`, "success");
    }

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

  if (!title) {
    if (status) status.textContent = "Please enter a resource title.";
    return;
  }

  if (!category || !level || !classLevel || !term) {
    if (status) status.textContent = "Please select the subject, education level, class / level and term / semester.";
    showMessage("Please complete the resource classification before uploading.", "error");
    return;
  }

  button.disabled = true;
  if (status) status.textContent = "Preparing...";

  try {
    /* DIGITAL BOOK */
if (type === "digital_book") {

  let bookPath =
    $("bookPath")?.value.trim() || "";

  let bookEntry =
    $("bookEntry")?.value.trim() || "index.html";

  const files =
    $("digitalBookFiles")?.files || [];

  bookPath =
    bookPath.replace(
      /^[\/\\]+|[\/\\]+$/g,
      ""
    );

  bookEntry =
    bookEntry.replace(
      /^[\/\\]+/,
      ""
    );

  if (!bookPath) {

    if (status) {
      status.textContent =
        "Please enter the digital book folder path.";
    }

    return;
  }

  if (!files.length) {

    if (status) {
      status.textContent =
        "Please select the digital book files.";
    }

    return;
  }

  if (!bookEntry) {
    bookEntry = "index.html";
  }

  /*
   * ------------------------------------------------------
   * REQUIRE THE THREE AGULIBRARY BOOK FILES
   * ------------------------------------------------------
   */

  const requiredFiles = [
    "index.html",
    "app.js",
    "data.js"
  ];

  const selectedNames =
    Array.from(files).map(
      file =>
        String(
          file.webkitRelativePath ||
          file.name ||
          ""
        )
          .replace(/\\/g, "/")
          .split("/")
          .pop()
    );

  for (const required of requiredFiles) {

    if (!selectedNames.includes(required)) {

      const message =
        `The digital book must contain ${required}.`;

      if (status) {
        status.textContent = message;
      }

      showMessage(
        message,
        "error"
      );

      return;
    }
  }

  /*
   * ------------------------------------------------------
   * CONVERT FILES TO BASE64
   * ------------------------------------------------------
   */

  const readFileAsDataURL =
    file =>
      new Promise(
        (resolve, reject) => {

          const reader =
            new FileReader();

          reader.onload =
            () => resolve(
              String(
                reader.result || ""
              )
            );

          reader.onerror =
            () =>
              reject(
                new Error(
                  "Could not read " +
                  file.name
                )
              );

          reader.readAsDataURL(file);
        }
      );

  if (status) {
    status.textContent =
      `Preparing digital book files... 0/${files.length}`;
  }

  const bookFiles = [];

  try {

    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      const file = files[i];

      const relativePath =
        file.webkitRelativePath ||
        file.name;

      const cleanRelativePath =
        String(relativePath)
          .replace(/\\/g, "/")
          .replace(/^\/+/g, "")
          .split("/")
          .map(
            part =>
              part.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
              )
          )
          .join("/");

      const content =
        await readFileAsDataURL(file);

      bookFiles.push({
        name: cleanRelativePath,
        content: content
      });

      if (status) {
        status.textContent =
          `Preparing digital book files... ${i + 1}/${files.length}`;
      }
    }

    /*
     * ------------------------------------------------------
     * GET CURRENT ADMIN SESSION
     * ------------------------------------------------------
     */

    const sessionResult =
      await d.auth.getSession();

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    const accessToken =
      sessionResult.data?.session?.access_token;

    if (!accessToken) {
      throw new Error(
        "Administrator authentication session is unavailable. Please sign in again."
      );
    }

    /*
     * ------------------------------------------------------
     * PUBLISH THROUGH NETLIFY FUNCTION
     * ------------------------------------------------------
     */

    if (status) {
      status.textContent =
        "Publishing digital book to AGULIBRARY...";
    }

    const publishResponse =
      await fetch(
        "/.netlify/functions/publish-digital-book",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " + accessToken
          },

          body:
            JSON.stringify({
              title: title,

              owner:
                "abbaumara391",

              repo:
                "AGU-LIBRARY",

              branch:
                "main",

              folder:
                bookPath,

              files:
                bookFiles
            })
        }
      );

    let publishData = {};

    try {

      publishData =
        await publishResponse.json();

    } catch (_) {

      publishData = {};
    }

    if (!publishResponse.ok) {

      throw new Error(
        publishData?.error ||
        publishData?.message ||
        "Digital book could not be published."
      );
    }

    /*
     * ------------------------------------------------------
     * NETLIFY BOOK URL
     * ------------------------------------------------------
     */

    const digitalBookURL =
      window.location.origin +
      "/" +
      bookPath +
      "/" +
      bookEntry;

    /*
     * ------------------------------------------------------
     * CREATE RESOURCE DATABASE RECORD
     * ------------------------------------------------------
     */

    const payload = {

      title:
        title,

      subject:
        category,

      level:
        level,

      class_level:
        classLevel,

      term:
        term,

      type:
        "digital_book",

      file_url:
        digitalBookURL,

      resource_category:
        category,

      folder_path:
        bookPath
    };

    const result =
      await d
        .from(TABLE)
        .insert(payload);

    if (result.error) {
      throw result.error;
    }

    /*
     * ------------------------------------------------------
     * SUCCESS
     * ------------------------------------------------------
     */

    if (status) {

      status.textContent =
        `✅ Digital book published successfully. ${files.length} file${files.length === 1 ? "" : "s"} published to GitHub.`;
    }

    showMessage(
      "Digital book published successfully.",
      "success"
    );

    $("uploadForm")?.reset();

    updateClassLevels();

    updateDigitalBookFields();

    await loadResources();

    return;

  } catch (digitalBookError) {

    console.error(
      "AGULIBRARY digital book publishing error:",
      digitalBookError
    );

    if (status) {

      status.textContent =
        "❌ " +
        (
          digitalBookError.message ||
          "Digital book publishing failed."
        );
    }

    showMessage(
      digitalBookError.message ||
      "Digital book publishing failed.",
      "error"
    );

    return;
  }
}

    /* NORMAL FILE */
    const file = $("file")?.files?.[0];

    if (!file) {
      if (status) status.textContent = "Please select a file.";
      return;
    }

    if (status) status.textContent = "Uploading...";

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `resources/${Date.now()}-${safe}`;

    const up = await d.storage.from(BUCKET).upload(filename, file, { upsert: false });
    if (up.error) throw up.error;

    const pub = d.storage.from(BUCKET).getPublicUrl(filename);
    const url = pub.data.publicUrl;

    /*
       IMPORTANT:
       The current resources table uses folder_path.
       Do NOT send name, category, url or storage_path.
    */
    const payload = {
      title: title,
      subject: category,
      level: level,
      class_level: classLevel,
      term: term,
      type: type,
      file_url: url,
      folder_path: filename,
      resource_category: category
    };

    const result = await d.from(TABLE).insert(payload);

    if (result.error) {
      try {
        await d.storage.from(BUCKET).remove([filename]);
      } catch (_) {}
      throw result.error;
    }

    if (status) status.textContent = " Upload successful.";
    showMessage("Resource uploaded successfully.", "success");

    $("uploadForm")?.reset();
    updateClassLevels();
    updateDigitalBookFields();
    await loadResources();

  } catch (err) {
    console.error("AGULIBRARY upload error:", err);

    if (status) status.textContent = " " + (err.message || "Upload failed.");
    showMessage(err.message || "Upload failed.", "error");
  } finally {
    button.disabled = false;
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

    if (!r.error) {
      return true;
    }

    last = r.error;
    const m = (r.error.message || "").toLowerCase();

    if (!(m.includes("column") || m.includes("schema cache") || m.includes("could not find"))) {
      throw r.error;
    }
  }

  throw last || new Error("Could not insert notification.");
}


/*
   ---------------------------------------------------------
   AGULIBRARY ANDROID / WEB PUSH
   ---------------------------------------------------------
   Sends the already-created notification to the student's
   registered Android/browser push subscriptions.

   IMPORTANT:
   The VAPID private key and Supabase service-role key are
   NEVER placed in this admin.js file.
   They remain inside the secure Supabase Edge Function.
   ---------------------------------------------------------
*/

async function sendPushNotification(recipientId, title, message) {
  try {
    const baseUrl = String(
      cfg.supabaseUrl ||
      window.AGU_CONFIG?.supabaseUrl ||
      ""
    ).replace(/\/$/, "");

    if (!baseUrl) {
      console.warn("Push notification skipped: Supabase URL unavailable.");
      return {
        sent: false,
        skipped: true,
        reason: "Supabase URL unavailable"
      };
    }

    /*
       The Edge Function is responsible for:
       - verifying the administrator
       - finding the student's push subscriptions
       - sending Web Push
       - removing expired subscriptions
    */
    const functionName =
      cfg.pushNotificationFunction ||
      window.AGU_CONFIG?.pushNotificationFunction ||
      "send-push-notification";

    const sessionResult = await getDB().auth.getSession();

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    const accessToken = sessionResult.data?.session?.access_token;

    if (!accessToken) {
      throw new Error("Administrator authentication token is unavailable.");
    }

    const response = await fetch(
      baseUrl + "/functions/v1/" + functionName,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken,
          "apikey": cfg.supabaseAnonKey || ""
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          title: title,
          message: message,
          url: "/index.html"
        })
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Push notification service returned an error."
      );
    }

    return {
      sent: true,
      data
    };

  } catch (error) {
    /*
       IMPORTANT:
       The database notification has already been saved.
       A push failure must NOT make the admin think the
       database notification was lost.
    */
    console.warn(
      "AGULIBRARY Android push notification could not be sent:",
      error
    );

    return {
      sent: false,
      skipped: false,
      error: error
    };
  }
}


async function sendNotification() {
  const d = getDB();

  const target =
    $("aguNotifyTarget")?.value || "all";

  const title =
    $("aguNotifyTitle")?.value.trim();

  const message =
    $("aguNotifyMessage")?.value.trim();

  const status =
    $("aguNotifyStatus");

  if (!title || !message) {
    if (status) {
      status.textContent =
        "Please enter a title and message.";
    }
    return;
  }

  if (status) {
    status.textContent =
      "Sending notification...";
  }

  try {

    const recipients =
      target === "all"
        ? students
        : students.filter(
            p =>
              getId(p) ===
              target.replace("student:", "")
          );

    if (!recipients.length) {
      throw new Error(
        "No student recipient was found."
      );
    }

    let sent = 0;
    let pushSent = 0;
    let pushUnavailable = 0;

    for (const p of recipients) {

      const id = getId(p);

      if (!id) continue;

      /*
         FIRST:
         Save the permanent AGULIBRARY notification.
      */
      await insertNotification(
        d,
        id,
        title,
        message
      );

      sent++;

      /*
         SECOND:
         Send Android/browser system notification.
         This is intentionally separate from the database
         insert so the existing notification system keeps
         working even if push is temporarily unavailable.
      */
      const pushResult =
        await sendPushNotification(
          id,
          title,
          message
        );

      if (pushResult.sent) {
        pushSent++;
      } else {
        pushUnavailable++;
      }
    }

    /*
       Existing admin notification count remains intact.
    */
    await loadNotificationCount();

    $("aguNotifyTitle").value = "";
    $("aguNotifyMessage").value = "";

    if (pushSent === sent) {

      if (status) {
        status.textContent =
          `✅ Notification sent to ${sent} student${sent === 1 ? "" : "s"} and Android push notification${sent === 1 ? "" : "s"} delivered.`;
      }

    } else if (pushSent > 0) {

      if (status) {
        status.textContent =
          `✅ Notification saved for ${sent} student${sent === 1 ? "" : "s"}. Android push delivered to ${pushSent}; ${pushUnavailable} device${pushUnavailable === 1 ? "" : "s"} could not receive push.`;
      }

    } else {

      if (status) {
        status.textContent =
          `✅ Notification saved for ${sent} student${sent === 1 ? "" : "s"}. Android push is not currently available for the selected device${sent === 1 ? "" : "s"}.`;
      }

    }

  } catch (e) {

    console.error(
      "AGULIBRARY notification error:",
      e
    );

    if (status) {
      status.textContent =
        "❌ " +
        (e.message ||
          "Notification could not be sent.");
    }
  }
}


async function loadNotificationCount() {
  try {

    const r =
      await getDB()
        .from("student_notifications")
        .select("*", {
          count: "exact",
          head: true
        });

    if (
      !r.error &&
      $("aguNotificationCount")
    ) {
      $("aguNotificationCount").textContent =
        r.count ?? 0;
    }

  } catch (_) {}
}

/* ---------------- CREATE / SAVE EXAMINATION ---------------- */

async function saveExam() {

  const status = $("examFormStatus");

  try {

    const verified = await adminMfaGate();

    if (!verified) return;

    const id =
      $("examEditId")?.value.trim() || "";

    const title =
      $("examTitle")?.value.trim() || "";

    const subject =
      $("examSubject")?.value.trim() || "";

    const educationLevel =
      $("examEducationLevel")?.value.trim() || "";

    const classLevel =
      $("examClassLevel")?.value.trim() || "";

    const term =
      $("examTerm")?.value.trim() || "";

    const description =
      $("examDescription")?.value.trim() || null;

    const pass =
      Number($("examPassPercentage")?.value);

    if (
      !title ||
      !subject ||
      !educationLevel ||
      !classLevel ||
      !term
    ) {

      throw new Error(
        "Title, subject, education level, class / level and term are required."
      );

    }

    if (
      !Number.isFinite(pass) ||
      pass < 0 ||
      pass > 100
    ) {

      throw new Error(
        "Pass percentage must be between 0 and 100."
      );

    }

    const payload = {

      title:
        title,

      description:
        description,

      subject:
        subject,

      education_level:
        educationLevel,

      class_level:
        classLevel,

      term:
        term,

      pass_percentage:
        pass,

      registration_required:
        $("examRegistrationRequired")?.value === "true",

      is_published:
        $("examPublished")?.value === "true"

    };

    let result;

    if (id) {

      result =
        await getDB()
          .from("agu_examinations")
          .update(payload)
          .eq("id", id);

    } else {

      result =
        await getDB()
          .from("agu_examinations")
          .insert({
            ...payload,
            created_by:
              currentSession?.user?.id || null
          });

    }

    if (result.error) {
      throw result.error;
    }

    if (status) {

      status.textContent =
        id
          ? "✅ Examination updated successfully."
          : "✅ Examination created successfully.";

    }

    showMessage(
      id
        ? "Examination updated successfully."
        : "Examination created successfully.",
      "success"
    );

    if (!id) {

      $("examTitle").value = "";
      $("examSubject").value = "";
      $("examEducationLevel").value = "";
      $("examClassLevel").value = "";
      $("examTerm").value = "";
      $("examPassPercentage").value = "";
      $("examRegistrationRequired").value = "true";
      $("examPublished").value = "false";
      $("examDescription").value = "";

    }

  } catch (e) {

    console.error(
      "AGULIBRARY examination save error:",
      e
    );

    if (status) {

      status.textContent =
        "❌ " +
        (
          e.message ||
          "Unable to save examination."
        );

    }

    showMessage(
      e.message ||
      "Unable to save examination.",
      "error"
    );

  }

}

/* ---------------- LOAD EXAMINATIONS ---------------- */

async function loadExaminations() {

  const list =
    $("adminExamList");

  if (!list) return;

  list.innerHTML =
    '<div class="empty">Loading examinations...</div>';

  try {

    const result =
      await getDB()
        .from("agu_examinations")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (result.error) {
      throw result.error;
    }

    const examinations =
      result.data || [];

    if (!examinations.length) {

      list.innerHTML =
        '<div class="empty">No examinations created yet.</div>';

      return;
    }

    list.innerHTML =
      examinations.map(exam => {

        const published =
          exam.is_published === true;

        const registration =
          exam.registration_required !== false;

        return `
          <div class="exam-card">

            <div class="exam-card-title">
              ${exam.title || "Untitled Examination"}
            </div>

            <div class="exam-card-info">
              <strong>Subject:</strong>
              ${exam.subject || "—"}
            </div>

            <div class="exam-card-info">
              <strong>Education Level:</strong>
              ${exam.education_level || "—"}
            </div>

            <div class="exam-card-info">
              <strong>Class / Level:</strong>
              ${exam.class_level || "—"}
            </div>

            <div class="exam-card-info">
              <strong>Term:</strong>
              ${exam.term || "—"}
            </div>

            <div class="exam-card-info">
              <strong>Pass Percentage:</strong>
              ${exam.pass_percentage ?? 0}%
            </div>

            <div class="exam-card-info">
              <strong>Registration:</strong>
              ${registration ? "Required" : "Not Required"}
            </div>

            <div class="exam-card-info">
              <strong>Status:</strong>
              ${published ? "Published" : "Draft"}
            </div>

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "AGULIBRARY examination loading error:",
      error
    );

    list.innerHTML =
      `<div class="empty">
        ❌ ${
          error.message ||
          "Unable to load examinations."
        }
      </div>`;
  }
}
  
  /* ---------------- DASHBOARD ---------------- */

async function finishAdmin() {
  $("loginPanel")?.classList.add("hidden");
  $("dashboardPanel")?.classList.remove("hidden");

  if (currentSession && $("adminIdentity")) {
    $("adminIdentity").textContent =
      "Signed in as " + (currentSession.user.email || "administrator");
  }

  await Promise.all([
  loadStudents(),
  loadResources(),
  loadNotificationCount(),
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
  button.disabled = true;

  showLoginMessage("Signing in...", "success");

  try {
    const d = getDB();

    const r = await d.auth.signInWithPassword({
      email: $("adminEmail").value.trim(),
      password: $("adminPassword").value
    });

    if (r.error) throw r.error;

    currentSession = r.data.session;

    if (!(await isAdmin(currentSession))) {
      await d.auth.signOut();
      throw new Error("This account is not authorized as an AGULIBRARY administrator.");
    }

    showLoginMessage("Authentication successful. Checking administrator verification...", "success");

    if (await adminMfaGate()) await finishAdmin();

  } catch (e) {
    console.error(e);
    showLoginMessage(e.message || "Sign in failed.", "error");
  } finally {
    button.disabled = false;
  }
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

  $("refreshAll")?.addEventListener("click", () => {
    loadStudents();
    loadResources();
    loadNotificationCount();
  });

  $("aguSendNotification")?.addEventListener("click", sendNotification);
  $("adminMfaReset")?.addEventListener("click", logout);

  $("saveExam")?.addEventListener("click", saveExam);
  
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
  logout
};

})();
