document.addEventListener("DOMContentLoaded",()=>{document.getElementById("status").textContent=getSupabase()?"Supabase configuration loaded.":"Add your publishable key to config.js.";});
document.getElementById("uploadForm").addEventListener("submit",async e=>{
 e.preventDefault();const c=getSupabase(),out=document.getElementById("result");if(!c){out.textContent="Supabase is not configured.";return;}
 const f=document.getElementById("file").files[0];if(!f)return;out.textContent="Uploading...";
 const path=Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"_"),bucket=AGU_CONFIG.bucket;
 const up=await c.storage.from(bucket).upload(path,f,{cacheControl:"3600",upsert:false});
 if(up.error){out.textContent="Upload failed: "+up.error.message;return;}
 const url=c.storage.from(bucket).getPublicUrl(path).data.publicUrl;
 const row={title:title.value.trim(),description:description.value.trim(),type:type.value,subject:subject.value.trim(),level:level.value.trim(),class_level:classLevel.value.trim(),file_url:url,is_premium:premium.checked};
 const ins=await c.from("resources").insert(row);
 out.textContent=ins.error?"File uploaded, but database record failed: "+ins.error.message:"✅ Uploaded and published.";
 if(!ins.error)e.target.reset();
});
