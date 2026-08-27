// ============================================================
// MASTERY PHYSICS — Content data
// Term 1 is fully written out below with complete lesson content.
// Term 2 and Term 3 chapter shells are included so the app's
// structure is ready — their lessons will be filled in next.
// ============================================================

const BOOK = {
  title: "MASTERY PHYSICS",
  terms: [
    { id: "t1", label: "First Term", status: "ready" },
    { id: "t2", label: "Second Term", status: "inprogress" },
    { id: "t3", label: "Third Term", status: "inprogress" }
  ]
};

function diagramCircuit(){
  return `<div class="diagram"><svg width="260" height="120" viewBox="0 0 260 120">
    <rect x="20" y="50" width="220" height="2" fill="#1565C0"/>
    <rect x="20" y="50" width="2" height="40" fill="#1565C0"/>
    <rect x="238" y="50" width="2" height="40" fill="#1565C0"/>
    <rect x="20" y="88" width="220" height="2" fill="#1565C0"/>
    <circle cx="130" cy="51" r="16" fill="none" stroke="#E8A400" stroke-width="3"/>
    <line x1="119" y1="40" x2="141" y2="62" stroke="#E8A400" stroke-width="2"/>
    <line x1="119" y1="62" x2="141" y2="40" stroke="#E8A400" stroke-width="2"/>
    <rect x="55" y="80" width="14" height="18" fill="#0B3D2E"/>
    <rect x="52" y="76" width="20" height="4" fill="#0B3D2E"/>
    <rect x="188" y="80" width="14" height="18" fill="#0B3D2E"/>
    <text x="45" y="112" font-size="10" fill="#4b6058">Cell</text>
    <text x="120" y="112" font-size="10" fill="#4b6058">Bulb</text>
    <text x="180" y="112" font-size="10" fill="#4b6058">Switch</text>
  </svg></div>`;
}
function diagramVector(){
  return `<div class="diagram"><svg width="240" height="140" viewBox="0 0 240 140">
    <line x1="20" y1="110" x2="150" y2="30" stroke="#1565C0" stroke-width="3"/>
    <polygon points="150,30 138,36 144,44" fill="#1565C0"/>
    <line x1="20" y1="110" x2="220" y2="110" stroke="#0B3D2E" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="150" y="60" font-size="11" fill="#4b6058">F = 25 N, 40°</text>
    <text x="10" y="128" font-size="10" fill="#4b6058">origin</text>
  </svg></div>`;
}
function diagramGraphDT(){
  return `<div class="diagram"><svg width="260" height="160" viewBox="0 0 260 160">
    <line x1="30" y1="20" x2="30" y2="140" stroke="#152420" stroke-width="1.5"/>
    <line x1="30" y1="140" x2="240" y2="140" stroke="#152420" stroke-width="1.5"/>
    <polyline points="30,140 90,90 150,90 220,30" fill="none" stroke="#1565C0" stroke-width="2.5"/>
    <text x="235" y="155" font-size="10" fill="#4b6058">time</text>
    <text x="4" y="24" font-size="10" fill="#4b6058">dist.</text>
    <text x="60" y="132" font-size="9" fill="#4b6058">moving</text>
    <text x="105" y="84" font-size="9" fill="#4b6058">at rest</text>
    <text x="170" y="60" font-size="9" fill="#4b6058">moving faster</text>
  </svg></div>`;
}
function diagramThermo(){
  return `<div class="diagram"><svg width="220" height="140" viewBox="0 0 220 140">
    <rect x="95" y="20" width="20" height="80" rx="10" fill="none" stroke="#c83232" stroke-width="2"/>
    <circle cx="105" cy="110" r="16" fill="#c83232"/>
    <rect x="100" y="60" width="10" height="45" fill="#c83232"/>
    <line x1="122" y1="30" x2="132" y2="30" stroke="#4b6058" stroke-width="1"/>
    <line x1="122" y1="50" x2="132" y2="50" stroke="#4b6058" stroke-width="1"/>
    <line x1="122" y1="70" x2="132" y2="70" stroke="#4b6058" stroke-width="1"/>
    <text x="140" y="34" font-size="9" fill="#4b6058">100°C</text>
    <text x="140" y="74" font-size="9" fill="#4b6058">0°C</text>
  </svg></div>`;
}
function diagramMeasure(){
  return `<div class="diagram"><svg width="260" height="90" viewBox="0 0 260 90">
    <rect x="20" y="35" width="220" height="20" fill="#F6FAF8" stroke="#1565C0" stroke-width="1.5"/>
    ${Array.from({length:23}).map((_,i)=>`<line x1="${30+i*9}" y1="35" x2="${30+i*9}" y2="${i%5===0?25:30}" stroke="#0B3D2E" stroke-width="1"/>`).join("")}
    <text x="24" y="20" font-size="10" fill="#4b6058">0</text>
    <text x="220" y="20" font-size="10" fill="#4b6058">20 cm</text>
  </svg></div>`;
}

function diagramForce(){
  return `<div class="diagram"><svg width="240" height="120" viewBox="0 0 240 120">
    <rect x="90" y="50" width="60" height="40" fill="#F6FAF8" stroke="#0B3D2E" stroke-width="2"/>
    <line x1="150" y1="70" x2="210" y2="70" stroke="#1565C0" stroke-width="3"/>
    <polygon points="210,70 198,64 198,76" fill="#1565C0"/>
    <line x1="90" y1="70" x2="30" y2="70" stroke="#c83232" stroke-width="3"/>
    <polygon points="30,70 42,64 42,76" fill="#c83232"/>
    <text x="160" y="62" font-size="10" fill="#4b6058">Applied force</text>
    <text x="10" y="62" font-size="10" fill="#4b6058">Friction</text>
  </svg></div>`;
}
function diagramLever(){
  return `<div class="diagram"><svg width="240" height="120" viewBox="0 0 240 120">
    <line x1="20" y1="70" x2="220" y2="70" stroke="#0B3D2E" stroke-width="4"/>
    <polygon points="120,70 108,95 132,95" fill="#1565C0"/>
    <line x1="60" y1="70" x2="60" y2="40" stroke="#c83232" stroke-width="2"/>
    <polygon points="60,40 55,50 65,50" fill="#c83232"/>
    <line x1="180" y1="70" x2="180" y2="100" stroke="#E8A400" stroke-width="2"/>
    <polygon points="180,100 175,90 185,90" fill="#E8A400"/>
    <text x="35" y="34" font-size="9" fill="#4b6058">Effort</text>
    <text x="160" y="112" font-size="9" fill="#4b6058">Load</text>
    <text x="105" y="112" font-size="9" fill="#4b6058">Pivot</text>
  </svg></div>`;
}
function diagramCircular(){
  return `<div class="diagram"><svg width="200" height="160" viewBox="0 0 200 160">
    <circle cx="100" cy="80" r="55" fill="none" stroke="#1565C0" stroke-width="2" stroke-dasharray="6 4"/>
    <circle cx="100" cy="25" r="6" fill="#0B3D2E"/>
    <line x1="100" y1="25" x2="130" y2="12" stroke="#c83232" stroke-width="2"/>
    <polygon points="130,12 120,14 124,22" fill="#c83232"/>
    <line x1="100" y1="25" x2="100" y2="80" stroke="#E8A400" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="132" y="10" font-size="9" fill="#4b6058">velocity</text>
    <text x="102" y="55" font-size="9" fill="#4b6058">centripetal</text>
  </svg></div>`;
}
function diagramProjectile(){
  return `<div class="diagram"><svg width="260" height="140" viewBox="0 0 260 140">
    <line x1="20" y1="120" x2="240" y2="120" stroke="#152420" stroke-width="1.5"/>
    <path d="M20 120 Q 130 10 240 120" fill="none" stroke="#1565C0" stroke-width="2.5"/>
    <polygon points="30,113 20,120 32,124" fill="#0B3D2E"/>
    <text x="120" y="14" font-size="9" fill="#4b6058">max height</text>
    <text x="230" y="135" font-size="9" fill="#4b6058">range</text>
  </svg></div>`;
}

function diagramMirror(){
  return `<div class="diagram"><svg width="240" height="140" viewBox="0 0 240 140">
    <line x1="120" y1="10" x2="120" y2="130" stroke="#0B3D2E" stroke-width="4"/>
    <line x1="30" y1="100" x2="120" y2="70" stroke="#1565C0" stroke-width="2"/>
    <polygon points="120,70 110,66 112,76" fill="#1565C0"/>
    <line x1="120" y1="70" x2="210" y2="40" stroke="#c83232" stroke-width="2"/>
    <polygon points="210,40 198,42 202,50" fill="#c83232"/>
    <line x1="90" y1="120" x2="150" y2="20" stroke="#4b6058" stroke-width="1" stroke-dasharray="3 2"/>
    <text x="30" y="112" font-size="9" fill="#4b6058">incident ray</text>
    <text x="165" y="35" font-size="9" fill="#4b6058">reflected ray</text>
    <text x="122" y="20" font-size="9" fill="#4b6058">normal</text>
  </svg></div>`;
}
function diagramLens(){
  return `<div class="diagram"><svg width="240" height="120" viewBox="0 0 240 120">
    <ellipse cx="120" cy="60" rx="18" ry="50" fill="rgba(21,101,192,0.12)" stroke="#1565C0" stroke-width="2"/>
    <line x1="20" y1="60" x2="220" y2="60" stroke="#4b6058" stroke-width="1" stroke-dasharray="3 2"/>
    <line x1="20" y1="45" x2="120" y2="60" stroke="#c83232" stroke-width="2"/>
    <line x1="120" y1="60" x2="200" y2="90" stroke="#c83232" stroke-width="2"/>
    <polygon points="200,90 190,84 188,94" fill="#c83232"/>
    <circle cx="200" cy="90" r="3" fill="#0B3D2E"/>
    <text x="195" y="105" font-size="9" fill="#4b6058">focus</text>
  </svg></div>`;
}
function diagramWave(){
  return `<div class="diagram"><svg width="260" height="110" viewBox="0 0 260 110">
    <line x1="10" y1="55" x2="250" y2="55" stroke="#4b6058" stroke-width="1" stroke-dasharray="3 2"/>
    <path d="M10 55 Q 30 15, 50 55 T 90 55 T 130 55 T 170 55 T 210 55 T 250 55" fill="none" stroke="#1565C0" stroke-width="2.5"/>
    <text x="40" y="25" font-size="9" fill="#4b6058">crest</text>
    <text x="60" y="95" font-size="9" fill="#4b6058">trough</text>
  </svg></div>`;
}
function diagramResistor(){
  return `<div class="diagram"><svg width="260" height="100" viewBox="0 0 260 100">
    <line x1="20" y1="50" x2="90" y2="50" stroke="#1565C0" stroke-width="2"/>
    <polyline points="90,50 100,30 115,70 130,30 145,70 160,30 170,50" fill="none" stroke="#E8A400" stroke-width="2.5"/>
    <line x1="170" y1="50" x2="240" y2="50" stroke="#1565C0" stroke-width="2"/>
    <text x="95" y="90" font-size="9" fill="#4b6058">resistor</text>
  </svg></div>`;
}

