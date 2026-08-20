// ==========================================
// AGU EDUCATIONAL PLATFORM
// PHASE 3 — EDUCATIONAL DATA
// ==========================================


// ==========================================
// PLATFORM INFORMATION
// ==========================================

const AGU_PLATFORM = {

  name: "AGU Educational Platform",

  slogan: "Learn • Teach • Grow",

  year: 2026

};


// ==========================================
// STUDENT DASHBOARD DATA
// ==========================================

const AGU_STUDENT_DATA = {

  lessons: [

    {
      id: 1,
      title: "Introduction to Physics",
      subject: "Physics",
      status: "Available"
    },

    {
      id: 2,
      title: "Basic Chemistry",
      subject: "Chemistry",
      status: "Available"
    },

    {
      id: 3,
      title: "Mathematics Fundamentals",
      subject: "Mathematics",
      status: "Available"
    }

  ],


  assignments: [

    {
      id: 1,
      title: "Physics Assignment",
      subject: "Physics",
      status: "Pending"
    },

    {
      id: 2,
      title: "Chemistry Exercise",
      subject: "Chemistry",
      status: "Pending"
    }

  ],


  progress: {

    lessonsCompleted: 0,

    totalLessons: 3,

    assignmentsCompleted: 0,

    totalAssignments: 2,

    score: 0

  }

};


// ==========================================
// TEACHER DASHBOARD DATA
// ==========================================

const AGU_TEACHER_DATA = {

  materials: [

    {
      id: 1,
      title: "Physics Teaching Materials",
      subject: "Physics"
    },

    {
      id: 2,
      title: "Chemistry Teaching Materials",
      subject: "Chemistry"
    },

    {
      id: 3,
      title: "Mathematics Teaching Materials",
      subject: "Mathematics"
    }

  ],


  students: [],


  classes: [

    {
      id: 1,
      name: "SSS 1",
      students: 0
    },

    {
      id: 2,
      name: "SSS 2",
      students: 0
    },

    {
      id: 3,
      name: "SSS 3",
      students: 0
    }

  ],


  lessons: []

};


// ==========================================
// LIBRARY DATA
// ==========================================

const AGU_LIBRARY_DATA = {

  ebooks: [

    {
      id: 1,
      title: "Physics",
      category: "Science"
    },

    {
      id: 2,
      title: "Chemistry",
      category: "Science"
    },

    {
      id: 3,
      title: "Mathematics",
      category: "Science"
    }

  ],


  videos: [],


  documents: []

};


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

const AGU_DASHBOARD_DATA = {

  students: 0,

  teachers: 0,

  invitations: 0,

  lessons: 0,

  assignments: 0

};


// ==========================================
// SAVE DATA
// ==========================================

function saveAGUData() {

  try {

    localStorage.setItem(
      "aguStudentData",
      JSON.stringify(
        AGU_STUDENT_DATA
      )
    );


    localStorage.setItem(
      "aguTeacherData",
      JSON.stringify(
        AGU_TEACHER_DATA
      )
    );


    localStorage.setItem(
      "aguLibraryData",
      JSON.stringify(
        AGU_LIBRARY_DATA
      )
    );


  } catch (error) {

    console.warn(
      "AGU data could not be saved:",
      error
    );

  }

}


// ==========================================
// LOAD DATA
// ==========================================

function loadAGUData() {

  try {

    const studentData =
      localStorage.getItem(
        "aguStudentData"
      );


    const teacherData =
      localStorage.getItem(
        "aguTeacherData"
      );


    const libraryData =
      localStorage.getItem(
        "aguLibraryData"
      );


    if (studentData) {

      Object.assign(
        AGU_STUDENT_DATA,
        JSON.parse(studentData)
      );

    }


    if (teacherData) {

      Object.assign(
        AGU_TEACHER_DATA,
        JSON.parse(teacherData)
      );

    }


    if (libraryData) {

      Object.assign(
        AGU_LIBRARY_DATA,
        JSON.parse(libraryData)
      );

    }


  } catch (error) {

    console.warn(
      "AGU data could not be loaded:",
      error
    );

  }

}


// ==========================================
// ADD STUDENT
// ==========================================

function addAGUStudent(student) {

  if (!student) {
    return;
  }


  AGU_TEACHER_DATA.students.push(
    student
  );


  saveAGUData();

}


// ==========================================
// ADD TEACHER LESSON
// ==========================================

function addAGULesson(lesson) {

  if (!lesson) {
    return;
  }


  AGU_TEACHER_DATA.lessons.push(
    lesson
  );


  saveAGUData();

}


// ==========================================
// INITIALIZE DATA
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadAGUData();

  }
);
