// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 2 — MAIN APPLICATION
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
        Math.random() * letters.length
      )
    );

  }

  code += "-";

  for (let i = 0; i < 3; i++) {

    code += numbers.charAt(
      Math.floor(
        Math.random() * numbers.length
      )
    );

  }

  return code;

}


// ==========================================
// GET SAVED INVITATIONS
// ==========================================

function getSavedInvitations() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "aguInvitations"
      ) || "[]"
    );

  } catch (error) {

    console.warn(
      "Could not load invitations:",
      error
    );

    return [];

  }

}


// ==========================================
// SAVE INVITATIONS
// ==========================================

function saveInvitations(invitations) {

  localStorage.setItem(
    "aguInvitations",
    JSON.stringify(invitations)
  );

}


// ==========================================
// GENERATE INVITATION
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

    status: "pending",

    createdAt:
      new Date().toISOString(),

    acceptedAt: null,

    acceptedBy: null

  };


  // ========================================
  // SAVE INVITATION
  // ========================================

  const invitations =
    getSavedInvitations();


  invitations.push(
    currentInvitation
  );


  saveInvitations(
    invitations
  );


  // ========================================
  // UPDATE STATISTICS
  // ========================================

  loadInvitationStats();

  updateDashboard();


  // ========================================
  // DISPLAY INVITATION
  // ========================================

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
// VALIDATE INVITATION
// ==========================================

function validateInvitationCode(
  code,
  role
) {

  if (!code) {

    return {
      valid: false,
      message: "No invitation code entered."
    };

  }


  const invitations =
    getSavedInvitations();


  const invitation =
    invitations.find(
      item =>
        item.code.toUpperCase() ===
        code.toUpperCase()
    );


  if (!invitation) {

    return {
      valid: false,
      message:
        "❌ Invitation code not found."
    };

  }


  if (
    invitation.status ===
    "accepted"
  ) {

    return {
      valid: false,
      message:
        "❌ This invitation has already been used."
    };

  }


  const expectedType =
    role === "student"
      ? "Student"
      : "Teacher";


  if (
    invitation.type !==
    expectedType
  ) {

    return {
      valid: false,
      message:
        `❌ This invitation is for ${invitation.type.toLowerCase()}s.`
    };

  }


  return {
    valid: true,
    invitation: invitation,
    message:
      "✅ Invitation code is valid."
  };

}


// ==========================================
// ACCEPT INVITATION
// ==========================================

function acceptInvitation(
  code,
  user
) {

  const invitations =
    getSavedInvitations();


  const index =
    invitations.findIndex(
      item =>
        item.code.toUpperCase() ===
        code.toUpperCase()
    );


  if (index === -1) {
    return false;
  }


  invitations[index].status =
    "accepted";


  invitations[index].acceptedAt =
    new Date().toISOString();


  invitations[index].acceptedBy = {

    id: user.id,

    name: user.name,

    email: user.email,

    role: user.role

  };


  saveInvitations(
    invitations
  );


  loadInvitationStats();

  updateDashboard();


  return true;

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
    encodeURIComponent(
      message
    );


  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

}


// ==========================================
// LOAD INVITATION STATISTICS
// ==========================================

function loadInvitationStats() {

  const saved =
    getSavedInvitations();


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


  showSection(
    "invitations"
  );


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


  if (result) {

    result.style.display =
      "block";

  }


  if (message) {

    const invitationType =
      type
        ? type.charAt(0).toUpperCase() +
          type.slice(1)
        : "User";


    message.textContent =
      `You have received a ${invitationType.toLowerCase()} invitation to join AGU Educational Platform.`;

  }


  if (codeElement) {

    codeElement.textContent =
      invite;

  }


  // Store the invitation code
  // so registration can use it.

  sessionStorage.setItem(
    "aguPendingInvitation",
    JSON.stringify({

      code: invite,

      type: type || null

    })

  );

}


// ==========================================
// LOGIN
// ==========================================

function openLogin() {

  window.location.href =
    "login.html";

}


// ==========================================
// CURRENT USER
// ==========================================

function displayCurrentUser() {

  try {

    const user =
      JSON.parse(
        localStorage.getItem(
          "aguCurrentUser"
        )
      );


    if (!user) {
      return;
    }


    console.log(
      "AGU User:",
      user.name,
      "| Role:",
      user.role
    );


  } catch (error) {

    console.warn(
      "No active AGU user."
    );

  }

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

  checkInvitationLink();

  displayCurrentUser();

  createLogoutButton();

}


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
