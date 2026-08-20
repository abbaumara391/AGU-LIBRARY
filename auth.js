// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 2 — AUTHENTICATION + INVITATIONS
// ==========================================

const AGU_USERS_KEY = "aguUsers";


// ==========================================
// GET USERS
// ==========================================

function getUsers() {

  try {

    return JSON.parse(
      localStorage.getItem(AGU_USERS_KEY) || "[]"
    );

  } catch (error) {

    console.error("Unable to load users:", error);

    return [];

  }

}


// ==========================================
// SAVE USERS
// ==========================================

function saveUsers(users) {

  localStorage.setItem(
    AGU_USERS_KEY,
    JSON.stringify(users)
  );

}


// ==========================================
// SHOW REGISTER FORM
// ==========================================

function showRegister() {

  const loginForm =
    document.getElementById("loginForm");

  const registerForm =
    document.getElementById("registerForm");

  const loginMessage =
    document.getElementById("loginMessage");

  if (loginForm) {
    loginForm.style.display = "none";
  }

  if (registerForm) {
    registerForm.style.display = "block";
  }

  if (loginMessage) {
    loginMessage.textContent = "";
  }

}


// ==========================================
// SHOW LOGIN FORM
// ==========================================

function showLogin() {

  const loginForm =
    document.getElementById("loginForm");

  const registerForm =
    document.getElementById("registerForm");

  const registerMessage =
    document.getElementById("registerMessage");

  if (loginForm) {
    loginForm.style.display = "block";
  }

  if (registerForm) {
    registerForm.style.display = "none";
  }

  if (registerMessage) {
    registerMessage.textContent = "";
  }

}


// ==========================================
// DISPLAY MESSAGE
// ==========================================

function showMessage(
  elementId,
  message,
  success = false
) {

  const element =
    document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;

  element.classList.remove(
    "success",
    "error"
  );

  element.classList.add(
    success ? "success" : "error"
  );

}


// ==========================================
// CREATE USER ID
// ==========================================

function createUserId() {

  return (
    "AGU-" +
    Date.now()
      .toString(36)
      .toUpperCase() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()
  );

}


// ==========================================
// GET PENDING INVITATION
// ==========================================

function getPendingInvitation() {

  try {

    const data =
      sessionStorage.getItem(
        "aguPendingInvitation"
      );

    if (!data) {
      return null;
    }

    return JSON.parse(data);

  } catch (error) {

    return null;

  }

}


// ==========================================
// GET SAVED INVITATIONS
// ==========================================

