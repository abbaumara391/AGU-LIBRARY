// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 1 — DATA
// ==========================================


// ==========================================
// PLATFORM INFORMATION
// ==========================================

const AGU_PLATFORM = {

  name: "AGU Educational Platform",

  shortName: "AGU",

  slogan: "Learn • Teach • Grow",

  year: 2026,

  version: "1.0.0"

};


// ==========================================
// PLATFORM SECTIONS
// ==========================================

const AGU_SECTIONS = [

  {
    id: "home",
    name: "Home",
    icon: "🏠"
  },

  {
    id: "library",
    name: "Library",
    icon: "📚"
  },

  {
    id: "students",
    name: "Students",
    icon: "👨‍🎓"
  },

  {
    id: "teachers",
    name: "Teachers",
    icon: "👨‍🏫"
  },

  {
    id: "invitations",
    name: "Invitations",
    icon: "📩"
  },

  {
    id: "dashboard",
    name: "Dashboard",
    icon: "📊"
  }

];


// ==========================================
// USER TYPES
// ==========================================

const AGU_USER_TYPES = [

  {
    id: "student",
    name: "Student",
    icon: "👨‍🎓"
  },

  {
    id: "teacher",
    name: "Teacher",
    icon: "👨‍🏫"
  },

  {
    id: "admin",
    name: "Administrator",
    icon: "🛡️"
  }

];


// ==========================================
// INVITATION TYPES
// ==========================================

const AGU_INVITATION_TYPES = [

  {
    id: "student",
    name: "Student Invitation",
    description:
      "Invitation for students to join AGU Educational Platform.",
    icon: "👨‍🎓"
  },

  {
    id: "teacher",
    name: "Teacher Invitation",
    description:
      "Invitation for teachers to join AGU Educational Platform.",
    icon: "👨‍🏫"
  }

];


// ==========================================
// INVITATION STATUS
// ==========================================

const AGU_INVITATION_STATUS = [

  {
    id: "pending",
    name: "Pending",
    icon: "⏳"
  },

  {
    id: "accepted",
    name: "Accepted",
    icon: "✅"
  },

  {
    id: "expired",
    name: "Expired",
    icon: "⌛"
  }

];


// ==========================================
// EDUCATIONAL SUBJECTS
// ==========================================

const AGU_SUBJECTS = [

  {
    id: "physics",
    name: "Physics",
    icon: "⚛️",
    description:
      "Physics lessons, textbooks and learning resources."
  },

  {
    id: "chemistry",
    name: "Chemistry",
    icon: "🧪",
    description:
      "Chemistry lessons, textbooks and learning resources."
  },

  {
    id: "biology",
    name: "Biology",
    icon: "🧬",
    description:
      "Biology lessons, textbooks and learning resources."
  },

  {
    id: "mathematics",
    name: "Mathematics",
    icon: "📐",
    description:
      "Mathematics lessons, exercises and learning resources."
  },

  {
    id: "civic-education",
    name: "Civic Education",
    icon: "🏛️",
    description:
      "Civic Education lessons and learning resources."
  },

  {
    id: "english",
    name: "English",
    icon: "📖",
    description:
      "English language lessons and educational resources."
  }

];


// ==========================================
// ACADEMIC LEVELS
// ==========================================

const AGU_LEVELS = [

  {
    id: "sss1",
    name: "SSS 1"
  },

  {
    id: "sss2",
    name: "SSS 2"
  },

  {
    id: "sss3",
    name: "SSS 3"
  }

];


// ==========================================
// TERM DATA
// ==========================================

const AGU_TERMS = [

  {
    id: "first-term",
    name: "First Term"
  },

  {
    id: "second-term",
    name: "Second Term"
  },

  {
    id: "third-term",
    name: "Third Term"
  }

];


// ==========================================
// INITIAL INVITATION DATA
// ==========================================

const AGU_INVITATIONS = [];


// ==========================================
// INITIAL STUDENT DATA
// ==========================================

const AGU_STUDENTS = [];


// ==========================================
// INITIAL TEACHER DATA
// ==========================================

const AGU_TEACHERS = [];


// ==========================================
// LIBRARY DATA
// ==========================================

const AGU_LIBRARY = [

  {
    id: "physics",
    subject: "Physics",
    icon: "⚛️",
    resources: []
  },

  {
    id: "chemistry",
    subject: "Chemistry",
    icon: "🧪",
    resources: []
  },

  {
    id: "biology",
    subject: "Biology",
    icon: "🧬",
    resources: []
  },

  {
    id: "mathematics",
    subject: "Mathematics",
    icon: "📐",
    resources: []
  },

  {
    id: "civic-education",
    subject: "Civic Education",
    icon: "🏛️",
    resources: []
  },

  {
    id: "english",
    subject: "English",
    icon: "📖",
    resources: []
  }

];


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getSubjectById(id) {

  return AGU_SUBJECTS.find(
    subject => subject.id === id
  );

}


function getLevelById(id) {

  return AGU_LEVELS.find(
    level => level.id === id
  );

}


function getTermById(id) {

  return AGU_TERMS.find(
    term => term.id === id
  );

}
