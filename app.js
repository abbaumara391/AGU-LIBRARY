// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 3 — STUDENT & TEACHER DASHBOARD
// ==========================================


// ==========================================
// GLOBAL DATA
// ==========================================

let currentInvitation = null;

let invitationStats = {
  total: 0,
  students: 0,
  teachers: 0
};


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".page-section");

  sections.forEach(section => {
    section.classList.remove("active");
  });

  const selectedSection =
    document.getElementById(sectionId);

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  const nav =
    document.getElementById("mainNav");

  if (nav) {
    nav.classList.remove("open");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ==========================================
// MOBILE MENU
// ==========================================

function toggleMenu() {

  const nav =
    document.getElementById("mainNav");

  if (!nav) return;

  nav.classList.toggle("open");

}


// ==========================================
// CURRENT USER
// ==========================================

function getAGUCurrentUser() {

  try {

    return JSON.parse(
      localStorage.getItem("aguCurrentUser")
    );

  } catch (error) {

    return null;

  }

}


// ==========================================
// INVITATION CODE GENERATOR
// ==========================================

function generateInvitation(type) {

  if (
    type !== "Student" &&
    type !== "Teacher"
  ) {
    return;
  }

  const code =
    createInvitationCode();

  const baseURL =
    window.location.origin +
    window.location.pathname;

  const invitationLink =
    baseURL +
    "?invite=" +
    encodeURIComponent(code) +
    "&type=" +
    encodeURIComponent(
      type.toLowerCase()
    );


  currentInvitation = {

    type: type,

    code: code,

    link: invitationLink,

    createdAt:
      new Date().toISOString(),

    status: "pending"

  };


  invitationStats.total++;


  if (type === "Student") {
    invitationStats.students++;
  }


  if (type === "Teacher") {
    invitationStats.teachers++;
  }


  const result =
    document.getElementById(
      "invitationResult"
    );

  const message =
    document.getElementById(
      "invitationMessage"
    );

  const codeElement =
    document.getElementById(
      "invitationCode"
    );

  const linkElement =
    document.getElementById(
      "invitationLink"
    );


  if (result) {
    result.style.display = "block";
  }


  if (message) {

    message.textContent =
      `Your ${type.toLowerCase()} invitation is ready to share.`;

  }


  if (codeElement) {
    codeElement.textContent = code;
  }


  if (linkElement) {
    linkElement.value =
      invitationLink;
  }


  saveInvitation(
    currentInvitation
  );

  updateDashboard();


  setTimeout(() => {

    if (result) {

      result.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }

  }, 100);

}


// ==========================================
// CREATE INVITATION CODE
// ==========================================

function createInvitationCode() {

  const letters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const numbers =
    "23456789";

  let code = "";


  for (let i = 0; i < 3; i++) {

    code +=
      letters.charAt(
        Math.floor(
          Math.random() *
          letters.length
        )
      );

  }


  code += "-";


  for (let i = 0; i < 3; i++) {

    code +=
      numbers.charAt(
        Math.floor(
          Math.random() *
          numbers.length
        )
      );

  }


  return code;

}


// ==========================================
// COPY INVITATION LINK
// ==========================================

async function copyInvitationLink() {

  if (!currentInvitation) {

    alert(
      "Please generate an invitation first."
    );

    return;

  }


  const link =
    currentInvitation.link;


  try {

    await navigator.clipboard.writeText(
      link
    );

    alert(
      "✅ Invitation link copied successfully!"
    );

  } catch (error) {

    const input =
      document.getElementById(
        "invitationLink"
      );

    if (input) {

      input.select();

      input.setSelectionRange(
        0,
        99999
      );

      document.execCommand("copy");

      alert(
        "✅ Invitation link copied!"
      );

    }

  }

}


// ==========================================
// WHATSAPP SHARING
// ==========================================

function shareWhatsApp() {

  if (!currentInvitation) {

    alert(
      "Please generate an invitation first."
    );

    return;

  }


  const message =
`🎓 AGU Educational Platform Invitation

You have been invited to join AGU Educational Platform.

Invitation type: ${currentInvitation.type}

Invitation code: ${currentInvitation.code}

Join using this link:
${currentInvitation.link}`;


  const whatsappURL =
    "https://wa.me/?text=" +
    encodeURIComponent(message);


  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

}


// ==========================================
// SAVE INVITATION
// ==========================================

function saveInvitation(invitation) {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "aguInvitations"
        ) || "[]"
      );


    saved.push(invitation);


    localStorage.setItem(
      "aguInvitations",
      JSON.stringify(saved)
    );


  } catch (error) {

    console.warn(
      "Could not save invitation:",
      error
    );

  }

}


