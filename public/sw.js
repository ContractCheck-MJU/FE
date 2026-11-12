self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "계약 일정", body: "" };
  event.waitUntil(self.registration.showNotification(data.title || "계약 일정", { body: data.body || "" }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/notifications"));
});
