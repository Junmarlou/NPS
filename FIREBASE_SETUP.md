# Firebase Setup Guide

This guide will walk you through setting up Firebase for your NPS Survey application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or select an existing project
3. Enter your project name (e.g., "NPS Survey App")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon (</>)** to add a web app
2. Enter an app nickname (e.g., "NPS Web App")
3. (Optional) Check "Also set up Firebase Hosting" if you plan to deploy
4. Click **"Register app"**

## Step 3: Get Your Firebase Configuration

After registering, you'll see your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy this configuration!**

## Step 4: Update Your Project

1. Open `src/firebase.js` in your code editor
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",              // Replace this
    authDomain: "your-project-id.firebaseapp.com",  // And this
    projectId: "your-project-id",                   // And this
    storageBucket: "your-project-id.appspot.com",   // And this
    messagingSenderId: "YOUR_SENDER_ID",            // And this
    appId: "YOUR_APP_ID"                            // And this
};
```

3. Save the file

## Step 5: Set Up Firestore Database

1. In the Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose a location closest to your users
4. Select **"Start in test mode"** for development (we'll update rules later)
5. Click **"Enable"**

### Important: Update Security Rules for Production

Before deploying to production, update your Firestore security rules:

1. In Firebase Console, go to **Firestore Database > Rules**
2. Replace the test rules with production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /nps_responses/{document=**} {
      // Allow anyone to read (for dashboard)
      allow read: if true;
      
      // Allow anyone to create new responses
      allow create: if true;
      
      // Optionally, if you want to add authentication later:
      // allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Test Your Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Navigate to the Survey page
4. Submit a test survey
5. Check the Dashboard to see if data appears
6. Verify in Firebase Console > Firestore Database that the `nps_responses` collection was created

## Common Issues

### Issue: "Firebase is not configured" error

**Solution:** Make sure you replaced ALL placeholder values in `src/firebase.js` with your actual Firebase configuration.

### Issue: Permission denied when saving data

**Solution:** 
1. Go to Firebase Console > Firestore Database > Rules
2. Make sure your rules allow writes (see Step 5)
3. For development, you can use test mode rules

### Issue: Data not appearing after submission

**Solution:**
1. Open browser console (F12) to check for errors
2. Verify your Firestore database is enabled
3. Check that the collection name is `nps_responses`
4. Ensure your internet connection is stable

### Issue: Can't find Firebase configuration

**Solution:**
1. Go to Firebase Console
2. Click the gear icon ⚙️ next to "Project Overview"
3. Select "Project settings"
4. Scroll down to "Your apps" section
5. Your configuration will be displayed there

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. Update `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
       apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
       authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
       projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
       storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
       messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
       appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

3. Add `.env` to your `.gitignore` file

## Next Steps

Once Firebase is configured:
- Start collecting survey responses
- Monitor your data in the Firebase Console
- Set up Firebase Authentication (optional)
- Deploy your app using Firebase Hosting or another platform
- Set up proper security rules for production

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com)
