/* =========================================================
   AGULIBRARY — ANDROID / WEB PUSH SERVICE WORKER
   ========================================================= */

"use strict";

self.addEventListener("push", event => {

  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {

    try {
      data = {
        message: event.data
          ? event.data.text()
          : ""
      };
    } catch (_) {}
  }

  const title =
    data.title ||
    "AGULIBRARY";

  const message =
    data.message ||
    data.body ||
    "You have a new notification from AGULIBRARY.";

  const notificationId =
    data.notificationId ||
    null;

  const url =
    data.url ||
    "/index.html";

  const options = {

    body: message,

    icon: "/favicon.ico",

    badge: "/favicon.ico",

    data: {
      url: url,
      notificationId: notificationId
    },

    tag:
      data.tag ||
      "agulibrary-notification",

    renotify: true,

    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );

});


self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const notificationData =
      event.notification.data || {};

    const targetUrl =
      notificationData.url ||
      "/index.html";

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then(clientList => {

        for (const client of clientList) {

          if (
            "focus" in client &&
            client.url.includes(location.origin)
          ) {

            if ("navigate" in client) {
              client.navigate(targetUrl);
            }

            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(
            targetUrl
          );
        }

      })

    );

  }
);
