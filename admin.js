/* =========================================================
   AGULIBRARY — ADMIN.JS
   ADMIN LOGIN + RESOURCE UPLOAD + INVITATIONS
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const loginPanel =
  document.getElementById("loginPanel");

const dashboardPanel =
  document.getElementById("dashboardPanel");

const loginForm =
  document.getElementById("loginForm");

const uploadForm =
  document.getElementById("uploadForm");

const loginMessage =
  document.getElementById("loginMessage");

const adminMessage =
  document.getElementById("adminMessage");

const invitationForm =
  document.getElementById("invitationForm");

const invitationResult =
  document.getElementById("invitationResult");

const invitationMessage =
  document.getElementById("invitationMessage");

const invitationList =
  document.getElementById("invitationList");

const generatedCode =
  document.getElementById("generatedCode");

const generatedLink =
  document.getElementById("generatedLink");



/* =========================================================
   SUPABASE CLIENT
========================================================= */

function getDatabase() {

  if (
    typeof getSupabase === "function"
  ) {

    return getSupabase();

  }

  return null;

}



/* =========================================================
   START ADMIN
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const db =
      typeof initSupabase === "function"
        ? initSupabase()
        : getDatabase();


    if (!db) {

      if (loginMessage) {

        loginMessage.textContent =
          "Supabase is not configured. Check config.js.";

      }

      return;

    }


    try {

      const {
        data,
        error
      } =
        await db.auth.getSession();


      if (error) {

        console.error(
          "Session error:",
          error
        );

        return;

      }


      if (data && data.session) {

        await checkAdmin(
          data.session.user
        );

      }

    } catch (error) {

      console.error(
        "Admin startup error:",
        error
      );

    }

  }
);



/* =========================================================
   ADMIN LOGIN
========================================================= */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      loginMessage.textContent =
        "Signing in...";


      const db =
        getDatabase();


      if (!db) {

        loginMessage.textContent =
          "Supabase is not configured.";

        return;

      }


      const email =
        document
          .getElementById("email")
          .value
          .trim();


      const password =
        document
          .getElementById("password")
          .value;


      try {

        const {
          data,
          error
        } =
          await db.auth.signInWithPassword({

            email: email,

            password: password

          });


        if (error) {

          loginMessage.textContent =
            "Login failed: " +
            error.message;

          return;

        }


        await checkAdmin(
          data.user
        );


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        loginMessage.textContent =
          "Login failed. Please try again.";

      }

    }
  );

}



/* =========================================================
   CHECK ADMIN
========================================================= */

async function checkAdmin(user) {

  const db =
    getDatabase();


  if (!db || !user) {

    return;

  }


  try {

    const {
      data,
      error
    } =
      await db
        .from("admin_users")
        .select("user_id")
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Admin verification error:",
        error
      );


      loginMessage.textContent =
        "Unable to verify administrator account: " +
        error.message;

      return;

    }


    if (!data) {

      await db.auth.signOut();


      loginMessage.textContent =
        "Access denied. This account is not an AGULIBRARY administrator.";

      return;

    }


    /* Admin confirmed */

    if (loginPanel) {

      loginPanel.classList.add(
        "hidden"
      );

    }


    if (dashboardPanel) {

      dashboardPanel.classList.remove(
        "hidden"
      );

    }


    if (adminMessage) {

      adminMessage.textContent =
        "Welcome to AGULIBRARY Admin.";

    }


    /* Load invitations */

    await loadInvitations();

  } catch (error) {

    console.error(
      "Admin check error:",
      error
    );

  }

}



/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
  document.getElementById(
    "logoutBtn"
  );


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async function () {

      const db =
        getDatabase();


      try {

        if (db) {

          await db.auth.signOut();

        }

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }


      if (dashboardPanel) {

        dashboardPanel.classList.add(
          "hidden"
        );

      }


      if (loginPanel) {

        loginPanel.classList.remove(
          "hidden"
        );

      }


      if (loginMessage) {

        loginMessage.textContent =
          "You have signed out.";

      }

    }
  );

}



/* =========================================================
   RESOURCE UPLOAD
========================================================= */