function getInvitations() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "aguInvitations"
      ) || "[]"
    );

  } catch (error) {

    console.warn(
      "Unable to load invitations:",
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
// REGISTER USER
// ==========================================

function registerUser(event) {

  event.preventDefault();


  // ========================================
  // GET FORM VALUES
  // ========================================

  const name =
    document
      .getElementById("registerName")
      .value
      .trim();


  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("registerPassword")
      .value;


  const role =
    document
      .getElementById("registerRole")
      .value;


  const invitationElement =
    document.getElementById(
      "invitationCode"
    );


  const invitationCode =
    invitationElement
      ? invitationElement.value
          .trim()
          .toUpperCase()
      : "";


  // ========================================
  // BASIC VALIDATION
  // ========================================

  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {

    showMessage(
      "registerMessage",
      "Please complete all required fields."
    );

    return;

  }


  if (password.length < 6) {

    showMessage(
      "registerMessage",
      "Password must contain at least 6 characters."
    );

    return;

  }


  // ========================================
  // INVITATION VALIDATION
  // ========================================

  let invitation = null;

  const invitations =
    getInvitations();


  // ----------------------------------------
  // FIRST: CHECK LOCAL STORAGE
  // ----------------------------------------

  if (invitationCode) {

    invitation =
      invitations.find(
        item =>
          String(item.code)
            .toUpperCase() ===
          invitationCode
      );

  }


  // ----------------------------------------
  // SECOND: CHECK PENDING INVITATION
  // ----------------------------------------

  const pending =
    getPendingInvitation();


  if (
    !invitation &&
    pending &&
    pending.code &&
    pending.code.toUpperCase() ===
      invitationCode
  ) {

    invitation = {

      code:
        invitationCode,

      type:
        pending.type
          ? pending.type
              .charAt(0)
              .toUpperCase() +
            pending.type
              .slice(1)
              .toLowerCase()
          : null,

      status:
        "pending",

      createdAt:
        new Date().toISOString()

    };

  }


  // ----------------------------------------
  // INVITATION CODE WAS ENTERED
  // ----------------------------------------

  if (invitationCode) {

    if (!invitation) {

      showMessage(
        "registerMessage",
        "❌ Invalid invitation code."
      );

      return;

    }


    // --------------------------------------
    // CHECK IF ALREADY USED
    // --------------------------------------

    if (
      invitation.status ===
      "accepted"
    ) {

      showMessage(
        "registerMessage",
        "❌ This invitation has already been used."
      );

      return;

    }


    // --------------------------------------
    // CHECK ROLE
    // --------------------------------------

    const expectedType =
      role.toLowerCase() ===
      "student"
        ? "Student"
        : "Teacher";


    if (
      invitation.type &&
      invitation.type !==
        expectedType
    ) {

      showMessage(
        "registerMessage",
        `❌ This invitation is for ${invitation.type.toLowerCase()}s.`
      );

      return;

    }

  }


  // ========================================
  // GET USERS
  // ========================================

  const users =
    getUsers();


  // ========================================
  // CHECK DUPLICATE EMAIL
  // ========================================

  const existingUser =
    users.find(
      user =>
        user.email === email
    );


  if (existingUser) {

    showMessage(
      "registerMessage",
      "An account with this email already exists."
    );

    return;

  }


  // ========================================
  // CREATE USER
  // ========================================

  const newUser = {

    id:
      createUserId(),

    name:
      name,

    email:
      email,

    password:
      password,

    role:
      role,

    invitationCode:
      invitationCode || null,

    invitationId:
      invitation
        ? invitation.code
        : null,

    createdAt:
      new Date().toISOString()

  };


  // ========================================
  // SAVE USER
  // ========================================

  users.push(newUser);

  saveUsers(users);


  // ========================================
  // MARK INVITATION ACCEPTED
  // ========================================

  if (invitationCode) {

    const updatedInvitations =
      getInvitations();


    const invitationIndex =
      updatedInvitations.findIndex(
        item =>
          String(item.code)
            .toUpperCase() ===
          invitationCode
      );


    if (
      invitationIndex !== -1
    ) {

      updatedInvitations[
        invitationIndex
      ].status =
        "accepted";


      updatedInvitations[
        invitationIndex
      ].acceptedAt =
        new Date().toISOString();


      updatedInvitations[
        invitationIndex
      ].acceptedBy = {

        id:
          newUser.id,

        name:
          newUser.name,

        email:
          newUser.email,

        role:
          newUser.role

      };


      saveInvitations(
        updatedInvitations
      );

    } else {

      // If this invitation came
      // from the pending link,
      // create its local record.

      const newInvitation = {

        code:
          invitationCode,

        type:
          invitation.type ||
          (
            role.toLowerCase() ===
            "student"
              ? "Student"
              : "Teacher"
          ),

        status:
          "accepted",

        createdAt:
          invitation.createdAt ||
          new Date().toISOString(),

        acceptedAt:
          new Date().toISOString(),

        acceptedBy: {

          id:
            newUser.id,

          name:
            newUser.name,

          email:
            newUser.email,

          role:
            newUser.role

        }

      };


      updatedInvitations.push(
        newInvitation
      );


      saveInvitations(
        updatedInvitations
      );

    }


    // Remove pending invitation
    // after successful registration.

    sessionStorage.removeItem(
      "aguPendingInvitation"
    );

  }


  // ========================================
  // SUCCESS
  // ========================================

  showMessage(
    "registerMessage",

    invitationCode
      ? "🎉 Account created and invitation accepted successfully!"
      : "✅ Account created successfully. You can now login.",

    true
  );


  document
    .getElementById(
      "registerForm"
    )
    .reset();


  // ========================================
  // RETURN TO LOGIN
  // ========================================

  setTimeout(
    () => {

      showLogin();

    },
    1500
  );

}


// ==========================================
// LOGIN USER
// ==========================================

function loginUser(event) {

  event.preventDefault();


  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("loginPassword")
      .value;


  if (
    !email ||
    !password
  ) {

    showMessage(
      "loginMessage",
      "Please enter your email and password."
    );

    return;

  }


  const users =
    getUsers();


  const user =
    users.find(
      account =>
        account.email ===
          email &&
        account.password ===
          password
    );


  if (!user) {

    showMessage(
      "loginMessage",
      "❌ Incorrect email or password."
    );

    return;

  }


  // ========================================
  // SAVE CURRENT SESSION
  // ========================================

  const session = {

    id:
      user.id,

    name:
      user.name,

    email:
      user.email,

    role:
      user.role,

    invitationCode:
      user.invitationCode ||
      null,

    loginTime:
      new Date().toISOString()

  };


  localStorage.setItem(
    "aguCurrentUser",
    JSON.stringify(session)
  );


  // ========================================
  // SUCCESS
  // ========================================

  showMessage(
    "loginMessage",
    "✅ Login successful. Opening your dashboard...",
    true
  );


  setTimeout(
    () => {

      window.location.href =
        "index.html";

    },
    800
  );

}


// ==========================================
// GET CURRENT USER
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
// LOGOUT
// ==========================================

function logoutUser() {

  localStorage.removeItem(
    "aguCurrentUser"
  );

  window.location.href =
    "login.html";

}


// ==========================================
// CHECK LOGIN
// ==========================================

function isLoggedIn() {

  return !!getCurrentUser();

}


// ==========================================
// GET USER ROLE
// ==========================================

function getUserRole() {

  const user =
    getCurrentUser();

  return user
    ? user.role
    : null;

}


// ==========================================
// AUTO-FILL INVITATION CODE
// ==========================================

function loadPendingInvitation() {

  const input =
    document.getElementById(
      "invitationCode"
    );


  if (!input) {
    return;
  }


  const pending =
    getPendingInvitation();


  if (
    pending &&
    pending.code
  ) {

    input.value =
      pending.code;

  }

}


// ==========================================
// CONNECT FORMS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const loginForm =
      document.getElementById(
        "loginForm"
      );


    const registerForm =
      document.getElementById(
        "registerForm"
      );


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        loginUser
      );

    }


    if (registerForm) {

      registerForm.addEventListener(
        "submit",
        registerUser
      );

    }


    loadPendingInvitation();

  }
);
