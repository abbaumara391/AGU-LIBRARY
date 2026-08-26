let supabaseClient = null;

/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

function initSupabase() {

  const c = window.AGU_CONFIG || {};

  if (
    !window.supabase ||
    !c.supabaseUrl ||
    !c.supabaseAnonKey ||
    c.supabaseAnonKey === "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
  ) {

    console.error(
      "AGULIBRARY: Supabase configuration is missing."
    );

    return null;
  }


  try {

    supabaseClient =
      window.supabase.createClient(
        c.supabaseUrl,
        c.supabaseAnonKey
      );


    /* -----------------------------------------------------
       IMPORTANT
       Make the client available as "supabase"
       because index.html uses supabase.auth
    ----------------------------------------------------- */

    window.supabaseClient =
      supabaseClient;


    window.supabase =
      supabaseClient;


    console.log(
      "AGULIBRARY: Supabase initialized successfully."
    );


    return supabaseClient;

  } catch (error) {

    console.error(
      "AGULIBRARY: Supabase initialization failed:",
      error
    );

    supabaseClient = null;

    return null;
  }

}


/* =========================================================
   GET SUPABASE CLIENT
========================================================= */

function getSupabase() {

  return (
    supabaseClient ||
    initSupabase()
  );

}


/* =========================================================
   INITIALIZE WHEN PAGE LOADS
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function() {
      initSupabase();
    }
  );

} else {

  initSupabase();

}