if (uploadForm) {

  uploadForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (adminMessage) {

        adminMessage.textContent =
          "Preparing upload...";

      }


      const db =
        getDatabase();


      if (!db) {

        adminMessage.textContent =
          "Supabase is not configured.";

        return;

      }


      try {

        /* Check session */

        const {
          data: sessionData
        } =
          await db.auth.getSession();


        if (
          !sessionData ||
          !sessionData.session
        ) {

          adminMessage.textContent =
            "Your session has expired. Please sign in again.";

          return;

        }


        /* Get file */

        const fileInput =
          document.getElementById("file");


        const file =
          fileInput
            ? fileInput.files[0]
            : null;


        if (!file) {

          adminMessage.textContent =
            "Please select a file.";

          return;

        }


        /* Safe filename */

        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );


        const filePath =
          Date.now() +
          "-" +
          safeName;


        const bucket =
          window.AGU_CONFIG &&
          window.AGU_CONFIG.bucket
            ? window.AGU_CONFIG.bucket
            : "agu-library";


        adminMessage.textContent =
          "Uploading file...";


        /* Upload */

        const upload =
          await db
            .storage
            .from(bucket)
            .upload(
              filePath,
              file,
              {
                cacheControl: "3600",
                upsert: false
              }
            );


        if (upload.error) {

          adminMessage.textContent =
            "Upload failed: " +
            upload.error.message;

          return;

        }


        /* Public URL */

        const publicUrl =
          db
            .storage
            .from(bucket)
            .getPublicUrl(
              filePath
            )
            .data
            .publicUrl;


        adminMessage.textContent =
          "File uploaded. Saving resource information...";


        /* Resource */

        const resource = {

          title:
            document
              .getElementById("title")
              .value
              .trim(),


          description:
            document
              .getElementById("description")
              .value
              .trim(),
      content:
        document
          .getElementById("content")
          .value
          .trim(),

          type:
            document
              .getElementById("type")
              .value,


          subject:
            document
              .getElementById("subject")
              .value
              .trim(),


          level:
            document
              .getElementById("level")
              .value
              .trim(),


          class_level:
            document
              .getElementById("classLevel")
              .value
              .trim(),


          term:
            document
              .getElementById("term")
              .value
              .trim(),


          file_url:
            publicUrl,


          is_premium:
            document
              .getElementById("premium")
              .checked

        };


        /* Database */

        const {
          error
        } =
          await db
            .from("resources")
            .insert(
              resource
            );


        if (error) {

          adminMessage.textContent =
            "The file uploaded, but the resource information could not be saved: " +
            error.message;

          return;

        }


        adminMessage.textContent =
          "✅ Resource uploaded and published successfully!";


        uploadForm.reset();


      } catch (error) {

        console.error(
          "Upload error:",
          error
        );


        adminMessage.textContent =
          "Upload error: " +
          error.message;

      }

    }
  );

}



/* =========================================================
   GENERATE INVITATION CODE
========================================================= */

function generateInvitationCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let code = "";


  for (
    let i = 0;
    i < 10;
    i++
  ) {

    code +=
      characters[
        Math.floor(
          Math.random() *
          characters.length
        )
      ];

  }


  return code;

}



/* =========================================================
   CREATE INVITATION LINK
========================================================= */

function createInvitationLink(code) {

  const base =
    window.location.origin;


  return (
    base +
    "/auth.html?invite=" +
    encodeURIComponent(
      code
    )
  );

}



/* =========================================================
   CREATE INVITATION
========================================================= */

