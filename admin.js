/* =========================================================
   AGULIBRARY — ADMIN.JS
   PHASE 3 — ADMIN + RESOURCES + STUDENT INVITATIONS
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
   SUPABASE
========================================================= */

function client(){

  if (
    typeof getSupabase === "function"
  ){

    return getSupabase();

  }

  return null;

}



/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const db =
      typeof initSupabase === "function"
        ? initSupabase()
        : client();


    if(!db){

      if(loginMessage){

        loginMessage.textContent =
          "Supabase is not configured. Check config.js.";

      }

      return;

    }


    const {
      data
    } =
      await db.auth.getSession();


    if(data?.session){

      await checkAdmin(
        data.session.user
      );

    }

  }
);



/* =========================================================
   ADMIN LOGIN
========================================================= */

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      loginMessage.textContent =
        "Signing in...";


      const db =
        client();


      if(!db){

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


      const {
        data,
        error
      } =
        await db.auth.signInWithPassword({

          email,
          password

        });


      if(error){

        loginMessage.textContent =
          "Login failed: " +
          error.message;

        return;

      }


      await checkAdmin(
        data.user
      );

    }
  );

}



/* =========================================================
   CHECK ADMIN
========================================================= */

async function checkAdmin(user){

  const db =
    client();


  if(!db || !user){

    return;

  }


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


  if(error || !data){

    await db.auth.signOut();


    if(loginMessage){

      loginMessage.textContent =
        "Access denied. This account is not an AGULIBRARY administrator.";

    }

    return;

  }


  loginPanel.classList.add(
    "hidden"
  );


  dashboardPanel.classList.remove(
    "hidden"
  );


  adminMessage.textContent =
    "Welcome to AGULIBRARY Admin.";


  /*
    Load invitations after admin
    authentication succeeds.
  */

  await loadInvitations();

}



/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
  document.getElementById(
    "logoutBtn"
  );


if(logoutButton){

  logoutButton.addEventListener(
    "click",
    async () => {

      const db =
        client();


      if(db){

        await db.auth.signOut();

      }


      dashboardPanel.classList.add(
        "hidden"
      );


      loginPanel.classList.remove(
        "hidden"
      );


      loginMessage.textContent =
        "You have signed out.";

    }
  );

}



/* =========================================================
   RESOURCE UPLOAD
========================================================= */

if(uploadForm){

  uploadForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      adminMessage.textContent =
        "Preparing upload...";


      const db =
        client();


      if(!db){

        adminMessage.textContent =
          "Supabase is not configured.";

        return;

      }


      const {
        data: sessionData
      } =
        await db.auth.getSession();


      if(!sessionData?.session){

        adminMessage.textContent =
          "Your session has expired. Please sign in again.";

        return;

      }


      const fileInput =
        document.getElementById(
          "file"
        );


      const file =
        fileInput.files[0];


      if(!file){

        adminMessage.textContent =
          "Please select a file.";

        return;

      }


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
        window.AGU_CONFIG.bucket;


      adminMessage.textContent =
        "Uploading file...";


      const upload =
        await db
          .storage
          .from(bucket)
          .upload(
            filePath,
            file,
            {
              cacheControl:"3600",
              upsert:false
            }
          );


      if(upload.error){

        adminMessage.textContent =
          "Upload failed: " +
          upload.error.message;

        return;

      }


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


      const {
        error
      } =
        await db
          .from("resources")
          .insert(
            resource
          );


      if(error){

        adminMessage.textContent =
          "The file uploaded, but the resource information could not be saved: " +
          error.message;

        return;

      }


      adminMessage.textContent =
        "✅ Resource uploaded and published successfully!";


      uploadForm.reset();

    }
  );

}



/* =========================================================
   INVITATION CODE GENERATOR
========================================================= */

