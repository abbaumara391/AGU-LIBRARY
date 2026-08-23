/* =========================================================
   AGULIBRARY — APP.JS
   PHASE 2 — SUBJECT + RESOURCE + LESSON CONNECTION
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

          ${resource.title || ""}

          ${resource.description || ""}

          ${resource.subject || ""}

          ${resource.subject_name || ""}

          ${resource.type || ""}

          ${resource.level || ""}

          ${resource.class_level || ""}

          ${resource.term || ""}

          ${resource.course || ""}

          ${resource.chapter || ""}

          ${resource.lesson || ""}

          ${resource.lesson_title || ""}

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

        ${
          currentSubject
            ? `
              No resources found for
              <strong>
                ${escapeHTML(
                  currentSubject
                )}
              </strong>.
            `
            : `
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
          ).toLowerCase();


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
          LESSONS AND COURSES ARE SENT
          TO lesson.html.

          Other resources continue
          opening their normal files.
        */

        const isLesson =
          typeValue === "lesson" ||
          typeValue === "course";


        const buttonText =
          isLesson
            ? "📖 Open Lesson →"
            : "Tap to open →";


        return `

          <article
            class="card"
            data-resource-id="${id}"
            onclick="openResourceById('${id}')">


            <div class="thumb">

              ${getResourceIcon(
                resource.type
              )}

            </div>


            <span>

              ${type}

            </span>


            <h3>

              ${title}

            </h3>


            ${
              subject
                ? `
                  <small
                    style="
                      display:block;
                      margin-top:5px;
                      color:#087a4b;
                      font-weight:800;
                    ">

                    ${subject}

                  </small>
                `
                : ""
            }


            <p>

              ${description}

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

  /*
    IMPORTANT:

    LESSON
    COURSE

    resources do NOT open their
    file directly.

    They open lesson.html with
    the resource ID.
  */

  const type =
    String(
      resource.type ||
      ""
    )
    .toLowerCase()
    .trim();


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


  /*
    NORMAL RESOURCE
  */

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

   openResource("https://...")
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

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

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
    "&#096;"
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
