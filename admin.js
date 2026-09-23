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
let examinations = [];
let examRegistrations = [];
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

const totp = (factors.data?.totp || []).find(
f => f.status === "verified"
);

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

<p style="color:#718079;line-height:1.6">  
    Enter the current 6-digit code from your authenticator app to continue.  
  </p>  

  <input  
    id="aguMfaCode"  
    inputmode="numeric"  
    maxlength="6"  
    autocomplete="one-time-code"  
    placeholder="000000"  
    style="width:100%;padding:14px;border:1px solid #cfe5da;border-radius:10px;font-size:20px;letter-spacing:5px;text-align:center"  
  >  

  <button  
    id="aguMfaVerify"  
    type="button"  
    style="width:100%;margin-top:12px;border:0;border-radius:10px;padding:13px;background:#087a4b;color:#fff;font-weight:900"  
  >  
    Verify & Continue  
  </button>  

  <button  
    id="aguMfaCancel"  
    type="button"  
    style="width:100%;margin-top:8px;border:1px solid #cfe5da;border-radius:10px;padding:13px;background:#edf7f2;color:#17352a;font-weight:800"  
  >  
    Cancel & Sign Out  
  </button>  

  <p  
    id="aguMfaError"  
    style="color:#b42323;font-size:13px;min-height:18px"  
  ></p>  
</div>`;

document.body.appendChild(overlay);

const codeInput = $("aguMfaCode");
const verifyButton = $("aguMfaVerify");
const cancelButton = $("aguMfaCancel");
const errorBox = $("aguMfaError");

cancelButton.onclick = async () => {

overlay.remove();  

mfaOpen = false;  

try {  
  await d.auth.signOut();  
} catch (e) {  
  console.error(e);  
}  

currentSession = null;  

$("dashboardPanel")?.classList.add("hidden");  
$("loginPanel")?.classList.remove("hidden");  

showLoginMessage(  
  "Administrator MFA verification was cancelled. Please sign in again.",  
  "error"  
);

};

verifyButton.onclick = async () => {

const code =  
  (codeInput.value || "")  
    .replace(/\D/g, "");  

if (code.length !== 6) {  

  errorBox.textContent =  
    "Enter the 6-digit authenticator code.";  

  return;  
}  

verifyButton.disabled = true;  
cancelButton.disabled = true;  

errorBox.textContent =  
  "Verifying...";  

try {  

  const r =  
    await d.auth.mfa.challengeAndVerify({  
      factorId: totp.id,  
      code  
    });  

  if (r.error) throw r.error;  

  const after =  
    await d.auth.mfa.getAuthenticatorAssuranceLevel();  

  if (after.error) throw after.error;  

  if (  
    after.data?.currentLevel !== "aal2"  
  ) {  

    throw new Error(  
      "MFA verification completed, but this session is not at AAL2. Please try again."  
    );  
  }  

  const sessionResult =  
    await d.auth.getSession();  

  if (sessionResult.error) {  
    throw sessionResult.error;  
  }  

  currentSession =  
    sessionResult.data?.session ||  
    currentSession;  

  mfaOpen = true;  

  overlay.remove();  

  await finishAdmin();  

} catch (e) {  

  console.error(e);  

  errorBox.textContent =  
    e.message ||  
    "MFA verification failed. Check the code and try again.";  

  verifyButton.disabled = false;  
  cancelButton.disabled = false;  

  codeInput.focus();  
  codeInput.select();  
}

};

codeInput.addEventListener(
"input",
() => {

codeInput.value =  
    codeInput.value  
      .replace(/\D/g, "")  
      .slice(0, 6);  

  if (  
    codeInput.value.length === 6  
  ) {  
    errorBox.textContent = "";  
  }  
}

);

codeInput.addEventListener(
"keydown",
e => {

if (e.key === "Enter") {  
    verifyButton.click();  
  }  

}

);

codeInput.focus();

return false;
}

/* ---------------- STUDENTS ---------------- */

async function loadStudents() {

const list =
$("aguStudentList");

if (!list) return;

list.innerHTML =
'<div class="empty">Loading students...</div>';

try {

const r =  
  await getDB()  
    .from("student_profiles")  
    .select("*");  

if (r.error) throw r.error;  

students =  
  Array.isArray(r.data)  
    ? r.data  
    : [];  

students.sort((a, b) => {  

  const ad =  
    String(  
      a.created_at ||  
      a.updated_at ||  
      ""  
    );  

  const bd =  
    String(  
      b.created_at ||  
      b.updated_at ||  
      ""  
    );  

  return bd.localeCompare(ad);  
});  

if ($("aguStudentCount")) {  

  $("aguStudentCount").textContent =  
    students.length;  
}  

renderStudents();  
updateTargets();

} catch (e) {

console.error(  
  "Student loading error:",  
  e  
);  

if ($("aguStudentCount")) {  
  $("aguStudentCount").textContent = "0";  
}  

list.innerHTML =  
  `<div class="empty">  
     Unable to load students.<br>  
    <small>${esc(  
      e.message ||  
      "Unknown database error"  
    )}</small>  
  </div>`;

}
}

function renderStudents() {

const list =
$("aguStudentList");

if (!list) return;

const q =
($("aguStudentSearch")?.value || "")
.toLowerCase()
.trim();

const rows =
students.filter(p => {

const text = [  

    profileName(p),  
    profileEmail(p),  
    profilePhone(p),  
    p.education_level,  
    p.class_level  

  ]  
    .filter(Boolean)  
    .join(" ")  
    .toLowerCase();  

  return text.includes(q);  
});

if (!rows.length) {

list.innerHTML =  
  '<div class="empty">No students found.</div>';  

return;

}

list.innerHTML =
rows.map(p => {

const n =  
    profileName(p);  

  const id =  
    getId(p);  

  const initials =  
    n  
      .split(/\s+/)  
      .filter(Boolean)  
      .slice(0, 2)  
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

          ${  
            p.education_level  
              ? `<div class="small">  
                   Education:  
                   ${esc(p.education_level)}  
                 </div>`  
              : ""  
          }  

          ${  
            p.class_level  
              ? `<div class="small">  
                   Class:  
                   ${esc(p.class_level)}  
                 </div>`  
              : ""  
          }  

        </div>  

      </div>  

      <button  
        class="btn blue agu-message-student"  
        data-id="${esc(id)}"  
        type="button">  
        Message  
      </button>  

    </div>`;  

}).join("");

list
.querySelectorAll(
".agu-message-student"
)
.forEach(button => {

button.onclick = () => {  

    const target =  
      $("aguNotifyTarget");  

    if (target) {  

      target.value =  
        "student:" +  
        button.dataset.id;  
    }  

    $("aguNotifyTitle")?.focus();  
  };  

});

}