if (invitationForm) {

  invitationForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const db =
        getDatabase();


      if (!db) {

        showInvitationMessage(
          "Supabase is not configured.",
          true
        );

        return;

      }


      showInvitationMessage(
        "Creating invitation..."
      );


      try {

        /* Current admin */

        const {
          data: sessionData,
          error: sessionError
        } =
          await db.auth.getSession();


        if (sessionError) {

          throw sessionError;

        }


        const session =
          sessionData &&
          sessionData.session;


        if (!session) {

          showInvitationMessage(
            "Your admin session has expired. Please sign in again.",
            true
          );

          return;

        }


        /* Fields */

        const nameInput =
          document.getElementById(
            "invitationStudentName"
          );


        const emailInput =
          document.getElementById(
            "invitationStudentEmail"
          );


        const noteInput =
          document.getElementById(
            "invitationNote"
          );


        const studentName =
          nameInput
            ? nameInput.value.trim()
            : "";


        const studentEmail =
          emailInput
            ? emailInput.value.trim()
            : "";


        const note =
          noteInput
            ? noteInput.value.trim()
            : "";


        /* Generate unique code */

        let code = "";


        let unique =
          false;


        for (
          let attempt = 0;
          attempt < 10;
          attempt++
        ) {

          const newCode =
            generateInvitationCode();


          const {
            data: existing,
            error: checkError
          } =
            await db
              .from(
                "student_invitations"
              )
              .select("id")
              .eq(
                "code",
                newCode
              )
              .maybeSingle();


          if (checkError) {

            throw checkError;

          }


          if (!existing) {

            code =
              newCode;

            unique =
              true;

            break;

          }

        }


        if (!unique) {

          throw new Error(
            "Could not create a unique invitation code."
          );

        }


        /* Insert invitation */

        const invitation = {

          code: code,

          student_name:
            studentName || null,

          student_email:
            studentEmail || null,

          note:
            note || null,

          created_by:
            session.user.id,

          used:
            false

        };


        const {
          data,
          error
        } =
          await db
            .from(
              "student_invitations"
            )
            .insert(
              invitation
            )
            .select()
            .single();


        if (error) {

          throw error;

        }


        /* Create link */

        const link =
          createInvitationLink(
            data.code
          );


        if (generatedCode) {

          generatedCode.textContent =
            data.code;

        }


        if (generatedLink) {

          generatedLink.value =
            link;

        }


        if (invitationResult) {

          invitationResult.classList.add(
            "show"
          );

          invitationResult.style.display =
            "block";

        }


        showInvitationMessage(
          "✅ Invitation created successfully."
        );


        if (invitationForm) {

          invitationForm.reset();

        }


        /* Reload list immediately */

        await loadInvitations();

      } catch (error) {

        console.error(
          "Invitation creation error:",
          error
        );


        showInvitationMessage(
          "Invitation could not be created: " +
          error.message,
          true
        );

      }

    }
  );

}



/* =========================================================
   INVITATION MESSAGE
========================================================= */

function showInvitationMessage(
  message,
  isError = false
) {

  if (!invitationMessage) {

    return;

  }


  invitationMessage.textContent =
    message;


  invitationMessage.style.color =
    isError
      ? "#b42323"
      : "#087f55";

}



/* =========================================================
   COPY INVITATION LINK
========================================================= */

const copyButton =
  document.getElementById(
    "copyInvitationButton"
  );


if (copyButton) {

  copyButton.addEventListener(
    "click",
    async function () {

      if (!generatedLink) {

        return;

      }


      const link =
        generatedLink.value;


      if (!link) {

        return;

      }


      try {

        await navigator.clipboard.writeText(
          link
        );


        copyButton.textContent =
          "✅ Copied!";


        setTimeout(
          function () {

            copyButton.textContent =
              "📋 Copy Link";

          },
          2000
        );


      } catch (error) {

        generatedLink.select();


        document.execCommand(
          "copy"
        );


        copyButton.textContent =
          "✅ Copied!";

      }

    }
  );

}



/* =========================================================
   SHARE INVITATION
========================================================= */

const shareButton =
  document.getElementById(
    "shareInvitationButton"
  );


if (shareButton) {

  shareButton.addEventListener(
    "click",
    async function () {

      if (!generatedLink) {

        return;

      }


      const link =
        generatedLink.value;


      if (!link) {

        return;

      }


      const message =
        "You are invited to join AGULIBRARY.\n\n" +
        "Open this invitation link to register:\n\n" +
        link;


      if (
        navigator.share
      ) {

        try {

          await navigator.share({

            title:
              "AGULIBRARY Student Invitation",

            text:
              message

          });

        } catch (error) {

          console.log(
            "Share cancelled."
          );

        }

      } else {

        try {

          await navigator.clipboard.writeText(
            message
          );


          alert(
            "Invitation copied. You can paste it into WhatsApp, SMS or email."
          );

        } catch (error) {

          alert(
            message
          );

        }

      }

    }
  );

}



/* =========================================================
   LOAD EXISTING INVITATIONS
========================================================= */

