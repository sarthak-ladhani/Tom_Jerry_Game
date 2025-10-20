// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get these from: Firebase Console > Project Settings > Your apps > Firebase SDK snippet

const firebaseConfig = {
  apiKey: "AIzaSyCvIXChDeaXNVlCJhGW1NUxgtRUJvwNNQU",
  authDomain: "tom-jerry-game.firebaseapp.com",
  databaseURL: "https://tom-jerry-game-default-rtdb.firebaseio.com",
  projectId: "tom-jerry-game",
  storageBucket: "tom-jerry-game.firebasestorage.app",
  messagingSenderId: "904909475059",
  appId: "1:904909475059:web:899e9bf9ddaa8e00f97b86"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();
const leaderboardRef = database.ref('leaderboard');
