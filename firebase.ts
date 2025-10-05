// Import Firebase compatibility libraries
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// --- IMPORTANT ---
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Go to Project Settings -> General tab
// 3. Under "Your apps", click the web icon (</>) to register a new web app.
// 4. Copy the firebaseConfig object here.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your domain
  projectId: "YOUR_PROJECT_ID", // Replace with your project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your bucket
  messagingSenderId: "YOUR_SENDER_ID", // Replace with your sender ID
  appId: "YOUR_APP_ID" // Replace with your app ID
};

// Initialize Firebase
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase initialization error. Please check your firebaseConfig settings in firebase.ts", e);
  }
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export default firebase;
