let supabaseClient = null;
function initSupabase(){
  const c=window.AGU_CONFIG||{};
  if(!window.supabase || !c.supabaseUrl || !c.supabaseAnonKey ||
     c.supabaseAnonKey==="PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE") return null;
  supabaseClient=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);
  return supabaseClient;
}
function getSupabase(){return supabaseClient||initSupabase();}
