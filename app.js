let allResources=[];
document.addEventListener("DOMContentLoaded",async()=>{initSupabase();await loadResources();});
async function loadResources(){
 const c=getSupabase(),g=document.getElementById("resourceGrid");
 if(!c){g.textContent="Supabase is not connected yet. Add your publishable key in config.js.";return;}
 const {data,error}=await c.from("resources").select("*").order("created_at",{ascending:false});
 if(error){g.textContent="Supabase is connected, but the resources table is not ready yet.";return;}
 allResources=data||[];renderResources(allResources);
}
function renderResources(list){
 const g=document.getElementById("resourceGrid");
 if(!list.length){g.textContent="No resources have been published yet.";return;}
 g.innerHTML=list.map(r=>`<article onclick="openResource('${safe(r.file_url||"")}')"><div class="thumb">${icon(r.type)}</div><b>${safe(r.title||"Untitled")}</b><small>${safe(r.description||"")}</small></article>`).join("");
}
function filterResources(){const q=document.getElementById("search").value.toLowerCase();renderResources(allResources.filter(r=>(r.title+" "+r.description+" "+r.subject+" "+r.type).toLowerCase().includes(q)));}
function openResource(u){if(u)window.open(u,"_blank");else alert("No file URL yet.");}
function icon(t){return ({book:"📚",pdf:"📄",video:"🎥",photo:"🖼️",course:"🎓",lesson:"📖"})[(t||"").toLowerCase()]||"📘";}
function safe(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
