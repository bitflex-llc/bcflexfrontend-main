importScripts("https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js");
firebase.initializeApp({
  // Project Settings => Add Firebase to your web app
  apiKey: "AIzaSyDjP_ob_TJuoY7aB0qJhT4H-ct1lGG0ls0",
  authDomain: "bitflex-front.firebaseapp.com",
  databaseURL: "https://bitflex-front.firebaseio.com",
  projectId: "bitflex-front",
  storageBucket: "bitflex-front.appspot.com",
  messagingSenderId: "24070800136",
  appId: "1:24070800136:web:6d593238b57b029b7da2bd",
  measurementId: "G-WNNEQ4LCDM"
});
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => {
      console.log(payload.data)
      return registration.showNotification(payload.data.title, { body: payload.data.body, icon: 'https://bit-flex.com/assets/icon/android-icon-192x192.png' });
    });
  return promiseChain;
});
self.addEventListener('notificationclick', function (event) {
  // do what you want
  // ..
});