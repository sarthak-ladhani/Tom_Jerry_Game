# Firebase Setup Instructions

This game uses Firebase Realtime Database for a global leaderboard. Follow these steps to set up your own Firebase project:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "Tom-Jerry-Game")
4. Disable Google Analytics (optional, not needed for this game)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In your Firebase project, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (select the one closest to your users)
4. **Important:** Select "Start in test mode" for now
   - This allows read/write access for testing
   - We'll secure it properly in Step 4

## Step 3: Get Your Firebase Configuration

1. Go to Project Settings (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname (e.g., "Tom Jerry Web")
5. Copy the `firebaseConfig` object

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the dummy configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Security Rules (Important!)

To prevent abuse while allowing game functionality:

1. Go to Realtime Database > Rules tab
2. Replace the rules with:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$entry": {
        ".validate": "newData.hasChildren(['name', 'score', 'date', 'timestamp'])"
      }
    }
  }
}
```

3. Click "Publish"

**Note:** These rules allow anyone to read/write to the leaderboard. For production, you might want to add:
- Rate limiting
- Score validation
- Authentication

## Step 6: Test Your Setup

1. Save all changes
2. Open your game in a browser
3. Play a game and check if the score appears in Firebase Console > Realtime Database
4. Open the game on another device - you should see the same leaderboard!

## Troubleshooting

### "Permission denied" error
- Check that your security rules are published
- Verify the databaseURL is correct in firebase-config.js

### Scores not showing up
- Open browser console (F12) and check for errors
- Verify Firebase SDK loaded correctly
- Check your internet connection

### Can't connect to Firebase
- Make sure firebase-config.js has the correct configuration
- Check that the Firebase project is active

## Alternative: Keep Local Leaderboard

If you prefer to keep the local (device-specific) leaderboard:
1. Revert the changes to use localStorage
2. Remove Firebase SDK from index.html
3. Delete firebase-config.js

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs/database/web/start)
- [Firebase Console](https://console.firebase.google.com/)
