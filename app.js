document.getElementById('year').textContent=new Date().getFullYear();
function notice(name){alert(name+' is ready. In the next phase this area will connect to your uploaded resources.')}
function payment(){alert('The premium payment area is ready for secure gateway integration.')}
function toggleMenu(){const n=document.getElementById('navLinks');n.style.display=n.style.display==='flex'?'none':'flex';n.style.position='absolute';n.style.top='76px';n.style.right='5%';n.style.background='#fff';n.style.padding='18px';n.style.borderRadius='15px';n.style.boxShadow='0 15px 40px #123b2820';n.style.flexDirection='column'}
function openAI(){document.getElementById('aiModal').classList.add('open');document.getElementById('aiInput').focus()}
function closeAI(e){if(!e||e.target.id==='aiModal')document.getElementById('aiModal').classList.remove('open')}
function sendAI(){const i=document.getElementById('aiInput'),q=i.value.trim();if(!q)return;const c=document.getElementById('chat');c.insertAdjacentHTML('beforeend','<div class="user">'+escapeHTML(q)+'</div>');i.value='';setTimeout(()=>c.insertAdjacentHTML('beforeend','<div class="bubble">I am the AGULIBRARY demo learning agent. I can guide you around the library and help with study questions. A secure live AI connection can be added later.</div>'),350);c.scrollTop=c.scrollHeight}
function escapeHTML(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function searchResources(){const q=document.getElementById('search').value.trim();if(q.length>2)document.getElementById('subjects').scrollIntoView({behavior:'smooth'})}