function objectives(list){
  return `<div class="section"><h4>🎯 Learning Objectives</h4><ul>${list.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function intro(text){ return `<div class="section"><h4>📘 Introduction</h4><p>${text}</p></div>`; }
function defs(list){
  return `<div class="section"><h4>🔤 Key Definitions</h4>${list.map(d=>`<div class="box box-note"><span class="box-title">${d.term}</span>${d.def}</div>`).join("")}</div>`;
}
function explain(html){ return `<div class="section"><h4>🧠 Detailed Explanation</h4>${html}</div>`; }
function applications(list){
  return `<div class="section"><h4>🌍 Real-Life Applications</h4><ul>${list.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function worked(list){
  return `<div class="section"><h4>✏️ Worked Examples</h4>${list.map((w,i)=>`
    <div class="box box-formula"><span class="box-title">Example ${i+1}</span>
    <p><b>Problem:</b> ${w.q}</p>
    <p><b>Solution:</b><br>${w.s}</p></div>`).join("")}</div>`;
}
function formula(html){ return `<div class="box box-formula"><span class="box-title">📐 Formula</span>${html}</div>`; }
function note(html){ return `<div class="box box-note"><span class="box-title">💡 Note</span>${html}</div>`; }
function waec(html){ return `<div class="box box-waec"><span class="box-title">⭐ WAEC Tip</span>${html}</div>`; }
function neco(html){ return `<div class="box box-neco"><span class="box-title">🎓 NECO Tip</span>${html}</div>`; }
function mistake(html){ return `<div class="box box-mistake"><span class="box-title">⚠️ Common Mistake</span>${html}</div>`; }
function lab(title, html){ return `<div class="section"><h4>🧪 Laboratory Activity</h4><div class="box box-lab"><span class="box-title">${title}</span>${html}</div></div>`; }
function table(headers, rows){
  return `<table class="ptable"><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>
  ${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
}
function mcqBlock(id, items){
  return `<div class="section"><h4>✅ Multiple-Choice Questions</h4>${items.map((it,i)=>`
    <div class="mcq"><div class="mcq-q">${i+1}. ${it.q}</div>
    ${it.opts.map((o,j)=>`<div class="mcq-opt" onclick="checkMCQ(this,${j===it.correct})">${String.fromCharCode(65+j)}. ${o}</div>`).join("")}
    </div>`).join("")}</div>`;
}
function theoryQs(list){
  return `<div class="section"><h4>📝 Theory Questions</h4><ol>${list.map(x=>`<li>${x}</li>`).join("")}</ol></div>`;
}
function revisionQs(list){
  return `<div class="section"><h4>🔁 Revision Questions</h4><ol>${list.map(x=>`<li>${x}</li>`).join("")}</ol></div>`;
}
function summary(text){ return `<div class="section"><h4>📌 Lesson Summary</h4><p>${text}</p></div>`; }
function homework(text){ return `<div class="section"><h4>🏠 Homework</h4><p>${text}</p></div>`; }

// ============================================================
// TERM 1 CONTENT
// ============================================================

const LESSON_1_1 = `
${objectives([
  "Define Physics and explain its importance.",
  "List and describe the main branches of Physics.",
  "Relate Physics to everyday life and other sciences."
])}
${intro("Physics is the branch of science that studies matter, energy, and the way they interact. Every phone call, every bulb that lights up, every car that moves, and every star you see at night can be explained by Physics. In this lesson you will meet the subject properly and see how it is organised into branches.")}
${defs([
  {term:"Physics", def:"The branch of science concerned with the study of matter, energy, and the relationship between them."},
  {term:"Matter", def:"Anything that has mass and occupies space."},
  {term:"Energy", def:"The capacity to do work."}
])}
${explain(`
  <p>Physics tries to answer simple but powerful questions: Why does an apple fall down and not sideways? Why do some materials conduct electricity while others don't? How can sound travel through air but not through empty space?</p>
  <p>To answer these questions clearly, Physics is divided into branches, each focusing on a group of related phenomena:</p>
  ${table(["Branch","What it studies"], [
    ["Mechanics","Motion of objects and the forces that cause motion"],
    ["Heat (Thermal Physics)","Temperature, heat energy and how it flows"],
    ["Optics","Light — how it travels, reflects and refracts"],
    ["Sound (Acoustics)","How sound is produced and how it travels"],
    ["Electricity & Magnetism","Electric charges, currents and magnetic effects"],
    ["Modern/Nuclear Physics","Atoms, radioactivity and nuclear energy"]
  ])}
`)}
${applications([
  "Mechanics explains how a footballer's kick sends a ball flying, and how seatbelts protect passengers.",
  "Thermal physics explains why a refrigerator keeps food cold and why a thermos flask keeps tea hot.",
  "Optics explains how eyeglasses correct vision and how a camera forms an image.",
  "Electricity and magnetism explain how electric bulbs, phones and generators work."
])}
${note("Physics is called a 'fundamental' science because Chemistry, Biology, Engineering, and even Medicine all rely on physical laws to explain how things work.")}
${waec("WAEC often asks candidates to <b>match a branch of Physics to a given phenomenon</b> (e.g. 'the study of the production and propagation of sound is called ___'). Learn each branch with one clear example.")}
${neco("NECO sometimes asks for the definition of Physics word-for-word. Practice writing it in one clean sentence: 'Physics is the study of matter and energy, and how they relate to each other.'")}
${mistake("Many students confuse 'Mechanics' with 'Machines'. Mechanics is about motion and forces in general — it is not only about machines.")}
${mcqBlock("1_1",[
  {q:"Physics is best defined as the study of:", opts:["Living things","Matter and energy and their relationship","Only electricity","Only the stars"], correct:1},
  {q:"The branch of Physics that studies light is called:", opts:["Acoustics","Mechanics","Optics","Thermodynamics"], correct:2},
  {q:"Which branch studies the motion of objects?", opts:["Optics","Mechanics","Nuclear Physics","Acoustics"], correct:1}
])}
${theoryQs([
  "Define Physics in your own words.",
  "Name four branches of Physics and state one thing each branch studies.",
  "Explain, with one example, why Physics is important to everyday life."
])}
${revisionQs([
  "Which branch of Physics would explain how a radio receives sound?",
  "State two differences between Mechanics and Thermal Physics."
])}
${summary("Physics is the scientific study of matter, energy and their interaction. It is divided into branches — Mechanics, Thermal Physics, Optics, Acoustics, Electricity & Magnetism, and Modern Physics — each explaining a different group of natural phenomena.")}
${homework("Write short notes (2–3 sentences each) on any THREE branches of Physics not fully covered in class, giving one real-life example for each.")}
`;

const LESSON_1_2 = `
${objectives([
  "Distinguish between fundamental and derived physical quantities.",
  "State the SI units of the seven fundamental quantities.",
  "Use standard prefixes to express very large or very small quantities."
])}
${intro("Every measurement in Physics is a physical quantity — something that can be measured and expressed as a number with a unit. To avoid confusion around the world, scientists agree on a single system of units called the SI (Système International) units.")}
${defs([
  {term:"Physical quantity", def:"Anything that can be measured, consisting of a numerical value and a unit, e.g. 5 metres."},
  {term:"Fundamental (basic) quantities", def:"Quantities that stand on their own and are not defined in terms of other quantities, e.g. length, mass, time."},
  {term:"Derived quantities", def:"Quantities obtained by combining two or more fundamental quantities, e.g. speed = distance ÷ time."}
])}
${explain(`
  <p>There are seven fundamental quantities recognised in the SI system:</p>
  ${table(["Quantity","SI Unit","Symbol"],[
    ["Length","metre","m"],
    ["Mass","kilogram","kg"],
    ["Time","second","s"],
    ["Electric current","ampere","A"],
    ["Temperature","kelvin","K"],
    ["Amount of substance","mole","mol"],
    ["Luminous intensity","candela","cd"]
  ])}
  <p>Derived quantities are built from these. For example:</p>
  ${table(["Derived quantity","Formula","SI Unit"],[
    ["Area","length × breadth","m²"],
    ["Volume","length × breadth × height","m³"],
    ["Speed","distance ÷ time","m/s"],
    ["Density","mass ÷ volume","kg/m³"],
    ["Force","mass × acceleration","kg m/s² (newton, N)"]
  ])}
  <p>Because measurements can be extremely large (distance between planets) or extremely small (the size of a cell), scientists use <b>prefixes</b> attached to units:</p>
  ${table(["Prefix","Symbol","Meaning"],[
    ["kilo","k","× 1000"],
    ["centi","c","× 0.01"],
    ["milli","m","× 0.001"],
    ["micro","μ","× 0.000001"],
    ["mega","M","× 1,000,000"]
  ])}
`)}
${worked([
  {q:"Classify the following as fundamental or derived quantities: mass, area, time, force.",
   s:"Mass — fundamental. Area — derived (length × breadth). Time — fundamental. Force — derived (mass × acceleration)."},
  {q:"Convert 5 kilometres to metres.",
   s:"1 km = 1000 m, so 5 km = 5 × 1000 = 5000 m."},
  {q:"Convert 250 centimetres to metres.",
   s:"1 cm = 0.01 m, so 250 cm = 250 × 0.01 = 2.5 m."}
])}
${applications([
  "Engineers use SI units so that a bridge design from one country can be built correctly in another.",
  "Doctors use derived units (like kg/m² for Body Mass Index) to check a patient's health.",
  "Pharmacists use prefixes like 'milli' when measuring drug doses (milligrams)."
])}
${waec("WAEC loves to test the table of fundamental quantities and their units directly. Memorise all seven together with their correct symbols (note: it's 'A' for ampere, not 'amp').")}
${neco("NECO may ask you to derive the unit of a quantity, e.g. 'show that the SI unit of speed is m/s'. Always start from the formula.")}
${mistake("Don't confuse 'weight' with 'mass'. Mass is fundamental (kg); weight is actually a force (derived, measured in newtons).")}
${lab("Identifying quantities","In groups, list 10 items around the classroom (e.g. a table, a bottle of water, a wall clock) and state which physical quantities you could measure about each (length, mass, time, etc.).")}
${mcqBlock("1_2",[
  {q:"Which of these is a fundamental quantity?", opts:["Speed","Area","Time","Density"], correct:2},
  {q:"The SI unit of mass is the:", opts:["Newton","Kilogram","Metre","Joule"], correct:1},
  {q:"1 kilometre is equal to:", opts:["10 m","100 m","1000 m","10000 m"], correct:2}
])}
${theoryQs([
  "Differentiate between fundamental and derived quantities, giving two examples of each.",
  "State the seven fundamental quantities with their SI units.",
  "Derive the SI unit of density from its formula."
])}
${revisionQs([
  "Express 3000 grams in kilograms.",
  "What is the derived unit for volume, and how is it obtained?"
])}
${summary("Physical quantities are either fundamental (length, mass, time, current, temperature, amount of substance, luminous intensity) or derived (built by combining fundamentals, like speed and density). SI units and prefixes give everyone in the world a common measuring language.")}
${homework("Prepare a table of any 6 derived quantities not listed in class, showing their formula and SI unit.")}
`;

const LESSON_1_3 = `
${objectives([
  "Measure length, mass, time and volume using appropriate instruments.",
  "State the correct SI unit for each of these quantities.",
  "Read a metre rule and a measuring cylinder correctly, avoiding parallax error."
])}
${intro("Measurement is at the heart of Physics — without accurate measurement, we cannot test any scientific idea. This lesson covers the four most common quantities you'll measure in the laboratory: length, mass, time, and volume.")}
${defs([
  {term:"Length", def:"The distance between two points, measured in metres (m)."},
  {term:"Mass", def:"The quantity of matter contained in a body, measured in kilograms (kg)."},
  {term:"Time", def:"The duration between two events, measured in seconds (s)."},
  {term:"Volume", def:"The amount of space occupied by an object, measured in cubic metres (m³) or litres."}
])}
${explain(`
  <p><b>Length</b> is measured using a metre rule, tape rule, or (for very small lengths) vernier calipers and a micrometer screw gauge.</p>
  ${diagramMeasure()}
  <p>When reading a metre rule, your eye must be placed directly in front of (perpendicular to) the mark you are reading. Looking at an angle causes a <b>parallax error</b>.</p>
  <p><b>Mass</b> is measured with a beam balance or an electronic/digital balance. Mass does not change with location.</p>
  <p><b>Time</b> is measured with a stopwatch or clock. For repeating events (like a swinging pendulum), timing several oscillations and dividing gives a more accurate result than timing just one.</p>
  <p><b>Volume</b> of liquids is measured with a measuring cylinder; the volume of an irregular solid is found by <b>displacement</b> — immersing it in a measuring cylinder of water and noting the rise in level.</p>
  ${table(["Instrument","Quantity measured","Typical use"],[
    ["Metre rule","Length","Measuring the length of a table"],
    ["Vernier calipers","Length (small, precise)","Diameter of a test tube"],
    ["Micrometer screw gauge","Length (very small)","Thickness of a wire"],
    ["Beam balance","Mass","Mass of a stone"],
    ["Stopwatch","Time","Time for a pendulum to swing"],
    ["Measuring cylinder","Volume","Volume of a liquid"]
  ])}
`)}
${worked([
  {q:"A measuring cylinder contains 40 cm³ of water. A stone is lowered into it and the level rises to 65 cm³. Find the volume of the stone.",
   s:"Volume of stone = final volume − initial volume = 65 − 40 = 25 cm³."},
  {q:"A student times 20 oscillations of a pendulum and gets 30 seconds. Find the time for one oscillation (the period).",
   s:"Period T = total time ÷ number of oscillations = 30 ÷ 20 = 1.5 seconds."}
])}
${formula("Volume of irregular solid by displacement = Final volume of liquid − Initial volume of liquid")}
${applications([
  "Tailors use a tape rule (length) to take body measurements for sewing clothes.",
  "Market women use a weighing balance (mass) to sell foodstuff by weight.",
  "Athletes use a stopwatch (time) to measure race performance.",
  "Fuel stations use calibrated pumps (volume) to sell petrol accurately."
])}
${waec("WAEC frequently sets a diagram of a measuring cylinder or metre rule and asks you to state the reading, including the correct unit and to identify sources of error such as parallax.")}
${neco("NECO practical papers often require you to describe, step-by-step, how to find the volume of an irregular solid using a measuring cylinder and water — practice writing this procedure clearly.")}
${mistake("Never take a reading by looking down at an angle into a measuring cylinder — always read at eye level, at the bottom of the curved liquid surface (the meniscus).")}
${lab("Finding the volume of an irregular solid","Partially fill a measuring cylinder with water and record the volume (V₁). Tie a thread to a small stone and lower it gently into the water. Record the new volume (V₂). The volume of the stone is V₂ − V₁.")}
${mcqBlock("1_3",[
  {q:"The SI unit of length is the:", opts:["Gram","Metre","Second","Litre"], correct:1},
  {q:"The best instrument for measuring the diameter of a wire is:", opts:["Metre rule","Tape rule","Micrometer screw gauge","Measuring cylinder"], correct:2},
  {q:"Parallax error occurs when:", opts:["The instrument is broken","The eye is not placed perpendicular to the scale","The object is too heavy","The stopwatch is not started on time"], correct:1}
])}
${theoryQs([
  "Describe how you would measure the volume of an irregular solid using a measuring cylinder.",
  "Explain what parallax error is and how it can be avoided.",
  "Why is it more accurate to time 20 oscillations of a pendulum than just one?"
])}
${revisionQs([
  "State one instrument each for measuring length, mass, time, and volume.",
  "A stone raises the water level in a cylinder from 30 cm³ to 47 cm³. What is its volume?"
])}
${summary("Length, mass, time and volume are basic quantities measured with specific instruments: metre rule/vernier calipers/micrometer for length, beam balance for mass, stopwatch for time, and measuring cylinder (with displacement, for solids) for volume. Careful technique avoids parallax and timing errors.")}
${homework("A rectangular block measures 5 cm by 4 cm by 3 cm. Calculate its volume. Then explain how you would find the volume of a stone of irregular shape using apparatus available in your school.")}
`;

const LESSON_1_4 = `
${objectives([
  "Define density and state its SI unit.",
  "Calculate the density of regular and irregular objects.",
  "Explain why some objects float while others sink, using density."
])}
${intro("Have you ever wondered why a small iron nail sinks in water but a large plastic bottle floats? The answer lies in density — how tightly packed the matter is inside an object.")}
${defs([
  {term:"Density", def:"The mass of a substance per unit volume."}
])}
${formula("Density (ρ) = Mass (m) ÷ Volume (V), SI unit: kg/m³ (also commonly expressed in g/cm³)")}
${explain(`
  <p>Density tells us how much mass is squeezed into a given space. A block of lead is much denser than a block of wood of the same size because lead's atoms are heavier and more closely packed.</p>
  <p>To find the density of a regular solid (like a cube), measure its dimensions to get volume, and weigh it to get mass, then apply the formula. For an irregular solid, find its volume by displacement (from the previous lesson) and its mass with a balance.</p>
  ${table(["Substance","Density (kg/m³)"],[
    ["Air","1.2"],
    ["Water","1000"],
    ["Ice","920"],
    ["Wood (pine)","500"],
    ["Iron","7900"],
    ["Gold","19300"]
  ])}
  <p>An object floats on a liquid if its density is <b>less</b> than the density of the liquid, and sinks if its density is <b>greater</b>. This is why ice (920 kg/m³) floats on water (1000 kg/m³), and iron sinks.</p>
`)}
${worked([
  {q:"A block of metal has a mass of 540 g and a volume of 60 cm³. Calculate its density.",
   s:"Density = mass ÷ volume = 540 g ÷ 60 cm³ = 9 g/cm³."},
  {q:"A stone of density 2.5 g/cm³ has a volume of 20 cm³. Find its mass.",
   s:"Mass = density × volume = 2.5 × 20 = 50 g."},
  {q:"Will an object of density 850 kg/m³ float or sink in water (density 1000 kg/m³)? Explain.",
   s:"It will float because its density (850 kg/m³) is less than the density of water (1000 kg/m³)."}
])}
${applications([
  "Ship builders use density principles to design ships that float despite being made of steel.",
  "Hot air balloons rise because heated air is less dense than the surrounding cool air.",
  "The density of a car's battery acid (using a hydrometer) tells mechanics if the battery is still charged."
])}
${waec("WAEC often gives mass and volume in different units (e.g. g and m³) in the same question — always convert to consistent units before dividing.")}
${neco("NECO may ask you to explain floating and sinking using density, not just define the term. Practice the floating/sinking explanation in full sentences.")}
${mistake("A common error is dividing volume by mass instead of mass by volume. Remember: Density = Mass ÷ Volume, not the other way round.")}
${lab("Determining the density of an irregular solid","Weigh a stone to find its mass using a beam balance. Find its volume by displacement in a measuring cylinder. Divide mass by volume to get the density.")}
${mcqBlock("1_4",[
  {q:"Density is defined as:", opts:["Volume per unit mass","Mass per unit volume","Weight per unit area","Force per unit volume"], correct:1},
  {q:"An object floats on water if its density is:", opts:["Equal to water's density","Greater than water's density","Less than water's density","Zero"], correct:2},
  {q:"A substance has mass 100 g and volume 25 cm³. Its density is:", opts:["4 g/cm³","0.25 g/cm³","2500 g/cm³","25 g/cm³"], correct:0}
])}
${theoryQs([
  "Define density and state its SI unit.",
  "Explain, using density, why a ship made of steel is able to float on water.",
  "Describe an experiment to determine the density of an irregular solid."
])}
${revisionQs([
  "A block has mass 800 g and volume 400 cm³. Calculate its density.",
  "Will a material of density 1200 kg/m³ float or sink in water? Explain."
])}
${summary("Density is mass per unit volume (ρ = m/V), measured in kg/m³ or g/cm³. Comparing an object's density to a liquid's density predicts whether it floats or sinks.")}
${homework("A metal cube of side 4 cm has a mass of 320 g. Calculate its density and state, with a reason, whether it would float on water.")}
`;

const LESSON_1_5 = `
${objectives([
  "Distinguish between accuracy and precision in measurement.",
  "Identify sources of error in measurement (systematic, random, parallax).",
  "State ways of minimising errors in an experiment."
])}
${intro("No measurement is ever perfectly exact — there is always some degree of uncertainty. Understanding accuracy, precision, and error helps scientists trust and improve their results.")}
${defs([
  {term:"Accuracy", def:"How close a measured value is to the true (actual) value."},
  {term:"Precision", def:"How close repeated measurements are to one another (consistency), whether or not they are close to the true value."},
  {term:"Error", def:"The difference between a measured value and the true value of a quantity."}
])}
${explain(`
  <p>Imagine a dartboard: if all your darts land close together near the bullseye, you are both accurate and precise. If they land close together but far from the bullseye, you are precise but not accurate. If they scatter widely but average out near the bullseye, you may be accurate on average but not precise.</p>
  ${table(["Type of error","Description","Example"],[
    ["Systematic error","A consistent error in the same direction, often from a faulty instrument","A balance that always reads 2 g too high"],
    ["Random error","Unpredictable, varies in both directions","Slight differences each time you time a swinging pendulum"],
    ["Parallax error","Caused by incorrect eye position when reading a scale","Reading a ruler at an angle instead of straight on"]
  ])}
  <p>Errors can be minimised by: taking several readings and finding the average, using more precise instruments, avoiding parallax by positioning the eye correctly, and calibrating (checking/zeroing) instruments before use.</p>
`)}
${worked([
  {q:"A student measures the length of a table five times and gets: 120.1 cm, 120.0 cm, 120.2 cm, 120.1 cm, 120.1 cm. Comment on the precision of the readings.",
   s:"The readings are all very close to one another (within 0.2 cm), so the measurements are precise."},
  {q:"A weighing balance always reads 3 g more than the true mass due to a fault. What type of error is this and how can it be corrected?",
   s:"This is a systematic error. It can be corrected by calibrating (zeroing) the balance before use, or by subtracting the constant 3 g error from every reading."}
])}
${applications([
  "In hospitals, precise and accurate thermometers are essential for correct diagnosis.",
  "In manufacturing, precision instruments ensure machine parts fit together correctly.",
  "In scientific research, repeating experiments and averaging results reduces random error."
])}
${waec("WAEC likes to test the difference between accuracy and precision using the dartboard-style scenario — be ready to explain both terms clearly, not just define them.")}
${neco("NECO may ask you to state THREE ways of reducing errors in an experiment — practice writing a numbered list confidently.")}
${mistake("Do not assume a precise result is automatically accurate. Repeated measurements can agree closely with each other yet still be far from the true value if there's a systematic error.")}
${mcqBlock("1_5",[
  {q:"Precision refers to:", opts:["Closeness to the true value","Closeness of repeated readings to each other","The unit used","The instrument's cost"], correct:1},
  {q:"A balance that always adds 2 g to every reading has:", opts:["Random error","Parallax error","Systematic error","No error"], correct:2},
  {q:"One way to reduce random error is to:", opts:["Use a broken instrument","Take one reading only","Take several readings and average them","Ignore the readings"], correct:2}
])}
${theoryQs([
  "Differentiate between accuracy and precision, using an example.",
  "List and explain three types of errors in measurement.",
  "State two ways of minimising errors in a laboratory experiment."
])}
${revisionQs([
  "A thermometer consistently reads 1°C below the true temperature. What kind of error is this?",
  "Why is taking the average of several readings good practice in Physics experiments?"
])}
${summary("Accuracy is closeness to the true value; precision is closeness among repeated readings. Errors — systematic, random, or parallax — can be reduced by averaging readings, calibrating instruments, and correct measurement technique.")}
${homework("A group of students measured the mass of the same object five times and got very similar results, but all far from the value stated on the object's label. Explain what this shows about their accuracy and precision, and suggest a possible reason.")}
`;

const LESSON_1_6 = `
${objectives([
  "Distinguish between scalar and vector quantities.",
  "Give examples of common scalars and vectors.",
  "Add two vectors acting at an angle using a simple diagram."
])}
${intro("When you say 'the car moved 20 km', you've given a scalar. When you say 'the car moved 20 km eastward', you've given a vector. Physics needs both kinds of quantities, and this lesson shows you how to tell them apart and work with vectors.")}
${defs([
  {term:"Scalar quantity", def:"A quantity that has only magnitude (size), with no direction."},
  {term:"Vector quantity", def:"A quantity that has both magnitude and direction."}
])}
${explain(`
  ${table(["Scalars","Vectors"],[
    ["Distance","Displacement"],
    ["Speed","Velocity"],
    ["Mass","Force"],
    ["Time","Acceleration"],
    ["Energy","Weight"]
  ])}
  <p>Vectors are usually represented by an arrow: the length of the arrow shows the magnitude, and the direction it points shows the direction of the quantity.</p>
  ${diagramVector()}
  <p>When two vectors act on a body, we can find their combined effect (the <b>resultant</b>) by scale drawing: draw the first vector to scale, then draw the second starting from the tip of the first, and the resultant is the arrow from the start of the first to the tip of the second (the "tip-to-tail" method). For two vectors at right angles, Pythagoras' theorem can be used directly.</p>
`)}
${worked([
  {q:"A man walks 3 m East, then 4 m North. Find the magnitude of his total displacement.",
   s:"Since the two directions are at right angles, use Pythagoras: Resultant = √(3² + 4²) = √(9+16) = √25 = 5 m."},
  {q:"Classify each of the following as scalar or vector: energy, weight, mass, velocity.",
   s:"Energy — scalar. Weight — vector (it's a force, acting downward). Mass — scalar. Velocity — vector."}
])}
${formula("For two perpendicular vectors A and B, Resultant R = √(A² + B²)")}
${applications([
  "Pilots must consider both the speed and direction (velocity) of wind, not just its speed, when planning a flight path.",
  "GPS navigation systems calculate displacement (a vector) to give the shortest direct route, not just distance travelled."
])}
${waec("WAEC frequently asks you to classify a list of quantities as scalar or vector — memorise the table above cold, as it's tested almost every year in some form.")}
${neco("NECO practical/theory questions may require simple vector addition using Pythagoras for perpendicular vectors — practice this calculation until it's automatic.")}
${mistake("A common mistake is thinking 'distance' and 'displacement' are the same. Distance is the total path covered (scalar); displacement is the straight-line distance from start to finish, in a specific direction (vector).")}
${mcqBlock("1_6",[
  {q:"Which of the following is a vector quantity?", opts:["Mass","Time","Displacement","Energy"], correct:2},
  {q:"A quantity with only magnitude and no direction is called a:", opts:["Vector","Scalar","Resultant","Force"], correct:1},
  {q:"A boy walks 6 m East then 8 m North. His displacement is:", opts:["14 m","2 m","10 m","48 m"], correct:2}
])}
${theoryQs([
  "Distinguish between scalar and vector quantities, giving two examples of each.",
  "A cyclist rides 6 km East then 8 km North. Find his resultant displacement.",
  "Explain the 'tip-to-tail' method of adding two vectors."
])}
${revisionQs([
  "Is 'speed' a scalar or a vector? Explain your answer.",
  "State the resultant of two vectors of 5 N and 12 N acting at right angles to each other."
])}
${summary("Scalar quantities (distance, speed, mass, time, energy) have magnitude only. Vector quantities (displacement, velocity, force, acceleration, weight) have both magnitude and direction. Perpendicular vectors combine using Pythagoras' theorem.")}
${homework("A drone flies 9 m North and then 12 m East. Calculate the magnitude of its resultant displacement, and sketch the vector diagram.")}
`;

const LESSON_1_7 = `
${objectives([
  "Define distance, displacement, speed, velocity and acceleration.",
  "Distinguish clearly between each pair of related terms.",
  "Solve numerical problems involving these quantities."
])}
${intro("Motion is everywhere — a moving bus, a falling mango, a running athlete. To describe motion precisely, Physics uses five key quantities: distance, displacement, speed, velocity, and acceleration.")}
${defs([
  {term:"Distance", def:"The total length of the path covered by a moving object, regardless of direction (scalar)."},
  {term:"Displacement", def:"The change in position of an object in a specified direction; the shortest straight-line distance from start to finish (vector)."},
  {term:"Speed", def:"The distance covered per unit time (scalar)."},
  {term:"Velocity", def:"The rate of change of displacement with time, in a specified direction (vector)."},
  {term:"Acceleration", def:"The rate of change of velocity with time (vector)."}
])}
${formula(`
  Speed = Distance ÷ Time<br>
  Velocity = Displacement ÷ Time<br>
  Acceleration = (Final velocity − Initial velocity) ÷ Time = (v − u) ÷ t
`)}
${explain(`
  <p>If a car moves at constant speed, it covers equal distances in equal time intervals. If its speed changes, it is accelerating (speeding up) or decelerating (slowing down).</p>
  ${table(["Quantity","Type","SI Unit"],[
    ["Distance","Scalar","metre (m)"],
    ["Displacement","Vector","metre (m)"],
    ["Speed","Scalar","m/s"],
    ["Velocity","Vector","m/s"],
    ["Acceleration","Vector","m/s²"]
  ])}
  <p>A runner completing one full lap of a 400 m circular track has covered a distance of 400 m, but his displacement is 0 m, because he ends up back where he started!</p>
`)}
${worked([
  {q:"A car travels 150 m in 10 s. Calculate its average speed.",
   s:"Speed = distance ÷ time = 150 ÷ 10 = 15 m/s."},
  {q:"A body's velocity changes from 5 m/s to 25 m/s in 4 s. Calculate its acceleration.",
   s:"a = (v − u) ÷ t = (25 − 5) ÷ 4 = 20 ÷ 4 = 5 m/s²."},
  {q:"A cyclist decelerates from 18 m/s to rest in 6 s. Find the deceleration.",
   s:"a = (v − u) ÷ t = (0 − 18) ÷ 6 = −3 m/s². The negative sign shows it is a deceleration of 3 m/s²."}
])}
${applications([
  "Speedometers in cars display speed, helping drivers obey speed limits.",
  "Air traffic controllers track the velocity (speed and direction) of aircraft to avoid collisions.",
  "Car safety engineers study acceleration during crashes to design better airbags."
])}
${waec("WAEC frequently sets numerical problems requiring you to calculate speed, velocity, or acceleration from given data — always write down the formula first, substitute values carefully, and include correct units in your final answer.")}
${neco("NECO may ask you to explain, using an example, why distance and displacement can have different numerical values for the same journey — the 'running around a track' example is a favourite.")}
${mistake("Do not forget the negative sign when acceleration represents a decrease in speed (deceleration/retardation) — dropping it is a common source of lost marks.")}
${mcqBlock("1_7",[
  {q:"The rate of change of displacement with time is called:", opts:["Speed","Distance","Velocity","Acceleration"], correct:2},
  {q:"A car increases its velocity from 10 m/s to 30 m/s in 5 s. Its acceleration is:", opts:["2 m/s²","4 m/s²","5 m/s²","8 m/s²"], correct:1},
  {q:"Which of these is a scalar quantity?", opts:["Velocity","Displacement","Speed","Acceleration"], correct:2}
])}
${theoryQs([
  "Distinguish between distance and displacement, using a runner on a circular track as an example.",
  "Distinguish between speed and velocity.",
  "A car's velocity changes from 12 m/s to 2 m/s in 5 s. Calculate its acceleration and explain what the sign of your answer means."
])}
${revisionQs([
  "A boy runs 200 m around a circular track and returns to his starting point. State his distance and displacement.",
  "Define acceleration and state its SI unit."
])}
${summary("Distance and speed are scalars describing how far and how fast, without direction. Displacement, velocity, and acceleration are vectors that also specify direction. Acceleration measures how quickly velocity itself is changing.")}
${homework("A motorcyclist's speed increases from 4 m/s to 24 m/s in 8 seconds while travelling in a straight line. Calculate the acceleration. Then explain, in your own words, the difference between speed and velocity.")}
`;

const LESSON_1_8 = `
${objectives([
  "Interpret and sketch distance-time graphs.",
  "Interpret and sketch velocity-time graphs.",
  "Calculate speed and acceleration from the gradient of graphs, and distance from the area under a velocity-time graph."
])}
${intro("Graphs let us 'see' motion at a glance. A distance-time graph shows how far an object has travelled over time, while a velocity-time graph shows how its velocity changes. Reading these graphs correctly is a key WAEC/NECO skill.")}
${defs([
  {term:"Distance-time graph", def:"A graph showing how the distance moved by an object varies with time; its gradient (slope) gives speed."},
  {term:"Velocity-time graph", def:"A graph showing how the velocity of an object varies with time; its gradient gives acceleration, and the area under it gives distance travelled."}
])}
${explain(`
  ${diagramGraphDT()}
  <p><b>On a distance-time graph:</b> a straight sloping line means constant speed (steeper = faster); a horizontal line means the object is at rest; a curve means the speed is changing.</p>
  <p><b>On a velocity-time graph:</b> a straight sloping line means constant acceleration; a horizontal line means constant velocity (zero acceleration); the area enclosed between the line and the time-axis equals the total distance travelled.</p>
  ${formula(`
    Gradient of distance-time graph = Speed<br>
    Gradient of velocity-time graph = Acceleration<br>
    Area under velocity-time graph = Distance travelled
  `)}
`)}
${worked([
  {q:"A distance-time graph shows an object covering 60 m in 12 s along a straight sloping line. Find its speed.",
   s:"Speed = gradient = distance ÷ time = 60 ÷ 12 = 5 m/s."},
  {q:"A velocity-time graph shows velocity increasing steadily from 0 to 20 m/s in 4 s. Find the acceleration and the distance travelled.",
   s:"Acceleration = gradient = (20 − 0) ÷ 4 = 5 m/s². Distance = area under graph = area of triangle = ½ × base × height = ½ × 4 × 20 = 40 m."}
])}
${applications([
  "Traffic and transport engineers use velocity-time graphs to study how quickly vehicles can safely stop.",
  "Sports scientists use distance-time graphs from race footage to analyse an athlete's performance during a race."
])}
${waec("WAEC often provides a velocity-time graph and asks for BOTH the acceleration (from the gradient) AND the total distance (from the area) in the same question — always calculate both carefully, using the correct shape (triangle, rectangle, or trapezium) for the area.")}
${neco("NECO may ask you to describe the motion shown by a given graph in words (e.g. 'the object was at rest, then it accelerated uniformly') — practice translating graph shapes into full sentences.")}
${mistake("Do not confuse a horizontal line on a distance-time graph (object at REST) with a horizontal line on a velocity-time graph (object moving at CONSTANT velocity, not at rest).")}
${lab("Plotting motion of a trolley","Release a trolley down a slightly inclined runway and use a ticker-tape timer (or stopwatch at marked intervals) to record its position at regular time intervals. Plot distance against time and describe the shape of the graph obtained.")}
${mcqBlock("1_8",[
  {q:"On a distance-time graph, a horizontal line shows that the object is:", opts:["Accelerating","At rest","Moving at constant speed","Decelerating"], correct:1},
  {q:"The gradient of a velocity-time graph gives:", opts:["Distance","Speed","Acceleration","Displacement"], correct:2},
  {q:"The area under a velocity-time graph represents:", opts:["Acceleration","Speed","Distance travelled","Time taken"], correct:2}
])}
${theoryQs([
  "Sketch and describe a distance-time graph for an object that starts at rest, moves at constant speed, then stops.",
  "Explain how you would find the acceleration of an object from a velocity-time graph.",
  "A velocity-time graph shows a straight horizontal line at 15 m/s for 10 s. Find the acceleration and the distance travelled."
])}
${revisionQs([
  "What does a steep line on a distance-time graph indicate compared to a gentle slope?",
  "A velocity-time graph rises from 0 to 12 m/s in 3 s. Calculate the acceleration."
])}
${summary("Distance-time graphs reveal speed through their gradient; velocity-time graphs reveal acceleration through their gradient and distance through the area beneath the line. Recognising rest, constant speed/velocity, and acceleration from graph shapes is essential for WAEC and NECO.")}
${homework("Sketch a velocity-time graph for a car that accelerates uniformly from rest to 20 m/s in 5 s, then travels at that constant velocity for 10 s. Calculate the total distance travelled over the 15 seconds.")}
`;

// ============================================================
// TERM 2 CONTENT
// ============================================================

const LESSON_2_1 = `
${objectives([
  "Define force and state its SI unit.",
  "State and explain Newton's three laws of motion.",
  "Apply Newton's second law (F = ma) to solve numerical problems."
])}
${intro("A ball at rest stays at rest until something pushes or kicks it. A moving car stops only when the brakes (a force) act on it. Sir Isaac Newton summarised how forces affect motion in three simple, powerful laws that remain central to Physics today.")}
${defs([
  {term:"Force", def:"A push or pull that can change the size, shape, speed, or direction of motion of an object."},
  {term:"Newton's First Law (Law of Inertia)", def:"A body remains at rest, or continues to move at constant velocity in a straight line, unless acted upon by a resultant (unbalanced) external force."},
  {term:"Newton's Second Law", def:"The acceleration of a body is directly proportional to the resultant force acting on it, and inversely proportional to its mass; a = F/m, or F = ma."},
  {term:"Newton's Third Law", def:"For every action there is an equal and opposite reaction; when body A exerts a force on body B, body B exerts an equal and opposite force on body A."}
])}
${explain(`
  ${diagramForce()}
  <p><b>First Law</b> explains why passengers jerk forward when a moving bus suddenly stops — their bodies want to keep moving (inertia) even though the bus has stopped.</p>
  <p><b>Second Law</b> tells us that a bigger force produces a bigger acceleration, but a bigger mass resists acceleration more — pushing an empty wheelbarrow is easier than pushing a fully loaded one with the same force.</p>
  <p><b>Third Law</b> explains how a rocket launches: hot gases are pushed downward and out (action), and the gases push the rocket upward (reaction) with equal force.</p>
  ${formula("Force (F) = mass (m) × acceleration (a); SI unit of force is the newton (N), where 1 N = 1 kg m/s²")}
`)}
${worked([
  {q:"A resultant force of 20 N acts on a body of mass 5 kg. Calculate its acceleration.",
   s:"a = F ÷ m = 20 ÷ 5 = 4 m/s²."},
  {q:"A force of 15 N gives a trolley an acceleration of 3 m/s². Find the mass of the trolley.",
   s:"m = F ÷ a = 15 ÷ 3 = 5 kg."},
  {q:"A book rests on a table. State the reaction force acting, according to Newton's third law.",
   s:"The book exerts a downward force (its weight) on the table (action); the table exerts an equal and opposite upward force (the normal reaction) on the book."}
])}
${applications([
  "Seatbelts in cars work with Newton's first law — they stop your body from continuing forward (due to inertia) when the car suddenly brakes.",
  "Newton's second law helps engineers calculate the engine force needed to give a vehicle of known mass a required acceleration.",
  "Newton's third law explains how swimmers push water backward to move themselves forward, and how rockets launch into space."
])}
${waec("WAEC frequently asks candidates to state all three laws precisely and to apply F = ma in calculations — practice stating each law word-perfect, then practice rearranging F = ma for a or m.")}
${neco("NECO often asks for a real-life example illustrating each law separately — prepare one clear, different example for each of the three laws.")}
${mistake("Do not say 'a force keeps an object moving' — Newton's first law actually says the OPPOSITE: no force is needed to keep something moving at constant velocity; a force is only needed to CHANGE its motion.")}
${lab("Investigating F = ma","Using a trolley on a runway, a set of known masses (hung over a pulley to provide force) and a ticker-tape timer, measure the acceleration of the trolley for different applied forces while keeping mass constant, then plot force against acceleration.")}
${mcqBlock("2_1",[
  {q:"The SI unit of force is the:", opts:["Kilogram","Joule","Newton","Watt"], correct:2},
  {q:"A force of 12 N acts on a 4 kg mass. The acceleration produced is:", opts:["3 m/s²","48 m/s²","8 m/s²","16 m/s²"], correct:0},
  {q:"Which law explains why a passenger jerks forward when a bus stops suddenly?", opts:["Newton's first law","Newton's second law","Newton's third law","Law of gravitation"], correct:0}
])}
${theoryQs([
  "State Newton's three laws of motion.",
  "A force of 25 N gives a body an acceleration of 5 m/s². Calculate the mass of the body.",
  "Using Newton's third law, explain how a rocket is able to move forward in space."
])}
${revisionQs([
  "What acceleration is produced when a force of 30 N acts on a mass of 6 kg?",
  "Give one everyday example of Newton's first law in action."
])}
${summary("Force is a push or pull, measured in newtons. Newton's first law describes inertia (resistance to a change in motion); the second law relates force, mass and acceleration (F = ma); the third law states that forces always occur in equal and opposite action-reaction pairs.")}
${homework("A car of mass 800 kg accelerates at 2.5 m/s². Calculate the resultant force needed. Then describe one real-life situation for each of Newton's three laws, different from the examples given in class.")}
`;

const LESSON_2_2 = `
${objectives([
  "Define momentum and impulse, and state their SI units.",
  "State the law of conservation of momentum.",
  "Solve simple numerical problems on momentum and impulse."
])}
${intro("Why does a heavy truck take longer to stop than a small car moving at the same speed? Why does a boxer 'follow through' when throwing a punch? The answers involve momentum and impulse.")}
${defs([
  {term:"Momentum", def:"The product of the mass of a body and its velocity; p = mv. It is a vector quantity."},
  {term:"Impulse", def:"The product of the force applied to a body and the time for which it acts; impulse = F × t. Impulse equals the change in momentum produced."},
  {term:"Law of conservation of momentum", def:"In a closed system, the total momentum before a collision equals the total momentum after the collision, provided no external force acts."}
])}
${formula(`
  Momentum (p) = mass (m) × velocity (v); SI unit: kg m/s<br>
  Impulse = Force (F) × time (t) = change in momentum (mv − mu); SI unit: N s (equivalent to kg m/s)
`)}
${explain(`
  <p>A heavier or faster-moving object has greater momentum, and therefore needs a greater force (or a longer time) to bring it to rest — this is why trucks need longer stopping distances than cars.</p>
  <p>When two objects collide (e.g. two snooker balls, or two vehicles), the total momentum of the system is conserved as long as no outside force interferes. This principle allows scientists to predict the velocities of objects after a collision.</p>
`)}
${worked([
  {q:"Calculate the momentum of a 1200 kg car moving at 20 m/s.",
   s:"p = mv = 1200 × 20 = 24,000 kg m/s."},
  {q:"A force of 50 N acts on a body for 4 s. Calculate the impulse produced.",
   s:"Impulse = F × t = 50 × 4 = 200 N s."},
  {q:"A trolley of mass 2 kg moving at 6 m/s collides and sticks to a stationary trolley of mass 4 kg. Find their common velocity after collision (assume momentum is conserved).",
   s:"Momentum before = momentum after: (2×6) + (4×0) = (2+4) × v → 12 = 6v → v = 2 m/s."}
])}
${applications([
  "Car crumple zones increase the time of impact during a crash, reducing the force on passengers (since impulse = F × t is fixed by the change in momentum).",
  "In football, a player 'gives' slightly when catching or trapping a fast ball to increase contact time and reduce the force felt.",
  "Rocket propulsion relies on conservation of momentum: gas is ejected backward so the rocket gains forward momentum."
])}
${waec("WAEC often links impulse to safety features such as crumple zones and airbags — be ready to explain why increasing impact TIME reduces the force felt, using impulse = F × t.")}
${neco("NECO frequently sets a straightforward conservation-of-momentum collision problem — always write 'momentum before = momentum after' clearly before substituting values.")}
${mistake("Remember momentum is a vector — direction matters. In collision problems, objects moving in opposite directions should have velocities with opposite signs.")}
${mcqBlock("2_2",[
  {q:"Momentum is the product of a body's:", opts:["Mass and acceleration","Mass and velocity","Force and time","Weight and height"], correct:1},
  {q:"The SI unit of impulse is the:", opts:["Newton","Newton-second","Joule","Watt"], correct:1},
  {q:"According to the law of conservation of momentum, in a collision with no external force:", opts:["Momentum increases","Momentum decreases","Total momentum stays the same","Momentum becomes zero"], correct:2}
])}
${theoryQs([
  "Define momentum and impulse, stating their SI units.",
  "State the law of conservation of momentum.",
  "Explain, using the concept of impulse, why airbags reduce injury in car accidents."
])}
${revisionQs([
  "Calculate the momentum of a 5 kg object moving at 8 m/s.",
  "A force of 10 N acts on a body for 6 s. Find the impulse produced."
])}
${summary("Momentum (mass × velocity) describes the 'quantity of motion' a body has. Impulse (force × time) equals the change in momentum produced. Total momentum is conserved in collisions where no external force acts.")}
${homework("A 3 kg trolley moving at 4 m/s collides with a stationary 1 kg trolley and they move together after collision. Calculate their common velocity, assuming momentum is conserved.")}
`;

const LESSON_2_3 = `
${objectives([
  "Define work and energy, and state their SI units.",
  "Identify and describe the different forms of mechanical energy.",
  "Apply the principle of conservation of energy to simple problems."
])}
${intro("You do 'work' in the Physics sense only when a force you apply actually causes movement. Lifting a bag of rice up a flight of stairs is work; pushing against a solid wall that doesn't move, however tiring, is not work in the Physics sense.")}
${defs([
  {term:"Work", def:"Done when a force moves its point of application through a distance in the direction of the force; Work = Force × Distance moved in the direction of the force."},
  {term:"Energy", def:"The capacity of a body to do work."},
  {term:"Kinetic energy", def:"The energy a body possesses due to its motion."},
  {term:"Potential energy", def:"The energy a body possesses due to its position or state, e.g. its height above the ground."}
])}
${formula(`
  Work (W) = Force (F) × Distance (d); SI unit: joule (J)<br>
  Kinetic Energy (K.E.) = ½ m v²<br>
  Potential Energy (P.E.) = m g h  (where g is acceleration due to gravity, h is height)
`)}
${explain(`
  <p>The <b>law of conservation of energy</b> states that energy cannot be created or destroyed, only transformed from one form to another. When you lift a ball, you give it potential energy; when you release it, that potential energy converts into kinetic energy as it falls, and just before hitting the ground, almost all the potential energy has become kinetic energy.</p>
  ${table(["Form of energy","Example"],[
    ["Kinetic energy","A moving car, flowing water"],
    ["Potential energy","Water behind a dam, a stretched bow"],
    ["Chemical energy","Food, fuel, batteries"],
    ["Heat (thermal) energy","A heated pot, sunlight"],
    ["Electrical energy","Current flowing through a wire"],
    ["Sound energy","A ringing bell"]
  ])}
`)}
${worked([
  {q:"A boy pushes a box with a force of 40 N through a distance of 5 m. Calculate the work done.",
   s:"W = F × d = 40 × 5 = 200 J."},
  {q:"Calculate the kinetic energy of a 2 kg ball moving at 6 m/s.",
   s:"K.E. = ½ m v² = ½ × 2 × 6² = ½ × 2 × 36 = 36 J."},
  {q:"A 5 kg object is raised to a height of 3 m. Calculate its potential energy (take g = 10 m/s²).",
   s:"P.E. = mgh = 5 × 10 × 3 = 150 J."}
])}
${applications([
  "Hydroelectric dams convert the potential energy of stored water into kinetic energy, then electrical energy, as the water falls and turns turbines.",
  "A pendulum clock continuously converts energy between potential (at the highest point of swing) and kinetic (at the lowest point).",
  "Weightlifters do measurable work (in joules) each time they lift a barbell a given height."
])}
${waec("WAEC frequently distinguishes work done by a force from a force that produces no movement — always check that movement actually occurs in the direction of the force before calculating work.")}
${neco("NECO likes questions on energy transformation in devices, e.g. 'state the energy transformation that takes place in a torchlight' (chemical → electrical → light and heat) — practice tracing energy changes through common devices.")}
${mistake("Do not forget to square the velocity in the kinetic energy formula — a common error is using K.E. = ½mv instead of ½mv².")}
${mcqBlock("2_3",[
  {q:"The SI unit of work and energy is the:", opts:["Newton","Watt","Joule","Pascal"], correct:2},
  {q:"The kinetic energy of a 4 kg object moving at 5 m/s is:", opts:["20 J","50 J","100 J","10 J"], correct:1},
  {q:"A man pushes against a wall that does not move. The work done is:", opts:["Very large","Zero","Negative","Infinite"], correct:1}
])}
${theoryQs([
  "Define work and state its SI unit.",
  "State the law of conservation of energy and illustrate it with the example of a swinging pendulum.",
  "Calculate the potential energy of a 10 kg object raised 4 m above the ground (g = 10 m/s²)."
])}
${revisionQs([
  "A force of 25 N moves an object through 8 m. Calculate the work done.",
  "State two forms of energy and give one example of each."
])}
${summary("Work is done when a force causes movement in its own direction (W = Fd). Energy — the capacity to do work — exists in many forms and is always conserved, only changing from one form to another, as described by the law of conservation of energy.")}
${homework("A 2 kg stone is dropped from a height of 5 m. Calculate its potential energy at the top (g = 10 m/s²) and its kinetic energy just before hitting the ground, explaining why the two values should be equal.")}
`;

const LESSON_2_4 = `
${objectives([
  "Define power and efficiency, and state their units.",
  "Calculate the power developed by a machine or person.",
  "Calculate the efficiency of a simple machine."
])}
${intro("Two workers might do the same amount of work — carrying the same number of blocks up to a roof — but if one finishes in 10 minutes and the other in 30 minutes, the faster worker has a greater power output. Power measures how quickly work is done.")}
${defs([
  {term:"Power", def:"The rate of doing work, or the rate of energy transfer; Power = Work done ÷ Time taken."},
  {term:"Efficiency", def:"The ratio of useful output energy (or work) to the total input energy (or work) supplied to a machine, usually expressed as a percentage."}
])}
${formula(`
  Power (P) = Work done (W) ÷ Time (t); SI unit: watt (W), where 1 W = 1 J/s<br>
  Efficiency = (Useful energy output ÷ Total energy input) × 100%
`)}
${explain(`
  <p>No real machine is 100% efficient — some energy is always "lost" to friction, heat, or sound. A petrol engine, for example, converts only about a third of the chemical energy in fuel into useful mechanical energy; the rest becomes heat.</p>
  ${diagramLever()}
  <p>Simple machines such as levers, pulleys, and inclined planes make work easier by changing the size or direction of a force, but they never create extra energy — the output energy can never exceed the input energy.</p>
`)}
${worked([
  {q:"A machine does 600 J of work in 20 s. Calculate its power.",
   s:"P = W ÷ t = 600 ÷ 20 = 30 W."},
  {q:"A pump has a power rating of 500 W. How much work does it do in 2 minutes (120 s)?",
   s:"W = P × t = 500 × 120 = 60,000 J."},
  {q:"A machine is supplied with 800 J of energy but produces only 600 J of useful work. Calculate its efficiency.",
   s:"Efficiency = (600 ÷ 800) × 100% = 75%."}
])}
${applications([
  "Electricity bills are based on power (in kilowatts) used over time — this is why appliance labels show power ratings.",
  "Engineers compare engines using efficiency ratings to choose designs that waste less fuel as heat.",
  "A more powerful motor lifts the same load in less time than a weaker one."
])}
${waec("WAEC commonly gives work and time (or energy input and output) and asks for power or efficiency — always convert time to seconds and express efficiency as a percentage in your final answer.")}
${neco("NECO sometimes asks WHY no machine can be 100% efficient — prepare a short explanation mentioning friction and heat losses.")}
${mistake("Do not confuse power with energy/work — power is the RATE at which work is done, not the amount of work itself.")}
${mcqBlock("2_4",[
  {q:"The SI unit of power is the:", opts:["Joule","Newton","Watt","Pascal"], correct:2},
  {q:"A machine does 1000 J of work in 10 s. Its power is:", opts:["10 W","100 W","1000 W","10000 W"], correct:1},
  {q:"A machine's efficiency can never be:", opts:["Less than 50%","More than 100%","Equal to 100%","Less than 100%"], correct:1}
])}
${theoryQs([
  "Define power and state its SI unit.",
  "A crane lifts a load doing 5000 J of work in 25 s. Calculate its power.",
  "Explain why no machine can be 100% efficient."
])}
${revisionQs([
  "A machine has a power output of 200 W. How much work does it do in 15 s?",
  "A machine converts 500 J of input energy into 350 J of useful work. Calculate its efficiency."
])}
${summary("Power is the rate of doing work (P = W/t), measured in watts. Efficiency compares useful energy output to total energy input as a percentage; real machines always lose some energy, usually as heat, so efficiency is always below 100%.")}
${homework("An electric motor does 3600 J of useful work in 30 s while being supplied with 4500 J of electrical energy. Calculate (a) its power output and (b) its efficiency.")}
`;

const LESSON_2_5 = `
${objectives([
  "Define friction and state its causes.",
  "Distinguish between static and kinetic (dynamic) friction.",
  "State the advantages and disadvantages of friction, and ways to control it."
])}
${intro("Try pushing a heavy box across a rough floor, then across a polished floor — the rough floor resists motion much more. This resistance is friction, a force present whenever two surfaces are in contact.")}
${defs([
  {term:"Friction", def:"The force that opposes the relative motion (or attempted motion) between two surfaces in contact."},
  {term:"Static friction", def:"Friction that acts between two surfaces that are not yet moving relative to each other, opposing the start of motion."},
  {term:"Kinetic (dynamic) friction", def:"Friction that acts between two surfaces already sliding over one another."}
])}
${explain(`
  <p>Friction arises mainly from the microscopic roughness of surfaces — even surfaces that look smooth have tiny bumps that interlock. Static friction is generally greater than kinetic friction, which is why it's harder to start pushing a heavy object than to keep it moving once it's sliding.</p>
  ${table(["Advantages of friction","Disadvantages of friction"],[
    ["Allows walking without slipping","Causes wear and tear on moving machine parts"],
    ["Allows vehicle tyres to grip the road","Generates unwanted heat, wasting energy"],
    ["Allows nails and screws to stay in place","Reduces the efficiency of machines"],
    ["Enables writing with a pen or chalk","Slows down moving objects, requiring extra fuel"]
  ])}
  <p>Friction can be reduced by lubrication (oil, grease), using ball bearings, or streamlining (smoothing) surfaces; it can be increased by roughening surfaces or using rubber (e.g. tyre treads, shoe soles).</p>
`)}
${applications([
  "Car brake pads use friction deliberately to slow the vehicle safely.",
  "Engine oil reduces friction between moving metal parts, preventing overheating and wear.",
  "Football boots have studs to increase friction (grip) with the ground, preventing slipping."
])}
${waec("WAEC frequently asks for the advantages and disadvantages of friction, together with methods of reducing or increasing it — prepare a clear table like the one above.")}
${neco("NECO may ask you to explain why it is harder to start pushing an object than to keep it moving — this tests your understanding of static versus kinetic friction directly.")}
${mistake("Do not say friction is always bad — many everyday activities (walking, writing, driving) are only possible because of friction; the goal in engineering is to control friction, not eliminate it entirely.")}
${lab("Investigating friction","Place a wooden block on a horizontal surface and attach a spring balance. Gradually pull the block and record the reading on the spring balance just as it begins to move (this gives the maximum static friction) and while it is moving steadily (kinetic friction). Repeat on a rougher and a smoother surface and compare.")}
${mcqBlock("2_5",[
  {q:"Friction is the force that:", opts:["Causes motion","Opposes relative motion between surfaces","Increases speed","Has no effect on machines"], correct:1},
  {q:"Which of these reduces friction?", opts:["Roughening the surface","Adding lubricant","Increasing surface contact","Adding more weight"], correct:1},
  {q:"Static friction compared to kinetic friction is generally:", opts:["Smaller","Equal","Greater","Non-existent"], correct:2}
])}
${theoryQs([
  "Define friction and distinguish between static and kinetic friction.",
  "State three advantages and three disadvantages of friction.",
  "Describe an experiment to compare friction on a rough surface and a smooth surface."
])}
${revisionQs([
  "Why do engineers add oil to the moving parts of machines?",
  "Give two ways of increasing friction where more grip is needed."
])}
${summary("Friction opposes relative motion between surfaces in contact. Static friction (before motion starts) is generally greater than kinetic friction (during motion). Friction has both benefits (grip, writing) and drawbacks (energy loss, wear), and can be controlled by lubrication, surface roughness, or streamlining.")}
${homework("List five machines or tools in your home that rely on friction to function properly, and for each, briefly explain the role friction plays.")}
`;

const LESSON_2_6 = `
${objectives([
  "Define equilibrium, centre of gravity and stability.",
  "State the conditions necessary for a body to be in equilibrium.",
  "Explain the factors that affect the stability of an object."
])}
${intro("A well-loaded truck can tip over on a bend, while a low sports car rarely does. Understanding centre of gravity and stability explains why — and helps engineers design safer vehicles, furniture, and structures.")}
${defs([
  {term:"Equilibrium", def:"The state of a body when the resultant force and resultant turning effect (moment) acting on it are both zero, so it remains at rest or moves at constant velocity."},
  {term:"Centre of gravity", def:"The single point in a body through which its entire weight appears to act."},
  {term:"Stability", def:"The ability of a body to return to its original position after being slightly displaced or tilted."}
])}
${explain(`
  <p>A body is in equilibrium when: (1) the sum of forces acting on it in any direction is zero, and (2) the sum of the turning effects (moments) about any point is zero.</p>
  ${table(["Type of equilibrium","Description","Example"],[
    ["Stable equilibrium","Returns to original position when slightly displaced","A cone resting on its base"],
    ["Unstable equilibrium","Moves further away from original position when slightly displaced","A cone balanced on its tip"],
    ["Neutral equilibrium","Stays in its new position when displaced, neither returning nor moving further","A ball on a flat, level surface"]
  ])}
  <p>An object is more stable when it has a <b>low centre of gravity</b> and a <b>wide base area</b>. This is why racing cars are built low and wide, and why a tall, narrow object (like a stack of boxes) tips over more easily than a short, wide one.</p>
`)}
${worked([
  {q:"A wooden cone is placed first on its flat base, then balanced on its pointed tip. State the type of equilibrium in each case.",
   s:"On its flat base: stable equilibrium (low centre of gravity, wide base — it returns to position if slightly tilted). Balanced on its tip: unstable equilibrium (high centre of gravity, tiny base — any slight tilt makes it fall over)."}
])}
${applications([
  "Racing cars are designed low and wide to lower the centre of gravity and increase stability at high speed.",
  "A tightrope walker carries a long pole to lower and widen the effective centre of gravity, improving balance.",
  "Buses and trucks are loaded with heavier goods at the bottom to keep the centre of gravity low and prevent tipping."
])}
${waec("WAEC frequently asks candidates to identify the type of equilibrium shown in a diagram (cone on base, on side, or on tip) — practice recognising all three types quickly from simple sketches.")}
${neco("NECO may ask how the stability of a vehicle can be improved — mention lowering the centre of gravity and widening the wheelbase/base area.")}
${mistake("Do not confuse a wide base with a low centre of gravity — both increase stability, but they are two separate factors, and a full answer should mention both.")}
${lab("Testing stability","Construct simple cardboard shapes with the same height but different base widths. Tilt each gently and note the angle at which it topples. Compare results to relate base width to stability.")}
${mcqBlock("2_6",[
  {q:"A body is in stable equilibrium if, when slightly displaced, it:", opts:["Falls over completely","Returns to its original position","Stays in the new position","Moves further away"], correct:1},
  {q:"Which factor increases the stability of an object?", opts:["High centre of gravity","Narrow base","Low centre of gravity","Increasing height only"], correct:2},
  {q:"A ball resting on a flat table is in:", opts:["Stable equilibrium","Unstable equilibrium","Neutral equilibrium","No equilibrium"], correct:2}
])}
${theoryQs([
  "Define centre of gravity and state two factors that affect the stability of a body.",
  "Distinguish between stable, unstable and neutral equilibrium, giving one example of each.",
  "Explain why racing cars are designed with a low, wide body."
])}
${revisionQs([
  "Why is a fully loaded top-heavy truck more likely to overturn on a bend than an empty one?",
  "State the two conditions necessary for a body to be in equilibrium."
])}
${summary("A body is in equilibrium when the resultant force and resultant moment acting on it are both zero. Stability — the tendency to return to an original position after being tilted — is improved by a low centre of gravity and a wide base, and bodies may be in stable, unstable, or neutral equilibrium.")}
${homework("Explain, using the ideas of centre of gravity and base area, why a bicycle is harder to balance when stationary than a tricycle.")}
`;

const LESSON_2_7 = `
${objectives([
  "State Newton's law of universal gravitation.",
  "Distinguish between mass and weight.",
  "Solve simple problems involving weight and acceleration due to gravity."
])}
${intro("Why does an apple fall to the ground instead of floating away? Why does the Moon orbit the Earth instead of drifting off into space? Both are explained by gravitation — the force of attraction between any two masses in the universe.")}
${defs([
  {term:"Gravitation", def:"The force of attraction that exists between any two masses in the universe."},
  {term:"Weight", def:"The force of gravity acting on the mass of a body; Weight = mass × acceleration due to gravity (W = mg)."},
  {term:"Acceleration due to gravity (g)", def:"The acceleration experienced by a freely falling object due to the Earth's gravitational pull, approximately 10 m/s² (more precisely 9.8 m/s²) near the Earth's surface."}
])}
${formula("Weight (W) = mass (m) × acceleration due to gravity (g); SI unit of weight: newton (N)")}
${explain(`
  <p>Every object with mass attracts every other object with mass — this is Newton's law of universal gravitation. The force is usually too small to notice between everyday objects, but becomes significant when at least one mass is enormous, like the Earth.</p>
  ${table(["Mass","Weight"],[
    ["Amount of matter in a body","Force of gravity acting on that matter"],
    ["Measured in kilograms (kg)","Measured in newtons (N)"],
    ["Same everywhere in the universe","Varies with location (different g values)"],
    ["Measured with a beam balance","Measured with a spring balance"]
  ])}
  <p>Because the Moon has a weaker gravitational pull than the Earth (about one-sixth), an astronaut's mass stays the same on the Moon, but their weight is much less — this is why astronauts can jump so high on the Moon.</p>
`)}
${worked([
  {q:"Calculate the weight of a 60 kg student on Earth (g = 10 m/s²).",
   s:"W = mg = 60 × 10 = 600 N."},
  {q:"An astronaut has a mass of 80 kg. If the Moon's gravitational acceleration is 1.6 m/s², find the astronaut's weight on the Moon.",
   s:"W = mg = 80 × 1.6 = 128 N (much less than the 800 N they would weigh on Earth)."}
])}
${applications([
  "Satellites remain in orbit around the Earth because of the continuous pull of gravity acting as a centripetal force.",
  "Weighing scales in shops actually measure weight (a force) but are calibrated to display mass in kilograms, assuming standard Earth gravity.",
  "Tides on Earth are caused mainly by the gravitational pull of the Moon on the oceans."
])}
${waec("WAEC frequently tests the distinction between mass and weight directly — always mention that mass is constant everywhere while weight changes with the local value of g.")}
${neco("NECO may ask you to calculate weight on the Moon given a different value of g — always identify which g value the question wants you to use.")}
${mistake("Do not use the same word 'weight' when a question means 'mass', or vice versa — this confusion costs many students marks even when their formula and arithmetic are correct.")}
${mcqBlock("2_7",[
  {q:"Weight is measured in:", opts:["Kilograms","Newtons","Grams","Metres"], correct:1},
  {q:"A body's mass on the Moon compared to on Earth is:", opts:["Six times more","The same","One-sixth","Zero"], correct:1},
  {q:"A 50 kg object on Earth (g = 10 m/s²) has a weight of:", opts:["5 N","50 N","500 N","5000 N"], correct:2}
])}
${theoryQs([
  "Distinguish between mass and weight, stating the unit of each.",
  "State Newton's law of universal gravitation.",
  "Calculate the weight of a 45 kg boy on Earth, taking g = 10 m/s²."
])}
${revisionQs([
  "Why would an object weigh less on the Moon than on Earth, even though its mass is unchanged?",
  "A stone has a mass of 2 kg. Calculate its weight on Earth (g = 10 m/s²)."
])}
${summary("Gravitation is the universal force of attraction between masses. Weight (W = mg) is the force of gravity on a body's mass and varies with location, while mass itself remains constant everywhere in the universe.")}
${homework("A rock has a mass of 12 kg. Calculate its weight on Earth (g = 10 m/s²) and on the Moon (g = 1.6 m/s²), and explain in your own words why the two values are different.")}
`;

const LESSON_2_8 = `
${objectives([
  "Define circular motion and centripetal force.",
  "Define projectile motion and identify examples.",
  "Solve simple problems involving centripetal force and projectile range."
])}
${intro("A stone tied to a string and swung in a circle, and a ball thrown horizontally off a cliff, may look unrelated — but both involve forces acting on a moving body in ways that create curved paths. This lesson covers circular motion and projectile motion together.")}
${defs([
  {term:"Circular motion", def:"The motion of a body along a circular path at a constant speed, with its direction continuously changing."},
  {term:"Centripetal force", def:"The force directed towards the centre of a circular path, which keeps a body moving in that circle."},
  {term:"Projectile", def:"Any object given an initial velocity and then allowed to move freely under gravity alone, following a curved path."}
])}
${explain(`
  ${diagramCircular()}
  <p>Even though the speed in circular motion may be constant, the <b>velocity</b> is always changing because its direction changes continuously — and since acceleration is a change in velocity, a body in circular motion is always accelerating towards the centre. This centre-directed acceleration is caused by the centripetal force.</p>
  ${formula("Centripetal Force (F) = m v² ÷ r  (where m = mass, v = speed, r = radius of the circular path)")}
  <p>A <b>projectile</b>, once launched, experiences two independent motions at the same time: constant horizontal velocity (no horizontal force acting, ignoring air resistance) and accelerating vertical motion due to gravity. Combined, these produce the familiar curved (parabolic) path.</p>
  ${diagramProjectile()}
`)}
${worked([
  {q:"A 2 kg stone moves in a circle of radius 0.5 m at a speed of 4 m/s. Calculate the centripetal force acting on it.",
   s:"F = mv² ÷ r = (2 × 4²) ÷ 0.5 = (2 × 16) ÷ 0.5 = 32 ÷ 0.5 = 64 N."},
  {q:"A ball is thrown horizontally off a cliff and takes 3 s to hit the ground. Explain what happens to its horizontal and vertical velocities during the fall.",
   s:"Its horizontal velocity stays constant throughout the fall (no horizontal force acting). Its vertical velocity increases steadily due to gravity, causing it to accelerate downward at g (about 10 m/s²)."}
])}
${applications([
  "Cars going round a bend rely on friction between tyres and road to provide the centripetal force needed; on icy roads this force is reduced, causing skidding.",
  "Satellites orbiting the Earth are undergoing circular motion, with gravity providing the centripetal force.",
  "A footballer taking a long pass, or a javelin thrower, launches a projectile whose path can be predicted using projectile motion principles.",
  "Washing machines use rapid circular motion in the spin cycle to force water out of clothes."
])}
${waec("WAEC often asks candidates to explain why a body moving at constant speed in a circle is still accelerating — always mention that velocity (a vector) changes direction even when speed (a scalar) stays the same.")}
${neco("NECO may set a numerical question using F = mv²/r — practice substituting values carefully, remembering to square the speed, not the radius.")}
${mistake("Do not think a projectile's horizontal and vertical motions affect each other — they are independent; only the vertical motion is affected by gravity, while the horizontal velocity remains unchanged (ignoring air resistance).")}
${mcqBlock("2_8",[
  {q:"Centripetal force acts in which direction relative to the circular path?", opts:["Away from the centre","Towards the centre","Along the circle's edge","Backward"], correct:1},
  {q:"A 1 kg object moves in a circle of radius 2 m at 4 m/s. The centripetal force is:", opts:["2 N","4 N","8 N","16 N"], correct:2},
  {q:"During projectile motion (ignoring air resistance), the horizontal velocity:", opts:["Increases steadily","Decreases steadily","Remains constant","Becomes zero immediately"], correct:2}
])}
${theoryQs([
  "Define centripetal force and state the formula used to calculate it.",
  "Explain why a body moving at constant speed around a circle is still said to be accelerating.",
  "Describe the horizontal and vertical motions of a projectile launched horizontally, and explain how they combine to produce its curved path."
])}
${revisionQs([
  "A 0.5 kg ball moves in a circle of radius 1 m at 3 m/s. Calculate the centripetal force acting on it.",
  "Give two real-life examples of projectile motion."
])}
${summary("Circular motion involves a constantly changing direction of velocity, requiring a centripetal force directed toward the centre (F = mv²/r). Projectile motion combines constant horizontal velocity with accelerating vertical motion under gravity, producing a curved (parabolic) path.")}
${homework("A car of mass 1000 kg goes round a bend of radius 25 m at a speed of 10 m/s. Calculate the centripetal force required, and explain what provides this force in a real car on a real road.")}
`;

// ============================================================
// TERM 3 CONTENT
// ============================================================

const LESSON_3_1 = `
${objectives([
  "Distinguish between heat and temperature.",
  "Explain thermal expansion in solids, liquids and gases.",
  "State practical applications and consequences of thermal expansion."
])}
${intro("On a hot afternoon, railway tracks can buckle, and a metal lid stuck on a jar can be loosened by running it under hot water. Both involve heat and the expansion it causes — the subject of this lesson.")}
${defs([
  {term:"Heat", def:"A form of energy that flows from a body at a higher temperature to one at a lower temperature; measured in joules (J)."},
  {term:"Temperature", def:"A measure of the degree of hotness or coldness of a body, measured in degrees Celsius (°C) or kelvin (K)."},
  {term:"Thermal expansion", def:"The increase in the size (length, area, or volume) of a substance when it is heated."}
])}
${explain(`
  <p>Heat is a form of <b>energy</b>; temperature is simply a <b>measure</b> of how hot or cold something is. A small cup of boiling water and a large pot of boiling water are at the same temperature (100°C), but the pot contains far more heat energy because it has more mass.</p>
  ${table(["Property","Heat","Temperature"],[
    ["What it measures","Quantity of thermal energy","Degree of hotness/coldness"],
    ["SI unit","Joule (J)","Kelvin (K), or °C"],
    ["Instrument","Calorimeter (indirectly)","Thermometer"]
  ])}
  <p>When substances are heated, their particles vibrate or move faster and spread further apart, causing <b>expansion</b>. Generally, gases expand the most for a given temperature rise, followed by liquids, then solids, because gas particles are least tightly bound.</p>
  ${table(["State of matter","Degree of expansion"],[
    ["Solids","Least expansion — particles are tightly fixed in position"],
    ["Liquids","Moderate expansion — particles are close but can move"],
    ["Gases","Greatest expansion — particles are far apart and move freely"]
  ])}
`)}
${applications([
  "Gaps are left between railway tracks and at the joints of bridges to allow for expansion in hot weather, preventing buckling.",
  "A metal lid on a glass jar can be loosened by heating it in hot water, since metal expands more than glass for the same temperature rise.",
  "Bimetallic strips (two different metals joined together) bend when heated because the metals expand by different amounts — used in thermostats to switch appliances on and off automatically."
])}
${waec("WAEC frequently asks why gaps are left in railway lines, bridges and overhead power lines — always link your answer to expansion during hot weather and the risk of buckling or snapping without the gap.")}
${neco("NECO may ask you to explain how a bimetallic strip works in a thermostat — mention that the two metals expand at different rates, causing the strip to bend and complete or break an electrical circuit.")}
${mistake("Do not say 'heat' and 'temperature' mean the same thing — a common WAEC/NECO trap question directly tests this distinction.")}
${lab("Demonstrating expansion in a solid","Heat a metal ball that just fits through a metal ring at room temperature. After heating, try to pass the ball through the ring again — it will no longer fit, showing that the metal has expanded.")}
${mcqBlock("3_1",[
  {q:"Heat is best described as a form of:", opts:["Temperature","Energy","Force","Distance"], correct:1},
  {q:"Which state of matter generally expands the most when heated?", opts:["Solids","Liquids","Gases","They all expand equally"], correct:2},
  {q:"Gaps are left in railway tracks mainly to allow for:", opts:["Painting","Thermal expansion","Decoration","Reducing weight"], correct:1}
])}
${theoryQs([
  "Distinguish between heat and temperature.",
  "Explain why gaps are left between sections of railway track.",
  "Explain how a bimetallic strip works and state one of its uses."
])}
${revisionQs([
  "Which expands more for the same rise in temperature — a solid or a gas? Explain why.",
  "State one everyday application of thermal expansion."
])}
${summary("Heat is a form of energy that flows from hotter to colder bodies; temperature measures the degree of hotness. Heating causes particles to move more and spread apart, producing thermal expansion, which is greatest in gases, less in liquids, and least in solids — with important practical consequences in construction and engineering.")}
${homework("Explain, in your own words, why telephone/electricity wires are hung slightly loose between poles rather than pulled perfectly tight.")}
`;

const LESSON_3_2 = `
${objectives([
  "Describe the structure and use of a liquid-in-glass thermometer.",
  "Define specific heat capacity and state its unit.",
  "Solve simple numerical problems involving specific heat capacity."
])}
${intro("Doctors use a thermometer to check a patient's temperature within seconds, and engineers choose materials carefully for cooking pots and car radiators based on how they store and release heat. Both rely on the ideas in this lesson.")}
${defs([
  {term:"Thermometer", def:"An instrument used for measuring temperature, commonly a liquid-in-glass thermometer using mercury or coloured alcohol."},
  {term:"Specific heat capacity", def:"The quantity of heat energy required to raise the temperature of 1 kg of a substance by 1°C (or 1 K)."}
])}
${explain(`
  ${diagramThermo()}
  <p>A liquid-in-glass thermometer works because the liquid inside (mercury or alcohol) expands and rises up a narrow, uniform capillary tube when heated, and contracts when cooled. The scale is calibrated using two fixed points: the <b>lower fixed point</b> (0°C, the melting point of pure ice) and the <b>upper fixed point</b> (100°C, the boiling point of pure water at standard atmospheric pressure).</p>
  ${formula("Heat energy (Q) = mass (m) × specific heat capacity (c) × temperature change (Δθ); Q = mcΔθ. SI unit of specific heat capacity: J/(kg °C) or J/(kg K)")}
  <p>Substances with a <b>high</b> specific heat capacity (like water) need a lot of energy to heat up and also release a lot of energy while cooling — this is why water is used in car radiators and hot water bottles. Substances with a <b>low</b> specific heat capacity (like metals) heat up and cool down quickly.</p>
`)}
${worked([
  {q:"Calculate the heat energy needed to raise the temperature of 2 kg of water from 20°C to 60°C. (Specific heat capacity of water = 4200 J/kg°C)",
   s:"Δθ = 60 − 20 = 40°C. Q = mcΔθ = 2 × 4200 × 40 = 336,000 J = 336 kJ."},
  {q:"A 0.5 kg block of metal absorbs 4000 J of heat and its temperature rises by 20°C. Calculate its specific heat capacity.",
   s:"c = Q ÷ (mΔθ) = 4000 ÷ (0.5 × 20) = 4000 ÷ 10 = 400 J/kg°C."}
])}
${applications([
  "Water's high specific heat capacity is why coastal areas have milder climates than inland areas — the sea absorbs and releases heat slowly.",
  "Cooking pots are often made of metal (low specific heat capacity) so they heat up quickly, while their handles are made of plastic or wood (also low conductivity) to stay cool to the touch.",
  "Car engines use water in the radiator to absorb large amounts of heat without a huge temperature rise, helping to cool the engine."
])}
${waec("WAEC frequently sets a direct Q = mcΔθ calculation — always identify m, c, and Δθ clearly from the question before substituting, and watch out for temperatures given as a rise/fall rather than final values.")}
${neco("NECO may ask you to state the two fixed points used to calibrate a thermometer and explain why they are used — practice stating the ice point and steam point precisely.")}
${mistake("A common error is using the initial or final temperature directly in Q = mcΔθ instead of the temperature CHANGE (Δθ = final − initial).")}
${lab("Determining specific heat capacity by the method of mixtures","Heat a known mass of metal to a known temperature, then transfer it quickly into a known mass of water at a known (lower) temperature inside a calorimeter. Measure the final common temperature and use the principle that heat lost by the metal equals heat gained by the water to calculate the specific heat capacity of the metal.")}
${mcqBlock("3_2",[
  {q:"The lower fixed point on a thermometer represents:", opts:["Boiling point of water","Melting point of pure ice","Room temperature","Body temperature"], correct:1},
  {q:"The SI unit of specific heat capacity is:", opts:["J/kg","J/(kg°C)","J","°C"], correct:1},
  {q:"The heat required to raise 3 kg of a substance (c = 500 J/kg°C) by 10°C is:", opts:["1500 J","5000 J","15000 J","500 J"], correct:2}
])}
${theoryQs([
  "Describe the structure of a liquid-in-glass thermometer and explain how it works.",
  "Define specific heat capacity and state its SI unit.",
  "Calculate the heat required to raise the temperature of 4 kg of water from 25°C to 75°C (c = 4200 J/kg°C)."
])}
${revisionQs([
  "State the two fixed points used in calibrating a thermometer.",
  "A 1 kg block absorbs 2000 J of heat and its temperature rises by 5°C. Calculate its specific heat capacity."
])}
${summary("A liquid-in-glass thermometer measures temperature using the expansion of a liquid between two fixed calibration points (0°C and 100°C). Specific heat capacity (Q = mcΔθ) describes how much heat energy a substance needs to change temperature, explaining why water is so useful for cooling and insulation.")}
${homework("A 0.2 kg piece of metal is heated and absorbs 1800 J of heat, causing its temperature to rise from 25°C to 55°C. Calculate its specific heat capacity.")}
`;

const LESSON_3_3 = `
${objectives([
  "Describe the three modes of heat transfer: conduction, convection and radiation.",
  "Distinguish between good and bad conductors of heat.",
  "Explain everyday phenomena using the appropriate mode of heat transfer."
])}
${intro("Why does the metal handle of a spoon left in a hot pot become hot, while the water in a boiling pot rises and circulates, and why can you feel the warmth of a fire from a distance without touching it? Each involves a different way heat travels: conduction, convection, and radiation.")}
${defs([
  {term:"Conduction", def:"The transfer of heat through a substance (usually a solid) from particle to particle, without the particles themselves moving from their positions."},
  {term:"Convection", def:"The transfer of heat through a fluid (liquid or gas) by the actual movement of the heated fluid itself, forming convection currents."},
  {term:"Radiation", def:"The transfer of heat energy through space by electromagnetic waves, requiring no material medium."}
])}
${explain(`
  ${table(["Mode","Medium needed","Example"],[
    ["Conduction","Solids (mainly)","A metal spoon heating up in hot soup"],
    ["Convection","Liquids and gases","Water boiling in a pot; hot air rising in a room"],
    ["Radiation","No medium needed (works in a vacuum)","Heat from the Sun reaching the Earth through space"]
  ])}
  <p><b>Good conductors</b> of heat (like copper, aluminium, and other metals) allow heat to pass through quickly and are used where fast heat transfer is wanted, e.g. cooking pots. <b>Poor conductors (insulators)</b>, like wood, plastic, and air, are used where heat loss should be minimised, e.g. pot handles, thermos flasks, and winter clothing.</p>
  <p>Convection happens because heated fluid becomes less dense, rises, and is replaced by cooler, denser fluid sinking down — creating a continuous convection current, as seen when water is heated in a pot or air is heated in a room.</p>
  <p>Radiation is the only mode of heat transfer that can travel through a vacuum (empty space), which is why the Sun's heat can reach the Earth across space, where there is no medium for conduction or convection to occur.</p>
`)}
${applications([
  "Thermos flasks use a vacuum layer (to prevent conduction and convection), silvered walls (to reflect radiation), and an insulating stopper to keep drinks hot or cold for hours.",
  "Cooking pots are made of metal (a good conductor) so heat reaches the food quickly, while their handles are made of wood or plastic (poor conductors) to prevent burns.",
  "Dark, matte surfaces absorb more radiant heat than light, shiny surfaces — this is why wearing dark clothes feels hotter under strong sunlight.",
  "Land and sea breezes are caused by convection currents formed as land and sea heat and cool at different rates."
])}
${waec("WAEC often asks you to explain why a thermos flask keeps liquids hot, expecting you to reference all three modes of heat transfer (vacuum stops conduction/convection, silvering reduces radiation) — prepare this full explanation, not just one part.")}
${neco("NECO frequently asks for the difference between conduction and convection with an everyday example for each — always mention that conduction involves particles passing energy along without moving position, while convection involves the fluid itself moving.")}
${mistake("Do not say radiation needs a medium to travel — it is the one mode of heat transfer that works even through a vacuum, which is exactly why sunlight can reach us across empty space.")}
${lab("Investigating convection in water","Half-fill a beaker with water, add a few crystals of potassium permanganate at the bottom, and heat the beaker gently from one side using a Bunsen burner. Observe and describe the coloured convection currents that form as the water circulates.")}
${mcqBlock("3_3",[
  {q:"Heat transfer that occurs without any medium is called:", opts:["Conduction","Convection","Radiation","Reflection"], correct:2},
  {q:"A good conductor of heat is:", opts:["Wood","Plastic","Copper","Air"], correct:2},
  {q:"Convection currents occur mainly in:", opts:["Solids only","Liquids and gases","Vacuums only","Metals only"], correct:1}
])}
${theoryQs([
  "Distinguish between conduction, convection and radiation, giving one example of each.",
  "Explain how a thermos flask keeps a liquid hot for several hours.",
  "Explain why land and sea breezes occur, using the idea of convection."
])}
${revisionQs([
  "Why is radiation the only mode of heat transfer that can occur through a vacuum?",
  "State two good conductors and two poor conductors (insulators) of heat."
])}
${summary("Heat transfers by conduction (particle-to-particle, mainly in solids), convection (movement of heated fluid, in liquids and gases), and radiation (electromagnetic waves, needing no medium). Everyday devices like thermos flasks and cooking pots are designed around controlling these three modes.")}
${homework("Explain, using the correct mode(s) of heat transfer, why a metal spoon left standing in a cup of hot tea becomes too hot to touch after a while, while a wooden or plastic spoon in the same cup stays cool.")}
`;

const LESSON_3_4 = `
${objectives([
  "State the laws of reflection of light.",
  "Describe image formation in plane and curved mirrors.",
  "Solve simple ray-diagram problems involving reflection."
])}
${intro("Mirrors are part of daily life — from checking your appearance to a dentist's small curved mirror, to the huge curved mirrors inside torchlights and car headlights. All obey the same basic laws of reflection.")}
${defs([
  {term:"Reflection of light", def:"The bouncing back of light when it strikes a surface, without passing through it."},
  {term:"Normal", def:"An imaginary line drawn perpendicular (at 90°) to a reflecting surface at the point where a ray strikes it."},
  {term:"Angle of incidence", def:"The angle between the incident (incoming) ray and the normal."},
  {term:"Angle of reflection", def:"The angle between the reflected (outgoing) ray and the normal."}
])}
${explain(`
  ${diagramMirror()}
  <p>The <b>laws of reflection</b> state that: (1) the angle of incidence equals the angle of reflection, and (2) the incident ray, the reflected ray, and the normal all lie in the same plane.</p>
  ${table(["Mirror type","Image formed by object in front"],[
    ["Plane (flat) mirror","Virtual, upright, same size as object, laterally inverted (left-right reversed)"],
    ["Concave (converging) mirror","Depends on object distance — can be real & inverted, or virtual, upright & magnified (used for shaving/make-up mirrors when object is close)"],
    ["Convex (diverging) mirror","Always virtual, upright, and smaller than the object — gives a wide field of view (used for car side mirrors and security mirrors)"]
  ])}
  <p>A <b>virtual image</b> cannot be captured on a screen (it appears to be behind the mirror), while a <b>real image</b> can be projected onto a screen (light rays actually meet at that point).</p>
`)}
${worked([
  {q:"A ray of light strikes a plane mirror at an angle of incidence of 35°. Find the angle of reflection, and the angle between the incident ray and the reflected ray.",
   s:"By the law of reflection, angle of reflection = angle of incidence = 35°. Angle between incident and reflected rays = 35° + 35° = 70°."}
])}
${applications([
  "Convex mirrors are used as car side/wing mirrors and shop security mirrors because they give a wider field of view, though objects appear smaller and further away than they really are.",
  "Concave mirrors are used in torchlights and car headlamps to focus light from a bulb into a strong, parallel beam.",
  "Dentists use small concave mirrors to see a magnified, upright image of teeth at close range."
])}
${waec("WAEC frequently gives an angle of incidence and asks for the angle of reflection, or asks you to sketch a ray diagram showing the normal — always draw the normal as a dashed line perpendicular to the mirror surface.")}
${neco("NECO may ask why car side mirrors carry the inscription 'objects are closer than they appear' — link your answer to the wide field of view (but reduced image size) given by a convex mirror.")}
${mistake("Do not confuse the angle of incidence/reflection (measured from the NORMAL) with the angle measured from the mirror surface itself — WAEC/NECO always measure these angles from the normal.")}
${lab("Verifying the laws of reflection","Using a plane mirror fixed vertically on a sheet of paper, a ray box (or pins) to send a single ray of light at a chosen angle onto the mirror, trace the incident and reflected rays, draw the normal at the point of incidence, and measure the angle of incidence and angle of reflection with a protractor to confirm they are equal.")}
${mcqBlock("3_4",[
  {q:"According to the law of reflection, the angle of incidence is:", opts:["Always 90°", "Always greater than the angle of reflection", "Equal to the angle of reflection", "Always zero"], correct:2},
  {q:"The image formed by a plane mirror is:", opts:["Real and inverted","Virtual, upright and the same size as the object","Real and magnified","Virtual and smaller than the object"], correct:1},
  {q:"Car side mirrors are usually:", opts:["Plane mirrors","Concave mirrors","Convex mirrors","Not mirrors at all"], correct:2}
])}
${theoryQs([
  "State the laws of reflection of light.",
  "Describe the nature of the image formed by a plane mirror.",
  "Explain why convex mirrors are preferred for car side mirrors, despite making objects appear smaller."
])}
${revisionQs([
  "A ray of light hits a mirror at an angle of incidence of 50°. What is the angle of reflection?",
  "Name one device that uses a concave mirror and explain why it is suitable."
])}
${summary("Light reflects according to two laws: the angle of incidence equals the angle of reflection, and the incident ray, reflected ray, and normal lie in the same plane. Plane mirrors form virtual, upright, same-size images; concave mirrors can form magnified or real images; convex mirrors always form smaller, virtual images with a wide field of view.")}
${homework("Sketch a ray diagram showing a ray of light striking a plane mirror at an angle of incidence of 40°, labelling the normal, the angle of incidence and the angle of reflection clearly.")}
`;

const LESSON_3_5 = `
${objectives([
  "Define refraction of light and state its laws in simple terms.",
  "Describe the action of convex and concave lenses on light.",
  "Explain everyday phenomena caused by refraction."
])}
${intro("A straw in a glass of water appears bent or broken at the surface — but the straw itself hasn't changed shape. This is refraction, the bending of light as it passes from one medium (like air) into another (like water) of different density.")}
${defs([
  {term:"Refraction of light", def:"The bending of a light ray as it passes from one transparent medium into another of different optical density, due to a change in speed."},
  {term:"Lens", def:"A piece of transparent material (usually glass or plastic) with at least one curved surface, which refracts light to converge or diverge it."}
])}
${explain(`
  <p>When light travels from a less dense medium (like air) into a more denser medium (like glass or water), it slows down and bends <b>towards</b> the normal. When it travels from a denser medium back into a less dense one, it speeds up and bends <b>away from</b> the normal.</p>
  ${diagramLens()}
  ${table(["Lens type","Effect on parallel light rays","Common use"],[
    ["Convex (converging) lens","Bends light rays inward to meet at a focus point","Magnifying glass, camera lens, correcting long-sightedness"],
    ["Concave (diverging) lens","Spreads light rays outward, as if from a focus point behind the lens","Correcting short-sightedness"]
  ])}
  <p>Refraction also causes <b>dispersion</b> — when white light (like sunlight) passes through a glass prism, different colours bend by slightly different amounts, spreading out into a band of colours called a spectrum: red, orange, yellow, green, blue, indigo, violet (often remembered as ROYGBIV). This is exactly how a rainbow forms, with water droplets in the sky acting as tiny prisms.</p>
`)}
${applications([
  "Eyeglasses use convex lenses to correct long-sightedness (helping the eye focus light from near objects) and concave lenses to correct short-sightedness.",
  "A swimming pool appears shallower than it really is due to refraction of light leaving the water and entering air.",
  "Rainbows form when sunlight is refracted, dispersed into its component colours, and reflected inside water droplets in the atmosphere.",
  "Cameras use convex lenses to focus light from a scene onto a photographic film or digital sensor."
])}
${waec("WAEC frequently asks candidates to explain why a straight stick partly immersed in water appears bent at the water surface — always mention that light bends as it passes from water (denser) to air (less dense), so the underwater part appears displaced from its true position.")}
${neco("NECO often tests the sequence of colours in the visible spectrum — memorise ROYGBIV (Red, Orange, Yellow, Green, Blue, Indigo, Violet) in the correct order.")}
${mistake("Do not confuse a convex lens (which converges/focuses light, thicker in the middle) with a concave lens (which diverges/spreads light, thinner in the middle) — many students mix up their shapes and effects.")}
${lab("Observing refraction","Place a coin at the bottom of an empty opaque cup so it is just out of your line of sight. Without moving your head, ask a partner to slowly pour water into the cup. Observe that the coin gradually becomes visible, showing that light from the coin is being refracted (bent) towards your eye as it passes from water into air.")}
${mcqBlock("3_5",[
  {q:"Refraction of light occurs when light:", opts:["Bounces off a surface", "Passes from one medium into another of different density", "Is absorbed completely", "Travels through a vacuum only"], correct:1},
  {q:"A convex lens is used to correct:", opts:["Short-sightedness","Long-sightedness","Colour blindness","Hearing problems"], correct:1},
  {q:"The correct order of colours in the visible spectrum, starting from red, is:", opts:["Red, Blue, Green, Yellow, Orange, Indigo, Violet","Red, Orange, Yellow, Green, Blue, Indigo, Violet","Violet, Indigo, Blue, Green, Yellow, Orange, Red","Red, Yellow, Blue, Green, Orange, Violet, Indigo"], correct:1}
])}
${theoryQs([
  "Define refraction of light and explain why a stick appears bent when partly dipped in water.",
  "Distinguish between the action of a convex lens and a concave lens on light rays.",
  "Explain how a rainbow is formed, using the ideas of refraction and dispersion."
])}
${revisionQs([
  "Why does a swimming pool appear shallower than its actual depth?",
  "State the correct order of colours produced when white light passes through a glass prism."
])}
${summary("Refraction is the bending of light as it moves between media of different optical density, bending towards the normal when entering a denser medium and away when leaving it. Convex lenses converge light while concave lenses diverge it, and refraction also causes dispersion — the splitting of white light into the seven colours of the spectrum.")}
${homework("Explain, using refraction, why a pencil placed at an angle in a glass of water appears to be broken or bent at the point where it enters the water.")}
`;

const LESSON_3_6 = `
${objectives([
  "Define wave motion and distinguish between transverse and longitudinal waves.",
  "Describe how sound is produced and how it travels.",
  "State the properties of sound waves and solve simple related problems."
])}
${intro("Whether it's ripples spreading across a pond, the vibration of a guitar string, or your own voice travelling across a room, all involve waves — a way of transferring energy from one place to another without transferring matter itself.")}
${defs([
  {term:"Wave", def:"A disturbance that transfers energy from one point to another without transferring matter."},
  {term:"Transverse wave", def:"A wave in which the particles of the medium vibrate at right angles (perpendicular) to the direction the wave travels, e.g. light waves, water waves."},
  {term:"Longitudinal wave", def:"A wave in which the particles of the medium vibrate parallel to (along) the direction the wave travels, e.g. sound waves."},
  {term:"Sound", def:"A form of energy produced by vibrating objects, which travels as a longitudinal wave through a material medium."}
])}
${explain(`
  ${diagramWave()}
  ${table(["Term","Meaning"],[
    ["Amplitude","The maximum displacement of a particle from its rest position"],
    ["Wavelength (λ)","The distance between two successive crests (or compressions)"],
    ["Frequency (f)","The number of complete waves (oscillations) passing a point per second, measured in hertz (Hz)"],
    ["Period (T)","The time taken for one complete oscillation, T = 1/f"],
    ["Wave speed (v)","The distance a wave travels per unit time, v = f × λ"]
  ])}
  <p>Sound is produced by vibrating objects (like a guitar string, a drum skin, or human vocal cords) and travels as a longitudinal wave, meaning it moves through a medium as a series of compressions (particles pushed close together) and rarefactions (particles spread apart). Sound needs a material medium (solid, liquid, or gas) to travel and <b>cannot travel through a vacuum</b>, unlike light.</p>
`)}
${formula("Wave speed (v) = frequency (f) × wavelength (λ)")}
${worked([
  {q:"A sound wave has a frequency of 256 Hz and a wavelength of 1.3 m. Calculate the speed of the wave.",
   s:"v = f × λ = 256 × 1.3 = 332.8 m/s (close to the known speed of sound in air, about 330–340 m/s)."},
  {q:"A wave has a speed of 340 m/s and a frequency of 170 Hz. Calculate its wavelength.",
   s:"λ = v ÷ f = 340 ÷ 170 = 2 m."}
])}
${applications([
  "Musical instruments (guitars, drums, flutes) all produce sound through vibration of strings, membranes, or air columns.",
  "Sonar systems on ships use sound waves travelling through water to detect the depth of the seabed or locate underwater objects.",
  "Doctors use ultrasound (very high frequency sound waves) to create images of a baby inside the womb.",
  "Because sound cannot travel through a vacuum, astronauts in open space must communicate using radio waves, not by shouting."
])}
${waec("WAEC frequently tests the fact that sound cannot travel through a vacuum, often using the example of an astronaut in space or a bell ringing inside a jar with the air removed — always state that a material medium is required.")}
${neco("NECO often sets a direct calculation using v = fλ — always check the units given (e.g. wavelength in cm should be converted to m) before substituting.")}
${mistake("Do not confuse transverse waves (vibration perpendicular to travel direction, like light and water waves) with longitudinal waves (vibration parallel to travel direction, like sound) — this distinction is commonly tested directly.")}
${lab("Demonstrating that sound needs a medium","Place a ringing electric bell inside a bell jar connected to a vacuum pump. As air is gradually pumped out of the jar, the sound of the bell becomes fainter and eventually inaudible, even though the bell can still be seen vibrating — showing that sound needs a medium to travel, unlike light.")}
${mcqBlock("3_6",[
  {q:"Sound waves are an example of:", opts:["Transverse waves","Longitudinal waves","Electromagnetic waves","None of the above"], correct:1},
  {q:"A wave with frequency 200 Hz and wavelength 1.5 m has a speed of:", opts:["133.3 m/s","300 m/s","201.5 m/s","1.5 m/s"], correct:1},
  {q:"Sound cannot travel through a:", opts:["Solid","Liquid","Gas","Vacuum"], correct:3}
])}
${theoryQs([
  "Distinguish between transverse and longitudinal waves, giving one example of each.",
  "Explain why sound cannot travel through a vacuum, describing a simple experiment to demonstrate this.",
  "A sound wave travels at 340 m/s and has a wavelength of 2 m. Calculate its frequency."
])}
${revisionQs([
  "Define frequency and state its SI unit.",
  "A wave has a period of 0.02 s. Calculate its frequency."
])}
${summary("A wave transfers energy without transferring matter; sound is a longitudinal wave requiring a material medium, while light is a transverse wave that can travel through a vacuum. Wave speed, frequency, and wavelength are related by v = fλ.")}
${homework("A tuning fork produces sound of frequency 320 Hz which travels through air at a speed of 336 m/s. Calculate the wavelength of the sound produced.")}
`;

const LESSON_3_7 = `
${objectives([
  "Describe the structure and function of a simple electric circuit.",
  "Distinguish between series and parallel circuits.",
  "Describe the function of cells and switches in a circuit."
])}
${intro("Every time you switch on a torchlight, a phone charger, or a radio, you are completing an electric circuit — a continuous path along which electric current can flow. This lesson covers the basic building blocks of circuits.")}
${defs([
  {term:"Electric current", def:"The rate of flow of electric charge (electrons) through a conductor, measured in amperes (A)."},
  {term:"Electric circuit", def:"A closed path made up of a source of electrical energy (like a cell) and other components, through which current can flow."},
  {term:"Cell", def:"A device that converts chemical energy into electrical energy, providing the driving force (voltage) for current to flow in a circuit."},
  {term:"Switch", def:"A device used to open (break) or close (complete) an electric circuit."}
])}
${explain(`
  ${diagramCircuit()}
  <p>A basic circuit needs: a source of electrical energy (a cell or battery), a conducting path (wires), a device that uses the energy (like a bulb), and usually a switch to control the current. If the circuit is broken at any point (a switch open, or a wire disconnected), no current flows.</p>
  ${table(["Circuit type","Description","Effect if one bulb is removed"],[
    ["Series circuit","Components are connected end-to-end along a single path; the same current flows through every component","All bulbs go off, since the single path is broken"],
    ["Parallel circuit","Components are connected across separate branches between the same two points; current divides between the branches","Other bulbs stay on, since their own separate branch is unbroken"]
  ])}
  <p>This is why household wiring uses parallel circuits — so that switching off one appliance or a faulty bulb does not affect other appliances on the same supply.</p>
`)}
${applications([
  "Christmas tree lights connected in series will all go off if a single bulb fails — a common frustration explained directly by series circuit behaviour.",
  "Household electrical wiring uses parallel circuits so that each room's lights and sockets can be switched independently.",
  "Torchlights use one or more dry cells connected in series to provide enough voltage to light the bulb brightly."
])}
${waec("WAEC frequently asks candidates to draw and identify simple series and parallel circuit diagrams and predict what happens when a component is removed or a switch is opened — practice sketching both types confidently with correct circuit symbols.")}
${neco("NECO may ask why household wiring is done in parallel rather than in series — link your answer to the independent operation of appliances.")}
${mistake("Do not assume current is 'used up' as it flows around a circuit — the current leaving a cell is the same current returning to it in a simple series circuit; it is energy, not current, that is transferred to the components.")}
${lab("Building simple series and parallel circuits","Using dry cells, connecting wires, bulbs and a switch, construct a series circuit with two bulbs and observe what happens when one bulb is removed. Then rebuild the same components as a parallel circuit and repeat the test, comparing your observations.")}
${mcqBlock("3_7",[
  {q:"The SI unit of electric current is the:", opts:["Volt","Watt","Ampere","Ohm"], correct:2},
  {q:"In a series circuit, if one bulb is removed:", opts:["Other bulbs stay lit","All bulbs go off","Only that bulb's brightness changes","Nothing happens"], correct:1},
  {q:"Household wiring commonly uses:", opts:["Series circuits","Parallel circuits","No circuits","Open circuits only"], correct:1}
])}
${theoryQs([
  "Distinguish between a series circuit and a parallel circuit.",
  "Explain why household electrical wiring is arranged in parallel rather than in series.",
  "State the function of a cell and a switch in an electric circuit."
])}
${revisionQs([
  "What happens to the other bulbs in a parallel circuit if one bulb blows?",
  "Name two components necessary to complete a simple electric circuit besides the connecting wires."
])}
${summary("An electric circuit is a closed conducting path allowing current to flow from a cell through components back to the cell. In series circuits, components share a single path and depend on each other; in parallel circuits, components are on independent branches, which is why household wiring uses parallel connections.")}
${homework("Draw a labelled diagram of a simple circuit containing one cell, one switch, and two bulbs connected in parallel, and explain what happens to the bulbs when the switch is opened.")}
`;

const LESSON_3_8 = `
${objectives([
  "Define electrical resistance and state its SI unit.",
  "State Ohm's law and use it to solve simple problems.",
  "State basic electrical safety precautions."
])}
${intro("Why does a long, thin wire heat up more than a thick, short one carrying the same current? Why do electricians insist on using fuses and earthing? Both are explained by resistance and safe practice in electrical circuits.")}
${defs([
  {term:"Electrical resistance", def:"The opposition offered by a conductor to the flow of electric current through it, measured in ohms (Ω)."},
  {term:"Ohm's law", def:"The current flowing through a conductor is directly proportional to the potential difference (voltage) across it, provided temperature remains constant; V = IR."}
])}
${formula("Ohm's Law: V = I × R  (V = potential difference in volts, I = current in amperes, R = resistance in ohms)")}
${explain(`
  ${diagramResistor()}
  <p>Resistance depends on several factors: a <b>longer</b> wire has more resistance than a shorter one of the same material and thickness; a <b>thinner</b> wire has more resistance than a thicker one; and different materials (like nichrome versus copper) have different inherent resistance.</p>
  ${table(["Safety practice","Reason"],[
    ["Using a fuse of correct rating","Breaks the circuit automatically if current becomes dangerously high, preventing fire"],
    ["Earthing (grounding) appliances","Provides a safe path for current in case of a fault, preventing electric shock"],
    ["Avoiding overloading sockets","Reduces the risk of overheating wires and starting a fire"],
    ["Using insulated wires and tools","Prevents accidental electric shock from live wires"],
    ["Switching off and unplugging before repairs","Prevents electrocution while working on appliances"]
  ])}
`)}
${worked([
  {q:"A current of 2 A flows through a resistor when a potential difference of 12 V is applied across it. Calculate the resistance.",
   s:"R = V ÷ I = 12 ÷ 2 = 6 Ω."},
  {q:"A resistor of 5 Ω has a current of 3 A flowing through it. Calculate the potential difference across it.",
   s:"V = I × R = 3 × 5 = 15 V."}
])}
${applications([
  "Electric heaters and toasters use wires with high resistance (like nichrome) that convert electrical energy into heat efficiently.",
  "Fuses are deliberately made of wire that melts and breaks the circuit if current exceeds a safe level, protecting both appliances and buildings from fire.",
  "Electricians choose thicker cables for circuits expected to carry larger currents, since thicker wires have lower resistance and heat up less."
])}
${waec("WAEC very frequently sets direct Ohm's law calculations (find V, I, or R given the other two) — memorise the triangle: V on top, I and R on the bottom, so V = IR, I = V/R, R = V/I.")}
${neco("NECO often asks for electrical safety precautions in the home — prepare a list of at least four practices with a brief reason for each, similar to the table above.")}
${mistake("Do not confuse resistance (Ω, opposition to current) with resistivity (a material property) or with current itself — many students mix up these related but distinct quantities.")}
${lab("Verifying Ohm's law","Connect a resistor in series with a battery, an ammeter, and a variable resistor (rheostat), with a voltmeter connected across the resistor. Vary the current using the rheostat, recording the voltmeter and ammeter readings each time. Plot voltage against current — a straight line through the origin confirms Ohm's law and its gradient gives the resistance.")}
${mcqBlock("3_8",[
  {q:"The SI unit of resistance is the:", opts:["Volt","Ampere","Ohm","Watt"], correct:2},
  {q:"According to Ohm's law, if V = 20 V and I = 4 A, the resistance R is:", opts:["5 Ω","80 Ω","0.2 Ω","24 Ω"], correct:0},
  {q:"A fuse in a circuit is designed to:", opts:["Increase the current","Break the circuit when current is too high","Store electrical energy","Reduce the voltage permanently"], correct:1}
])}
${theoryQs([
  "State Ohm's law and the formula relating voltage, current and resistance.",
  "List four factors that affect the resistance of a conductor.",
  "State and explain three electrical safety precautions that should be observed in the home."
])}
${revisionQs([
  "A conductor has a resistance of 10 Ω and a current of 2 A flows through it. Calculate the voltage across it.",
  "Why should electrical sockets not be overloaded with too many appliances at once?"
])}
${summary("Resistance opposes the flow of current and depends on a conductor's length, thickness, and material. Ohm's law (V = IR) relates voltage, current and resistance in a circuit. Safety practices such as fuses, earthing, and avoiding overloaded sockets protect people and property from electrical hazards.")}
${homework("A heater has a resistance of 20 Ω and is connected to a 240 V supply. Calculate the current flowing through it, and state two safety precautions that should be observed when using a mains-powered heater.")}
`;

// ============================================================
// CHAPTER STRUCTURE
// ============================================================

const CHAPTERS = [
  {
    term:"t1", icon:"🔬", title:"Introduction to Physics",
    lessons:[ {title:"What is Physics? Branches of Physics", content:LESSON_1_1} ]
  },
  {
    term:"t1", icon:"📏", title:"Physical Quantities & Units",
    lessons:[ {title:"Fundamental & Derived Quantities, SI Units and Prefixes", content:LESSON_1_2} ]
  },
  {
    term:"t1", icon:"⚖️", title:"Measurement",
    lessons:[
      {title:"Measuring Length, Mass, Time and Volume", content:LESSON_1_3},
      {title:"Density", content:LESSON_1_4}
    ]
  },
  {
    term:"t1", icon:"🎯", title:"Accuracy, Precision & Errors",
    lessons:[ {title:"Accuracy, Precision and Errors in Measurement", content:LESSON_1_5} ]
  },
  {
    term:"t1", icon:"➡️", title:"Scalars and Vectors",
    lessons:[ {title:"Scalars and Vectors", content:LESSON_1_6} ]
  },
  {
    term:"t1", icon:"🏃", title:"Motion",
    lessons:[
      {title:"Distance, Displacement, Speed, Velocity, Acceleration", content:LESSON_1_7},
      {title:"Distance-Time and Velocity-Time Graphs", content:LESSON_1_8}
    ]
  },
  // ---------- Term 2 (fully written) ----------
  {
    term:"t2", icon:"💪", title:"Force & Newton's Laws of Motion",
    lessons:[
      {title:"Force and Newton's Laws of Motion", content:LESSON_2_1},
      {title:"Momentum and Impulse", content:LESSON_2_2}
    ]
  },
  {
    term:"t2", icon:"⚡", title:"Work, Energy & Power",
    lessons:[
      {title:"Work and Energy", content:LESSON_2_3},
      {title:"Power and Efficiency", content:LESSON_2_4}
    ]
  },
  {
    term:"t2", icon:"🧲", title:"Friction, Equilibrium & Gravitation",
    lessons:[
      {title:"Friction", content:LESSON_2_5},
      {title:"Equilibrium, Centre of Gravity and Stability", content:LESSON_2_6},
      {title:"Gravitation: Mass, Weight and Newton's Law of Gravitation", content:LESSON_2_7}
    ]
  },
  {
    term:"t2", icon:"🌀", title:"Circular Motion & Projectile Motion",
    lessons:[
      {title:"Circular Motion and Projectile Motion", content:LESSON_2_8}
    ]
  },
  // ---------- Term 3 (fully written) ----------
  {
    term:"t3", icon:"🌡️", title:"Heat & Temperature",
    lessons:[
      {title:"Heat, Temperature and Thermal Expansion", content:LESSON_3_1},
      {title:"Thermometers and Specific Heat Capacity", content:LESSON_3_2},
      {title:"Heat Transfer: Conduction, Convection and Radiation", content:LESSON_3_3}
    ]
  },
  {
    term:"t3", icon:"💡", title:"Light — Reflection & Refraction",
    lessons:[
      {title:"Reflection of Light and Mirrors", content:LESSON_3_4},
      {title:"Refraction of Light, Lenses, Dispersion and Colours", content:LESSON_3_5}
    ]
  },
  {
    term:"t3", icon:"🔊", title:"Wave Motion & Sound",
    lessons:[
      {title:"Wave Motion and Sound", content:LESSON_3_6}
    ]
  },
  {
    term:"t3", icon:"🔌", title:"Basic Electricity",
    lessons:[
      {title:"Electric Circuits, Cells and Switches", content:LESSON_3_7},
      {title:"Resistance, Ohm's Law and Electrical Safety", content:LESSON_3_8}
    ]
  }
];

// ============================================================
// RESOURCES — Formula Sheet, SI Units, Constants, Symbols,
// Lab Safety, Practical Guide, WAEC/NECO Guides, Mock Exams,
// Glossary and Alphabetical Index
// ============================================================

const FORMULA_SHEET = [
  {
    group: "Measurement & Density",
    icon: "⚖️",
    items: [
      { name: "Density", formula: "ρ = m / V", note: "mass ÷ volume; SI unit kg/m³" },
      { name: "Percentage error", formula: "% error = (Error / True value) × 100%", note: "" }
    ]
  },
  {
    group: "Motion",
    icon: "🏃",
    items: [
      { name: "Speed", formula: "Speed = Distance ÷ Time", note: "" },
      { name: "Velocity", formula: "Velocity = Displacement ÷ Time", note: "" },
      { name: "Acceleration", formula: "a = (v − u) ÷ t", note: "v = final velocity, u = initial velocity" },
      { name: "Equation of motion 1", formula: "v = u + at", note: "" },
      { name: "Equation of motion 2", formula: "s = ut + ½at²", note: "" },
      { name: "Equation of motion 3", formula: "v² = u² + 2as", note: "" },
      { name: "Distance-time graph gradient", formula: "Gradient = Speed", note: "" },
      { name: "Velocity-time graph gradient", formula: "Gradient = Acceleration", note: "area under graph = distance" }
    ]
  },
  {
    group: "Forces, Momentum & Newton's Laws",
    icon: "💪",
    items: [
      { name: "Newton's Second Law", formula: "F = ma", note: "a = F / m" },
      { name: "Weight", formula: "W = mg", note: "g ≈ 10 m/s² (9.8 m/s²)" },
      { name: "Momentum", formula: "p = mv", note: "SI unit: kg m/s" },
      { name: "Impulse", formula: "Impulse = Ft = mv − mu", note: "SI unit: N s" }
    ]
  },
  {
    group: "Work, Energy & Power",
    icon: "⚡",
    items: [
      { name: "Work done", formula: "W = F × d", note: "distance moved in the direction of the force" },
      { name: "Kinetic energy", formula: "K.E. = ½mv²", note: "" },
      { name: "Potential energy", formula: "P.E. = mgh", note: "" },
      { name: "Power", formula: "P = W / t", note: "SI unit: watt (W); 1 W = 1 J/s" },
      { name: "Efficiency", formula: "Efficiency = (Useful energy output ÷ Total energy input) × 100%", note: "" }
    ]
  },
  {
    group: "Equilibrium, Moments & Circular Motion",
    icon: "🧲",
    items: [
      { name: "Moment of a force", formula: "Moment = Force × Perpendicular distance from pivot", note: "SI unit: N m" },
      { name: "Principle of moments", formula: "Sum of clockwise moments = Sum of anticlockwise moments", note: "for a body in equilibrium" },
      { name: "Centripetal force", formula: "F = mv² / r", note: "directed toward the centre of the circular path" }
    ]
  },
  {
    group: "Heat",
    icon: "🌡️",
    items: [
      { name: "Quantity of heat", formula: "Q = mcΔθ", note: "c = specific heat capacity, Δθ = temperature change" }
    ]
  },
  {
    group: "Electricity",
    icon: "🔌",
    items: [
      { name: "Ohm's Law", formula: "V = IR", note: "V = voltage, I = current, R = resistance" }
    ]
  }
];

const SI_UNITS_TABLE = [
  ["Length", "l", "metre", "m"],
  ["Mass", "m", "kilogram", "kg"],
  ["Time", "t", "second", "s"],
  ["Volume", "V", "cubic metre", "m³"],
  ["Density", "ρ", "kilogram per cubic metre", "kg/m³"],
  ["Speed / Velocity", "v", "metre per second", "m/s"],
  ["Acceleration", "a", "metre per second squared", "m/s²"],
  ["Force", "F", "newton", "N"],
  ["Weight", "W", "newton", "N"],
  ["Momentum", "p", "kilogram metre per second", "kg m/s"],
  ["Work / Energy", "W / E", "joule", "J"],
  ["Power", "P", "watt", "W"],
  ["Pressure", "P", "pascal", "Pa"],
  ["Temperature", "θ / T", "degree Celsius / kelvin", "°C / K"],
  ["Heat energy", "Q", "joule", "J"],
  ["Specific heat capacity", "c", "joule per kilogram per degree Celsius", "J/(kg °C)"],
  ["Electric current", "I", "ampere", "A"],
  ["Potential difference (Voltage)", "V", "volt", "V"],
  ["Resistance", "R", "ohm", "Ω"],
  ["Frequency", "f", "hertz", "Hz"]
];

const SI_PREFIXES_TABLE = [
  ["giga", "G", "× 1,000,000,000 (10⁹)"],
  ["mega", "M", "× 1,000,000 (10⁶)"],
  ["kilo", "k", "× 1,000 (10³)"],
  ["deci", "d", "× 0.1 (10⁻¹)"],
  ["centi", "c", "× 0.01 (10⁻²)"],
  ["milli", "m", "× 0.001 (10⁻³)"],
  ["micro", "μ", "× 0.000001 (10⁻⁶)"],
  ["nano", "n", "× 0.000000001 (10⁻⁹)"]
];

const CONSTANTS_TABLE = [
  ["Acceleration due to gravity", "g", "10 m/s² (approx.), 9.8 m/s² (more precise)"],
  ["Speed of light in a vacuum", "c", "3.0 × 10⁸ m/s"],
  ["Speed of sound in air", "v", "330 – 340 m/s (at room temperature)"],
  ["Density of water", "ρ", "1000 kg/m³ (1 g/cm³)"],
  ["Specific heat capacity of water", "c", "4200 J/(kg °C)"],
  ["Standard atmospheric pressure", "P", "1.01 × 10⁵ Pa (101 kPa)"]
];

const SYMBOLS_TABLE = [
  ["s", "distance / displacement"],
  ["u", "initial velocity"],
  ["v", "final velocity / velocity"],
  ["a", "acceleration"],
  ["t", "time"],
  ["m", "mass"],
  ["F", "force"],
  ["W", "weight or work done (context-dependent)"],
  ["g", "acceleration due to gravity"],
  ["p", "momentum"],
  ["ρ", "density (rho)"],
  ["E", "energy"],
  ["P", "power or pressure (context-dependent)"],
  ["Q", "quantity of heat"],
  ["c", "specific heat capacity (or speed of light, context-dependent)"],
  ["θ / Δθ", "temperature / change in temperature"],
  ["I", "electric current"],
  ["V", "voltage (potential difference)"],
  ["R", "resistance"],
  ["r", "radius"],
  ["μ", "coefficient of friction (mu)"]
];

const LAB_SAFETY_RULES = [
  "Always read and follow the teacher's instructions before starting any practical activity.",
  "Wear protective clothing (a lab coat) and, where necessary, safety goggles when handling heat sources or glassware.",
  "Never taste, touch, or smell chemicals or unknown substances directly.",
  "Handle glass apparatus (thermometers, beakers, tubes) with care — report any breakage immediately rather than trying to clean it up yourself.",
  "Keep your working area tidy and free of unnecessary bags or materials that could cause a trip or fire hazard.",
  "When heating a substance, always point the open end of a test tube away from yourself and others.",
  "Never leave a heat source (Bunsen burner, spirit lamp, candle) unattended while lit.",
  "Switch off and unplug electrical apparatus before adjusting or dismantling a circuit.",
  "Do not overload electrical circuits or use damaged wires and plugs.",
  "Know the location of the fire extinguisher, fire blanket, and first-aid box in the laboratory.",
  "Report all accidents, spills, or injuries to the teacher immediately, no matter how small.",
  "Wash your hands thoroughly after every practical session.",
  "Never run or play around in the laboratory.",
  "Dispose of broken glass and waste materials only in the containers provided for them."
];

const PRACTICAL_GUIDE_CONTENT = `
${intro("The WAEC and NECO Physics practical (alternative-to-practical) examinations test your ability to plan an experiment, take accurate readings, record and process data, plot graphs correctly, and draw sound conclusions. This guide summarises the skills examiners look for.")}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">1. Reading Instruments Correctly</h4>
  <ul>
    <li><b>Metre rule:</b> avoid parallax error — position your eye directly in line with the reading.</li>
    <li><b>Vernier calipers / micrometer screw gauge:</b> take the main scale reading, then add the vernier/thimble reading; always check for and subtract any zero error.</li>
    <li><b>Stopwatch:</b> time several oscillations (e.g. 20 swings of a pendulum) and divide by the number of oscillations to reduce reaction-time error.</li>
    <li><b>Thermometer:</b> read at eye level with the bulb fully immersed in the substance being measured; avoid touching the bulb against the container.</li>
    <li><b>Ammeter/Voltmeter:</b> check the correct range/scale is used and that there is no zero error before connecting into the circuit.</li>
  </ul>
`)}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">2. Recording Results</h4>
  <ul>
    <li>Always record raw readings in a neat table with clear column headings that include the physical quantity <b>and</b> its unit, e.g. "Length, l (cm)".</li>
    <li>Keep the number of decimal places consistent for a given instrument (e.g. all metre rule readings to 1 decimal place in cm).</li>
    <li>Repeat each reading (usually 3 times) and record the average to reduce random error.</li>
  </ul>
`)}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">3. Plotting Graphs</h4>
  <ul>
    <li>Choose scales that use at least half of the graph sheet in both directions — avoid awkward scales like multiples of 3 or 7.</li>
    <li>Label both axes with the quantity and unit, and give the graph a title.</li>
    <li>Plot points accurately using a sharp pencil and a small, neat cross (×) or dot-in-circle (⊙).</li>
    <li>Draw a single best-fit straight line or smooth curve — do not simply join point to point.</li>
    <li>To find the gradient, choose two points far apart <b>on the line</b> (not necessarily plotted points) and use a large triangle for accuracy.</li>
  </ul>
`)}
${waec("WAEC frequently allocates marks separately for: table/headings, trend of values, graph scale, plotting, line of best fit, gradient/intercept, and final answer with correct unit. Losing the unit on a final answer is one of the most common ways candidates lose easy marks.")}
${neco("NECO's alternative-to-practical paper often describes an experiment and gives you a set of 'results' to process — practise reading such data, completing tables, and calculating gradients so you can do this quickly under exam conditions.")}
${mistake("A common mistake is forgetting to state the unit of the final answer, or mixing units (e.g. mixing cm and m) within the same table without converting.")}
`;

const WAEC_GUIDE_CONTENT = `
${intro("This guide brings together practical strategies for approaching the WAEC Physics paper with confidence.")}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">Paper Structure</h4>
  <p>WAEC Physics is usually made up of three papers: <b>Paper 1</b> (multiple choice, objective questions covering the whole syllabus), <b>Paper 2</b> (theory — a mix of compulsory and optional structured/essay questions), and <b>Paper 3</b> (practical, or Alternative to Practical for candidates without lab access).</p>
`)}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">Revision Strategy</h4>
  <ul>
    <li>Work through past questions topic by topic rather than only full past papers — this reveals which specific ideas repeat most often.</li>
    <li>Memorise formulas alongside their units; WAEC frequently awards a mark just for stating the correct unit.</li>
    <li>Practice defining key terms precisely — many objective questions are simple definition-matching.</li>
    <li>For calculation questions, always show your working: state the formula, substitute values with units, then compute — partial marks are awarded for correct method even if the final answer is wrong.</li>
    <li>Draw and label diagrams neatly wherever a question involves rays of light, circuits, or forces — unlabelled or messy diagrams lose marks.</li>
  </ul>
