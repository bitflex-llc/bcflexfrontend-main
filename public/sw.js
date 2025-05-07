/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
function receivePushNotification(event) {

  const options = {
    body: "First Test Push",

  };

  event.waitUntil(
    self.registration.showNotification("Push Notificatio Titlen", options)
  );
  // navigator.serviceWorker.ready.then(function (serviceWorker) {
  //     serviceWorker.showNotification("Test Push", options);
  // });
}

function openPushNotification(event) {
  console.log("[Service Worker] Notification click Received.", event.notification.data);

  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
}

self.addEventListener("push", receivePushNotification);
self.addEventListener("notificationclick", openPushNotification);

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});