// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 3 — MAIN APPLICATION
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
// LOGIN
// ==========================================

function openLogin() {

  window.location.href =
    "login.html";
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

  updateDashboard();

  saveInvitation(
    currentInvitation
  );

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

    code += letters.charAt(
      Math.floor(
        Math.random() *
        letters.length
      )
    );

  }

  code += "-";

  for (let i = 0; i < 3; i++) {

    code += numbers.charAt(
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

      document.execCommand(
        "copy"
      );

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
    `🎓 AGU Educational Platform Invitation\n\n` +
    `You have been invited to join AGU Educational Platform.\n\n` +
    `Invitation type: ${currentInvitation.type}\n` +
    `Invitation code: ${currentInvitation.code}\n\n` +
    `Join using this link:\n` +
    `${currentInvitation.link}`;

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

function saveInvitation(
  invitation
) {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "aguInvitations"
        ) || "[]"
      );

    saved.push(
      invitation
    );

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

  // Save invitation for registration page

  sessionStorage.setItem(
    "aguPendingInvitation",
    JSON.stringify({
      code: invite,
      type: type || "student"
    })
  );

  // Send invited person to registration

  window.location.href =
    "login.html?register=true&invite=" +
    encodeURIComponent(invite) +
    "&type=" +
    encodeURIComponent(
      type || "student"
    );
}


// ==========================================
// STUDENT — MY LESSONS
// ==========================================

function openStudentLessons() {

  showSection(
    "library"
  );

  setTimeout(() => {

    alert(
      "📚 Student Lessons\n\n" +
      "Your lessons will appear in the AGU Library."
    );

  }, 300);
}


// ==========================================
// STUDENT — ASSIGNMENTS
// ==========================================

function openAssignments() {

  alert(
    "📝 Assignments\n\n" +
    "Your assignments area is ready for the next development phase."
  );
}


// ==========================================
// STUDENT — PROGRESS
// ==========================================

function openStudentProgress() {

  const user =
    getCurrentUser();

  const name =
    user
      ? user.name
      : "Student";

  alert(
    "🏆 Student Progress\n\n" +
    `${name}, your progress dashboard will display your lessons, assignments and achievements here.`
  );
}


// ==========================================
// TEACHER — MATERIALS
// ==========================================

function openTeachingMaterials() {

  showSection(
    "library"
  );

  setTimeout(() => {

    alert(
      "📚 Teaching Materials\n\n" +
      "Teachers will be able to manage educational materials here."
    );

  }, 300);
}


// ==========================================
// TEACHER — STUDENTS
// ==========================================

function openTeacherStudents() {

  let users = [];

  try {

    users =
      JSON.parse(
        localStorage.getItem(
          "aguUsers"
        ) || "[]"
      );

  } catch (error) {

    users = [];

  }

  const students =
    users.filter(
      user =>
        user.role === "student"
    );

  if (students.length === 0) {

    alert(
      "👨‍🎓 My Students\n\n" +
      "No registered students found yet."
    );

    return;
  }

  let message =
    "👨‍🎓 MY STUDENTS\n\n";

  students.forEach(
    (student, index) => {

      message +=
        `${index + 1}. ${student.name}\n` +
        `   ${student.email}\n\n`;

    }
  );

  alert(message);
}


// ==========================================
// TEACHER — CLASS PROGRESS
// ==========================================

function openClassProgress() {

  let users = [];

  try {

    users =
      JSON.parse(
        localStorage.getItem(
          "aguUsers"
        ) || "[]"
      );

  } catch (error) {

    users = [];

  }

  const students =
    users.filter(
      user =>
        user.role === "student"
    );

  alert(
    "📊 CLASS PROGRESS\n\n" +
    `Registered students: ${students.length}\n\n` +
    "Detailed academic progress will be added in the next phase."
  );
}


// ==========================================
// TEACHER — CREATE LESSON
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
      "LESSON-" +
      Date.now(),

    title:
      title.trim(),

    subject:
      subject.trim(),

    createdAt:
      new Date().toISOString()

  };

  try {

    const lessons =
      JSON.parse(
        localStorage.getItem(
          "aguLessons"
        ) || "[]"
      );

    lessons.push(
      lesson
    );

    localStorage.setItem(
      "aguLessons",
      JSON.stringify(
        lessons
      )
    );

    alert(
      "✅ Lesson created successfully!\n\n" +
      `Title: ${lesson.title}\n` +
      `Subject: ${lesson.subject}`
    );

  } catch (error) {

    alert(
      "❌ Unable to save the lesson."
    );

  }
}


// ==========================================
// CURRENT USER
// ==========================================

function getCurrentUser() {

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
// DISPLAY CURRENT USER
// ==========================================

function displayCurrentUser() {

  const user =
    getCurrentUser();

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
// LOGOUT BUTTON
// ==========================================

function createLogoutButton() {

  const user =
    localStorage.getItem(
      "aguCurrentUser"
    );

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
// INITIALIZE APPLICATION
// ==========================================

function initializeApp() {

  loadInvitationStats();

  updateDashboard();

  displayCurrentUser();

  createLogoutButton();

  checkInvitationLink();

}


// ==========================================
// START APP
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
