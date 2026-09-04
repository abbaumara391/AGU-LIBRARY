/* =========================================================
AGULIBRARY — APP.JS
PHASE 2 — SUBJECT + RESOURCE + LESSON CONNECTION
DIGITAL BOOK OPENING FIX
========================================================= */

let allResources = [];
let currentSubject = "";
let currentSubjectId = "";

/* =========================================================
START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

const year =
document.getElementById("year");

if (year) {
year.textContent =
new Date().getFullYear();
}

if (typeof initSupabase === "function") {
initSupabase();
}

readSubjectFromURL();

await loadResources();

setupSearch();

setupSubjectCards();

updateStudentAccountButton();

});

/* =========================================================
READ SUBJECT FROM URL
========================================================= */

function readSubjectFromURL() {

const params =
new URLSearchParams(
window.location.search
);

currentSubject =
params.get("subject") || "";

currentSubjectId =
params.get("subject_id") || "";

}

/* =========================================================
LOAD RESOURCES FROM SUPABASE
========================================================= */

async function loadResources() {

const grid =
document.getElementById(
"resourceGrid"
);

if (!grid) return;

const client =
typeof getSupabase === "function"
? getSupabase()
: null;

if (!client) {

grid.innerHTML = `

<div class="empty">

AGULIBRARY is waiting for the
Supabase connection.

<br><br>

Please check config.js.

</div>

`;

return;

}

try {

const {
data,
error
} =
await client
.from("resources")
.select("*")
.order(
"created_at",
{
ascending: false
}
);

if (error) {

console.error(
"Resource loading error:",
error
);

grid.innerHTML = `

<div class="empty">

The AGULIBRARY database
could not load resources.

</div>

`;

return;

}

allResources =
data || [];

applyResourceFilters();

} catch (error) {

console.error(error);

grid.innerHTML = `

<div class="empty">

Unable to load AGULIBRARY
resources right now.

</div>

`;

}

}

/* =========================================================
FILTER RESOURCES
========================================================= */

function applyResourceFilters() {

const search =
document.getElementById(
"search"
);

const query =
search
? search.value
.toLowerCase()
.trim()
: "";

const filtered =
allResources.filter(
resource => {

const subjectName =
String(
resource.subject ||
resource.subject_name ||
""
).toLowerCase();

const resourceSubjectId =
String(
resource.subject_id ||
""
);

let matchesSubject = true;

if (currentSubject) {

matchesSubject =
subjectName ===
currentSubject.toLowerCase()

||

subjectName.includes(
currentSubject.toLowerCase()
);

}

if (currentSubjectId) {

matchesSubject =
matchesSubject ||

resourceSubjectId ===
String(currentSubjectId);

}

const searchableText = `

$`{resource.title || ""}

`${resource.description || ""}

$`{resource.subject || ""}

`${resource.subject_name || ""}

$`{resource.type || ""}

`${resource.level || ""}

$`{resource.class_level || ""}

`${resource.term || ""}

$`{resource.course || ""}

`${resource.chapter || ""}

$`{resource.lesson || ""}

`${resource.lesson_title || ""}

`.toLowerCase();

const matchesSearch =
!query ||
searchableText.includes(
query
);

return (
matchesSubject &&
matchesSearch
);

}
);

renderResources(
filtered
);

updateSubjectHeading();

}

/* =========================================================
RENDER RESOURCES
========================================================= */