// ==========================================
// LOAD INVITATION STATISTICS
// ==========================================

function loadInvitationStats() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "aguInvitations"
        ) || "[]"
      );


    invitationStats = {

      total:
        saved.length,

      students:
        saved.filter(
          item =>
            item.type === "Student"
        ).length,

      teachers:
        saved.filter(
          item =>
            item.type === "Teacher"
        ).length

    };


  } catch (error) {

    invitationStats = {

      total: 0,

      students: 0,

      teachers: 0

    };

  }

}


// ==========================================
// UPDATE DASHBOARD COUNTS
// ==========================================

function updateDashboard() {

  const invitationCount =
    document.getElementById(
      "invitationCount"
    );

  const studentCount =
    document.getElementById(
      "studentCount"
    );

  const teacherCount =
    document.getElementById(
      "teacherCount"
    );


  if (invitationCount) {

    invitationCount.textContent =
      invitationStats.total;

  }


  if (studentCount) {

    studentCount.textContent =
      invitationStats.students;

  }


  if (teacherCount) {

    teacherCount.textContent =
      invitationStats.teachers;

  }

}


// ==========================================
// CHECK INVITATION LINK
// ==========================================

function checkInvitationLink() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const invite =
    params.get("invite");

  const type =
    params.get("type");


  if (!invite) {
    return;
  }


  /*
   * IMPORTANT:
   * Store invitation temporarily.
   * The registration page can use this
   * invitation code.
   */

  sessionStorage.setItem(
    "aguPendingInvitation",
    JSON.stringify({

      code: invite,

      type: type || "user"

    })
  );


  /*
   * Send the user directly to
   * registration.
   */

  window.location.href =
    "login.html?register=true&invite=" +
    encodeURIComponent(invite);

}


// ==========================================
// PERSONALIZED STUDENT DASHBOARD
// ==========================================

function buildStudentDashboard() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  const studentsSection =
    document.getElementById(
      "students"
    );

  if (!studentsSection) {
    return;
  }


  const name =
    user.name || "Student";


  const existing =
    document.getElementById(
      "aguStudentWelcome"
    );


  if (existing) {
    return;
  }


  const welcome =
    document.createElement("div");

  welcome.id =
    "aguStudentWelcome";

  welcome.className =
    "dashboard-card";


  welcome.innerHTML = `

    <span>🎓</span>

    <h3>
      Welcome, ${escapeHTML(name)}
    </h3>

    <p>
      Your student dashboard is ready.
    </p>

    <p>
      📚 Continue learning and explore
      your educational resources.
    </p>

  `;


  const grid =
    studentsSection.querySelector(
      ".dashboard-grid"
    );


  if (grid) {

    grid.insertBefore(
      welcome,
      grid.firstChild
    );

  }

}


// ==========================================
// PERSONALIZED TEACHER DASHBOARD
// ==========================================

