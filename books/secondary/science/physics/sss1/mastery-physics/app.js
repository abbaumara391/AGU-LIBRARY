// ============================================================
// MASTERY PHYSICS — App logic
// ============================================================

const state = {
  currentTerm: "t1",
  currentChapter: null,
  currentLessonIndex: 0,
  progress: loadProgress()
};

function loadProgress(){
  try{
    const raw = localStorage.getItem("masteryPhysicsProgress");
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function saveProgress(){
  try{ localStorage.setItem("masteryPhysicsProgress", JSON.stringify(state.progress)); }catch(e){}
}
function markRead(chapterIdx, lessonIdx){
  const key = chapterIdx+"_"+lessonIdx;
  state.progress[key] = true;
  saveProgress();
}
function chapterProgressPercent(chapterIdx){
  const ch = CHAPTERS[chapterIdx];
  if(!ch.lessons.length) return 0;
  let done = 0;
  ch.lessons.forEach((l,i)=>{ if(state.progress[chapterIdx+"_"+i]) done++; });
  return Math.round((done/ch.lessons.length)*100);
}

// ---------- Dark mode ----------
function toggleDark(){
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  if(next === "dark") document.documentElement.setAttribute("data-theme","dark");
  else document.documentElement.removeAttribute("data-theme");
  try{ localStorage.setItem("masteryPhysicsTheme", next); }catch(e){}
}
(function initTheme(){
  try{
    const saved = localStorage.getItem("masteryPhysicsTheme");
    if(saved === "dark") document.documentElement.setAttribute("data-theme","dark");
  }catch(e){}
})();

// ---------- Screen switching ----------
function showScreen(id){
  ["cover","library","reader","searchResults","resources","resourceReader","examScreen"].forEach(s=>{
    document.getElementById(s).classList.toggle("hidden", s !== id);
  });
}

// ---------- Cover ----------
document.getElementById("cover").addEventListener("click", ()=>{
  const book = document.getElementById("coverBook");
  book.classList.add("opening");
  setTimeout(()=>{
    showScreen("library");
    renderTermTabs();
    renderChapterList();
  }, 750);
});

// ---------- Term tabs ----------
function renderTermTabs(){
  const wrap = document.getElementById("termTabs");
  wrap.innerHTML = "";
  BOOK.terms.forEach(t=>{
    const btn = document.createElement("div");
    btn.className = "term-tab" + (t.id === state.currentTerm ? " active" : "");
    btn.textContent = t.label;
    btn.onclick = ()=>{ state.currentTerm = t.id; renderTermTabs(); renderChapterList(); };
    wrap.appendChild(btn);
  });
}

// ---------- Chapter list ----------
function renderChapterList(filterText){
  const wrap = document.getElementById("chapterList");
  wrap.innerHTML = "";
  CHAPTERS.forEach((ch, idx)=>{
    if(ch.term !== state.currentTerm) return;
    if(filterText && !ch.title.toLowerCase().includes(filterText.toLowerCase())) return;

    const card = document.createElement("div");
    card.className = "chapter-card";
    const pct = chapterProgressPercent(idx);
    const lessonCountLabel = ch.comingSoon
      ? "Coming in the next update"
      : (ch.lessons.length + (ch.lessons.length===1 ? " lesson" : " lessons"));

    card.innerHTML = `
      <div class="chapter-num">${idx+1}</div>
      <div class="chapter-body">
        <div class="chapter-title">${ch.title}</div>
        <div class="chapter-sub">${lessonCountLabel}</div>
        ${!ch.comingSoon ? `<div class="chapter-progress-wrap"><div class="chapter-progress-bar" style="width:${pct}%"></div></div>` : ``}
      </div>
      <div class="chapter-icon">${ch.icon}</div>
      <div class="chapter-arrow">›</div>
    `;
    card.onclick = ()=>{
      if(ch.comingSoon){
        alert("This chapter is being written next and will appear here once added — First Term is fully ready to study now.");
        return;
      }
      openChapter(idx);
    };
    wrap.appendChild(card);
  });

  if(!wrap.children.length){
    wrap.innerHTML = `<div style="text-align:center; color:var(--text-soft); padding:40px 20px;">No chapters found here yet.</div>`;
  }
}

// ---------- Reader ----------
function openChapter(chapterIdx, lessonIdx){
  state.currentChapter = chapterIdx;
  state.currentLessonIndex = lessonIdx || 0;
  showScreen("reader");
  renderLessonTrack();
}

function renderLessonTrack(){
  const ch = CHAPTERS[state.currentChapter];
  const track = document.getElementById("lessonTrack");
  track.innerHTML = "";
  ch.lessons.forEach((lesson, i)=>{
    const page = document.createElement("div");
    page.className = "lesson-page";
    page.innerHTML = `
      <div class="lesson-inner">
        <div class="lesson-kicker">${BOOK.terms.find(t=>t.id===ch.term).label} · Chapter ${state.currentChapter+1}</div>
        <div class="lesson-title">${lesson.title}</div>
        ${lesson.content}
        <div class="lesson-nav">
          <button class="nav-btn ghost" onclick="goLesson(${i-1})" ${i===0 ? "disabled style='opacity:.4;cursor:default;'" : ""}>← Previous</button>
          <button class="nav-btn" onclick="goLesson(${i+1})">${i===ch.lessons.length-1 ? "Finish chapter ✓" : "Next lesson →"}</button>
        </div>
      </div>
    `;
    track.appendChild(page);
  });
  updateCrumb();
  renderDots();
  scrollToLesson(state.currentLessonIndex, false);

  // mark current lesson as read as soon as it's opened
  markRead(state.currentChapter, state.currentLessonIndex);
  renderDots();
}

function updateCrumb(){
  const ch = CHAPTERS[state.currentChapter];
  document.getElementById("crumb").textContent =
    `Chapter ${state.currentChapter+1}: ${ch.title} — Lesson ${state.currentLessonIndex+1} of ${ch.lessons.length}`;
}

function renderDots(){
  const ch = CHAPTERS[state.currentChapter];
  const wrap = document.getElementById("dots");
  wrap.innerHTML = "";
  ch.lessons.forEach((_,i)=>{
    const d = document.createElement("div");
    d.className = "dot" + (i===state.currentLessonIndex ? " active" : "");
    wrap.appendChild(d);
  });
}

function scrollToLesson(i, smooth){
  const track = document.getElementById("lessonTrack");
  track.scrollTo({ left: i * track.clientWidth, behavior: smooth === false ? "auto" : "smooth" });
}

function goLesson(i){
  const ch = CHAPTERS[state.currentChapter];
  if(i < 0) return;
  if(i >= ch.lessons.length){
    // finished chapter — go back to library
    showScreen("library");
    renderChapterList();
    return;
  }
  state.currentLessonIndex = i;
  scrollToLesson(i, true);
  updateCrumb();
  renderDots();
  markRead(state.currentChapter, i);
}

document.getElementById("lessonTrack").addEventListener("scroll", function(){
  const track = this;
  const i = Math.round(track.scrollLeft / track.clientWidth);
  if(i !== state.currentLessonIndex && i >= 0){
    state.currentLessonIndex = i;
    updateCrumb();
    renderDots();
    markRead(state.currentChapter, i);
  }
}, { passive:true });

document.getElementById("backBtn").addEventListener("click", ()=>{
  showScreen("library");
  renderChapterList();
});

// ---------- MCQ interaction ----------
function checkMCQ(el, isCorrect){
  const parent = el.parentElement;
  Array.from(parent.querySelectorAll(".mcq-opt")).forEach(o=>{
    o.style.pointerEvents = "none";
  });
  el.classList.add(isCorrect ? "correct" : "wrong");
}

// ---------- Search ----------
function runSearch(query){
  const q = query.trim().toLowerCase();
  if(!q){ document.getElementById("searchResultsList").innerHTML=""; return; }
  const results = [];
  CHAPTERS.forEach((ch, ci)=>{
    if(ch.comingSoon) return;
    ch.lessons.forEach((lesson, li)=>{
      const hay = (ch.title + " " + lesson.title + " " + lesson.content).toLowerCase();
      if(hay.includes(q)){
        results.push({ci, li, chapterTitle: ch.title, lessonTitle: lesson.title});
      }
    });
  });
  const list = document.getElementById("searchResultsList");
  list.innerHTML = "";
  if(!results.length){
    list.innerHTML = `<div style="color:var(--text-soft); text-align:center; padding:30px;">No lessons found for "${query}".</div>`;
    return;
  }
  results.forEach(r=>{
    const div = document.createElement("div");
    div.className = "search-result";
    div.innerHTML = `<b>${r.chapterTitle}</b><br>${r.lessonTitle}`;
    div.onclick = ()=>{
      showScreen("reader");
      openChapter(r.ci, r.li);
    };
    list.appendChild(div);
  });
}

document.getElementById("searchBox").addEventListener("input", (e)=>{
  const q = e.target.value;
  if(q.trim().length > 1){
    showScreen("searchResults");
    runSearch(q);
  } else {
    showScreen("library");
  }
});
document.getElementById("closeSearch").addEventListener("click", ()=>{
  document.getElementById("searchBox").value = "";
  showScreen("library");
});

// ---------- Dark mode buttons ----------
document.getElementById("darkBtn").addEventListener("click", toggleDark);
document.getElementById("darkBtn2").addEventListener("click", toggleDark);
document.getElementById("darkBtn3").addEventListener("click", toggleDark);
document.getElementById("darkBtn4").addEventListener("click", toggleDark);
document.getElementById("darkBtn5").addEventListener("click", toggleDark);

// ---------- Resources navigation ----------
document.getElementById("resourcesBtn").addEventListener("click", ()=>{
  showScreen("resources"); renderResourceList();
});
document.getElementById("resourcesBtn2").addEventListener("click", ()=>{
  showScreen("resources"); renderResourceList();
});
document.getElementById("resourcesBackBtn").addEventListener("click", ()=>{
  showScreen("library"); renderChapterList();
});
document.getElementById("resourceReaderBackBtn").addEventListener("click", ()=>{
  showScreen("resources"); renderResourceList();
});
document.getElementById("examBackBtn").addEventListener("click", ()=>{
  showScreen("resources"); renderResourceList();
});

// ---------- Keyboard nav for reader ----------
document.addEventListener("keydown", (e)=>{
  const readerVisible = !document.getElementById("reader").classList.contains("hidden");
  if(!readerVisible) return;
  if(e.key === "ArrowRight") goLesson(state.currentLessonIndex+1);
  if(e.key === "ArrowLeft") goLesson(state.currentLessonIndex-1);
});

// ============================================================
// RESOURCES HUB — Formula Sheet, Reference Tables, Guides,
// Glossary, Alphabetical Index, Mock Examinations
// ============================================================
const RESOURCE_DEFS = [
  { key:"formulas", icon:"📐", title:"Physics Formula Sheet", sub:"Every formula from Term 1–3, grouped by topic" },
  { key:"siunits", icon:"📏", title:"SI Units & Prefixes", sub:"Standard units for every physical quantity" },
  { key:"constants", icon:"🔢", title:"Scientific Constants", sub:"Key constant values used in calculations" },
  { key:"symbols", icon:"🔤", title:"Physics Symbols", sub:"Quick reference for every symbol used in this book" },
  { key:"safety", icon:"🦺", title:"Laboratory Safety Rules", sub:"Stay safe during practicals" },
  { key:"practical", icon:"🧪", title:"Practical Physics Guide", sub:"How to take readings, tabulate results and plot graphs" },
  { key:"waec", icon:"⭐", title:"WAEC Revision Guide", sub:"Exam structure and strategy for WAEC Physics" },
  { key:"neco", icon:"🎓", title:"NECO Revision Guide", sub:"Exam structure and strategy for NECO Physics" },
  { key:"exams", icon:"📝", title:"Mock Examinations", sub:"Timed practice exams with full answer keys" },
  { key:"glossary", icon:"🔤", title:"Glossary", sub:"Every key term and definition, A–Z" },
  { key:"index", icon:"📖", title:"Alphabetical Index", sub:"Jump straight to any topic in the book" }
];

function renderResourceList(){
  const wrap = document.getElementById("resourceList");
  wrap.innerHTML = "";
  RESOURCE_DEFS.forEach(r=>{
    const card = document.createElement("div");
    card.className = "resource-card";
    card.innerHTML = `
      <div class="resource-icon">${r.icon}</div>
      <div class="resource-body">
        <div class="resource-title">${r.title}</div>
        <div class="resource-sub">${r.sub}</div>
      </div>
      <div class="chapter-arrow">›</div>
    `;
    card.onclick = ()=> openResource(r.key);
    wrap.appendChild(card);
  });
}

function openResource(key){
  if(key === "exams"){ renderExamList(); return; }
  showScreen("resourceReader");
  const def = RESOURCE_DEFS.find(r=>r.key===key);
  document.getElementById("resourceCrumb").textContent = def.title;
  const content = document.getElementById("resourceContent");
  const kicker = `<div class="res-kicker">Study Resources</div><div class="res-title">${def.title}</div>`;
  let body = "";
  switch(key){
    case "formulas": body = renderFormulaSheetHTML(); break;
    case "siunits": body = renderSIUnitsHTML(); break;
    case "constants": body = renderConstantsHTML(); break;
    case "symbols": body = renderSymbolsHTML(); break;
    case "safety": body = renderSafetyHTML(); break;
    case "practical": body = PRACTICAL_GUIDE_CONTENT; break;
    case "waec": body = WAEC_GUIDE_CONTENT; break;
    case "neco": body = NECO_GUIDE_CONTENT; break;
    case "glossary": body = renderGlossaryHTML(); break;
    case "index": body = renderIndexHTML(); break;
  }
  content.innerHTML = kicker + body;
  document.getElementById("resourceReader").scrollTop = 0;
}

function renderFormulaSheetHTML(){
  return FORMULA_SHEET.map(group => `
    <div class="formula-group">
      <h4>${group.icon} ${group.group}</h4>
      ${group.items.map(it => `
        <div class="formula-row">
          <div>
            <div class="formula-name">${it.name}</div>
            <div class="formula-expr">${it.formula}</div>
            ${it.note ? `<div class="formula-note">${it.note}</div>` : ``}
          </div>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderSIUnitsHTML(){
  let html = `<div class="section"><h4>📏 SI Base &amp; Derived Units</h4>${table(["Quantity","Symbol","SI Unit","Unit Symbol"], SI_UNITS_TABLE)}</div>`;
  html += `<div class="section"><h4>🔢 SI Prefixes</h4>${table(["Prefix","Symbol","Meaning"], SI_PREFIXES_TABLE)}</div>`;
  return html;
}
function renderConstantsHTML(){
  return `<div class="section"><h4>🔢 Scientific Constants</h4>${table(["Constant","Symbol","Value"], CONSTANTS_TABLE)}</div>`;
}
function renderSymbolsHTML(){
  return `<div class="section"><h4>🔤 Physics Symbols</h4>${table(["Symbol","Represents"], SYMBOLS_TABLE)}</div>`;
}
function renderSafetyHTML(){
  return `<div class="section"><h4>🦺 Laboratory Safety Rules</h4><ul class="safety-list">${LAB_SAFETY_RULES.map(r=>`<li>${r}</li>`).join("")}</ul></div>`;
}

function renderGlossaryHTML(){
  let html = "";
  let lastLetter = "";
  GLOSSARY_TERMS.forEach(g=>{
    const letter = g.term[0].toUpperCase();
    if(letter !== lastLetter){
      html += `<div class="glossary-letter">${letter}</div>`;
      lastLetter = letter;
    }
    const ch = CHAPTERS[g.ci];
    html += `<div class="glossary-item" onclick="jumpToLesson(${g.ci},${g.li})">
      <b>${g.term}</b>
      <div class="glossary-def">${g.def}</div>
      <div class="glossary-link">→ Chapter ${g.ci+1}: ${ch.title}</div>
    </div>`;
  });
  return html;
}

function renderIndexHTML(){
  let html = "";
  let lastLetter = "";
  GLOSSARY_TERMS.forEach(g=>{
    const letter = g.term[0].toUpperCase();
    if(letter !== lastLetter){
      html += `<div class="glossary-letter">${letter}</div>`;
      lastLetter = letter;
    }
    const ch = CHAPTERS[g.ci];
    const lesson = ch.lessons[g.li];
    html += `<div class="glossary-item" onclick="jumpToLesson(${g.ci},${g.li})">
      <b>${g.term}</b>
      <div class="glossary-link">Chapter ${g.ci+1}: ${ch.title} — ${lesson.title}</div>
    </div>`;
  });
  return html;
}

function jumpToLesson(ci, li){
  showScreen("reader");
  openChapter(ci, li);
}

// ============================================================
// MOCK EXAMS — selectable objective questions, submit & score,
// theory questions with revealable model answers, retake
// ============================================================
const examState = {}; // examId -> {answers:{qIdx:optIdx}, submitted:bool, revealed:{theoryIdx:bool}}

function renderExamList(){
  showScreen("resourceReader");
  document.getElementById("resourceCrumb").textContent = "Mock Examinations";
  const content = document.getElementById("resourceContent");
  content.innerHTML = `<div class="res-kicker">Study Resources</div><div class="res-title">Mock Examinations</div>`;
  MOCK_EXAMS.forEach(exam=>{
    const card = document.createElement("div");
    card.className = "resource-card";
    card.style.marginBottom = "12px";
    card.innerHTML = `
      <div class="resource-icon">📝</div>
      <div class="resource-body">
        <div class="resource-title">${exam.title}</div>
        <div class="resource-sub">${exam.subtitle}</div>
        <div class="resource-sub">⏱ ${exam.duration} · ${exam.objectives.length} objective + ${exam.theory.length} theory questions</div>
      </div>
      <div class="chapter-arrow">›</div>
    `;
    card.onclick = ()=> openExam(exam.id);
    content.appendChild(card);
  });
  document.getElementById("resourceReader").scrollTop = 0;
}

function openExam(examId){
  if(!examState[examId]) examState[examId] = { answers:{}, submitted:false, revealed:{} };
  showScreen("examScreen");
  const exam = MOCK_EXAMS.find(e=>e.id===examId);
  document.getElementById("examCrumb").textContent = exam.title;
  renderExam(examId);
  document.getElementById("examScreen").scrollTop = 0;
}

function renderExam(examId){
  const exam = MOCK_EXAMS.find(e=>e.id===examId);
  const st = examState[examId];
  const content = document.getElementById("examContent");
  let html = `<div class="res-kicker">Mock Examination</div><div class="res-title">${exam.title}</div>
    <div class="exam-meta">⏱ ${exam.duration} · ${exam.subtitle}</div>`;

  if(st.submitted){
    let score = 0;
    exam.objectives.forEach((q,i)=>{ if(st.answers[i] === q.correct) score++; });
    const pct = Math.round((score/exam.objectives.length)*100);
    html += `<div class="exam-score-banner">
      <div class="score-num">${score} / ${exam.objectives.length}</div>
      <div>Objective score — ${pct}%</div>
    </div>`;
  }

  html += `<div class="section"><h4>✅ Objective Questions</h4></div>`;
  content.innerHTML = html;

  const objWrap = document.createElement("div");
  exam.objectives.forEach((q,i)=>{
    const div = document.createElement("div");
    div.className = "mcq";
    const selected = st.answers[i];
    div.innerHTML = `<div class="mcq-q">${i+1}. ${q.q}</div>` + q.opts.map((o,j)=>{
      let cls = "mcq-opt";
      if(st.submitted){
        if(j === q.correct) cls += " correct";
        else if(j === selected) cls += " wrong";
      } else if(j === selected){
        cls += " selected";
      }
      return `<div class="${cls}" data-ei="${i}" data-oi="${j}">${String.fromCharCode(65+j)}. ${o}</div>`;
    }).join("");
    objWrap.appendChild(div);
  });
  content.appendChild(objWrap);

  if(!st.submitted){
    objWrap.querySelectorAll(".mcq-opt").forEach(opt=>{
      opt.addEventListener("click", ()=>{
        const ei = +opt.dataset.ei, oi = +opt.dataset.oi;
        st.answers[ei] = oi;
        renderExam(examId);
      });
    });
  }

  const theorySection = document.createElement("div");
  theorySection.className = "section";
  theorySection.innerHTML = `<h4>📝 Theory Questions</h4>`;
  exam.theory.forEach((t,i)=>{
    const item = document.createElement("div");
    item.className = "theory-item";
    const revealed = st.revealed[i];
    item.innerHTML = `<div class="theory-q">${i+1}. ${t.q}</div>
      <button class="reveal-btn" data-ti="${i}">${revealed ? "Hide model answer" : "Show model answer"}</button>
      ${revealed ? `<div class="theory-guide">${t.guide}</div>` : ``}`;
    theorySection.appendChild(item);
  });
  content.appendChild(theorySection);
  theorySection.querySelectorAll(".reveal-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const ti = +btn.dataset.ti;
      st.revealed[ti] = !st.revealed[ti];
      renderExam(examId);
    });
  });

  const actionBar = document.createElement("div");
  actionBar.className = "exam-submit-bar";
  if(!st.submitted){
    const unanswered = exam.objectives.length - Object.keys(st.answers).length;
    actionBar.innerHTML = `<button class="nav-btn" id="submitExamBtn">Submit Exam${unanswered>0 ? ` (${unanswered} unanswered)` : ``}</button>`;
    content.appendChild(actionBar);
    document.getElementById("submitExamBtn").addEventListener("click", ()=>{
      st.submitted = true;
      renderExam(examId);
      document.getElementById("examScreen").scrollTop = 0;
    });
  } else {
    actionBar.innerHTML = `<button class="nav-btn ghost" id="retakeExamBtn">↺ Retake Exam</button>`;
    content.appendChild(actionBar);
    document.getElementById("retakeExamBtn").addEventListener("click", ()=>{
      examState[examId] = { answers:{}, submitted:false, revealed:{} };
      renderExam(examId);
      document.getElementById("examScreen").scrollTop = 0;
    });
  }
}
