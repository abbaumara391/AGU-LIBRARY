/* =========================================================
   AGULIBRARY — SUPABASE CLIENT
========================================================= */

let supabaseClient = null;


/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

function initSupabase() {

  /* -------------------------------------------------------
     If already initialized, return the existing client.
     This prevents the client from being created twice.
  ------------------------------------------------------- */

  if (supabaseClient) {
    return supabaseClient;
  }


  const config =
    window.AGU_CONFIG || {};


  /* -------------------------------------------------------
     IMPORTANT:
     At this moment window.supabase is still the
     Supabase JavaScript library loaded from the CDN.
  ------------------------------------------------------- */

  const supabaseLibrary =
    window.supabase;


  if (
    !supabaseLibrary ||
    typeof supabaseLibrary.createClient !== "function"
  ) {

    console.error(
      "AGULIBRARY: Supabase library was not loaded."
    );

    return null;
  }


  /* -------------------------------------------------------
     Check configuration
  ------------------------------------------------------- */

  if (
    !config.supabaseUrl ||
    !config.supabaseAnonKey ||
    config.supabaseAnonKey ===
      "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
  ) {

    console.error(
      "AGULIBRARY: Supabase configuration is missing."
    );

    return null;
  }


  /* -------------------------------------------------------
     Create the actual Supabase client
  ------------------------------------------------------- */

  try {

    supabaseClient =
      supabaseLibrary.createClient(
        config.supabaseUrl,
        config.supabaseAnonKey
      );


    /* -----------------------------------------------------
       Make the client available to the rest of AGULIBRARY.

       Your existing index.html uses:

       supabase.auth.getSession()

       Therefore we expose the client as window.supabase.
    ----------------------------------------------------- */

    window.supabase =
      supabaseClient;


    /* Also expose a clearly named client. */

    window.supabaseClient =
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

  if (supabaseClient) {
    return supabaseClient;
  }

  return initSupabase();

}


/* =========================================================
   INITIALIZE AFTER PAGE LOAD
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