function buildTeacherDashboard() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  const teachersSection =
    document.getElementById(
      "teachers"
    );

  if (!teachersSection) {
    return;
  }


  const name =
    user.name || "Teacher";


  const existing =
    document.getElementById(
      "aguTeacherWelcome"
    );


  if (existing) {
    return;
  }


  const welcome =
    document.createElement("div");

  welcome.id =
    "aguTeacherWelcome";

  welcome.className =
    "dashboard-card";


  welcome.innerHTML = `

    <span>👨‍🏫</span>

    <h3>
      Welcome, ${escapeHTML(name)}
    </h3>

    <p>
      Your teacher dashboard is ready.
    </p>

    <p>
      📚 Organize lessons and support
      your students.
    </p>

  `;


  const grid =
    teachersSection.querySelector(
      ".dashboard-grid"
    );


  if (grid) {

    grid.insertBefore(
      welcome,
      grid.firstChild
    );

  }

}


// ==========================================
// DASHBOARD WELCOME
// ==========================================

function buildMainDashboard() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  const dashboard =
    document.getElementById(
      "dashboard"
    );

  if (!dashboard) {
    return;
  }


  const existing =
    document.getElementById(
      "aguDashboardWelcome"
    );


  if (existing) {
    return;
  }


  const welcome =
    document.createElement("div");

  welcome.id =
    "aguDashboardWelcome";

  welcome.className =
    "invitation-intro";


  const role =
    user.role === "student"
      ? "Student"
      : "Teacher";


  welcome.innerHTML = `

    <h3>
      👋 Welcome, ${escapeHTML(user.name)}
    </h3>

    <p>
      You are logged in as a
      <strong>${role}</strong>.
    </p>

    <p>
      Your AGU Educational Platform
      dashboard is ready.
    </p>

  `;


  dashboard.insertBefore(
    welcome,
    dashboard.querySelector(
      ".dashboard-grid"
    )
  );

}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


// ==========================================
// DISPLAY CURRENT USER
// ==========================================

function displayCurrentUser() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  console.log(
    "AGU User:",
    user.name,
    "| Role:",
    user.role
  );

}


// ==========================================
// CREATE LOGOUT BUTTON
// ==========================================

function createLogoutButton() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  const nav =
    document.getElementById(
      "mainNav"
    );

  if (!nav) {
    return;
  }


  if (
    document.getElementById(
      "aguLogoutButton"
    )
  ) {
    return;
  }


  const button =
    document.createElement(
      "button"
    );


  button.id =
    "aguLogoutButton";


  button.textContent =
    "🚪 Logout";


  button.onclick =
    function () {

      localStorage.removeItem(
        "aguCurrentUser"
      );

      window.location.reload();

    };


  nav.appendChild(
    button
  );

}


// ==========================================
// ROLE-BASED NAVIGATION
// ==========================================

function setupRoleAccess() {

  const user =
    getAGUCurrentUser();

  if (!user) {
    return;
  }


  const studentButton =
    document.querySelector(
      'button[onclick="showSection(\'students\')"]'
    );

  const teacherButton =
    document.querySelector(
      'button[onclick="showSection(\'teachers\')"]'
    );


  /*
   * Keep both areas visible for now.
   * This makes Phase 3 easier to expand.
   */


  if (user.role === "student") {

    if (studentButton) {

      studentButton.innerHTML =
        "🎓 My Student Area";

    }

  }


  if (user.role === "teacher") {

    if (teacherButton) {

      teacherButton.innerHTML =
        "👨‍🏫 My Teacher Area";

    }

  }

}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function initializeApp() {

  /*
   * Check invitation BEFORE normal
   * application initialization.
   */

  const params =
    new URLSearchParams(
      window.location.search
    );


  const invite =
    params.get("invite");


  if (invite) {

    checkInvitationLink();

    return;

  }


  loadInvitationStats();

  updateDashboard();

  displayCurrentUser();

  createLogoutButton();

  setupRoleAccess();

  buildStudentDashboard();

  buildTeacherDashboard();

  buildMainDashboard();

}


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


// ==========================================
// LOGIN BUTTON
// ==========================================

function openLogin() {

  window.location.href =
    "login.html";

}