function renderResources(list) {

const grid =
document.getElementById(
"resourceGrid"
);

if (!grid) return;

if (!list.length) {

grid.innerHTML = `

<div class="empty">

latex
{ currentSubject ? ` No resources found for &lt;strong&gt; 

{escapeHTML(
currentSubject
)}
</strong>.
:
No educational resources
have been published yet.
`
}

</div>

`;

return;

}

grid.innerHTML =
list.map(
resource => {

const id =
escapeAttr(
resource.id
);

const title =
escapeHTML(
resource.title ||
"Untitled Resource"
);

const description =
escapeHTML(
resource.description ||
"Educational resource"
);

const typeValue =
String(
resource.type ||
"resource"
)
.toLowerCase()
.trim();

const type =
escapeHTML(
typeValue.toUpperCase()
);

const subject =
escapeHTML(
resource.subject ||
resource.subject_name ||
""
);

/*
LESSONS AND COURSES
CONTINUE TO OPEN THROUGH
lesson.html.

DIGITAL BOOKS ARE DIFFERENT:
THEY OPEN THEIR ACTUAL
UPLOADED FILE URL.
*/

const isLesson =
typeValue === "lesson" ||
typeValue === "course";

const isDigitalBook =
typeValue === "digital_book";

const buttonText =
isDigitalBook
? "📚 Open Book →"
: isLesson
? "📖 Open Lesson →"
: "Tap to open →";

return `

<article
class="card"
data-resource-id="{id}')">

<div class="thumb">

$`{getResourceIcon(
resource.type
)}

</div>

<span>

`${type}

</span>

<h3>

$`{title}

</h3>

${ subject ?
<small
style="
display:block;
margin-top:5px;
color:#087a4b;
font-weight:800;
">

$`{subject}

</small>
`
: ""
}

<p>

`${description}

</p>

<b>

${buttonText}

</b>

</article>

`;

}
).join("");

}

/* =========================================================
SUBJECT HEADING
========================================================= */

function updateSubjectHeading() {

const heading =
document.querySelector(
"#resources h2"
);

const description =
document.querySelector(
"#resources .muted"
);

if (!heading) return;

if (currentSubject) {

heading.textContent =
currentSubject +
" Resources";

if (description) {

description.textContent =
"Learning resources available for " +
currentSubject +
".";

}

} else {

heading.textContent =
"Latest learning resources";

if (description) {

description.textContent =
"Published resources appear here.";

}

}

}

/* =========================================================
SEARCH
========================================================= */

function filterResources() {

applyResourceFilters();

}

function setupSearch() {

const search =
document.getElementById(
"search"
);

const button =
document.getElementById(
"searchButton"
);

if (search) {

search.addEventListener(
"input",
() => {

applyResourceFilters();

}
);

}

if (button) {

button.addEventListener(
"click",
() => {

applyResourceFilters();

}
);

}

}

/* =========================================================
SUBJECT CARDS ON INDEX PAGE
========================================================= */

function setupSubjectCards() {

document
.querySelectorAll(
".subjects > div"
)
.forEach(card => {

card.addEventListener(
"click",
() => {

const subject =
card.dataset.subject;

if (!subject) return;

window.location.href =
"subjects.html?subject=" +
encodeURIComponent(
subject
);

}
);

});

}

/* =========================================================
OPEN RESOURCE BY DATABASE ID
========================================================= */

function openResourceById(id) {

const resource =
allResources.find(
item =>
String(item.id) ===
String(id)
);

if (!resource) {

alert(
"This AGULIBRARY resource could not be found."
);

return;

}

openResource(
resource
);

}

/* =========================================================
OPEN RESOURCE
========================================================= */

function openResource(resource) {

const type =
String(
resource.type ||
""
)
.toLowerCase()
.trim();

/* =======================================================
DIGITAL BOOK

THIS IS THE ONLY NEW BEHAVIOUR.

DIGITAL BOOKS OPEN THE ACTUAL
FILE STORED IN SUPABASE.

THEY DO NOT OPEN lesson.html.
======================================================= */

if (type === "digital_book") {

const url =
resource.file_url ||
resource.url ||
"";

if (!url) {

alert(
"This digital book does not have a file attached yet."
);

return;

}

/*
Open the uploaded digital book.
*/

window.open(
url,
"_blank",
"noopener,noreferrer"
);

return;

}

/* =======================================================
LESSON / COURSE

EXISTING BEHAVIOUR PRESERVED.
======================================================= */

if (
type === "lesson" ||
type === "course"
) {

window.location.href =
"lesson.html?id=" +
encodeURIComponent(
resource.id
);

return;

}

/* =======================================================
NORMAL RESOURCE

EXISTING BEHAVIOUR PRESERVED.
======================================================= */

const url =
resource.file_url ||
resource.url ||
"";

if (!url) {

alert(
"This resource does not have a file attached yet."
);

return;

}

window.open(
url,
"_blank",
"noopener,noreferrer"
);

}

