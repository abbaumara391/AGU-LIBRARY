exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed."
      })
    };
  }

  try {
    const githubToken =
      process.env.AGU_GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error(
        "AGU_GITHUB_TOKEN is not configured in Netlify."
      );
    }

    /*
     * ------------------------------------------------------
     * VERIFY THE SIGNED-IN AGULIBRARY USER
     * ------------------------------------------------------
     */

    const authorization =
      event.headers?.authorization ||
      event.headers?.Authorization ||
      "";

    if (!authorization.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "Administrator authentication is required."
        })
      };
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are not configured in Netlify."
      );
    }

    const userResponse =
      await fetch(
        supabaseUrl.replace(/\/$/, "") +
          "/auth/v1/user",
        {
          method: "GET",
          headers: {
            "Authorization": authorization,
            "apikey": supabaseAnonKey
          }
        }
      );

    if (!userResponse.ok) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "Invalid or expired login session."
        })
      };
    }

    const user =
      await userResponse.json();

    if (!user?.id) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "Unable to verify the administrator."
        })
      };
    }

    /*
     * ------------------------------------------------------
     * VERIFY THAT THE USER IS AN AGULIBRARY ADMIN
     * ------------------------------------------------------
     */

    const adminResponse =
      await fetch(
        supabaseUrl.replace(/\/$/, "") +
          "/rest/v1/admin_users?user_id=eq." +
          encodeURIComponent(user.id) +
          "&select=user_id&limit=1",
        {
          method: "GET",
          headers: {
            "Authorization": authorization,
            "apikey": supabaseAnonKey
          }
        }
      );

    if (!adminResponse.ok) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: "Administrator verification failed."
        })
      };
    }

    const admins =
      await adminResponse.json();

    if (!Array.isArray(admins) || !admins.length) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: "You are not authorized to publish digital books."
        })
      };
    }

    /*
     * ------------------------------------------------------
     * READ REQUEST
     * ------------------------------------------------------
     */

    let payload = {};

    try {
      payload =
        JSON.parse(
          event.isBase64Encoded
            ? Buffer.from(
                event.body || "",
                "base64"
              ).toString("utf8")
            : event.body || "{}"
        );
    } catch (_) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid request data."
        })
      };
    }

    const owner =
      String(
        payload.owner ||
        "abbaumara391"
      ).trim();

    const repo =
      String(
        payload.repo ||
        "AGU-LIBRARY"
      ).trim();

    const branch =
      String(
        payload.branch ||
        "main"
      ).trim();

    let folder =
      String(
        payload.folder ||
        ""
      ).trim();

    const files =
      Array.isArray(payload.files)
        ? payload.files
        : [];

    if (!folder) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Digital book folder is required."
        })
      };
    }

    if (!files.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "No digital book files were supplied."
        })
      };
    }

    /*
     * ------------------------------------------------------
     * CLEAN FOLDER PATH
     * ------------------------------------------------------
     */

    folder =
      folder
        .replace(/\\/g, "/")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\.\./g, "");

    /*
     * ------------------------------------------------------
     * REQUIRE THE THREE AGULIBRARY BOOK FILES
     * ------------------------------------------------------
     */

    const requiredFiles = [
      "index.html",
      "app.js",
      "data.js"
    ];

    const suppliedNames =
      files.map(
        file =>
          String(
            file?.name || ""
          )
            .replace(/\\/g, "/")
            .split("/")
            .pop()
      );

    for (const required of requiredFiles) {
      if (!suppliedNames.includes(required)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error:
              "The digital book must contain " +
              required +
              "."
          })
        };
      }
    }

    /*
     * ------------------------------------------------------
     * GITHUB API
     * ------------------------------------------------------
     */

    const githubBase =
      "https://api.github.com/repos/" +
      encodeURIComponent(owner) +
      "/" +
      encodeURIComponent(repo) +
      "/contents/";

    const results = [];

    /*
     * ------------------------------------------------------
     * PUBLISH EACH BOOK FILE
     * ------------------------------------------------------
     */

    for (const file of files) {

      if (!file || !file.name) {
        continue;
      }

      const fileName =
        String(file.name)
          .replace(/\\/g, "/")
          .replace(/^\/+/, "")
          .replace(/\.\./g, "");

      const filePath =
        folder + "/" + fileName;

      const fileContent =
        String(file.content || "");

      if (!fileContent) {
        throw new Error(
          "Empty file supplied: " +
          fileName
        );
      }

      /*
       * Get existing file SHA.
       *
       * GitHub requires the SHA when an existing
       * file is being replaced.
       */

      let sha = null;

      const existingResponse =
        await fetch(
          githubBase +
            filePath +
            "?ref=" +
            encodeURIComponent(branch),
          {
            method: "GET",
            headers: {
              "Authorization":
                "Bearer " + githubToken,
              "Accept":
                "application/vnd.github+json",
              "X-GitHub-Api-Version":
                "2022-11-28"
            }
          }
        );

      if (existingResponse.ok) {

        const existing =
          await existingResponse.json();

        sha =
          existing?.sha ||
          null;

      } else if (existingResponse.status !== 404) {

        const errorText =
          await existingResponse.text();

        throw new Error(
          "GitHub could not check " +
          fileName +
          ": " +
          errorText
        );
      }

      /*
       * Remove data URL prefix if supplied.
       */

      let base64Content =
        fileContent;

      if (
        base64Content.includes(",") &&
        base64Content.startsWith("data:")
      ) {
        base64Content =
          base64Content.split(",")[1];
      }

      /*
       * Publish to GitHub.
       */

      const githubBody = {
        message:
          "AGULIBRARY: publish digital book " +
          fileName,
        content:
          base64Content,
        branch:
          branch
      };

      if (sha) {
        githubBody.sha = sha;
      }

      const uploadResponse =
        await fetch(
          githubBase + filePath,
          {
            method: "PUT",
            headers: {
              "Authorization":
                "Bearer " + githubToken,
              "Accept":
                "application/vnd.github+json",
              "Content-Type":
                "application/json",
              "X-GitHub-Api-Version":
                "2022-11-28"
            },
            body:
              JSON.stringify(
                githubBody
              )
          }
        );

      if (!uploadResponse.ok) {

        const errorText =
          await uploadResponse.text();

        throw new Error(
          "GitHub could not publish " +
          fileName +
          ": " +
          errorText
        );
      }

      const uploaded =
        await uploadResponse.json();

      results.push({
        name: fileName,
        path: filePath,
        sha:
          uploaded?.content?.sha ||
          null
      });
    }

    /*
     * ------------------------------------------------------
     * SUCCESS
     * ------------------------------------------------------
     */

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message:
          "Digital book published successfully to GitHub.",
        repository:
          owner + "/" + repo,
        branch:
          branch,
        folder:
          folder,
        files:
          results
      })
    };

  } catch (error) {

    console.error(
      "AGULIBRARY digital book publishing error:",
      error
    );

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error:
          error?.message ||
          "Digital book publishing failed."
      })
    };
  }
};