async function loadInvitations() {

  const list =
    document.getElementById(
      "invitationList"
    );


  if (!list) {

    return;

  }


  const db =
    getDatabase();


  if (!db) {

    list.innerHTML = `
      <div class="empty">
        Supabase is not configured.
      </div>
    `;

    return;

  }


  list.innerHTML = `
    <div class="empty">
      Loading invitations...
    </div>
  `;


  try {

    /* Get admin session */

    const {
      data: sessionData,
      error: sessionError
    } =
      await db.auth.getSession();


    if (sessionError) {

      throw sessionError;

    }


    const session =
      sessionData &&
      sessionData.session;


    if (!session) {

      list.innerHTML = `
        <div class="empty">
          Please sign in again.
        </div>
      `;

      return;

    }


    /* Load invitations */

    const {
      data,
      error
    } =
      await db
        .from(
          "student_invitations"
        )
        .select(
          "id,code,student_name,student_email,note,used,used_at,created_at,created_by"
        )
        .eq(
          "created_by",
          session.user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      throw error;

    }


    /* Nothing found */

    if (
      !data ||
      data.length === 0
    ) {

      list.innerHTML = `
        <div class="empty">
          No student invitations yet.
        </div>
      `;

      return;

    }


    /* Display invitations */

    list.innerHTML =
      data.map(
        function (invitation) {

          const name =
            escapeHTML(
              invitation.student_name ||
              "Student"
            );


          const email =
            escapeHTML(
              invitation.student_email ||
              "No email specified"
            );


          const code =
            escapeHTML(
              invitation.code ||
              ""
            );


          const id =
            escapeHTML(
              invitation.id ||
              ""
            );


          const used =
            Boolean(
              invitation.used ||
              invitation.used_at
            );


          const status =
            used
              ? "USED"
              : "AVAILABLE";


          return `

            <div
              class="invitation-item"
              style="
                padding:18px;
                margin-bottom:14px;
                border:1px solid #c8eadb;
                border-radius:16px;
                background:#f4fbf7;
              "
            >

              <strong
                style="
                  display:block;
                  font-size:21px;
                  letter-spacing:2px;
                  color:#087f55;
                  margin-bottom:8px;
                "
              >
                ${code}
              </strong>


              <b>
                ${name}
              </b>


              <br>


              <small>
                ${email}
              </small>


              <br><br>


              <span
                style="
                  font-weight:700;
                  color:#087f55;
                "
              >
                ${status}
              </span>


              ${
                !used
                  ? `

                    <br><br>

                    <button
                      type="button"
                      class="cancel-invitation btn outline"
                      data-invitation-id="${id}"
                    >
                      Cancel Invitation
                    </button>

                  `
                  : ""
              }

            </div>

          `;

        }
      ).join("");


    /* Cancel buttons */

    list
      .querySelectorAll(
        ".cancel-invitation"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            async function () {

              await cancelInvitation(
                button.dataset.invitationId
              );

            }
          );

        }
      );


  } catch (error) {

    console.error(
      "LOAD INVITATIONS ERROR:",
      error
    );


    list.innerHTML = `
      <div class="empty">

        ❌ Unable to load invitations.

        <br><br>

        <small>
          ${escapeHTML(
            error.message ||
            "Unknown database error"
          )}
        </small>

      </div>
    `;

  }

}



/* =========================================================
   CANCEL INVITATION
========================================================= */

async function cancelInvitation(id) {

  if (!id) {

    return;

  }


  const confirmed =
    confirm(
      "Cancel this invitation?"
    );


  if (!confirmed) {

    return;

  }


  const db =
    getDatabase();


  if (!db) {

    alert(
      "Supabase is not configured."
    );

    return;

  }


  try {

    const {
      data: sessionData
    } =
      await db.auth.getSession();


    const session =
      sessionData &&
      sessionData.session;


    if (!session) {

      alert(
        "Your admin session has expired."
      );

      return;

    }


    const {
      error
    } =
      await db
        .from(
          "student_invitations"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "created_by",
          session.user.id
        );


    if (error) {

      throw error;

    }


    await loadInvitations();


  } catch (error) {

    console.error(
      "Cancel invitation error:",
      error
    );


    alert(
      "Unable to cancel invitation: " +
      error.message
    );

  }

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    function (character) {

      const entities = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      };


      return entities[
        character
      ];

    }
  );

}



/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttr(value) {

  return escapeHTML(
    value
  ).replace(
    /`/g,
    "&#096;"
  );

}



/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadInvitations =
  loadInvitations;


window.cancelInvitation =
  cancelInvitation;


window.generateInvitationCode =
  generateInvitationCode;