/* =========================================================
BACKWARD COMPATIBILITY
Allows old calls such as:

openResourceURL("https://...")
========================================================= */

function openResourceURL(url) {

if (!url) {

alert(
"This resource does not have a file attached yet."
);

return;

}

window.open(
url,
"_blank",
"noopener,noreferrer"
);

}

/* =========================================================
RESOURCE ICONS
========================================================= */

function getResourceIcon(type) {

const icons = {

book: "📚",

digital_book: "📚",

pdf: "📄",

video: "🎥",

photo: "🖼️",

image: "🖼️",

course: "🎓",

lesson: "📖",

document: "📄",

audio: "🎧"

};

return (
icons[
String(
type || ""
).toLowerCase()
 ]
||
"📘"
);

}

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHTML(value) {

return String(
value ?? ""
).replace(
/[&<>"']/g,
character => {

const entities = {

"&": "&",

"<": "<",

">": ">",

'"': """,

"'": "'"

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
"`"
);

}

/* =========================================================
GLOBAL SEARCH SUPPORT
========================================================= */

window.filterResources =
filterResources;

window.openResource =
openResource;

window.openResourceById =
openResourceById;

window.openResourceURL =
openResourceURL;

window.loadResources =
loadResources;

/* =========================================================
SUBJECT NAVIGATION HELPER
========================================================= */

function openSubject(subject) {

if (!subject) return;

window.location.href =
"subjects.html?subject=" +
encodeURIComponent(
subject
);

}

window.openSubject =
openSubject;

/* =========================================================
SUPABASE AUTH SESSION
========================================================= */

async function updateStudentAccountButton() {

const accountButton =
document.getElementById(
"accountButton"
);

const studentBar =
document.getElementById(
"studentBar"
);

const studentWelcome =
document.getElementById(
"studentWelcome"
);

if (!accountButton) return;

const client =
typeof getSupabase === "function"
? getSupabase()
: null;

if (!client) return;

try {

const {
data
} =
await client.auth.getSession();

const session =
data?.session;

if (!session) {

return;

}

const user =
session.user;

const name =
user.user_metadata?.full_name ||

user.user_metadata?.name ||

user.email?.split("@")[0] ||

"Student";

accountButton.textContent =
"🎓 My Account";

accountButton.href =
"student.html";

if (studentBar) {

studentBar.classList.add(
"show"
);

}

if (studentWelcome) {

studentWelcome.textContent =
"Welcome, " +
name;

}

} catch(error) {

console.error(
"Student session:",
error
);

}

}

/* =========================================================
   AGULIBRARY AI TEACHER DISPLAY RENDERER
   SAFE ADDITION — DOES NOT CHANGE AI CONNECTION OR APP LOGIC
   ========================================================= */
(function setupAITeacherDisplayRenderer(){
  "use strict";

  function escapeAIHTML(value){
    return String(value ?? "").replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];
    });
  }

  function inlineAIFormat(value){
    let s = escapeAIHTML(value);

    /* Protect inline code first */
    const code=[];
    s=s.replace(/`([^`]+)`/g,function(_,x){
      const i=code.length;
      code.push("<code>"+x+"</code>");
      return "\u0000CODE"+i+"\u0000";
    });

    /* Basic Markdown emphasis */
    s=s.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>");
    s=s.replace(/__([^_\n]+)__/g,"<strong>$1</strong>");
    s=s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,"<em>$1</em>");
    s=s.replace(/(?<!_)_([^_\n]+)_(?!_)/g,"<em>$1</em>");

    s=s.replace(/\u0000CODE(\d+)\u0000/g,function(_,i){return code[Number(i)];});
    return s;
  }

  function renderAIMessage(text){
    const source=String(text ?? "").replace(/\r\n?/g,"\n").trim();
    if(!source) return "";

    const lines=source.split("\n");
    let html="";
    let inCode=false, codeLines=[];
    let inUl=false, inOl=false, inQuote=false;

    function closeLists(){
      if(inUl){html+="</ul>";inUl=false;}
      if(inOl){html+="</ol>";inOl=false;}
    }
    function closeQuote(){
      if(inQuote){html+="</blockquote>";inQuote=false;}
    }
    function flushCode(){
      if(codeLines.length){
        html+="<pre><code>"+escapeAIHTML(codeLines.join("\n"))+"</code></pre>";
        codeLines=[];
      }
    }

    for(let i=0;i<lines.length;i++){
      const line=lines[i];

      if(/^```/.test(line.trim())){
        if(inCode){
          flushCode();
          html+="</div>";
          inCode=false;
        }else{
          closeLists(); closeQuote();
          html+='<div class="ai-code">';
          inCode=true;
        }
        continue;
      }

      if(inCode){
        codeLines.push(line);
        continue;
      }

      if(!line.trim()){
        closeLists(); closeQuote();
        continue;
      }

      let m=line.match(/^(#{1,6})\s+(.+)$/);
      if(m){
        closeLists(); closeQuote();
        const level=m[1].length;
        html+="<h"+level+">"+inlineAIFormat(m[2])+"</h"+level+">";
        continue;
      }

      if(/^[-*+]\s+/.test(line)){
        closeQuote();
        if(!inUl){closeLists();html+="<ul>";inUl=true;}
        html+="<li>"+inlineAIFormat(line.replace(/^[-*+]\s+/,""))+"</li>";
        continue;
      }

      m=line.match(/^\d+[.)]\s+(.+)$/);
      if(m){
        closeQuote();
        if(!inOl){closeLists();html+="<ol>";inOl=true;}
        html+="<li>"+inlineAIFormat(m[1])+"</li>";
        continue;
      }

      if(/^>\s?/.test(line)){
        closeLists();
        if(!inQuote){html+="<blockquote>";inQuote=true;}
        html+="<p>"+inlineAIFormat(line.replace(/^>\s?/,""))+"</p>";
        continue;
      }

      if(/^(---+|\*\*\*+|___+)\s*$/.test(line)){
        closeLists(); closeQuote();
        html+="<hr>";
        continue;
      }

      closeLists(); closeQuote();

      /* Display LaTeX delimiters as text until MathJax is ready. */
      html+="<p>"+inlineAIFormat(line)+"</p>";
    }

    if(inCode){flushCode();html+="</div>";}
    closeLists(); closeQuote();

    return html;
  }

  function loadMathJax(){
    if(window.MathJax || document.getElementById("aguMathJax")) return;

    window.MathJax={
      tex:{
        inlineMath:[["\\(","\\)"],["$","$"]],
        displayMath:[["\\[","\\]"],["$$","$$"]]
      },
      options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]}
    };

    const script=document.createElement("script");
    script.id="aguMathJax";
    script.async=true;
    script.src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    document.head.appendChild(script);
  }

  function formatTeacherMessage(el){
    if(!el || el.classList.contains("user") || el.dataset.aguRendered==="1") return;

    const raw=el.textContent || "";
    if(!raw.trim()) return;

    el.dataset.aguRendered="1";
    el.classList.add("ai-response");
    el.innerHTML=renderAIMessage(raw);

    if(/[\\$][\\(\[]|\\\[|\\\]|\\begin\{|\\frac|\\sqrt|\\times|\\sum|\\int|\\alpha|\\beta|\\theta/.test(raw)){
      loadMathJax();
      if(window.MathJax && typeof window.MathJax.typesetPromise==="function"){
        window.MathJax.typesetPromise([el]).catch(function(){});
      }
    }
  }

  function watchTeacherChat(){
    const chat=document.getElementById("teacherChat");
    if(!chat || chat.dataset.aguRendererReady==="1") return;

    chat.dataset.aguRendererReady="1";

    const observer=new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        mutation.addedNodes.forEach(function(node){
          if(node.nodeType===1 && node.classList.contains("msg")){
            formatTeacherMessage(node);
          }
        });
      });
    });

    observer.observe(chat,{childList:true});

    chat.querySelectorAll(".msg:not(.user)").forEach(formatTeacherMessage);
  }

  function start(){
    watchTeacherChat();
    /* The AI panel is already present on the page, but this retry
       also keeps the renderer safe if the DOM is assembled later. */
    let tries=0;
    const timer=setInterval(function(){
      watchTeacherChat();
      if(++tries>=20) clearInterval(timer);
    },250);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();
