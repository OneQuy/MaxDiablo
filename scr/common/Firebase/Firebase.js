// https://firebase.google.com/docs/
// install: npm install firebase

import { initializeApp } from 'firebase/app';

// Get these info when creating WEB app on firebase console:
// - Go to Console
// - Go to Project Settings
// - Add app > Web
const firebaseConfig = {
    apiKey: "AIzaSyBkiGyYzL0bNrFwffSo3dvo3LgIJwgzjXk",
    authDomain: "diablosenpai-a31ff.firebaseapp.com",
    databaseURL: "https://diablosenpai-a31ff-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "diablosenpai-a31ff",
    storageBucket: "diablosenpai-a31ff.appspot.com",
    messagingSenderId: "658070458246",
    appId: "1:658070458246:web:31722292577e985a2e2607"
};

var FirebaseApp = null;

export function GetFirebaseApp() {
    FirebaseInit();
    return FirebaseApp;
}

export function FirebaseInit() {
    if (FirebaseApp)
        return;

    FirebaseApp = initializeApp(firebaseConfig);
}