function updateTargets() {

const s =
$("aguNotifyTarget");

if (!s) return;

s.innerHTML =
'<option value="all"> All students</option>' +

students.map(p => {  

  const id =  
    getId(p);  

  const name =  
    profileName(p);  

  const email =  
    profileEmail(p);  

  return `  
    <option value="student:${esc(id)}">  
      ${esc(name)}  
      ${  
        email  
          ? " — " + esc(email)  
          : ""  
      }  
    </option>`;  

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
["Primary 1", "Primary 1"],
["Primary 2", "Primary 2"],
["Primary 3", "Primary 3"],
["Primary 4", "Primary 4"],
["Primary 5", "Primary 5"],
["Primary 6", "Primary 6"]
],

"Junior Secondary": [
["JSS 1", "JSS 1"],
["JSS 2", "JSS 2"],
["JSS 3", "JSS 3"]
],

"Senior Secondary": [
["SSS 1", "SSS 1"],
["SSS 2", "SSS 2"],
["SSS 3", "SSS 3"]
],

"Tertiary": [
["100 Level", "100 Level"],
["200 Level", "200 Level"],
["300 Level", "300 Level"],
["400 Level", "400 Level"],
["500 Level", "500 Level"],
["Postgraduate", "Postgraduate"]
]

};

function updateClassLevels() {

const level =
$("educationLevel")?.value || "";

const select =
$("classLevel");

if (!select) return;

const options =
CLASS_OPTIONS[level] || [];

if (!options.length) {

select.disabled = true;  
select.required = false;  

select.innerHTML =  
  '<option value="">Select education level first</option>';  

return;

}

select.disabled = false;
select.required = true;

select.innerHTML =
'<option value="">Select class / level</option>' +

options.map(  
  ([value, label]) =>  
    `<option value="${esc(value)}">  
      ${esc(label)}  
    </option>`  
).join("");

}

function updateDigitalBookFields() {

const type =
$("resourceType");

const normal =
$("normalFileField");

const digital =
$("digitalBookFields");

const file =
$("file");

if (!type) return;

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

if (file) {

file.required =  
  !isDigital;

}

if (
isDigital &&
$("bookEntry") &&
!$("bookEntry").value
) {

$("bookEntry").value =  
  "index.html";

}
}

/* ---------------- RESOURCES ---------------- */

async function loadResources() {

const list =
$("aguResourceList");

if (!list) return;

list.innerHTML =
'<div class="empty">Loading resources...</div>';

try {

const r =  
  await getDB()  
    .from(TABLE)  
    .select("*")  
    .order(  
      "created_at",  
      {  
        ascending: false  
      }  
    );  

if (r.error) throw r.error;  

resources =  
  r.data || [];  

if ($("aguResourceCount")) {  

  $("aguResourceCount").textContent =  
    resources.length;  
}  

renderResources();

} catch (e) {

console.error(  
  "Resource loading error:",  
  e  
);  

list.innerHTML =  
  `<div class="empty">  
     Unable to load resources.<br>  
    <small>${esc(  
      e.message ||  
      "Unknown database error"  
    )}</small>  
  </div>`;

}
}

function renderResources() {

const list =
$("aguResourceList");

if (!list) return;

const q =
($("aguResourceSearch")?.value || "")
.toLowerCase()
.trim();

const rows =
resources.filter(r => {

const text = [  

    r.title,  
    r.subject,  
    r.level,  
    r.class_level,  
    r.term,  
    r.resource_category,  
    r.type,  
    r.folder_path  

  ]  
    .filter(Boolean)  
    .join(" ")  
    .toLowerCase();  

  return text.includes(q);  
});

if (!rows.length) {

list.innerHTML =  
  '<div class="empty">No resources found.</div>';  

return;

}

list.innerHTML =
rows
.slice(0, 200)
.map((r, i) => {

const url =  
      r.file_url || "";  

    const path =  
      r.folder_path ||  
      r.storage_path ||  
      "";  

    const key =  
      r.id ??  
      path ??  
      url ??  
      `${r.title || "resource"}-${i}`;  

    return `  
      <div class="item">  

        <div class="item-text">  

          <strong>  
            ${esc(  
              r.title ||  
              "Untitled Resource"  
            )}  
          </strong>  

          <div class="small">  

            Subject:  
            ${esc(  
              r.subject ||  
              r.resource_category ||  
              "—"  
            )}  

            ${  
              r.level  
                ? " • Level: " +  
                  esc(r.level)  
                : ""  
            }  

            ${  
              r.class_level  
                ? " • Class: " +  
                  esc(r.class_level)  
                : ""  
            }  

            ${  
              r.term  
                ? " • " +  
                  esc(r.term)  
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
            ${esc(path)}  
          </div>  

        </div>  

        <div  
          style="display:flex;gap:8px;flex-wrap:wrap">  

          ${  
            url  
              ? `<a  
                   class="btn blue"  
                   href="${esc(url)}"  
                   target="_blank"  
                   rel="noopener">  
                   Open  
                 </a>`  
              : ""  
          }  

          <button  
            class="btn delete-resource agu-delete-resource"  
            data-resource-key="${esc(key)}"  
            type="button">  
             Delete  
          </button>  

        </div>  

      </div>`;  
  })  
  .join("");

list
.querySelectorAll(
".agu-delete-resource"
)
.forEach(button => {

button.onclick =  
    () =>  
      deleteResource(  
        button.dataset.resourceKey  
      );  

});

}

async function deleteResource(resourceKey) {

const d =
getDB();

const resource =
resources.find(r =>
String(
r.id ??
r.folder_path ??
r.storage_path ??
r.file_url ??
""
) ===
String(resourceKey)
);

if (!resource) {

showMessage(  
  "Resource could not be found. Refresh the resource list and try again.",  
  "error"  
);  

return;

}

const title =
resource.title ||
"this resource";

if (
!confirm(
`Delete "${title}"?\n\nThis action removes the published resource from AGULIBRARY. It cannot be undone.`
)
) {
return;
}

try {

const verified =  
  await adminMfaGate();  

if (!verified) return;  

showMessage(  
  `Deleting "${title}"...`,  
  "success"  
);  

const storagePath =  
  resource.folder_path ||  
  resource.storage_path ||  
  resource.path ||  
  "";  

let storageError =  
  null;  

if (storagePath) {  

  const sr =  
    await d.storage  
      .from(BUCKET)  
      .remove([storagePath]);  

  if (sr.error) {  
    storageError = sr.error;  
  }  
}  

let dbResult;  

if (  
  resource.id !== undefined &&  
  resource.id !== null  
) {  

  dbResult =  
    await d  
      .from(TABLE)  
      .delete()  
      .eq(  
        "id",  
        resource.id  
      );  

} else if (storagePath) {  

  dbResult =  
    await d  
      .from(TABLE)  
      .delete()  
      .eq(  
        "folder_path",  
        storagePath  
      );  

} else if (resource.file_url) {  

  dbResult =  
    await d  
      .from(TABLE)  
      .delete()  
      .eq(  
        "file_url",  
        resource.file_url  
      );  

} else {  

  throw new Error(  
    "This resource has no safe database identifier."  
  );  
}  

if (dbResult.error) {  
  throw dbResult.error;  
}  

if (storageError) {  

  showMessage(  
    `"${title}" was removed from the library, but its stored file could not be deleted: ${storageError.message || "Storage error"}.`,  
    "error"  
  );  

} else {  

  showMessage(  
    `"${title}" was deleted successfully.`,  
    "success"  
  );  
}  

await loadResources();

} catch (e) {

console.error(e);  

showMessage(  
  e.message ||  
  "Resource deletion failed.",  
  "error"  
);

}
}

/* ---------------- UPLOAD ---------------- */

async function uploadFile(e) {

e.preventDefault();

const d =
getDB();

const title =
$("title")?.value.trim() || "";

const category =
$("category")?.value.trim() || "";

const level =
$("educationLevel")?.value || "";

const classLevel =
$("classLevel")?.value || "";

const term =
$("term")?.value || "";

const type =
$("resourceType")?.value || "";

const status =
$("uploadStatus");

const button =
$("uploadButton");

if (!title) {

if (status) {  
  status.textContent =  
    "Please enter a resource title.";  
}  

return;

}

if (
!category ||
!level ||
!classLevel ||
!term
) {

if (status) {  
  status.textContent =  
    "Please select the subject, education level, class / level and term / semester.";  
}  

showMessage(  
  "Please complete the resource classification before uploading.",  
  "error"  
);  

return;

}

button.disabled = true;

if (status) {
status.textContent =
"Preparing...";
}

try {

/* DIGITAL BOOK */  

if (type === "digital_book") {  

  let bookPath =  
    $("bookPath")?.value.trim() || "";  

  let bookEntry =  
    $("bookEntry")?.value.trim() ||  
    "index.html";  

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
    bookEntry =  
      "index.html";  
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

  for (  
    const required of requiredFiles  
  ) {  

    if (  
      !selectedNames.includes(  
        required  
      )  
    ) {  

      const message =  
        `The digital book must contain ${required}.`;  

      if (status) {  
        status.textContent =  
          message;  
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
            () =>  
              resolve(  
                String(  
                  reader.result ||  
                  ""  
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

          reader.readAsDataURL(  
            file  
          );  
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

      const file =  
        files[i];  

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
        await readFileAsDataURL(  
          file  
        );  

      bookFiles.push({  
        name:  
          cleanRelativePath,  

        content:  
          content  
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
      sessionResult.data?.session  
        ?.access_token;  

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
              "Bearer " +  
              accessToken  
          },  

          body:  
            JSON.stringify({  

              title:  
                title,  

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

  } catch (  
    digitalBookError  
  ) {  

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

const file =  
  $("file")?.files?.[0];  

if (!file) {  

  if (status) {  
    status.textContent =  
      "Please select a file.";  
  }  

  return;  
}  

if (status) {  
  status.textContent =  
    "Uploading...";  
}  

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
        upsert: false  
      }  
    );  

if (up.error) {  
  throw up.error;  
}  

const pub =  
  d.storage  
    .from(BUCKET)  
    .getPublicUrl(  
      filename  
    );  

const url =  
  pub.data.publicUrl;  

/*  
   IMPORTANT:  
   The current resources table uses folder_path.  
   Do NOT send name, category, url or storage_path.  
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
    type,  

  file_url:  
    url,  

  folder_path:  
    filename,  

  resource_category:  
    category  
};  

const result =  
  await d  
    .from(TABLE)  
    .insert(payload);  

if (result.error) {  

  try {  

    await d.storage  
      .from(BUCKET)  
      .remove([  
        filename  
      ]);  

  } catch (_) {}  

  throw result.error;  
}  

if (status) {  
  status.textContent =  
    " Upload successful.";  
}  

showMessage(  
  "Resource uploaded successfully.",  
  "success"  
);  

$("uploadForm")?.reset();  

updateClassLevels();  

updateDigitalBookFields();  

await loadResources();

} catch (err) {

console.error(  
  "AGULIBRARY upload error:",  
  err  
);  

if (status) {  

  status.textContent =  
    " " +  
    (  
      err.message ||  
      "Upload failed."  
    );  
}  

showMessage(  
  err.message ||  
  "Upload failed.",  
  "error"  
);

} finally {

button.disabled = false;

}
}

/* ---------------- NOTIFICATIONS ---------------- */

async function insertNotification(
d,
recipientId,
title,
message
) {

const variants = [

{  
  student_id:  
    recipientId,  
  title,  
  message,  
  is_read: false  
},  

{  
  user_id:  
    recipientId,  
  title,  
  message,  
  is_read: false  
},  

{  
  recipient_id:  
    recipientId,  
  title,  
  message,  
  is_read: false  
},  

{  
  student_id:  
    recipientId,  
  message,  
  is_read: false  
},  

{  
  user_id:  
    recipientId,  
  message,  
  is_read: false  
}

];

let last = null;

for (
const payload of variants
) {

const r =  
  await d  
    .from(  
      "student_notifications"  
    )  
    .insert(  
      payload  
    );  

if (!r.error) {  
  return true;  
}  

last =  
  r.error;  

const m =  
  (  
    r.error.message ||  
    ""  
  ).toLowerCase();  

if (  
  !(  
    m.includes("column") ||  
    m.includes("schema cache") ||  
    m.includes("could not find")  
  )  
) {  
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

/*

AGULIBRARY ANDROID / WEB PUSH

Sends the already-created notification to the student's
registered Android/browser push subscriptions.

IMPORTANT:
The VAPID private key and Supabase service-role key are
NEVER placed in this admin.js file.
They remain inside the secure Supabase Edge Function.

*/

async function sendPushNotification(
recipientId,
title,
message
) {

try {

const baseUrl =  
  String(  
    cfg.supabaseUrl ||  
    window.AGU_CONFIG?.supabaseUrl ||  
    ""  
  ).replace(  
    /\/$/,  
    ""  
  );  

if (!baseUrl) {  

  console.warn(  
    "Push notification skipped: Supabase URL unavailable."  
  );  

  return {  
    sent: false,  
    skipped: true,  
    reason:  
      "Supabase URL unavailable"  
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

const sessionResult =  
  await getDB()  
    .auth  
    .getSession();  

if (sessionResult.error) {  
  throw sessionResult.error;  
}  

const accessToken =  
  sessionResult.data?.session  
    ?.access_token;  

if (!accessToken) {  

  throw new Error(  
    "Administrator authentication token is unavailable."  
  );  
}  

const response =  
  await fetch(  
    baseUrl +  
    "/functions/v1/" +  
    functionName,  
    {  

      method:  
        "POST",  

      headers: {  

        "Content-Type":  
          "application/json",  

        "Authorization":  
          "Bearer " +  
          accessToken,  

        "apikey":  
          cfg.supabaseAnonKey ||  
          ""  
      },  

      body:  
        JSON.stringify({  

          recipient_id:  
            recipientId,  

          title:  
            title,  

          message:  
            message,  

          url:  
            "/index.html"  
        })  
    }  
  );  

let data = {};  

try {  

  data =  
    await response.json();  

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

const d =
getDB();

const target =
$("aguNotifyTarget")?.value ||
"all";

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
          target.replace(  
            "student:",  
            ""  
          )  
      );  

if (!recipients.length) {  

  throw new Error(  
    "No student recipient was found."  
  );  
}  

let sent = 0;  
let pushSent = 0;  
let pushUnavailable = 0;  

for (  
  const p of recipients  
) {  

  const id =  
    getId(p);  

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
    (  
      e.message ||  
      "Notification could not be sent."  
    );  
}

}
}

async function loadNotificationCount() {

try {

const r =  
  await getDB()  
    .from(  
      "student_notifications"  
    )  
    .select(  
      "*",  
      {  
        count:  
          "exact",  
        head:  
          true  
      }  
    );  

if (  
  !r.error &&  
  $("aguNotificationCount")  
) {  

  $("aguNotificationCount")  
    .textContent =  
      r.count ?? 0;  
}

} catch (_) {}
}

/* ---------------- EXAMINATION HIERARCHY ---------------- */
const ADMIN_EXAM_HIERARCHY={
  "Early Years":{"School Assessment":["Term Assessment","Progress Assessment","Final Assessment"],"International Early Years":["Early Years Assessment","International Progress Assessment"],"Other":["General Assessment"]},
  "Primary School":{"School Examination":["First Term Examination","Second Term Examination","Third Term Examination","Mock Examination","Final Examination"],"Common Entrance":["Common Entrance Examination","Common Entrance Mock Examination"],"Primary Leaving Examination":["Primary Leaving Examination","Primary Leaving Mock Examination"],"International Primary":["Primary Progress Test","International Primary Examination"],"Other":["General Assessment"]},
  "Junior Secondary School":{"BECE":["Basic Education Certificate Examination","BECE Mock Examination"],"School Examination":["First Term Examination","Second Term Examination","Third Term Examination","Mock Examination","Final Examination"],"Cambridge Lower Secondary":["Checkpoint Examination","Lower Secondary Assessment"],"International Examination":["International Lower Secondary Examination","Mock Examination"],"Other":["General Assessment"]},
  "Senior Secondary School":{"WAEC":["SSCE","GCE","Mock Examination"],"NECO":["SSCE","GCE","BECE","Mock Examination"],"NABTEB":["NBC/NTC","ANBC/ANTC","GCE","Mock Examination"],"Cambridge":["IGCSE","O Level","AS Level","A Level"],"School Examination":["First Term Examination","Second Term Examination","Third Term Examination","Mock Examination","Final Examination"],"International Examination":["International Secondary Examination","Mock Examination"],"Other":["General Examination"]},
  "Tertiary / University":{"University":["Semester Examination","Mid-Semester Test","Final Examination","Entrance Examination","Mock Examination"],"Polytechnic":["Semester Examination","Mid-Semester Test","Final Examination","Entrance Examination"],"College":["Semester Examination","Mid-Semester Test","Final Examination","Entrance Examination"],"Professional Examination":["Professional Certification Examination","Licensing Examination","Entrance Examination"],"Other":["General Examination"]},
  "Professional / Career":{"Professional Certification":["Certification Examination","Mock Examination"],"Licensing Board":["Licensing Examination","Renewal Examination","Mock Examination"],"Entrance Examination":["Entrance Examination","Aptitude Test","Mock Examination"],"Career Assessment":["Career Assessment","Professional Aptitude Test"],"Other":["General Assessment"]}
};
const ADMIN_EXAM_CLASSES={"Early Years":["Early Years 1","Early Years 2","Early Years 3"],"Primary School":["Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","Primary 6"],"Junior Secondary School":["JSS 1","JSS 2","JSS 3"],"Senior Secondary School":["SSS 1","SSS 2","SSS 3"],"Tertiary / University":["100 Level","200 Level","300 Level","400 Level","500 Level","Postgraduate"],"Professional / Career":[]};
     
/* =========================================================
AGULIBRARY — EXAMINATION REGISTRATION PRICE HIERARCHY

PRICE IS BASED ON:

Education Level
→ Examination Board / Organization
→ Examination Type
→ Class / Level
→ Country
→ Registration Price

IMPORTANT:
Subject is NOT part of examination registration pricing.

Individual examinations/subjects do NOT determine the
registration price.

Example:

Senior Secondary School
→ WAEC
→ SSCE
→ SSS 1
→ Nigeria
→ ₦5,000

The student may select 1 subject or 9 subjects.
The registration price remains ₦5,000.
========================================================= */

function setupExamPriceHierarchy() {

  const education =
    $("examPriceEducationLevel");

  const board =
    $("examPriceBoard");

  const type =
    $("examPriceType");

  const classLevel =
    $("examPriceClassLevel");

  if (!education) return;


  function fillSelect(
    select,
    items,
    placeholder
  ) {

    if (!select) return;

    const values = [
      ...new Set(
        (items || [])
          .filter(Boolean)
          .map(x => String(x).trim())
          .filter(Boolean)
      )
    ];

    select.innerHTML =
      `<option value="">${esc(placeholder)}</option>` +
      values
        .map(
          value =>
            `<option value="${esc(value)}">${esc(value)}</option>`
        )
        .join("");

    select.disabled = false;
  }


  /* -------------------------------------------------------
     EDUCATION LEVEL → BOARD
  ------------------------------------------------------- */

  function updateBoards() {

    const level =
      education.value || "";

    const boards =
      Object.keys(
        ADMIN_EXAM_HIERARCHY[level] || {}
      );

    fillSelect(
      board,
      boards,
      "Select examination board / organization"
    );

    fillSelect(
      type,
      [],
      "Select examination board / organization"
    );

    fillSelect(
      classLevel,
      ADMIN_EXAM_CLASSES[level] || [],
      "Select class / level"
    );

    if (type) {
      type.disabled = true;
    }

    if (classLevel) {
      classLevel.disabled =
        !(ADMIN_EXAM_CLASSES[level] || []).length;
    }
  }


  /* -------------------------------------------------------
     BOARD → EXAM TYPE
  ------------------------------------------------------- */

  function updateTypes() {

    const level =
      education.value || "";

    const selectedBoard =
      board?.value || "";

    const types =
      selectedBoard
        ? (
            ADMIN_EXAM_HIERARCHY[level]?.[
              selectedBoard
            ] || []
          )
        : [];

    fillSelect(
      type,
      types,
      "Select examination type"
    );

    if (type) {
      type.disabled =
        !selectedBoard ||
        !types.length;
    }
  }


  /* -------------------------------------------------------
     EVENTS
  ------------------------------------------------------- */

  if (
    !education.dataset.aguPriceHierarchyBound
  ) {

    education.addEventListener(
      "change",
      () => {

        updateBoards();

      }
    );


    board?.addEventListener(
      "change",
      () => {

        updateTypes();

      }
    );


    education.dataset.aguPriceHierarchyBound =
      "true";
  }


  /* -------------------------------------------------------
     INITIAL STATE
  ------------------------------------------------------- */

  updateBoards();

}    

function adminExamSetOptions(id,items,placeholder,disabled=false,value=""){
  const el=$(id);if(!el)return;
  const unique=[...new Set(items.filter(Boolean).map(x=>String(x).trim()))];
  el.innerHTML=`<option value="">${esc(placeholder)}</option>`+unique.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");
  el.disabled=disabled||!unique.length;
  if(value&&unique.includes(value))el.value=value;
}
function setupAdminExamHierarchy(){
  const level=$("examEducationLevel"),board=$("examBoard"),type=$("examType"),cls=$("examClassLevel");
  if(!level)return;
  const refreshBoards=()=>{
    const v=level.value;adminExamSetOptions("examBoard",Object.keys(ADMIN_EXAM_HIERARCHY[v]||{}),"Select examination board / organization",!v,board?.value||"");
    adminExamSetOptions("examType",v&&board?.value?(ADMIN_EXAM_HIERARCHY[v]?.[board.value]||[]):[],"Select examination type",!board?.value,type?.value||"");
    adminExamSetOptions("examClassLevel",ADMIN_EXAM_CLASSES[v]||[],"Select class / level",!v,cls?.value||"");
  };
  if(!level.dataset.aguHierarchyBound){
    level.addEventListener("change",()=>{adminExamSetOptions("examBoard",Object.keys(ADMIN_EXAM_HIERARCHY[level.value]||{}),"Select examination board / organization",!level.value);adminExamSetOptions("examType",[],"Select examination type",true);adminExamSetOptions("examClassLevel",ADMIN_EXAM_CLASSES[level.value]||[],"Select class / level",!level.value);});
    board?.addEventListener("change",()=>adminExamSetOptions("examType",ADMIN_EXAM_HIERARCHY[level.value]?.[board.value]||[],"Select examination type",!board.value));
    level.dataset.aguHierarchyBound="true";
  }
  refreshBoards();
}
function clearExamForm(){
  $("examEditId") && ($("examEditId").value="");
  ["examTitle","examSubject","examEducationLevel","examTerm","examDescription"].forEach(id=>{if($(id))$(id).value="";});
  adminExamSetOptions("examBoard",[],"Select education level first",true);
  adminExamSetOptions("examType",[],"Select examination board first",true);
  adminExamSetOptions("examClassLevel",[],"Select education level first",true);
  $("examPassPercentage") && ($("examPassPercentage").value="");
  $("examRegistrationRequired") && ($("examRegistrationRequired").value="true");
  $("examPublished") && ($("examPublished").value="false");
  $("saveExam") && ($("saveExam").textContent="➕ Create Examination");
  if($("examFormStatus"))$("examFormStatus").textContent="";
}

/* ---------------- CREATE / SAVE EXAMINATION ---------------- */

/* ---------------- POPULATE EXAMINATION SELECTS ---------------- */

function populateExamSelects() {

  /* -------------------------------------------------------
     QUESTION MANAGEMENT

     Question Manager still works with individual
     examinations because questions belong to a specific
     examination.
  ------------------------------------------------------- */

  const questionSelect =
    $("adminQuestionExamSelect");

  if (questionSelect) {

    const currentValue =
      questionSelect.value;

    questionSelect.innerHTML =
      '<option value="">Select an examination</option>' +

      examinations
        .map(exam => `
          <option value="${esc(exam.id)}">
            ${esc(
              exam.title ||
              "Untitled Examination"
            )}
          </option>
        `)
        .join("");

    if (
      currentValue &&
      examinations.some(
        exam =>
          String(exam.id) ===
          String(currentValue)
      )
    ) {

      questionSelect.value =
        currentValue;

    }

  }

  /* -------------------------------------------------------
     EXAMINATION REGISTRATIONS

     Registration filter is also based on
     EXAMINATION TYPE, not examination title.
  ------------------------------------------------------- */

  const registrationSelect =
    $("registrationExamFilter");

  if (registrationSelect) {

    const currentType =
      registrationSelect.value;


    const registrationTypes = [
      ...new Set(

        examinations
          .map(
            exam =>
              String(
                exam.examination_type ||
                ""
              ).trim()
          )
          .filter(Boolean)

      )
    ].sort(
      (a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            sensitivity: "base"
          }
        )
    );


    registrationSelect.innerHTML =
      '<option value="">All examination types</option>' +

      registrationTypes
        .map(
          type =>
            `<option value="${esc(type)}">
              ${esc(type)}
            </option>`
        )
        .join("");


    if (
      currentType &&
      registrationTypes.includes(
        currentType
      )
    ) {

      registrationSelect.value =
        currentType;

    }

  }

}

async function loadRegistrations() {

  const list =
    $("adminRegistrationList");

  if (!list) return;

  list.innerHTML =
    '<div class="empty">Loading registrations...</div>';

  try {

    /* -------------------------------------------------------
       LOAD REGISTRATIONS
    ------------------------------------------------------- */

    let query =
      getDB()
        .from("agu_exam_registrations")
        .select("*")
        .order(
          "registered_at",
          {
            ascending: false
          }
        );


    const examinationType =
      $("registrationExamFilter")?.value ||
      "";

    const status =
      $("registrationStatusFilter")?.value ||
      "";


    /* -------------------------------------------------------
       STATUS FILTER
    ------------------------------------------------------- */

    if (status) {

      query =
        query.eq(
          "status",
          status
        );

    }


    const result =
      await query;

    if (result.error) {
      throw result.error;
    }


    let rows =
      Array.isArray(result.data)
        ? result.data
        : [];


    /* -------------------------------------------------------
       EXAMINATION TYPE FILTER
       
       Find examinations belonging to the selected
       examination type, then keep registrations for
       those examinations.
    ------------------------------------------------------- */

    if (examinationType) {

      const matchingExamIds =
        examinations
          .filter(
            exam =>
              String(
                exam.examination_type ||
                ""
              ).trim() ===
              String(
                examinationType
              ).trim()
          )
          .map(
            exam =>
              String(exam.id)
          );


      rows =
        rows.filter(
          registration =>
            matchingExamIds.includes(
              String(
                registration.examination_id
              )
            )
        );

    }


    examRegistrations =
      rows;


    renderRegistrations();


  } catch (error) {

    console.error(
      "AGULIBRARY registration loading error:",
      error
    );

    list.innerHTML =
      `<div class="empty">
        ❌ Unable to load registrations.<br>
        <small>${esc(
          error.message ||
          "Database error"
        )}</small>
      </div>`;

  }

}

function renderRegistrations() {

const list =
$("adminRegistrationList");

if (!list) return;

if (!examRegistrations.length) {

list.innerHTML =  
  '<div class="empty">No examination registrations found.</div>';  

return;

}

list.innerHTML =
examRegistrations
.map(registration => {

const student =  
      students.find(  
        p =>  
          String(getId(p)) ===  
          String(registration.student_id)  
      );  

    const exam =  
      examinations.find(  
        e =>  
          String(e.id) ===  
          String(registration.examination_id)  
      );  

    const studentName =  
      student  
        ? profileName(student)  
        : "Student";  

    const studentEmail =  
      student  
        ? profileEmail(student)  
        : "";  

    const examName =  
      exam  
        ? exam.title  
        : "Examination";  

    const state =  
      registration.status ||  
      "registered";  

    const badgeClass =  
      state === "approved"  
        ? ""  
        : state === "rejected"  
          ? "badge off"  
          : "badge blue";  

    return `  
      <div class="exam-row">  

        <h3>  
          ${esc(examName)}  
        </h3>  

        <div class="small">  

          <strong>  
            ${esc(studentName)}  
          </strong>  

          ${  
            studentEmail  
              ? " • " +  
                esc(studentEmail)  
              : ""  
          }  

        </div>  

        <div class="exam-meta">  

          <span class="${badgeClass}">  
            ${esc(  
              state.toUpperCase()  
            )}  
          </span>  

          <span>  
            Registered:  
            ${  
              registration.registered_at  
                ? esc(  
                    new Date(  
                      registration.registered_at  
                    ).toLocaleString()  
                  )  
                : "—"  
            }  
          </span>  

          ${  
            registration.approved_at  
              ? `  
                <span>  
                  Approved:  
                  ${esc(  
                    new Date(  
                      registration.approved_at  
                    ).toLocaleString()  
                  )}  
                </span>  
              `  
              : ""  
          }  

        </div>  

        <div class="small">  

          Student ID:  
          ${esc(  
            registration.student_id ||  
            "—"  
          )}  

        </div>  

        <div class="actions">  

          <button  
            class="btn primary agu-registration-status"  
            data-id="${esc(registration.id)}"  
            data-status="approved"  
            type="button"  
          >  
            ✓ Approve  
          </button>  

          <button  
            class="btn danger agu-registration-status"  
            data-id="${esc(registration.id)}"  
            data-status="rejected"  
            type="button"  
          >  
            ✕ Reject  
          </button>  

          ${  
            state !== "registered"  
              ? `  
                <button  
                  class="btn light agu-registration-status"  
                  data-id="${esc(registration.id)}"  
                  data-status="registered"  
                  type="button"  
                >  
                  ↺ Set Registered  
                </button>  
              `  
              : ""  
          }  

        </div>  

      </div>  
    `;  

  })  
  .join("");

list
.querySelectorAll(
".agu-registration-status"
)
.forEach(button => {

button.onclick = () => {  

    updateRegistrationStatus(  
      button.dataset.id,  
      button.dataset.status  
    );  

  };  

});

}
async function updateRegistrationStatus(id, status) {

try {

const verified =  
  await adminMfaGate();  

if (!verified) return;  

const payload = {  

  status:  
    status,  

  approved_at:  
    status === "approved"  
      ? new Date().toISOString()  
      : null  

};  

const result =  
  await getDB()  
    .from("agu_exam_registrations")  
    .update(payload)  
    .eq(  
      "id",  
      id  
    );  

if (result.error) {  
  throw result.error;  
}  

showMessage(  
  `Registration ${status}.`,  
  "success"  
);  

await loadRegistrations();

} catch (error) {

console.error(  
  "AGULIBRARY registration status update error:",  
  error  
);  

showMessage(  
  error.message ||  
  "Unable to update registration.",  
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
    .from(  
      "agu_examinations"  
    )  
    .select("*")  
    .order(  
      "created_at",  
      {  
        ascending: false  
      }  
    );  

if (result.error) {  
  throw result.error;  
}  

examinations =  
  result.data || [];

/*  
 * ------------------------------------------------------  
 * POPULATE EXAMINATION SELECT MENUS  
 * ------------------------------------------------------  
 */  

populateExamSelects();  

if (!examinations.length) {  

  list.innerHTML =  
    '<div class="empty">No examinations created yet.</div>';  

  return;  
}  

list.innerHTML =
  examinations
    .map(exam => {

      const published =
        exam.is_published === true;

      const registration =
        exam.registration_required !== false;

      return `
        <div class="exam-card">

          <div class="exam-card-title">
            ${esc(exam.title || "Untitled Examination")}
          </div>

          <div class="exam-card-info">
            <strong>Subject:</strong>
            ${esc(exam.subject || "—")}
          </div>

          <div class="exam-card-info">
            <strong>Education Level:</strong>
            ${esc(exam.education_level || "—")}
          </div>

          <div class="exam-card-info">
            <strong>Class / Level:</strong>
            ${esc(exam.class_level || "—")}
          </div>

          <div class="exam-card-info">
            <strong>Term:</strong>
            ${esc(exam.term || "—")}
          </div>

          <div class="exam-card-info">
            <strong>Pass Percentage:</strong>
            ${exam.pass_percentage ?? 0}%
          </div>

          <div class="exam-card-info">
            <strong>Registration:</strong>
            ${
              registration
                ? "Required"
                : "Not Required"
            }
          </div>

          <div class="exam-card-info">
            <strong>Status:</strong>
            ${
              published
                ? "Published"
                : "Draft"
            }
          </div>


          ${
            published
              ? `
                <div
                  class="actions"
                  style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-top:15px;
                  "
                >

                  <button
                    class="btn danger agu-delete-examination"
                    data-id="${esc(exam.id)}"
                    data-title="${esc(exam.title || "Untitled Examination")}"
                    type="button"
                  >
                    🗑 Delete Published Examination
                  </button>

                </div>
              `
              : ""
          }

        </div>
      `;

    })
    .join("");


/* ---------------- DELETE PUBLISHED EXAMINATION ---------------- */

list
  .querySelectorAll(".agu-delete-examination")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        deleteExamination(
          button.dataset.id,
          button.dataset.title
        );

      }
    );

  });

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

/* ---------------- DELETE PUBLISHED EXAMINATION ---------------- */

async function deleteExamination(id, title) {

  if (!id) {
    showMessage(
      "Examination ID is missing.",
      "error"
    );
    return;
  }


  const confirmed =
    confirm(
      `Delete "${title || "this examination"}"?\n\n` +
      `This will permanently delete the published examination.\n\n` +
      `This action cannot be undone.`
    );

  if (!confirmed) {
    return;
  }


  try {

    /* -----------------------------------------
       REQUIRE ADMIN MFA
    ----------------------------------------- */

    const verified =
      await adminMfaGate();

    if (!verified) {
      return;
    }


    showMessage(
      `Deleting "${title || "examination"}"...`,
      "success"
    );


    /* -----------------------------------------
       DELETE EXAMINATION
    ----------------------------------------- */

    const result =
      await getDB()
        .from("agu_examinations")
        .delete()
        .eq(
          "id",
          id
        );


    if (result.error) {
      throw result.error;
    }


    /* -----------------------------------------
       SUCCESS
    ----------------------------------------- */

    showMessage(
      `"${title || "Examination"}" deleted successfully.`,
      "success"
    );


    /* -----------------------------------------
       RELOAD EXAMINATION LIST
    ----------------------------------------- */

    await loadExaminations();


  } catch (error) {

    console.error(
      "AGULIBRARY published examination deletion error:",
      error
    );


    showMessage(
      error.message ||
      "Unable to delete the published examination.",
      "error"
    );

  }
}
    
/* ---------------- LOAD QUESTIONS FOR SELECTED EXAM ---------------- */

async function loadQuestionsForSelectedExam() {

const list =
$("adminQuestionList");

const examinationId =
$("adminQuestionExamSelect")?.value?.trim() || "";

if (!list) {

console.warn(  
  "AGULIBRARY: adminQuestionList was not found."  
);  

return;

}

if (!examinationId) {

list.innerHTML =  
  '<div class="empty">Select an examination to manage its questions.</div>';  

return;

}

list.innerHTML =
'<div class="empty">Loading questions...</div>';

try {

const result =  
  await getDB()  
    .from("agu_exam_questions")  
    .select(  
      "id, examination_id, question_number, question_text, options, correct_option, marks"  
    )  
    .eq(  
      "examination_id",  
      examinationId  
    )  
    .order(  
      "question_number",  
      {  
        ascending: true  
      }  
    );  

if (result.error) {  
  throw result.error;  
}  

const questions =  
  result.data || [];  

console.log(  
  "AGULIBRARY questions loaded:",  
  questions  
);  

if (!questions.length) {  

  list.innerHTML =  
    '<div class="empty">No questions have been added to this examination yet.</div>';  

  return;  
}  

list.innerHTML =  
  questions.map(question => {  

    let options =  
      question.options;  

    /*  
     * Supabase JSONB normally returns an array,  
     * but this also safely handles JSON stored as text.  
     */  

    if (typeof options === "string") {  

      try {  
        options =  
          JSON.parse(options);  
      } catch (_) {  
        options = [];  
      }  
    }  

    /*  
     * Also handle an object such as:  
     * { A: "...", B: "...", C: "...", D: "...", E: "..." }  
     */  

    if (  
      options &&  
      !Array.isArray(options) &&  
      typeof options === "object"  
    ) {  

      options = [  

        options.A ?? "",  
        options.B ?? "",  
        options.C ?? "",  
        options.D ?? "",  
        options.E ?? ""  

      ];  
    }  

    if (!Array.isArray(options)) {  
      options = [];  
    }  

    const letters = [  
      "A",  
      "B",  
      "C",  
      "D",  
      "E"  
    ];  

    const optionsHTML =  
      letters.map((letter, index) => {  

        const option =  
          options[index] ?? "";  

        const isCorrect =  
          String(  
            question.correct_option || ""  
          )  
            .trim()  
            .toUpperCase() ===  
          letter;  

        return `  
          <div  
            class="question-option ${isCorrect ? "correct" : ""}"  
          >  
            <strong>${letter}.</strong>  
            ${option}  
            ${isCorrect ? " ✅" : ""}  
          </div>  
        `;  

      }).join("");  

    return `  
      <div  
        class="question-row"  
        data-question-id="${question.id}"  
      >  

        <h3>  
          Question ${question.question_number ?? ""}  
          <span class="badge blue">  
            ${question.marks ?? 0}  
            ${  
              Number(question.marks) === 1  
                ? "mark"  
                : "marks"  
            }  
          </span>  
        </h3>  

        <div style="margin-top:8px">  
          ${question.question_text || ""}  
        </div>  

        <div  
          class="question-options"  
          style="margin-top:12px"  
        >  
          ${optionsHTML}  
        </div>  

        <div  
          class="small"  
          style="margin-top:10px"  
        >  
          Marks:  
          ${question.marks ?? 0}  
          • Correct option:  
          ${question.correct_option || "—"}  
        </div>  

        <div  
          class="actions"  
          style="  
            display:flex;  
            gap:8px;  
            margin-top:12px;  
            flex-wrap:wrap;  
          "  
        >  

          <button  
            class="btn light agu-edit-question"  
            data-id="${question.id}"  
            type="button"  
          >  
            ✏ Edit  
          </button>  

          <button  
            class="btn danger agu-delete-question"  
            data-id="${question.id}"  
            type="button"  
          >  
            🗑 Delete  
          </button>  

        </div>  

      </div>  
    `;  

  }).join("");  

/*  
 * ---------------- EDIT BUTTONS ----------------  
 */  

list  
  .querySelectorAll(".agu-edit-question")  
  .forEach(button => {  

    button.addEventListener(  
      "click",  
      () => {  

        const question =  
          questions.find(  
            item =>  
              String(item.id) ===  
              String(button.dataset.id)  
          );  

        if (!question) return;  

        $("questionEditId").value =  
          question.id || "";  

        $("questionPosition").value =  
          question.question_number ?? "";  

        $("questionMarks").value =  
          question.marks ?? 1;  

        $("questionText").value =  
          question.question_text || "";  

        let options =  
          question.options;  

        if (typeof options === "string") {  

          try {  
            options =  
              JSON.parse(options);  
          } catch (_) {  
            options = [];  
          }  
        }  

        if (  
          options &&  
          !Array.isArray(options) &&  
          typeof options === "object"  
        ) {  

          options = [  

            options.A ?? "",  
            options.B ?? "",  
            options.C ?? "",  
            options.D ?? "",  
            options.E ?? ""  

          ];  
        }  

        if (!Array.isArray(options)) {  
          options = [];  
        }  

        [  
          "optionA",  
          "optionB",  
          "optionC",  
          "optionD",  
          "optionE"  
        ].forEach(  
          (id, index) => {  

            const input =  
              $(id);  

            if (input) {  

              input.value =  
                options[index] ?? "";  
            }  

          }  
        );  

        $("correctOption").value =  
          question.correct_option || "A";  

        const saveButton =  
          $("saveQuestion");  

        if (saveButton) {  

          saveButton.textContent =  
            "💾 Save Question Changes";  
        }  

        if ($("questionFormStatus")) {  

          $("questionFormStatus").textContent =  
            "Editing question " +  
            (question.question_number ?? "") +  
            ".";  
        }  

        const questionTextInput =  
          $("questionText");  

        if (questionTextInput) {  

          questionTextInput.scrollIntoView({  
            behavior: "smooth",  
            block: "center"  
          });  
        }  

      }  
    );  

  });  

/*  
 * ---------------- DELETE BUTTONS ----------------  
 */  

list  
  .querySelectorAll(".agu-delete-question")  
  .forEach(button => {  

    button.addEventListener(  
      "click",  
      async () => {  

        const confirmed =  
          confirm(  
            "Are you sure you want to delete this question?"  
          );  

        if (!confirmed) return;  

        try {  

          const verified =  
            await adminMfaGate();  

          if (!verified) return;  

          const deleteResult =  
            await getDB()  
              .from("agu_exam_questions")  
              .delete()  
              .eq(  
                "id",  
                button.dataset.id  
              );  

          if (deleteResult.error) {  
            throw deleteResult.error;  
          }  

          showMessage(  
            "Question deleted successfully.",  
            "success"  
          );  

          await loadQuestionsForSelectedExam();  

        } catch (error) {  

          console.error(  
            "AGULIBRARY question deletion error:",  
            error  
          );  

          showMessage(  
            error.message ||  
            "Unable to delete question.",  
            "error"  
          );  
        }  

      }  
    );  

  });

} catch (error) {

console.error(  
  "AGULIBRARY question loading error:",  
  error  
);  

list.innerHTML =  
  `<div class="empty">  
    ❌ ${  
      error.message ||  
      "Unable to load questions."  
    }  
  </div>`;

}
}

/* ---------------- SAVE EXAMINATION QUESTION ---------------- */

async function saveQuestion() {

const status =
$("questionFormStatus");

try {

const verified =  
  await adminMfaGate();  

if (!verified) return;  

const examinationId =
  $("adminQuestionExamSelect")?.value || "";
const id =  
  $("questionEditId")?.value.trim() || "";  

const questionNumber =  
  Number(  
    $("questionPosition")?.value  
  );  

const marks =  
  Number(  
    $("questionMarks")?.value  
  );  

const questionText =  
  $("questionText")?.value.trim() || "";  

const options = [  

  $("optionA")?.value.trim() || "",  
  $("optionB")?.value.trim() || "",  
  $("optionC")?.value.trim() || "",  
  $("optionD")?.value.trim() || "",  
  $("optionE")?.value.trim() || ""  

];  

const correct =  
  $("correctOption")?.value || "A";  

if (!examinationId) {  

  throw new Error(  
    "Select an examination first."  
  );  
}  

if (  
  !Number.isInteger(questionNumber) ||  
  questionNumber < 1  
) {  

  throw new Error(  
    "Question position must be a whole number starting from 1."  
  );  
}  

if (  
  !Number.isFinite(marks) ||  
  marks < 0  
) {  

  throw new Error(  
    "Marks must be zero or greater."  
  );  
}  

if (!questionText) {  

  throw new Error(  
    "Enter the question text."  
  );  
}  

if (options.some(option => !option)) {  

  throw new Error(  
    "All five answer options A–E are required."  
  );  
}  

const payload = {  

  examination_id:  
    examinationId,  

  question_number:  
    questionNumber,  

  question_text:  
    questionText,  

  options:  
    options,  

  correct_option:  
    correct,  

  marks:  
    marks  
};  

let result;  

if (id) {  

  result =  
    await getDB()  
      .from("agu_exam_questions")  
      .update(payload)  
      .eq(  
        "id",  
        id  
      );  

} else {  

  result =  
    await getDB()  
      .from("agu_exam_questions")  
      .insert(payload);  
}  

if (result.error) {  
  throw result.error;  
}  

if (status) {  

  status.textContent =  
    id  
      ? "✅ Question updated successfully."  
      : "✅ Question saved successfully.";  
}  

showMessage(  
  id  
    ? "Question updated successfully."  
    : "Question saved successfully.",  
  "success"  
);  

/*  
 * IMPORTANT:  
 * Reload the question list after saving so the  
 * newly saved/updated question remains visible.  
 */  
await loadQuestionsForSelectedExam();

} catch (error) {

console.error(  
  "AGULIBRARY question save error:",  
  error  
);  

if (status) {  

  status.textContent =  
    "❌ " +  
    (  
      error.message ||  
      "Unable to save question."  
    );  
}  

showMessage(  
  error.message ||  
  "Unable to save question.",  
  "error"  
);

}
}
/* =========================================================
AGULIBRARY — EXAMINATION GLOBAL SETTINGS
Uses the actual agu_exam_settings database columns.
========================================================= */

async function loadExamSettings() {

const status =
$("examSettingsStatus");

try {

const result =  
  await getDB()  
    .from("agu_exam_settings")  
    .select(`  
      id,  
      examination_enabled,  
      registration_enabled,  
      payment_enabled,  
      payment_required,  
      default_question_duration_seconds,  
      important_notice  
    `)  
    .eq("id", true)  
    .maybeSingle();  

if (result.error) {  
  throw result.error;  
}  

const settings =  
  result.data;  

if (!settings) {  

  if (status) {  
    status.textContent =  
      "❌ Examination settings record was not found.";  
  }  

  return;  
}  

if ($("examEnabled")) {  
  $("examEnabled").value =  
    String(!!settings.examination_enabled);  
}  

if ($("examRegistrationEnabled")) {  
  $("examRegistrationEnabled").value =  
    String(!!settings.registration_enabled);  
}  

if ($("examDefaultPass")) {  
  $("examDefaultPass").value =  
    Number(  
      settings.default_pass_percentage ?? 50  
    );  
}  

if ($("examQuestionSeconds")) {  
  $("examQuestionSeconds").value =  
    "5 seconds";  
}  

if (status) {  
  status.textContent =  
    "Current examination settings loaded.";  
}

} catch (error) {

console.error(  
  "AGULIBRARY examination settings load error:",  
  error  
);  

if (status) {  
  status.textContent =  
    "❌ " +  
    (  
      error.message ||  
      "Unable to load examination settings."  
    );  
}

}
}

async function saveExamSettings() {

const status =
$("examSettingsStatus");

try {

const verified =  
  await adminMfaGate();  

if (!verified) {  
  return;  
}  

const examinationEnabled =  
  $("examEnabled")?.value === "true";  

const registrationEnabled =  
  $("examRegistrationEnabled")?.value === "true";  

const payload = {  

  examination_enabled:  
    examinationEnabled,  

  registration_enabled:  
    registrationEnabled,  

  default_question_duration_seconds:  
    5,  

  updated_at:  
    new Date().toISOString()  
};  

const result =  
  await getDB()  
    .from("agu_exam_settings")  
    .update(payload)  
    .eq("id", true);  

if (result.error) {  
  throw result.error;  
}  

if (status) {  
  status.textContent =  
    "✅ Examination settings saved successfully.";  
}  

showMessage(  
  "Examination settings saved successfully.",  
  "success"  
);  

await loadExamSettings();

} catch (error) {

console.error(  
  "AGULIBRARY examination settings save error:",  
  error  
);  

if (status) {  
  status.textContent =  
    "❌ " +  
    (  
      error.message ||  
      "Unable to save examination settings."  
    );  
}  

showMessage(  
  error.message ||  
  "Unable to save examination settings.",  
  "error"  
);

}
}
async function saveExam() {

const status =
$("examFormStatus");

try {

const verified =  
  await adminMfaGate();  

if (!verified) return;  

const id =  
  $("examEditId")?.value.trim() ||  
  "";  

const title =  
  $("examTitle")?.value.trim() ||  
  "";  

const subject =  
  $("examSubject")?.value.trim() ||  
  "";  

const educationLevel =  
  $("examEducationLevel")?.value.trim() ||  
  "";  

const classLevel =  
  $("examClassLevel")?.value.trim() ||  
  "";

const examinationBoard =
  $("examBoard")?.value.trim() ||
  "";

const examinationType =
  $("examType")?.value.trim() ||
  "";  

const term =  
  $("examTerm")?.value.trim() ||  
  "";  

const description =  
  $("examDescription")?.value.trim() ||  
  null;  

const pass =  
  Number(  
    $("examPassPercentage")?.value  
  );  

if (  
  !title ||  
  !subject ||  
  !educationLevel ||  
  !classLevel ||  
  !examinationBoard ||
  !examinationType ||
  !term  
) {  

  throw new Error(  
    "Title, subject, education level, examination board, examination type, class / level and term are required."  
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


  examination_board:
    examinationBoard,

  examination_type:
    examinationType,  

  class_level:  
    classLevel,  

  term:  
    term,  

  pass_percentage:  
    pass,  

  registration_required:  
    $("examRegistrationRequired")?.value ===  
    "true",  

  is_published:  
    $("examPublished")?.value ===  
    "true"  
};  

let result;  

if (id) {  

  result =  
    await getDB()  
      .from(  
        "agu_examinations"  
      )  
      .update(payload)  
      .eq(  
        "id",  
        id  
      );  

} else {  

  result =  
    await getDB()  
      .from(  
        "agu_examinations"  
      )  
      .insert({  

        ...payload,  

        created_by:  
          currentSession?.user?.id ||  
          null  

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
  adminExamSetOptions("examBoard", [], "Select education level first", true);
  adminExamSetOptions("examType", [], "Select examination board first", true);
  adminExamSetOptions("examClassLevel", [], "Select education level first", true);  
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


/* =========================================================
AGULIBRARY — EXAMINATION REGISTRATION COUNTRY PRICES
The live database table uses:
  id
  country_code
  country_name
  currency_code
  amount
  is_enabled

IMPORTANT:
Do not request currency_symbol from Supabase. Some existing
AGULIBRARY installations do not have that database column.
The currency symbol is derived locally from the selected country
and displayed without requiring a currency_symbol database column.
========================================================= */

const EXAM_COUNTRY_CURRENCIES = {
  NG: { name: "Nigeria", code: "NG", currency: "NGN", symbol: "₦" },
  GH: { name: "Ghana", code: "GH", currency: "GHS", symbol: "₵" },
  KE: { name: "Kenya", code: "KE", currency: "KES", symbol: "KSh" },
  ZA: { name: "South Africa", code: "ZA", currency: "ZAR", symbol: "R" },
  US: { name: "United States", code: "US", currency: "USD", symbol: "$" },
  GB: { name: "United Kingdom", code: "GB", currency: "GBP", symbol: "£" },
  CA: { name: "Canada", code: "CA", currency: "CAD", symbol: "$" },
  AU: { name: "Australia", code: "AU", currency: "AUD", symbol: "$" },
  DE: { name: "Germany", code: "DE", currency: "EUR", symbol: "€" },
  FR: { name: "France", code: "FR", currency: "EUR", symbol: "€" },
  IT: { name: "Italy", code: "IT", currency: "EUR", symbol: "€" },
  ES: { name: "Spain", code: "ES", currency: "EUR", symbol: "€" },
  IN: { name: "India", code: "IN", currency: "INR", symbol: "₹" },
  AE: { name: "United Arab Emirates", code: "AE", currency: "AED", symbol: "د.إ" },
  SA: { name: "Saudi Arabia", code: "SA", currency: "SAR", symbol: "﷼" },
  EG: { name: "Egypt", code: "EG", currency: "EGP", symbol: "E£" },
  JP: { name: "Japan", code: "JP", currency: "JPY", symbol: "¥" },
  CN: { name: "China", code: "CN", currency: "CNY", symbol: "¥" },
  BR: { name: "Brazil", code: "BR", currency: "BRL", symbol: "R$" },
  MX: { name: "Mexico", code: "MX", currency: "MXN", symbol: "$" }
};

function examCurrencyInfo(countryCode, countryName, currencyCode) {
  const code = String(countryCode || "").trim().toUpperCase();
  if (EXAM_COUNTRY_CURRENCIES[code]) {
    return EXAM_COUNTRY_CURRENCIES[code];
  }

  const currency = String(currencyCode || "").trim().toUpperCase();
  const symbolMap = {
    NGN: "₦", GHS: "₵", KES: "KSh", ZAR: "R", USD: "$",
    GBP: "£", CAD: "$", AUD: "$", EUR: "€", INR: "₹",
    AED: "د.إ", SAR: "﷼", EGP: "E£", JPY: "¥", CNY: "¥",
    BRL: "R$", MXN: "$"
  };

  return {
    name: String(countryName || code || "Unknown country"),
    code: code,
    currency: currency,
    symbol: symbolMap[currency] || ""
  };
}

function getExamCountryInfoFromOption(option) {
  if (!option || !option.value) return null;

  const rawValue = String(option.value || "").trim();
  const rawText = String(option.textContent || "").trim();
  const dataCode = String(option.dataset?.code || "").trim().toUpperCase();
  const dataCurrency = String(option.dataset?.currency || "").trim().toUpperCase();

  // First use explicit data attributes when the HTML provides them.
  if (dataCode && EXAM_COUNTRY_CURRENCIES[dataCode]) {
    return EXAM_COUNTRY_CURRENCIES[dataCode];
  }

  // Also accept an option whose value is the ISO country code.
  const valueUpper = rawValue.toUpperCase();
  if (EXAM_COUNTRY_CURRENCIES[valueUpper]) {
    return EXAM_COUNTRY_CURRENCIES[valueUpper];
  }

  // Accept the country name as the option value or visible text.
  const countryName = rawValue || rawText;
  const foundByName = Object.values(EXAM_COUNTRY_CURRENCIES).find(
    item => String(item.name).toLowerCase() === countryName.toLowerCase()
  );

  if (foundByName) {
    return foundByName;
  }

  // Final fallback for future countries added to the HTML.
  return examCurrencyInfo(
    dataCode,
    rawValue || rawText,
    dataCurrency
  );
}

function setupExamCountrySelector() {
  const countrySelect = $("examPriceCountryName");
  const countryCode = $("examPriceCountryCode");
  const currencyCode = $("examPriceCurrencyCode");
  const currencySymbol = $("examPriceCurrencySymbol");

  if (!countrySelect) return;

  // Prevent duplicate listeners if this function is called again while editing.
  if (countrySelect.dataset.aguCurrencySelectorBound === "true") {
    const option = countrySelect.options[countrySelect.selectedIndex];
    const info = getExamCountryInfoFromOption(option);
    if (countryCode) countryCode.value = info?.code || "";
    if (currencyCode) currencyCode.value = info?.currency || "";
    if (currencySymbol) currencySymbol.value = info?.symbol || "";
    return;
  }

  const fill = () => {
    const option = countrySelect.options[countrySelect.selectedIndex];
    const info = getExamCountryInfoFromOption(option);

    if (!info) {
      if (countryCode) countryCode.value = "";
      if (currencyCode) currencyCode.value = "";
      if (currencySymbol) currencySymbol.value = "";
      return;
    }

    if (countryCode) countryCode.value = info.code || "";
    if (currencyCode) currencyCode.value = info.currency || "";
    if (currencySymbol) currencySymbol.value = info.symbol || "";
  };

  countrySelect.addEventListener("change", fill);
  countrySelect.dataset.aguCurrencySelectorBound = "true";
  fill();
}

function examPriceStatusText(enabled) {
  return enabled
    ? '<span class="badge">ON — Active</span>'
    : '<span class="badge off">OFF — Disabled</span>';
}

 async function loadExamPrices() {

  const list =
    $("adminExamPriceList");

  if (!list) return;

  list.innerHTML =
    '<div class="empty">Loading examination registration prices...</div>';

  try {

    const result =
      await getDB()
        .from("agu_exam_country_prices")
        .select(
          "id,education_level,examination_board,examination_type,class_level,country_code,country_name,currency_code,amount,is_enabled,created_at,updated_at"
        )
        .order(
          "country_name",
          {
            ascending: true
          }
        );

    if (result.error) {
      throw result.error;
    }

    const rows =
      Array.isArray(result.data)
        ? result.data
        : [];

    if (!rows.length) {

      list.innerHTML =
        '<div class="empty">No examination registration prices have been configured yet.</div>';

      return;
    }


    list.innerHTML =
      rows.map(row => {

        const info =
          examCurrencyInfo(
            row.country_code,
            row.country_name,
            row.currency_code
          );

        const amount =
          Number(row.amount || 0);

        return `
          <div class="item">

            <div class="item-main">

              <div class="avatar">
                ${esc(info.code || "🌍")}
              </div>

              <div class="item-text">

                <strong>
                  ${esc(
                    row.examination_type ||
                    "Examination Type"
                  )}
                </strong>

                <div class="small">
                  Education Level:
                  ${esc(
                    row.education_level || "—"
                  )}
                </div>

                <div class="small">
                  Board / Organization:
                  ${esc(
                    row.examination_board || "—"
                  )}
                </div>

                <div class="small">
                  Exam Type:
                  ${esc(
                    row.examination_type || "—"
                  )}
                </div>

                <div class="small">
                  Class / Level:
                  ${esc(
                    row.class_level || "—"
                  )}
                </div>

                <div class="small">
                  Country:
                  ${esc(
                    row.country_name ||
                    info.name
                  )}
                </div>

                <div class="small">
                  Currency:
                  ${esc(
                    info.currency || "—"
                  )}
                </div>

                <div class="small">

                  Registration Price:

                  <strong>
                    ${esc(info.symbol)}
                    ${esc(
                      amount.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        }
                      )
                    )}
                  </strong>

                </div>

                <div class="exam-meta">

                  ${examPriceStatusText(
                    !!row.is_enabled
                  )}

                </div>

              </div>

            </div>


            <div
              style="
                display:flex;
                gap:8px;
                flex-wrap:wrap
              "
            >

              <button
                class="btn light agu-edit-exam-price"
                data-id="${esc(row.id)}"
                type="button"
              >
                ✏️ Edit
              </button>


              <button
                class="btn ${
                  row.is_enabled
                    ? "danger"
                    : "primary"
                } agu-toggle-exam-price"
                data-id="${esc(row.id)}"
                data-enabled="${
                  row.is_enabled
                    ? "true"
                    : "false"
                }"
                type="button"
              >
                ${
                  row.is_enabled
                    ? "Disable"
                    : "Enable"
                }
              </button>


              <button
                class="btn danger agu-delete-exam-price"
                data-id="${esc(row.id)}"
                data-country="${esc(
                  row.country_name || ""
                )}"
                type="button"
              >
                🗑 Delete
              </button>

            </div>

          </div>
        `;

      })
      .join("");


    /* ---------------- EDIT ---------------- */

    list
      .querySelectorAll(
        ".agu-edit-exam-price"
      )
      .forEach(button => {

        button.onclick = () => {

          const row =
            rows.find(
              x =>
                String(x.id) ===
                String(button.dataset.id)
            );

          if (!row) return;


          if ($("examPriceEditId")) {

            $("examPriceEditId").value =
              row.id || "";

          }


          if ($("examPriceEducationLevel")) {

            $("examPriceEducationLevel").value =
              row.education_level || "";

          }


          setupExamPriceHierarchy();


          if ($("examPriceBoard")) {

            $("examPriceBoard").value =
              row.examination_board || "";

          }


          /* Refresh Exam Type after Board */

          const level =
            $("examPriceEducationLevel")?.value ||
            "";

          const selectedBoard =
            $("examPriceBoard")?.value ||
            "";

          const types =
            ADMIN_EXAM_HIERARCHY[level]?.[
              selectedBoard
            ] || [];

          const typeSelect =
            $("examPriceType");

          if (typeSelect) {

            typeSelect.innerHTML =
              '<option value="">Select examination type</option>' +
              types
                .map(
                  value =>
                    `<option value="${esc(value)}">${esc(value)}</option>`
                )
                .join("");

            typeSelect.disabled =
              !selectedBoard;

            typeSelect.value =
              row.examination_type || "";
          }


          const classSelect =
            $("examPriceClassLevel");

          if (classSelect) {

            const classes =
              ADMIN_EXAM_CLASSES[level] || [];

            classSelect.innerHTML =
              '<option value="">Select class / level</option>' +
              classes
                .map(
                  value =>
                    `<option value="${esc(value)}">${esc(value)}</option>`
                )
                .join("");

            classSelect.disabled =
              !classes.length;

            classSelect.value =
              row.class_level || "";
          }


          const countrySelect =
            $("examPriceCountryName");

          if (countrySelect) {

            countrySelect.value =
              row.country_name || "";

            if (!countrySelect.value) {

              const option =
                Array.from(
                  countrySelect.options
                ).find(
                  o =>
                    String(
                      o.dataset.code || ""
                    ).toUpperCase() ===
                    String(
                      row.country_code || ""
                    ).toUpperCase()
                );

              if (option) {
                countrySelect.value =
                  option.value;
              }

            }

          }


          if ($("examPriceAmount")) {

            $("examPriceAmount").value =
              row.amount ?? "";

          }


          if ($("examPriceEnabled")) {

            $("examPriceEnabled").value =
              String(
                !!row.is_enabled
              );

          }


          setupExamCountrySelector();


          if ($("saveExamPrice")) {

            $("saveExamPrice").textContent =
              "💾 Update Examination Type Price";

          }


          if ($("examPriceFormStatus")) {

            $("examPriceFormStatus").textContent =
              `Editing ${row.examination_type || "examination type"} price.`;

          }


          $("examPriceAmount")?.focus();

        };

      });


    /* ---------------- ENABLE / DISABLE ---------------- */

    list
      .querySelectorAll(
        ".agu-toggle-exam-price"
      )
      .forEach(button => {

        button.onclick = () =>
          toggleExamPrice(
            button.dataset.id,
            button.dataset.enabled !== "true"
          );

      });


    /* ---------------- DELETE ---------------- */

    list
      .querySelectorAll(
        ".agu-delete-exam-price"
      )
      .forEach(button => {

        button.onclick = () =>
          deleteExamPrice(
            button.dataset.id,
            button.dataset.country ||
            "this country"
          );

      });


  } catch (error) {

    console.error(
      "AGULIBRARY examination price loading error:",
      error
    );

    list.innerHTML = `
      <div class="empty">

        ❌ Unable to load examination registration prices.

        <br>

        <small>
          ${esc(
            error.message ||
            "Database error"
          )}
        </small>

      </div>
    `;

  }

}   

async function saveExamPrice() {

  const status =
    $("examPriceFormStatus");

  try {

    const verified =
      await adminMfaGate();

    if (!verified) return;


    const editId =
      $("examPriceEditId")?.value.trim() ||
      "";


    /* ---------------- HIERARCHY ---------------- */

    const educationLevel =
      $("examPriceEducationLevel")?.value.trim() ||
      "";

    const examinationBoard =
      $("examPriceBoard")?.value.trim() ||
      "";

    const examinationType =
      $("examPriceType")?.value.trim() ||
      "";

    const classLevel =
      $("examPriceClassLevel")?.value.trim() ||
      "";


    if (!educationLevel) {

      throw new Error(
        "Please select an education level."
      );

    }


    if (!examinationBoard) {

      throw new Error(
        "Please select an examination board / organization."
      );

    }


    if (!examinationType) {

      throw new Error(
        "Please select an examination type."
      );

    }


    if (!classLevel) {

      throw new Error(
        "Please select a class / level."
      );

    }


    /* ---------------- COUNTRY ---------------- */

    const countrySelect =
      $("examPriceCountryName");

    const selectedOption =
      countrySelect?.options[
        countrySelect.selectedIndex
      ];


    if (
      !selectedOption ||
      !selectedOption.value
    ) {

      throw new Error(
        "Please select a country."
      );

    }


    const info =
      getExamCountryInfoFromOption(
        selectedOption
      );


    if (
      !info ||
      !info.code ||
      !info.currency
    ) {

      throw new Error(
        "The selected country does not have a valid country/currency configuration."
      );

    }


    /* ---------------- PRICE ---------------- */

    const amount =
      Number(
        $("examPriceAmount")?.value
      );


    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {

      throw new Error(
        "Registration price must be 0 or greater."
      );

    }


    const isEnabled =
      $("examPriceEnabled")?.value ===
      "true";


    const database =
      getDB();


    /*
     * IMPORTANT:
     *
     * There is NO:
     *
     * subject
     * examination_id
     *
     * in this price record.
     *
     * The price belongs to the
     * examination type hierarchy.
     */

    const payload = {

      education_level:
        educationLevel,

      examination_board:
        examinationBoard,

      examination_type:
        examinationType,

      class_level:
        classLevel,

      country_code:
        info.code,

      country_name:
        info.name,

      currency_code:
        info.currency,

      amount:
        amount,

      is_enabled:
        isEnabled,

      updated_at:
        new Date().toISOString()

    };


    let result;


    /* ---------------- UPDATE ---------------- */

    if (editId) {

      result =
        await database
          .from(
            "agu_exam_country_prices"
          )
          .update(payload)
          .eq(
            "id",
            editId
          );

    }


    /* ---------------- CREATE / UPSERT ---------------- */

    else {

      const existing =
        await database
          .from(
            "agu_exam_country_prices"
          )
          .select("id")
          .eq(
            "education_level",
            educationLevel
          )
          .eq(
            "examination_board",
            examinationBoard
          )
          .eq(
            "examination_type",
            examinationType
          )
          .eq(
            "class_level",
            classLevel
          )
          .eq(
            "country_code",
            info.code
          )
          .maybeSingle();


      if (existing.error) {
        throw existing.error;
      }


      if (existing.data?.id) {

        result =
          await database
            .from(
              "agu_exam_country_prices"
            )
            .update(payload)
            .eq(
              "id",
              existing.data.id
            );

      } else {

        result =
          await database
            .from(
              "agu_exam_country_prices"
            )
            .insert(payload);

      }

    }


    if (result.error) {
      throw result.error;
    }


    if (status) {

      status.textContent =
        editId
          ? "✅ Examination type registration price updated successfully."
          : "✅ Examination type registration price saved successfully.";

    }


    showMessage(
      editId
        ? "Examination type registration price updated successfully."
        : "Examination type registration price saved successfully.",
      "success"
    );


    clearExamPriceForm();

    await loadExamPrices();


  } catch (error) {

    console.error(
      "AGULIBRARY examination type price save error:",
      error
    );


    if (status) {

      status.textContent =
        "❌ " +
        (
          error.message ||
          "Unable to save examination registration price."
        );

    }


    showMessage(
      error.message ||
      "Unable to save examination registration price.",
      "error"
    );

  }

}

async function toggleExamPrice(id, enabled) {
  if (!id) return;

  try {
    const verified = await adminMfaGate();
    if (!verified) return;

    const result = await getDB()
      .from("agu_exam_country_prices")
      .update({
        is_enabled: !!enabled,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (result.error) throw result.error;

    showMessage(
      enabled
        ? "Country examination price enabled."
        : "Country examination price disabled.",
      "success"
    );

    await loadExamPrices();

  } catch (error) {
    console.error("AGULIBRARY examination price status error:", error);

    showMessage(
      error.message || "Unable to change examination price status.",
      "error"
    );
  }
}

async function deleteExamPrice(id, countryName) {
  if (!id) return;

  if (
    !confirm(
      `Delete the examination registration price for "${countryName}"?\n\nThis cannot be undone.`
    )
  ) {
    return;
  }

  try {
    const verified = await adminMfaGate();
    if (!verified) return;

    const result = await getDB()
      .from("agu_exam_country_prices")
      .delete()
      .eq("id", id);

    if (result.error) throw result.error;

    showMessage(
      `The examination registration price for "${countryName}" was deleted.`,
      "success"
    );

    clearExamPriceForm();
    await loadExamPrices();

  } catch (error) {
    console.error("AGULIBRARY examination price delete error:", error);

    showMessage(
      error.message || "Unable to delete examination registration price.",
      "error"
    );
  }
}

function clearExamPriceForm() {

  if ($("examPriceEditId")) {
    $("examPriceEditId").value = "";
  }


  if ($("examPriceEducationLevel")) {
    $("examPriceEducationLevel").value = "";
  }


  if ($("examPriceBoard")) {

    $("examPriceBoard").innerHTML =
      '<option value="">Select education level first</option>';

    $("examPriceBoard").disabled = true;

  }


  if ($("examPriceType")) {

    $("examPriceType").innerHTML =
      '<option value="">Select examination board / organization first</option>';

    $("examPriceType").disabled = true;

  }


  if ($("examPriceClassLevel")) {

    $("examPriceClassLevel").innerHTML =
      '<option value="">Select education level first</option>';

    $("examPriceClassLevel").disabled = true;

  }


  if ($("examPriceCountryName")) {
    $("examPriceCountryName").value = "";
  }


  if ($("examPriceCountryCode")) {
    $("examPriceCountryCode").value = "";
  }


  if ($("examPriceCurrencyCode")) {
    $("examPriceCurrencyCode").value = "";
  }


  if ($("examPriceCurrencySymbol")) {
    $("examPriceCurrencySymbol").value = "";
  }


  if ($("examPriceAmount")) {
    $("examPriceAmount").value = "";
  }


  if ($("examPriceEnabled")) {
    $("examPriceEnabled").value = "true";
  }


  if ($("saveExamPrice")) {

    $("saveExamPrice").textContent =
      "➕ Add Examination Type Price";

  }


  if ($("examPriceFormStatus")) {
    $("examPriceFormStatus").textContent = "";
  }

}
    
setupExamPriceHierarchy();

/* ---------------- DASHBOARD ---------------- */

async function finishAdmin() {

$("loginPanel")
?.classList
.add("hidden");

$("dashboardPanel")
?.classList
.remove("hidden");

if (
currentSession &&
$("adminIdentity")
) {

$("adminIdentity").textContent =  
  "Signed in as " +  
  (  
    currentSession.user.email ||  
    "administrator"  
  );

}

await Promise.all([
loadStudents(),
loadResources(),
loadNotificationCount(),
loadExamSettings(),
loadExaminations(),
loadExamPrices()
]);

}

async function checkSession() {

try {

const d =  
  getDB();  

const r =  
  await d.auth.getSession();  

if (r.error) {  
  throw r.error;  
}  

currentSession =  
  r.data?.session ||  
  null;  

if (!currentSession) {  

  $("loginPanel")  
    ?.classList  
    .remove("hidden");  

  $("dashboardPanel")  
    ?.classList  
    .add("hidden");  

  return;  
}  

if (  
  !(await isAdmin(  
    currentSession  
  ))  
) {  

  await d.auth.signOut();  

  showLoginMessage(  
    "This account is not authorized as an AGULIBRARY administrator.",  
    "error"  
  );  

  return;  
}  

if (  
  await adminMfaGate()  
) {  

  await finishAdmin();  
}

} catch (e) {

console.error(e);  

showLoginMessage(  
  e.message ||  
  "Unable to initialize administrator access.",  
  "error"  
);

}
}

async function login(e) {

e.preventDefault();

const button =
$("adminLoginButton");

button.disabled = true;

showLoginMessage(
"Signing in...",
"success"
);

try {

const d =  
  getDB();  

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

if (r.error) {  
  throw r.error;  
}  

currentSession =  
  r.data.session;  

if (  
  !(await isAdmin(  
    currentSession  
  ))  
) {  

  await d.auth.signOut();  

  throw new Error(  
    "This account is not authorized as an AGULIBRARY administrator."  
  );  
}  

showLoginMessage(  
  "Authentication successful. Checking administrator verification...",  
  "success"  
);  

if (  
  await adminMfaGate()  
) {  

  await finishAdmin();  
}

} catch (e) {

console.error(e);  

showLoginMessage(  
  e.message ||  
  "Sign in failed.",  
  "error"  
);

} finally {

button.disabled = false;

}
}

async function logout() {

try {

await getDB()  
  .auth  
  .signOut();

} catch (e) {

console.error(e);

}

localStorage.removeItem(
"AGU_ADMIN_MFA_VERIFIED_AT"
);

mfaOpen = false;

currentSession = null;

location.reload();
}

/* ---------------- EVENTS ---------------- */

function bind() {

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

$("educationLevel")
?.addEventListener(
"change",
updateClassLevels
);

$("resourceType")
?.addEventListener(
"change",
updateDigitalBookFields
);

updateClassLevels();

updateDigitalBookFields();

// Initialize the examination country selector so Country Code, Currency Code
// and Currency Symbol are revealed automatically when a country is selected.
setupExamCountrySelector();

// Initialize Create/Edit Examination hierarchy.
setupAdminExamHierarchy();

// Initialize Examination Registration Price hierarchy.
setupExamPriceHierarchy();

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
logout
);
$("saveExamSettings")?.addEventListener(
"click",
saveExamSettings
);

$("saveExamPrice")?.addEventListener(
"click",
saveExamPrice
);

$("clearExamPriceForm")?.addEventListener(
"click",
clearExamPriceForm
);

$("refreshExamPrices")?.addEventListener(
"click",
loadExamPrices
);

$("refreshExamAdmin")?.addEventListener(
"click",
async () => {
await loadExamSettings();
await loadExaminations();
await loadExamPrices();
}
);
$("saveExam")
?.addEventListener(
"click",
saveExam
);

$("saveQuestion")
?.addEventListener(
"click",
saveQuestion
);

/*

CORRECT QUESTION SELECT LISTENER

Selecting an examination loads its questions.
*/
$("adminQuestionExamSelect")?.addEventListener(
  "change",
  loadQuestionsForSelectedExam
);
$("registrationExamFilter")?.addEventListener(
"change",
loadRegistrations
);


$("registrationStatusFilter")?.addEventListener(
"change",
loadRegistrations
);

$("refreshRegistrations")?.addEventListener(
"click",
loadRegistrations
);
/*

The incorrect populateExamSelects()

change listeners have intentionally been removed.

populateExamSelects() is called by

loadExaminations() after examinations

are loaded from Supabase.
*/


document
.querySelectorAll(
"[data-target]"
)
.forEach(button => {

button.addEventListener(  
    "click",  
    () => {  

      const input =  
        $(  
          button.dataset.target  
        );  

      if (input) {  

        input.type =  
          input.type ===  
          "password"  
            ? "text"  
            : "password";  
      }  
    }  
  );  
});

if ($("year")) {

$("year").textContent =  
  new Date().getFullYear();

}
}

document.addEventListener(
"DOMContentLoaded",
() => {

bind();  

checkSession();

}
);

window.AGU_ADMIN = {

loadStudents,

loadResources,

sendNotification,

uploadFile,

deleteResource,

logout

};

})();
