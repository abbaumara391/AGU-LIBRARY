let allResources = [];

document.addEventListener("DOMContentLoaded", async () => {

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  initSupabase();

  await loadResources();

});


async function loadResources() {

  const client = getSupabase();

  const grid = document.getElementById("resourceGrid");

  if (!grid) return;


  if (!client) {

    grid.innerHTML = `
      <div class="empty">
        AGULIBRARY is waiting for the Supabase connection.
        Please check config.js.
      </div>
    `;

    return;
  }


  const { data, error } = await client
    .from("resources")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error("Resource loading error:", error);

    grid.innerHTML = `
      <div class="empty">
        The AGULIBRARY database is not ready yet.
      </div>
    `;

    return;
  }


  allResources = data || [];

  renderResources(allResources);

}



function renderResources(list) {

  const grid = document.getElementById("resourceGrid");

  if (!grid) return;


  if (!list.length) {

    grid.innerHTML = `
      <div class="empty">
        No educational resources have been published yet.
      </div>
    `;

    return;
  }


  grid.innerHTML = list.map(resource => {

    const title =
      escapeHTML(resource.title || "Untitled Resource");

    const description =
      escapeHTML(resource.description || "Educational resource");

    const type =
      escapeHTML(
        String(resource.type || "resource").toUpperCase()
      );

    const url =
      escapeAttr(resource.file_url || "");

    return `

      <article
        class="card"
        onclick="openResource('${url}')"
      >

        <div class="thumb">
          ${getResourceIcon(resource.type)}
        </div>

        <span>
          ${type}
        </span>

        <h3>
          ${title}
        </h3>

        <p>
          ${description}
        </p>

        <b>
          Tap to open →
        </b>

      </article>

    `;

  }).join("");

}



function filterResources() {

  const searchInput =
    document.getElementById("search");

  if (!searchInput) return;


  const query =
    searchInput.value
      .toLowerCase()
      .trim();


  const filtered =
    allResources.filter(resource => {

      const searchableText = `

        ${resource.title || ""}

        ${resource.description || ""}

        ${resource.subject || ""}

        ${resource.type || ""}

        ${resource.level || ""}

        ${resource.class_level || ""}

        ${resource.term || ""}

      `.toLowerCase();


      return searchableText.includes(query);

    });


  renderResources(filtered);

}



function openResource(url) {

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



function getResourceIcon(type) {

  const icons = {

    book: "📚",

    pdf: "📄",

    video: "🎥",

    photo: "🖼️",

    course: "🎓",

    lesson: "📖"

  };


  return (
    icons[String(type || "").toLowerCase()]
    || "📘"
  );

}



function escapeHTML(value) {

  return String(value).replace(
    /[&<>"']/g,
    character => {

      const entities = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      };

      return entities[character];

    }
  );

}



function escapeAttr(value) {

  return escapeHTML(value)
    .replace(/`/g, "&#096;");

}