// import "firebase/messaging";

// import * as firebase from "firebase/app";

// import {
//     isChrome,
//     isSafari
// } from "react-device-detect";

// let messaging;
// const firebaseConfig = {
//     apiKey: "AIzaSyDjP_ob_TJuoY7aB0qJhT4H-ct1lGG0ls0",
//     authDomain: "bitflex-front.firebaseapp.com",
//     databaseURL: "https://bitflex-front.firebaseio.com",
//     projectId: "bitflex-front",
//     storageBucket: "bitflex-front.appspot.com",
//     messagingSenderId: "24070800136",
//     appId: "1:24070800136:web:6d593238b57b029b7da2bd",
//     measurementId: "G-WNNEQ4LCDM"
// };

// if (isChrome ) {
//     const initializedFirebaseApp = firebase.default.initializeApp(firebaseConfig);
//     messaging = initializedFirebaseApp.messaging();

//     messaging.usePublicVapidKey("BKw13mHl4eK3xfZb_Q5P7zwjOMz1Mpj6RzNZH5Vb46Yq5haOwvtYqCtsiJJremCWiENRVgq3KS-uMJNw9xXJvvs");

//     if ('serviceWorker' in navigator) {
//         window.addEventListener('load', async () => {
//             const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
//                 updateViaCache: 'none'
//             });
//             messaging.useServiceWorker(registration);
//         });
//     }
    
// }



// export { messaging };