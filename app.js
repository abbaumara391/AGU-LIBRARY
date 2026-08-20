// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 3 — WORKING DASHBOARD
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
      localStorage.getItem(
        "aguCurrentUser"
      )
    );

  } catch (error) {

    return null;

  }

}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text || "";

  return div.innerHTML;

}


// ==========================================
// INVITATION CODE
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


  saveInvitation(
    currentInvitation
  );


  loadInvitationStats();

  updateDashboard();


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

    result.style.display =
      "block";

  }


  if (message) {

    message.textContent =
      `Your ${type.toLowerCase()} invitation is ready to share.`;

  }


  if (codeElement) {

    codeElement.textContent =
      code;

  }


  if (linkElement) {

    linkElement.value =
      invitationLink;

  }


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
// LOAD INVITATION STATS
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
// UPDATE DASHBOARD
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
// COPY INVITATION
// ==========================================

async function copyInvitationLink() {

  if (!currentInvitation) {

    alert(
      "Please generate an invitation first."
    );

    return;

  }


  try {

    await navigator.clipboard.writeText(
      currentInvitation.link
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
// WHATSAPP
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

Invitation type:
${currentInvitation.type}

Invitation code:
${currentInvitation.code}

Join using this link:
${currentInvitation.link}`;


  const whatsappURL =
    "https://wa.me/?text=" +
    encodeURIComponent(message);


  window.open(
    whatsappURL,
    "_blank"
  );

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


  sessionStorage.setItem(
    "aguPendingInvitation",
    JSON.stringify({

      code: invite,

      type:
        type || "user"

    })
  );


  window.location.href =
    "login.html?register=true&invite=" +
    encodeURIComponent(invite);

}


// ==========================================
// STUDENT LESSONS
// ==========================================

function openStudentLessons() {

  showSection("library");

  alert(
    "📚 Student Lessons\n\nYour available lessons are ready. The full lesson system will be connected in the next phase."
  );

}


// ==========================================
// STUDENT ASSIGNMENTS
// ==========================================

function openAssignments() {

  alert(
    "📝 Assignments\n\nYour assignment system is ready for the next development stage."
  );

}


// ==========================================
// STUDENT PROGRESS
// ==========================================

function openStudentProgress() {

  const data =
    typeof AGU_STUDENT_DATA !== "undefined"
      ? AGU_STUDENT_DATA.progress
      : null;


  if (!data) {

    alert(
      "🏆 Progress data is not available yet."
    );

    return;

  }


  alert(
`🏆 MY PROGRESS

Lessons completed:
${data.lessonsCompleted}/${data.totalLessons}

Assignments completed:
${data.assignmentsCompleted}/${data.totalAssignments}

Score:
${data.score}%`
  );

}


// ==========================================
// TEACHING MATERIALS
// ==========================================

function openTeachingMaterials() {

  const data =
    typeof AGU_TEACHER_DATA !== "undefined"
      ? AGU_TEACHER_DATA.materials
      : [];


  let message =
    "📚 TEACHING MATERIALS\n\n";


  if (!data.length) {

    message +=
      "No teaching materials available yet.";

  } else {

    data.forEach(
      material => {

        message +=
          "• " +
          material.title +
          "\n";

      }
    );

  }


  alert(message);

}


// ==========================================
// TEACHER STUDENTS
// ==========================================

function openTeacherStudents() {

  const data =
    typeof AGU_TEACHER_DATA !== "undefined"
      ? AGU_TEACHER_DATA.students
      : [];


  if (!data.length) {

    alert(
      "👨‍🎓 My Students\n\nNo students have been added yet."
    );

    return;

  }


  let message =
    "👨‍🎓 MY STUDENTS\n\n";


  data.forEach(
    student => {

      message +=
        "• " +
        student.name +
        "\n";

    }
  );


  alert(message);

}


// ==========================================
// CLASS PROGRESS
// ==========================================

function openClassProgress() {

  const data =
    typeof AGU_TEACHER_DATA !== "undefined"
      ? AGU_TEACHER_DATA.classes
      : [];


  let message =
    "📊 CLASS PROGRESS\n\n";


  data.forEach(
    classroom => {

      message +=
        classroom.name +
        ": " +
        classroom.students +
        " students\n";

    }
  );


  alert(message);

}


// ==========================================
// CREATE LESSON
// ==========================================

function createTeacherLesson() {

  const title =
    prompt(
      "Enter the lesson title:"
    );


  if (!title) {
    return;
  }


  const subject =
    prompt(
      "Enter the subject:"
    );


  if (!subject) {
    return;
  }


  const lesson = {

    id:
      Date.now(),

    title:
      title,

    subject:
      subject,

    createdAt:
      new Date().toISOString()

  };


  if (
    typeof addAGULesson ===
    "function"
  ) {

    addAGULesson(
      lesson
    );

  }


  alert(
    "✅ Lesson created successfully!"
  );

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
// LOGOUT
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
// PERSONALIZED DASHBOARD
// ==========================================

function personalizeDashboard() {

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


  const old =
    document.getElementById(
      "aguUserWelcome"
    );


  if (old) {
    old.remove();
  }


  const welcome =
    document.createElement(
      "div"
    );


  welcome.id =
    "aguUserWelcome";


  welcome.className =
    "invitation-intro";


  welcome.innerHTML = `

    <h3>
      👋 Welcome,
      ${escapeHTML(user.name)}
    </h3>

    <p>
      You are logged in as
      <strong>
        ${escapeHTML(user.role)}
      </strong>.
    </p>

    <p>
      Your AGU Educational Platform
      dashboard is ready.
    </p>

  `;


  const grid =
    dashboard.querySelector(
      ".dashboard-grid"
    );


  if (grid) {

    dashboard.insertBefore(
      welcome,
      grid
    );

  }

}


// ==========================================
// INITIALIZE
// ==========================================

function initializeApp() {

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

  personalizeDashboard();

}


// ==========================================
// START
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


// ==========================================
// LOGIN
// ==========================================

function openLogin() {

  window.location.href =
    "login.html";

}
