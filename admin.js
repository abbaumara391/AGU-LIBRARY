const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");

const loginForm = document.getElementById("loginForm");
const uploadForm = document.getElementById("uploadForm");

const loginMessage = document.getElementById("loginMessage");
const adminMessage = document.getElementById("adminMessage");


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const client = initSupabase();

  if (!client) {

    loginMessage.textContent =
      "Supabase is not configured. Check config.js.";

    return;
  }


  // Check whether an admin is already logged in

  const { data } =
    await client.auth.getSession();


  if (data.session) {

    await checkAdmin(
      data.session.user
    );

  }

});



// ==========================================
// ADMIN LOGIN
// ==========================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    loginMessage.textContent =
      "Signing in...";


    const client =
      getSupabase();


    if (!client) {

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


    const { data, error } =
      await client.auth.signInWithPassword({

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

  }
);



// ==========================================
// CHECK ADMIN
// ==========================================

async function checkAdmin(user) {

  const client =
    getSupabase();


  if (!client || !user) {

    return;
  }


  const { data, error } =
    await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();


  if (error || !data) {

    await client.auth.signOut();


    loginMessage.textContent =
      "Access denied. This account is not an AGULIBRARY administrator.";

    return;
  }


  // Admin confirmed

  loginPanel.classList.add(
    "hidden"
  );


  dashboardPanel.classList.remove(
    "hidden"
  );


  adminMessage.textContent =
    "Welcome to AGULIBRARY Admin.";

}



// ==========================================
// LOGOUT
// ==========================================

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async () => {

      const client =
        getSupabase();


      if (client) {

        await client.auth.signOut();

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



// ==========================================
// UPLOAD RESOURCE
// ==========================================

uploadForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    adminMessage.textContent =
      "Preparing upload...";


    const client =
      getSupabase();


    if (!client) {

      adminMessage.textContent =
        "Supabase is not configured.";

      return;
    }


    // Check current session

    const { data: sessionData } =
      await client.auth.getSession();


    if (!sessionData.session) {

      adminMessage.textContent =
        "Your session has expired. Please sign in again.";

      return;
    }



    // Get selected file

    const fileInput =
      document.getElementById("file");


    const file =
      fileInput.files[0];


    if (!file) {

      adminMessage.textContent =
        "Please select a file.";

      return;
    }



    // Create safe file name

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



    // ======================================
    // UPLOAD TO SUPABASE STORAGE
    // ======================================

    const upload =
      await client
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



    // ======================================
    // GET PUBLIC FILE URL
    // ======================================

    const publicUrl =
      client
        .storage
        .from(bucket)
        .getPublicUrl(filePath)
        .data
        .publicUrl;



    adminMessage.textContent =
      "File uploaded. Saving resource information...";



    // ======================================
    // CREATE DATABASE RECORD
    // ======================================

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



    const { error } =
      await client
        .from("resources")
        .insert(resource);



    // ======================================
    // DATABASE ERROR
    // ======================================

    if (error) {

      adminMessage.textContent =
        "The file uploaded, but the resource information could not be saved: " +
        error.message;

      return;
    }



    // ======================================
    // SUCCESS
    // ======================================

    adminMessage.textContent =
      "✅ Resource uploaded and published successfully!";


    uploadForm.reset();

  }
);