`)}
${waec("Time management: in Paper 2, spend the first few minutes reading through all compulsory and optional questions before writing, so you choose the optional questions you are strongest in.")}
${mistake("Do not leave objective questions unanswered — there is usually no negative marking, so an educated guess is better than a blank.")}
`;

const NECO_GUIDE_CONTENT = `
${intro("NECO Physics follows a similar structure to WAEC but has its own style of phrasing questions — this guide highlights what to watch for.")}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">What Makes NECO Different</h4>
  <ul>
    <li>NECO theory questions sometimes ask for definitions to be stated <b>exactly</b> as in the standard textbook wording — practise writing clean, complete one-sentence definitions for every key term.</li>
    <li>NECO's Alternative-to-Practical paper often gives you a table of 'results' directly and asks you to process them (plot a graph, find a gradient, calculate a value) rather than describing an experiment for you to imagine.</li>
    <li>Diagram-based questions (mirrors, lenses, circuits) are common — always use a ruler for straight lines and label all rays/parts clearly.</li>
  </ul>
`)}
${explain(`
  <h4 style="border:none;padding:0;font-size:.95rem;color:var(--ink);">Revision Strategy</h4>
  <ul>
    <li>Keep a personal formula sheet (like the one in this app) and revise it daily in the weeks before the exam.</li>
    <li>Attempt the Mock Examinations in this app under timed conditions to build speed and accuracy.</li>
    <li>Review the Common Mistakes boxes in every lesson — these mirror the errors examiners report most frequently.</li>
  </ul>
`)}
${neco("NECO awards method marks generously in calculations — always write the formula and substitution step even under time pressure, rather than jumping straight to a final answer.")}
`;

// ============================================================
// GLOSSARY (auto-compiled from all lesson Key Definitions)
// ============================================================
const GLOSSARY_TERMS = [
  {term:"Acceleration", def:"The rate of change of velocity with time (vector).", ci:5, li:0},
  {term:"Acceleration due to gravity (g)", def:"The acceleration experienced by a freely falling object due to the Earth's gravitational pull, approximately 10 m/s² (more precisely 9.8 m/s²) near the Earth's surface.", ci:8, li:2},
  {term:"Accuracy", def:"How close a measured value is to the true (actual) value.", ci:3, li:0},
  {term:"Angle of incidence", def:"The angle between the incident (incoming) ray and the normal.", ci:11, li:0},
  {term:"Angle of reflection", def:"The angle between the reflected (outgoing) ray and the normal.", ci:11, li:0},
  {term:"Cell", def:"A device that converts chemical energy into electrical energy, providing the driving force (voltage) for current to flow in a circuit.", ci:13, li:0},
  {term:"Centre of gravity", def:"The single point in a body through which its entire weight appears to act.", ci:8, li:1},
  {term:"Centripetal force", def:"The force directed towards the centre of a circular path, which keeps a body moving in that circle.", ci:9, li:0},
  {term:"Circular motion", def:"The motion of a body along a circular path at a constant speed, with its direction continuously changing.", ci:9, li:0},
  {term:"Conduction", def:"The transfer of heat through a substance (usually a solid) from particle to particle, without the particles themselves moving from their positions.", ci:10, li:2},
  {term:"Convection", def:"The transfer of heat through a fluid (liquid or gas) by the actual movement of the heated fluid itself, forming convection currents.", ci:10, li:2},
  {term:"Density", def:"The mass of a substance per unit volume.", ci:2, li:1},
  {term:"Derived quantities", def:"Quantities obtained by combining two or more fundamental quantities, e.g. speed = distance ÷ time.", ci:1, li:0},
  {term:"Displacement", def:"The change in position of an object in a specified direction; the shortest straight-line distance from start to finish (vector).", ci:5, li:0},
  {term:"Distance", def:"The total length of the path covered by a moving object, regardless of direction (scalar).", ci:5, li:0},
  {term:"Distance-time graph", def:"A graph showing how the distance moved by an object varies with time; its gradient (slope) gives speed.", ci:5, li:1},
  {term:"Efficiency", def:"The ratio of useful output energy (or work) to the total input energy (or work) supplied to a machine, usually expressed as a percentage.", ci:7, li:1},
  {term:"Electric circuit", def:"A closed path made up of a source of electrical energy (like a cell) and other components, through which current can flow.", ci:13, li:0},
  {term:"Electric current", def:"The rate of flow of electric charge (electrons) through a conductor, measured in amperes (A).", ci:13, li:0},
  {term:"Electrical resistance", def:"The opposition offered by a conductor to the flow of electric current through it, measured in ohms (Ω).", ci:13, li:1},
  {term:"Energy", def:"The capacity to do work.", ci:0, li:0},
  {term:"Equilibrium", def:"The state of a body when the resultant force and resultant turning effect (moment) acting on it are both zero, so it remains at rest or moves at constant velocity.", ci:8, li:1},
  {term:"Error", def:"The difference between a measured value and the true value of a quantity.", ci:3, li:0},
  {term:"Force", def:"A push or pull that can change the size, shape, speed, or direction of motion of an object.", ci:6, li:0},
  {term:"Friction", def:"The force that opposes the relative motion (or attempted motion) between two surfaces in contact.", ci:8, li:0},
  {term:"Fundamental (basic) quantities", def:"Quantities that stand on their own and are not defined in terms of other quantities, e.g. length, mass, time.", ci:1, li:0},
  {term:"Gravitation", def:"The force of attraction that exists between any two masses in the universe.", ci:8, li:2},
  {term:"Heat", def:"A form of energy that flows from a body at a higher temperature to one at a lower temperature; measured in joules (J).", ci:10, li:0},
  {term:"Impulse", def:"The product of the force applied to a body and the time for which it acts; impulse = F × t. Impulse equals the change in momentum produced.", ci:6, li:1},
  {term:"Kinetic (dynamic) friction", def:"Friction that acts between two surfaces already sliding over one another.", ci:8, li:0},
  {term:"Kinetic energy", def:"The energy a body possesses due to its motion.", ci:7, li:0},
  {term:"Law of conservation of momentum", def:"In a closed system, the total momentum before a collision equals the total momentum after the collision, provided no external force acts.", ci:6, li:1},
  {term:"Length", def:"The distance between two points, measured in metres (m).", ci:2, li:0},
  {term:"Lens", def:"A piece of transparent material (usually glass or plastic) with at least one curved surface, which refracts light to converge or diverge it.", ci:11, li:1},
  {term:"Longitudinal wave", def:"A wave in which the particles of the medium vibrate parallel to (along) the direction the wave travels, e.g. sound waves.", ci:12, li:0},
  {term:"Mass", def:"The quantity of matter contained in a body, measured in kilograms (kg).", ci:2, li:0},
  {term:"Matter", def:"Anything that has mass and occupies space.", ci:0, li:0},
  {term:"Momentum", def:"The product of the mass of a body and its velocity; p = mv. It is a vector quantity.", ci:6, li:1},
  {term:"Newton's First Law (Law of Inertia)", def:"A body remains at rest, or continues to move at constant velocity in a straight line, unless acted upon by a resultant (unbalanced) external force.", ci:6, li:0},
  {term:"Newton's Second Law", def:"The acceleration of a body is directly proportional to the resultant force acting on it, and inversely proportional to its mass; a = F/m, or F = ma.", ci:6, li:0},
  {term:"Newton's Third Law", def:"For every action there is an equal and opposite reaction; when body A exerts a force on body B, body B exerts an equal and opposite force on body A.", ci:6, li:0},
  {term:"Normal", def:"An imaginary line drawn perpendicular (at 90°) to a reflecting surface at the point where a ray strikes it.", ci:11, li:0},
  {term:"Ohm's law", def:"The current flowing through a conductor is directly proportional to the potential difference (voltage) across it, provided temperature remains constant; V = IR.", ci:13, li:1},
  {term:"Physical quantity", def:"Anything that can be measured, consisting of a numerical value and a unit, e.g. 5 metres.", ci:1, li:0},
  {term:"Physics", def:"The branch of science concerned with the study of matter, energy, and the relationship between them.", ci:0, li:0},
  {term:"Potential energy", def:"The energy a body possesses due to its position or state, e.g. its height above the ground.", ci:7, li:0},
  {term:"Power", def:"The rate of doing work, or the rate of energy transfer; Power = Work done ÷ Time taken.", ci:7, li:1},
  {term:"Precision", def:"How close repeated measurements are to one another (consistency), whether or not they are close to the true value.", ci:3, li:0},
  {term:"Projectile", def:"Any object given an initial velocity and then allowed to move freely under gravity alone, following a curved path.", ci:9, li:0},
  {term:"Radiation", def:"The transfer of heat energy through space by electromagnetic waves, requiring no material medium.", ci:10, li:2},
  {term:"Reflection of light", def:"The bouncing back of light when it strikes a surface, without passing through it.", ci:11, li:0},
  {term:"Refraction of light", def:"The bending of a light ray as it passes from one transparent medium into another of different optical density, due to a change in speed.", ci:11, li:1},
  {term:"Scalar quantity", def:"A quantity that has only magnitude (size), with no direction.", ci:4, li:0},
  {term:"Sound", def:"A form of energy produced by vibrating objects, which travels as a longitudinal wave through a material medium.", ci:12, li:0},
  {term:"Specific heat capacity", def:"The quantity of heat energy required to raise the temperature of 1 kg of a substance by 1°C (or 1 K).", ci:10, li:1},
  {term:"Speed", def:"The distance covered per unit time (scalar).", ci:5, li:0},
  {term:"Stability", def:"The ability of a body to return to its original position after being slightly displaced or tilted.", ci:8, li:1},
  {term:"Static friction", def:"Friction that acts between two surfaces that are not yet moving relative to each other, opposing the start of motion.", ci:8, li:0},
  {term:"Switch", def:"A device used to open (break) or close (complete) an electric circuit.", ci:13, li:0},
  {term:"Temperature", def:"A measure of the degree of hotness or coldness of a body, measured in degrees Celsius (°C) or kelvin (K).", ci:10, li:0},
  {term:"Thermal expansion", def:"The increase in the size (length, area, or volume) of a substance when it is heated.", ci:10, li:0},
  {term:"Thermometer", def:"An instrument used for measuring temperature, commonly a liquid-in-glass thermometer using mercury or coloured alcohol.", ci:10, li:1},
  {term:"Time", def:"The duration between two events, measured in seconds (s).", ci:2, li:0},
  {term:"Transverse wave", def:"A wave in which the particles of the medium vibrate at right angles (perpendicular) to the direction the wave travels, e.g. light waves, water waves.", ci:12, li:0},
  {term:"Vector quantity", def:"A quantity that has both magnitude and direction.", ci:4, li:0},
  {term:"Velocity", def:"The rate of change of displacement with time, in a specified direction (vector).", ci:5, li:0},
  {term:"Velocity-time graph", def:"A graph showing how the velocity of an object varies with time; its gradient gives acceleration, and the area under it gives distance travelled.", ci:5, li:1},
  {term:"Volume", def:"The amount of space occupied by an object, measured in cubic metres (m³) or litres.", ci:2, li:0},
  {term:"Wave", def:"A disturbance that transfers energy from one point to another without transferring matter.", ci:12, li:0},
  {term:"Weight", def:"The force of gravity acting on the mass of a body; Weight = mass × acceleration due to gravity (W = mg).", ci:8, li:2},
  {term:"Work", def:"Done when a force moves its point of application through a distance in the direction of the force; Work = Force × Distance moved in the direction of the force.", ci:7, li:0},
];
// ============================================================
// MOCK EXAMINATIONS (with objective + theory answer keys)
// ============================================================

const MOCK_EXAMS = [
  {
    id: "mock_t1",
    term: "t1",
    title: "First Term Mock Examination",
    subtitle: "Covers: Physics branches, Quantities & Units, Measurement, Density, Errors, Scalars/Vectors, Motion",
    duration: "45 minutes",
    objectives: [
      { q: "Physics is the study of:", opts: ["Living organisms only", "Matter, energy and their relationship", "Rocks and minerals", "Chemical reactions only"], correct: 1 },
      { q: "Which of these is a fundamental (basic) quantity?", opts: ["Speed", "Density", "Mass", "Volume"], correct: 2 },
      { q: "Which of these is a derived quantity?", opts: ["Length", "Time", "Mass", "Speed"], correct: 3 },
      { q: "The SI unit of mass is the:", opts: ["Newton", "Kilogram", "Litre", "Joule"], correct: 1 },
      { q: "1 kilometre is equal to:", opts: ["10 m", "100 m", "1000 m", "10,000 m"], correct: 2 },
      { q: "Density is defined as:", opts: ["Mass × Volume", "Mass ÷ Volume", "Volume ÷ Mass", "Weight ÷ Volume"], correct: 1 },
      { q: "A measurement that is close to the true value is said to be:", opts: ["Precise", "Accurate", "Random", "Systematic"], correct: 1 },
      { q: "Repeated measurements that are close to one another, whether or not close to the true value, show:", opts: ["Accuracy", "Precision", "Error", "Density"], correct: 1 },
      { q: "Which of these is a scalar quantity?", opts: ["Velocity", "Displacement", "Distance", "Force"], correct: 2 },
      { q: "Which of these is a vector quantity?", opts: ["Mass", "Time", "Speed", "Velocity"], correct: 3 },
      { q: "The rate of change of displacement with time is:", opts: ["Speed", "Velocity", "Acceleration", "Distance"], correct: 1 },
      { q: "The gradient of a distance–time graph gives:", opts: ["Acceleration", "Speed", "Displacement", "Momentum"], correct: 1 },
      { q: "The area under a velocity–time graph gives:", opts: ["Speed", "Acceleration", "Distance travelled", "Momentum"], correct: 2 },
      { q: "A body moving with constant velocity has an acceleration of:", opts: ["Increasing value", "Zero", "Constant negative value", "Undefined value"], correct: 1 },
      { q: "The branch of Physics that deals with heat is:", opts: ["Optics", "Acoustics", "Thermal Physics", "Mechanics"], correct: 2 }
    ],
    theory: [
      { q: "Define Physics and name three of its branches, giving one example phenomenon each branch explains.", guide: "Physics: the study of matter, energy and their relationship. Branches: e.g. Mechanics (motion of a football), Thermal Physics (a fridge keeping food cold), Optics (a mirror forming an image)." },
      { q: "Distinguish between fundamental and derived quantities, giving two examples of each.", guide: "Fundamental quantities stand alone and are not defined from others, e.g. length, mass, time. Derived quantities are combinations of fundamental ones, e.g. speed (length/time), density (mass/volume)." },
      { q: "A block of wood has a mass of 60 g and a volume of 80 cm³. Calculate its density.", guide: "ρ = m/V = 60 ÷ 80 = 0.75 g/cm³." },
      { q: "Explain the difference between accuracy and precision, using a simple illustration.", guide: "Accuracy is closeness to the true value; precision is closeness of repeated readings to one another. Illustration: darts clustered tightly together but off-target are precise but not accurate; darts scattered around the bullseye are accurate on average but not precise." },
      { q: "A car accelerates uniformly from rest to 20 m/s in 5 seconds. Calculate its acceleration and the distance covered.", guide: "a = (v−u)/t = (20−0)/5 = 4 m/s². s = ut + ½at² = 0 + ½(4)(25) = 50 m." }
    ]
  },
  {
    id: "mock_t2",
    term: "t2",
    title: "Second Term Mock Examination",
    subtitle: "Covers: Force & Newton's Laws, Momentum, Work/Energy/Power, Friction, Equilibrium, Gravitation, Circular & Projectile Motion",
    duration: "45 minutes",
    objectives: [
      { q: "Newton's First Law is also known as the Law of:", opts: ["Gravitation", "Inertia", "Conservation", "Motion"], correct: 1 },
      { q: "According to Newton's Second Law, F equals:", opts: ["mv", "ma", "m/a", "m + a"], correct: 1 },
      { q: "A resultant force of 20 N acts on a 4 kg mass. Its acceleration is:", opts: ["2 m/s²", "5 m/s²", "8 m/s²", "80 m/s²"], correct: 1 },
      { q: "Momentum is the product of:", opts: ["Force and time", "Mass and velocity", "Force and distance", "Mass and acceleration"], correct: 1 },
      { q: "The SI unit of momentum is:", opts: ["N", "kg m/s", "J", "W"], correct: 1 },
      { q: "Work done is the product of:", opts: ["Force and time", "Force and distance moved in the direction of the force", "Mass and velocity", "Power and time"], correct: 1 },
      { q: "The energy possessed by a moving body is called:", opts: ["Potential energy", "Kinetic energy", "Chemical energy", "Heat energy"], correct: 1 },
      { q: "Power is defined as the rate of:", opts: ["Doing work", "Change of momentum", "Change of velocity", "Change of mass"], correct: 0 },
      { q: "Efficiency of a machine is always:", opts: ["Greater than 100%", "Exactly 100%", "Less than or equal to 100%", "Independent of energy input"], correct: 2 },
      { q: "Friction that opposes the start of motion between two surfaces is called:", opts: ["Kinetic friction", "Static friction", "Rolling friction", "Fluid friction"], correct: 1 },
      { q: "A body is in equilibrium when:", opts: ["It is moving with increasing speed", "The resultant force and resultant moment on it are both zero", "Only the resultant force is zero", "It is accelerating uniformly"], correct: 1 },
      { q: "The point through which the entire weight of a body appears to act is the:", opts: ["Centre of mass", "Centre of gravity", "Pivot", "Fulcrum"], correct: 1 },
      { q: "Weight is calculated using the formula:", opts: ["W = mg", "W = ma", "W = mv", "W = Fd"], correct: 0 },
      { q: "The force that keeps a body moving in a circular path is called:", opts: ["Gravitational force", "Frictional force", "Centripetal force", "Normal force"], correct: 2 },
      { q: "A projectile's path under gravity alone (ignoring air resistance) is a:", opts: ["Straight line", "Circle", "Parabola", "Spiral"], correct: 2 }
    ],
    theory: [
      { q: "State Newton's three laws of motion.", guide: "1st: a body stays at rest or moves at constant velocity unless acted on by a resultant force. 2nd: a = F/m (or F = ma). 3rd: for every action there is an equal and opposite reaction." },
      { q: "A 5 kg trolley moving at 3 m/s collides with a stationary 2 kg trolley and they move off together. Use conservation of momentum to find their common velocity.", guide: "Total momentum before = 5×3 + 2×0 = 15 kg m/s. Combined mass = 7 kg. v = 15/7 ≈ 2.14 m/s." },
      { q: "Define work done and calculate the work done when a force of 15 N moves an object 4 m in the direction of the force.", guide: "Work = Force × distance moved in the direction of the force. W = 15 × 4 = 60 J." },
      { q: "Explain the principle of moments and state one application of it.", guide: "For a body in equilibrium under the action of turning forces, the sum of clockwise moments about a point equals the sum of anticlockwise moments about the same point. Application: a see-saw balancing, or a beam balance." },
      { q: "Explain why a satellite in circular orbit around the Earth is said to be accelerating even though its speed is constant.", guide: "Its velocity is a vector, and although its speed (magnitude) is constant, its direction is continuously changing as it moves around the circle. Since acceleration is the rate of change of velocity (a vector), a changing direction means it is accelerating — this acceleration is directed towards the centre (centripetal acceleration)." }
    ]
  },
  {
    id: "mock_t3",
    term: "t3",
    title: "Third Term Mock Examination",
    subtitle: "Covers: Heat & Temperature, Heat Transfer, Light — Reflection & Refraction, Wave Motion & Sound, Basic Electricity",
    duration: "45 minutes",
    objectives: [
      { q: "Heat flows from a body at:", opts: ["Lower temperature to higher temperature", "Higher temperature to lower temperature", "Equal temperature to another of equal temperature", "Rest to motion"], correct: 1 },
      { q: "The SI unit of specific heat capacity is:", opts: ["J/kg", "J/(kg °C)", "J", "W"], correct: 1 },
      { q: "Heat transfer through a solid, particle to particle, is called:", opts: ["Convection", "Radiation", "Conduction", "Evaporation"], correct: 2 },
      { q: "Heat transfer through a fluid by movement of the fluid itself is called:", opts: ["Conduction", "Convection", "Radiation", "Insulation"], correct: 1 },
      { q: "Heat transfer that requires no material medium is:", opts: ["Conduction", "Convection", "Radiation", "Friction"], correct: 2 },
      { q: "The angle between an incident ray and the normal is called the:", opts: ["Angle of reflection", "Angle of incidence", "Critical angle", "Angle of refraction"], correct: 1 },
      { q: "For reflection at a plane mirror, the angle of incidence is:", opts: ["Always greater than the angle of reflection", "Always less than the angle of reflection", "Equal to the angle of reflection", "Unrelated to the angle of reflection"], correct: 2 },
      { q: "The bending of light as it passes from one medium to another of different optical density is called:", opts: ["Reflection", "Refraction", "Dispersion", "Diffraction"], correct: 1 },
      { q: "A wave in which particles vibrate at right angles to the direction of travel is called:", opts: ["Longitudinal", "Transverse", "Mechanical", "Electromagnetic only"], correct: 1 },
      { q: "Sound waves are an example of:", opts: ["Transverse waves", "Longitudinal waves", "Electromagnetic waves", "Standing light waves"], correct: 1 },
      { q: "Sound cannot travel through:", opts: ["Air", "Water", "A vacuum", "Steel"], correct: 2 },
      { q: "The rate of flow of electric charge is called:", opts: ["Voltage", "Resistance", "Current", "Power"], correct: 2 },
      { q: "The SI unit of electric current is the:", opts: ["Volt", "Ohm", "Ampere", "Watt"], correct: 2 },
      { q: "Ohm's Law is stated as:", opts: ["V = I/R", "V = IR", "I = VR", "R = V + I"], correct: 1 },
      { q: "A device used to open or close an electric circuit is a:", opts: ["Cell", "Switch", "Resistor", "Ammeter"], correct: 1 }
    ],
    theory: [
      { q: "Distinguish between heat and temperature.", guide: "Heat is a form of energy that flows from a hotter body to a colder one, measured in joules. Temperature is a measure of the degree of hotness or coldness of a body, measured in °C or K — it does not measure the amount of heat energy present." },
      { q: "2 kg of water is heated so that its temperature rises from 20°C to 60°C. Given that the specific heat capacity of water is 4200 J/(kg°C), calculate the quantity of heat absorbed.", guide: "Q = mcΔθ = 2 × 4200 × (60−20) = 2 × 4200 × 40 = 336,000 J (336 kJ)." },
      { q: "State the laws of reflection of light.", guide: "1) The incident ray, the reflected ray, and the normal all lie in the same plane. 2) The angle of incidence equals the angle of reflection." },
      { q: "Explain, with a labelled diagram in words, why a straight stick appears bent when partly dipped in water.", guide: "Light travelling from the part of the stick under water bends (refracts) as it passes from water (denser medium) into air (less dense medium) at the water surface, before reaching the eye. The eye interprets light as travelling in a straight line, so the underwater part appears to be at a different position, making the stick look bent at the surface." },
      { q: "A heater of resistance 20 Ω is connected to a 240 V supply. Calculate the current flowing, and state one safety precaution to observe when using it.", guide: "I = V/R = 240/20 = 12 A. Safety precaution: use a properly rated fuse/circuit breaker, ensure the appliance is earthed, and avoid overloading the socket." }
    ]
  }
];
