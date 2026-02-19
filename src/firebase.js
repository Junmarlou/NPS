// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
    apiKey: "AIzaSyBww3vpbCLRmDl8Ng9nNsNNxMfBMXgZ8xg",
    authDomain: "nps-survey-c0ac3.firebaseapp.com",
    projectId: "nps-survey-c0ac3",
    storageBucket: "nps-survey-c0ac3.firebasestorage.app",
    messagingSenderId: "958308127056",
    appId: "1:958308127056:web:f8635633198dad414cdc55"
};

// Check if Firebase is properly configured
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                     firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app = null;
let db = null;

let auth = null;

if (isConfigured) {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        // Initialize Firebase Auth
        auth = getAuth(app);

        // Enable offline persistence
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('The current browser does not support all of the features required to enable persistence');
            }
        });
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
} else {
    console.error("❌ Firebase is not configured! Please update src/firebase.js with your Firebase credentials.");
}

export { db, auth, isConfigured };