function generateInvitationCode(){

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let code = "";


  for(
    let i = 0;
    i < 10;
    i++
  ){

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
   INVITATION LINK
========================================================= */

function createInvitationLink(code){

  const base =
    window.location.origin +
    window.location.pathname
      .replace(
        /admin\.html.*$/i,
        ""
      );


  return (
    base +
    "auth.html?invite=" +
    encodeURIComponent(
      code
    )
  );

}



/* =========================================================
   CREATE INVITATION
========================================================= */

if(invitationForm){

  invitationForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const db =
        client();


      if(!db){

        showInvitationMessage(
          "Supabase is not configured.",
          true
        );

        return;

      }


      const {
        data: sessionData
      } =
        await db.auth.getSession();


      if(!sessionData?.session){

        showInvitationMessage(
          "Your admin session has expired.",
          true
        );

        return;

      }


      showInvitationMessage(
        "Creating invitation..."
      );


      const studentName =
        document
          .getElementById(
            "invitationStudentName"
          )
          .value
          .trim();


      const studentEmail =
        document
          .getElementById(
            "invitationStudentEmail"
          )
          .value
          .trim();


      const note =
        document
          .getElementById(
            "invitationNote"
          )
          .value
          .trim();


      let code =
        generateInvitationCode();


      /*
        Check that the generated code
        does not already exist.
      */

      let attempts = 0;


      while(attempts < 5){

        const {
          data
        } =
          await db
            .from(
              "student_invitations"
            )
            .select("id")
            .eq(
              "code",
              code
            )
            .maybeSingle();


        if(!data){

          break;

        }


        code =
          generateInvitationCode();


        attempts++;

      }


      const invitation = {

        code,

        student_name:
          studentName || null,

        student_email:
          studentEmail || null,

        note:
          note || null,

        created_by:
          sessionData.session.user.id,

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


      if(error){

        console.error(
          "Invitation error:",
          error
        );


        showInvitationMessage(
          "Invitation could not be created: " +
          error.message,
          true
        );

        return;

      }


      const link =
        createInvitationLink(
          data.code
        );


      generatedCode.textContent =
        data.code;


      generatedLink.value =
        link;


      invitationResult.classList.add(
        "show"
      );


      showInvitationMessage(
        "✅ Invitation created successfully."
      );


      invitationForm.reset();


      await loadInvitations();

    }
  );

}



/* =========================================================
   INVITATION MESSAGE
========================================================= */

function showInvitationMessage(
  message,
  error = false
){

  if(!invitationMessage){

    return;

  }


  invitationMessage.textContent =
    message;


  invitationMessage.style.color =
    error
      ? "#b42323"
      : "#087f55";

}



/* =========================================================
   COPY INVITATION
========================================================= */

const copyButton =
  document.getElementById(
    "copyInvitationButton"
  );


if(copyButton){

  copyButton.addEventListener(
    "click",
    async () => {

      const link =
        generatedLink.value;


      if(!link){

        return;

      }


      try{

        await navigator.clipboard.writeText(
          link
        );


        copyButton.textContent =
          "✅ Copied!";


        setTimeout(
          () => {

            copyButton.textContent =
              "📋 Copy Link";

          },
          2000
        );


      }catch(error){

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


if(shareButton){

  shareButton.addEventListener(
    "click",
    async () => {

      const link =
        generatedLink.value;


      if(!link){

        return;

      }


      const text =
        "You are invited to join AGULIBRARY. Open this invitation link to register: " +
        link;


      if(
        navigator.share
      ){

        try{

          await navigator.share({

            title:
              "AGULIBRARY Student Invitation",

            text

          });

        }catch(error){

          console.log(
            "Share cancelled."
          );

        }

      }else{

        try{

          await navigator.clipboard.writeText(
            text
          );

          alert(
            "Invitation copied. You can paste it into WhatsApp, SMS or email."
          );

        }catch(error){

          alert(
            text
          );

        }

      }

    }
  );

}



/* =========================================================
   LOAD INVITATIONS
========================================================= */

async function loadInvitations(){

  if(!invitationList){

    return;

  }


  const db =
    client();


  if(!db){

    invitationList.innerHTML = `

      <div class="empty">
        Supabase is not configured.
      </div>

    `;

    return;

  }


  invitationList.innerHTML = `

    <div class="empty">
      Loading invitations...
    </div>

  `;


  const {
    data,
    error
  } =
    await db
      .from(
        "student_invitations"
      )
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  if(error){

    console.error(
      "Invitation list:",
      error
    );


    invitationList.innerHTML = `

      <div class="empty">

        Invitations could not be loaded.

        <br><br>

        Make sure the
        <strong>
          student_invitations
        </strong>
        table exists in Supabase.

      </div>

    `;

    return;

  }


  if(!data || !data.length){

    invitationList.innerHTML = `

      <div class="empty">

        No student invitations yet.

      </div>

    `;

    return;

  }


  invitationList.innerHTML =
    data.map(
      invitation => {

        const used =
          Boolean(
            invitation.used ||
            invitation.used_at
          );


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
            invitation.code
          );


        const id =
          escapeAttr(
            invitation.id
          );


        const status =
          used
            ? "USED"
            : "AVAILABLE";


        return `

          <div
            class="invitation-item">


            <div
              class="invitation-item-info">


              <div
                class="invitation-item-code">

                ${code}

              </div>


              <div>

                ${name}

              </div>


              <small>

                ${email}

              </small>


              <br>


              <span
                class="invitation-status ${
                  used
                    ? "used"
                    : "available"
                }">

                ${status}

              </span>


            </div>


            ${
              !used
                ? `

                  <button
                    class="cancel-invitation"
                    data-invitation-id="${id}">

                    Cancel

                  </button>

                `
                : ""
            }


          </div>

        `;

      }
    ).join("");


  invitationList
    .querySelectorAll(
      ".cancel-invitation"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            cancelInvitation(
              button.dataset.invitationId
            );

          }
        );

      }
    );

}



/* =========================================================
   CANCEL INVITATION
========================================================= */

async function cancelInvitation(id){

  if(
    !confirm(
      "Cancel this invitation?"
    )
  ){

    return;

  }


  const db =
    client();


  if(!db){

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
      );


  if(error){

    alert(
      "Unable to cancel invitation: " +
      error.message
    );

    return;

  }


  await loadInvitations();

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value){

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => {

      const entities = {

        "&":"&amp;",

        "<":"&lt;",

        ">":"&gt;",

        '"':"&quot;",

        "'":"&#039;"

      };


      return entities[
        character
      ];

    }
  );

}



/* =========================================================
   START INVITATION SYSTEM
========================================================= */

window.loadInvitations =
  loadInvitations;
