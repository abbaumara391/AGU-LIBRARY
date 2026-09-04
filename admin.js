/* =========================================================
   AGULIBRARY — COMPLETE ADMIN.JS
   Fixed for current Supabase database structure.

   Includes:
   - Supabase admin authentication
   - Admin-user authorization
   - Admin MFA verification
   - Resource upload
   - Student management/search
   - Student notifications
   - Resource management/search
   - Resource deletion
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


  /* =========================================================
     HELPERS
     ========================================================= */

  function esc(v) {
    return String(v ?? "").replace(
      /[&<>"']/g,
      c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[c])
    );
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

  function hideMessage() {
    const x = $("message");
    if (x) x.className = "message";
  }

  function getDB() {
    if (db) return db;

    if (typeof getSupabase === "function") {
      return db = getSupabase();
    }

    if (
      window.supabase &&
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey
    ) {
      return db = window.supabase.createClient(
        cfg.supabaseUrl,
        cfg.supabaseAnonKey
      );
    }

    throw new Error("Supabase configuration is unavailable.");
  }


  /* =========================================================
     STUDENT PROFILE HELPERS
     ========================================================= */

  function profileName(p) {
    return (
      [
        p.first_name,
        p.middle_name,
        p.last_name
      ]
        .filter(Boolean)
        .join(" ")
      ||
      p.full_name ||
      p.name ||
      "Student"
    );
  }

  function profileEmail(p) {
    return (
      p.email ||
      p.email_address ||
      p.student_email ||
      ""
    );
  }

  function profilePhone(p) {
    return (
      p.phone ||
      p.phone_number ||
      p.mobile ||
      ""
    );
  }

  /*
     IMPORTANT:
     Your student_profiles table uses "id" as the
     student's Supabase Auth user ID.

     It does NOT use "user_id".
  */
  function getId(p) {
    return (
      p.id ||
      p.user_id ||
      p.student_id ||
      ""
    );
  }


  /* =========================================================
     ADMIN AUTHORIZATION
     ========================================================= */

  async function isAdmin(session) {
    const d = getDB();

    const {
      data,
      error
    } = await d
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  }


  /* =========================================================
     ADMIN MFA
     ========================================================= */

  async function adminMfaGate() {

    if (mfaOpen) return true;

    const d = getDB();

    let aal;

    try {

      const r =
        await d.auth.mfa.getAuthenticatorAssuranceLevel();

      if (r.error) throw r.error;

      aal = r.data || {};

    } catch (e) {

      console.error(e);

      alert(
        "Administrator MFA status could not be checked: " +
        (e.message || "Unknown error")
      );

      return false;
    }


    /*
       AAL2 is the Supabase server-issued proof
       that MFA has been completed.
    */

    if (aal.currentLevel === "aal2") {

      mfaOpen = true;

      return true;
    }


    if (aal.nextLevel !== "aal2") {

      alert(
        "MFA is not enrolled for this administrator. " +
        "Enroll and verify a TOTP authenticator before " +
        "using the Admin Dashboard."
      );

      return false;
    }


    let factors;

    try {

      factors =
        await d.auth.mfa.listFactors();

      if (factors.error) throw factors.error;

    } catch (e) {

      console.error(e);

      alert(
        "Administrator MFA could not be checked: " +
        (e.message || "Unknown error")
      );

      return false;
    }


    const totp =
      (factors.data?.totp || [])
        .find(f => f.status === "verified");


    if (!totp) {

      alert(
        "No verified TOTP authenticator was found " +
        "for this administrator. Enroll and verify " +
        "an authenticator before entering the Admin Dashboard."
      );

      return false;
    }


    const overlay = document.createElement("div");

    overlay.id = "aguMfaOverlay";

    overlay.style.cssText =
      "position:fixed;" +
      "inset:0;" +
      "background:rgba(0,0,0,.62);" +
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

        <h2 style="
          margin-top:0;
          color:#123d2d
        ">
          🔐 Admin MFA Verification
        </h2>

        <p style="
          color:#718079;
          line-height:1.6
        ">
          Enter the current 6-digit code from your
          authenticator app to continue.
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
          type="button"
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
        >
          Verify & Continue
        </button>

        <button
          id="aguMfaCancel"
          type="button"
          style="
            width:100%;
            margin-top:8px;
            border:1px solid #cfe5da;
            border-radius:10px;
            padding:13px;
            background:#edf7f2;
            color:#17352a;
            font-weight:800
          "
        >
          Cancel & Sign Out
        </button>

        <p
          id="aguMfaError"
          style="
            color:#b42323;
            font-size:13px;
            min-height:18px
          "
        ></p>

      </div>
    `;


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

      errorBox.textContent = "Verifying...";


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
            "MFA verification completed, but this session " +
            "is not at AAL2. Please try again."
          );
        }


        const sessionResult =
          await d.auth.getSession();


        if (sessionResult.error)
          throw sessionResult.error;


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


    codeInput.addEventListener("input", () => {

      codeInput.value =
        codeInput.value
          .replace(/\D/g, "")
          .slice(0, 6);

      if (codeInput.value.length === 6) {
        errorBox.textContent = "";
      }
    });


    codeInput.addEventListener("keydown", e => {

      if (e.key === "Enter") {
        verifyButton.click();
      }
    });


    codeInput.focus();

    return false;
  }


  /* =========================================================
     STUDENT LIST
     ========================================================= */

  async function loadStudents() {

    const d = getDB();
    const list = $("aguStudentList");

    if (!list) return;

    list.innerHTML =
      '<div class="empty">Loading students...</div>';


    try {

      /*
         Your real table is:

         student_profiles
         id
         first_name
         last_name
         middle_name
         full_name
         phone
         country_code
         email
         profile_photo_url
         education_level
         class_level
         bio
         invitation_code
         created_at
         updated_at
      */

      const r =
        await d
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
        '<div class="empty">' +
        '❌ Unable to load students.<br>' +
        '<small>' +
        esc(e.message || "Unknown database error") +
        '</small>' +
        '</div>';
    }
  }


  function renderStudents() {

    const list = $("aguStudentList");

    const q =
      ($("aguStudentSearch")?.value || "")
        .toLowerCase()
        .trim();


    if (!list) return;


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

        const n = profileName(p);
        const id = getId(p);

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
                         Education: ${esc(p.education_level)}
                       </div>`
                    : ""
                }

                ${
                  p.class_level
                    ? `<div class="small">
                         Class: ${esc(p.class_level)}
                       </div>`
                    : ""
                }

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
      .forEach(button => {

        button.onclick = () => {

          const target = $("aguNotifyTarget");

          if (target) {
            target.value =
              "student:" + button.dataset.id;
          }

          $("aguNotifyTitle")?.focus();
        };
      });
  }


  function updateTargets() {

    const s = $("aguNotifyTarget");

    if (!s) return;


    s.innerHTML =
      '<option value="all">👥 All students</option>' +

      students.map(p => {

        const id = getId(p);
        const name = profileName(p);
        const email = profileEmail(p);


        return `
          <option value="student:${esc(id)}">
            ${esc(name)}
            ${email ? " — " + esc(email) : ""}
          </option>
        `;
      }).join("");
  }


  /* =========================================================
     DIGITAL BOOK UI
     ========================================================= */

  function updateDigitalBookFields() {

    const type = $("resourceType");
    const normal = $("normalFileField");
    const digital = $("digitalBookFields");
    const file = $("file");


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
      file.required = !isDigital;
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


  /* =========================================================
     RESOURCE LIST
     ========================================================= */

  async function loadResources() {

    const d = getDB();
    const list = $("aguResourceList");

    if (!list) return;


    list.innerHTML =
      '<div class="empty">Loading resources...</div>';


    try {

      const r =
        await d
          .from(TABLE)
          .select("*")
          .order(
            "created_at",
            { ascending: false }
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
        '<div class="empty">' +
        '❌ Unable to load resources.<br>' +
        '<small>' +
        esc(e.message || "Unknown database error") +
        '</small>' +
        '</div>';
    }
  }


  function renderResources() {

    const list =
      $("aguResourceList");

    const q =
      ($("aguResourceSearch")?.value || "")
        .toLowerCase()
        .trim();


    if (!list) return;


    const rows =
      resources.filter(r => {

        const text = [
          r.title,
          r.subject,
          r.resource_category,
          r.class_level,
          r.type,
          r.storage_path
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


          const key =
            r.id ||
            r.storage_path ||
            r.file_url ||
            `${r.title || "resource"}-${i}`;


          return `
            <div class="item">

              <div class="item-text">

                <strong>
                  ${esc(r.title || "Untitled Resource")}
                </strong>

                <div class="small">
                  ${esc(
                    r.subject ||
                    r.resource_category ||
                    ""
                  )}

                  ${
                    r.class_level
                      ? " • " + esc(r.class_level)
                      : ""
                  }

                  ${
                    r.type
                      ? " • " + esc(r.type)
                      : ""
                  }
                </div>

                <div class="small">
                  ${esc(r.storage_path || "")}
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
        }).join("");


    list
      .querySelectorAll(".agu-delete-resource")
      .forEach(button => {

        button.onclick = () =>
          deleteResource(
            button.dataset.resourceKey
          );
      });
  }


  /* =========================================================
     RESOURCE DELETE
     ========================================================= */

  async function deleteResource(resourceKey) {

    const d = getDB();


    const resource =
      resources.find(r =>
        String(
          r.id ??
          r.storage_path ??
          r.file_url ??
          ""
        ) === String(resourceKey)
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
        `Delete "${title}"?\n\n` +
        `This action removes the published resource ` +
        `from AGULIBRARY. It cannot be undone.`
      )
    ) {
      return;
    }


    try {

      showMessage(
        "Administrator verification required for deletion.",
        "success"
      );


      const verified =
        await adminMfaGate();


      if (!verified) return;


      showMessage(
        `Deleting "${title}"...`,
        "success"
      );


      let storageError = null;


      const storagePath =
        resource.storage_path ||
        resource.path ||
        "";


      if (storagePath) {

        const sr =
          await d
            .storage
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
            .eq("id", resource.id);

      } else if (storagePath) {

        dbResult =
          await d
            .from(TABLE)
            .delete()
            .eq(
              "storage_path",
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
          "This resource has no safe database identifier. Refresh the list and try again."
        );
      }


      if (dbResult.error)
        throw dbResult.error;


      if (storageError) {

        showMessage(
          `"${title}" was removed from the library, ` +
          `but its stored file could not be deleted: ` +
          `${storageError.message || "Storage error"}.`,
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


  /* =========================================================
     RESOURCE UPLOAD
     ========================================================= */

  async function uploadFile(e) {

    e.preventDefault();


    const d = getDB();


    const title =
      $("title")?.value.trim() || "";


    const category =
      $("category")?.value.trim() || "";


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


    button.disabled = true;


    if (status) {
      status.textContent =
        "Preparing...";
    }


    try {

      /* =====================================================
         DIGITAL BOOK
         ===================================================== */

      if (type === "digital_book") {

        let bookPath =
          $("bookPath")?.value.trim() || "";


        let bookEntry =
          $("bookEntry")?.value.trim() ||
          "index.html";


        if (!bookPath) {

          if (status) {
            status.textContent =
              "Please enter the digital book folder path.";
          }

          return;
        }


        bookPath =
          bookPath.replace(
            /^[\/\\]+|[\/\\]+$/g,
            ""
          );


        if (!bookPath) {

          if (status) {
            status.textContent =
              "Please enter the digital book folder path.";
          }

          return;
        }


        bookEntry =
          bookEntry.replace(
            /^[\/\\]+/,
            ""
          );


        if (!bookEntry) {
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
           IMPORTANT:
           Only columns that actually exist in
           your resources table are sent.
        */

        const payload = {
          title: title,
          subject: category,
          type: "digital_book",
          file_url: digitalBookURL,
          resource_category: category
        };


        const result =
          await d
            .from(TABLE)
            .insert(payload);


        if (result.error) {
          throw result.error;
        }


        if (status) {
          status.textContent =
            "✅ Digital book published successfully.";
        }


        showMessage(
          "Digital book published successfully.",
          "success"
        );


        $("uploadForm")?.reset();

        updateDigitalBookFields();

        await loadResources();

        return;
      }


      /* =====================================================
         NORMAL FILE UPLOAD
         ===================================================== */

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


      /*
         Make a safe storage filename.
      */

      const safe =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );


      const filename =
        `resources/${Date.now()}-${safe}`;


      /*
         Upload to:
         agu-library/resources/...
      */

      const up =
        await d
          .storage
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


      /*
         Get public URL.
      */

      const pub =
        d
          .storage
          .from(BUCKET)
          .getPublicUrl(filename);


      const url =
        pub.data.publicUrl;


      /*
         IMPORTANT FIX:
         Do NOT send:
         - name
         - category
         - url

         because those columns do not exist
         in the current resources table.

         We use the actual fields:
         - title
         - subject
         - type
         - file_url
         - storage_path
         - resource_category
      */

      const payload = {
        title: title,
        subject: category,
        type: type,
        file_url: url,
        storage_path: filename,
        resource_category: category
      };


      const result =
        await d
          .from(TABLE)
          .insert(payload);


      if (result.error) {

        /*
           If database insertion fails after the
           file uploaded, attempt to remove the
           uploaded file so we don't leave an orphan.
        */

        try {

          await d
            .storage
            .from(BUCKET)
            .remove([filename]);

        } catch (_) {}

        throw result.error;
      }


      if (status) {
        status.textContent =
          "✅ Upload successful.";
      }


      showMessage(
        "Resource uploaded successfully.",
        "success"
      );


      $("uploadForm")?.reset();

      updateDigitalBookFields();

      await loadResources();


    } catch (err) {

      console.error(
        "AGULIBRARY upload error:",
        err
      );


      if (status) {

        status.textContent =
          "❌ " +
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


  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  async function insertNotification(
    d,
    recipientId,
    title,
    message
  ) {

    const variants = [

      {
        student_id: recipientId,
        title,
        message,
        is_read: false
      },

      {
        user_id: recipientId,
        title,
        message,
        is_read: false
      },

      {
        recipient_id: recipientId,
        title,
        message,
        is_read: false
      },

      {
        student_id: recipientId,
        message,
        is_read: false
      },

      {
        user_id: recipientId,
        message,
        is_read: false
      }
    ];


    let last = null;


    for (const payload of variants) {

      const r =
        await d
          .from("student_notifications")
          .insert(payload);


      if (!r.error) {
        return true;
      }


      last = r.error;


      const m =
        (r.error.message || "")
          .toLowerCase();


      /*
         Continue trying another schema
         only when the error indicates a
         missing column/schema field.
      */

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


  async function sendNotification() {

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


    if (!title || !message) {

      status.textContent =
        "Please enter a title and message.";

      return;
    }


    status.textContent =
      "Sending...";


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


      for (const p of recipients) {

        const id = getId(p);

        if (!id) continue;


        await insertNotification(
          d,
          id,
          title,
          message
        );


        sent++;
      }


      status.textContent =
        `✅ Notification sent to ${sent} student${
          sent === 1 ? "" : "s"
        }.`;

      $("aguNotifyTitle").value = "";
      $("aguNotifyMessage").value = "";


      await loadNotificationCount();


    } catch (e) {

      console.error(e);

      status.textContent =
        "❌ " +
        (
          e.message ||
          "Notification could not be sent."
        );
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


  /* =========================================================
     FINISH ADMIN DASHBOARD
     ========================================================= */

  async function finishAdmin() {

    $("loginPanel")?.classList.add(
      "hidden"
    );

    $("dashboardPanel")?.classList.remove(
      "hidden"
    );


    if (currentSession) {

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
      loadNotificationCount()
    ]);
  }


  /* =========================================================
     SESSION CHECK
     ========================================================= */

  async function checkSession() {

    try {

      const d = getDB();


      const r =
        await d.auth.getSession();


      if (r.error) {
        throw r.error;
      }


      currentSession =
        r.data?.session || null;


      if (!currentSession) {

        $("loginPanel")?.classList.remove(
          "hidden"
        );

        $("dashboardPanel")?.classList.add(
          "hidden"
        );

        return;
      }


      if (
        !(await isAdmin(currentSession))
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


  /* =========================================================
     ADMIN LOGIN
     ========================================================= */

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


      if (r.error) {
        throw r.error;
      }


      currentSession =
        r.data.session;


      if (
        !(await isAdmin(currentSession))
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


  /* =========================================================
     LOGOUT
     ========================================================= */

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


  /* =========================================================
     EVENT BINDING
     ========================================================= */

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
        async () => {
          await logout();
        }
      );


    document
      .querySelectorAll("[data-target]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const input =
              $(button.dataset.target);

            if (input) {

              input.type =
                input.type === "password"
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
