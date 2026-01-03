# Firebase Migration Guide

This guide will help you migrate your fitness app to a new Firebase project.

## Step 1: Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., `fitapp-new` or `my-fitness-app`)
4. **Note the Project ID** - you'll need this later
5. Disable Google Analytics (optional, or enable if you want it)
6. Click **"Create project"**

## Step 2: Enable Required Firebase Services

In your new Firebase project, enable these services:

### 2.1 Authentication
1. Go to **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. (Optional) Enable other sign-in methods you need

### 2.2 Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll update rules later)
3. Select a location (choose closest to your users)
4. Click **Enable**

### 2.3 Cloud Functions
1. Go to **Functions** → **Get started**
2. Upgrade to **Blaze plan** (pay-as-you-go) - required for Cloud Functions
3. Follow the setup instructions

### 2.4 Storage
1. Go to **Storage** → **Get started**
2. Start in **test mode** (we'll update rules later)
3. Choose a location
4. Click **Done**

### 2.5 Hosting (Optional)
1. Go to **Hosting** → **Get started**
2. Follow the setup instructions

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register your app with a nickname (e.g., "FitApp Web")
5. **Copy the Firebase configuration object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Update Your Local Configuration

### 4.1 Create .env file

Create a `.env` file in the `fitapp` directory with your new Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_if_you_have_analytics
```

### 4.2 Update .firebaserc

Update the `.firebaserc` file with your new project ID:

```json
{
  "projects": {
    "default": "your-new-project-id"
  },
  "targets": {
    "your-new-project-id": {
      "hosting": {
        "coaches": [
          "your-new-project-id"
        ]
      }
    }
  }
}
```

## Step 5: Deploy Firestore Rules

1. Make sure you're in the `fitapp` directory
2. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 6: Deploy Storage Rules

1. Deploy Storage rules:
   ```bash
   firebase deploy --only storage
   ```

## Step 7: Set Up Firestore Indexes

1. Deploy Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Step 8: Set Up Cloud Functions

### 8.1 Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 8.2 Login to Firebase
```bash
firebase login
```

### 8.3 Set Environment Variables for Functions

You'll need to set the OpenAI API key for AI functions:

```bash
cd functions
firebase functions:config:set openai.api_key="your-openai-api-key-here"
cd ..
```

Or if using .env in functions (recommended):
1. Create `functions/.env` file:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

### 8.4 Build Functions
```bash
cd functions
npm install
npm run build
cd ..
```

### 8.5 Deploy Functions
```bash
firebase deploy --only functions
```

## Step 9: Test Your Setup

### 9.1 Test with Emulators (Recommended First)
```bash
# Start emulators
firebase emulators:start

# In another terminal, start your app
npm run dev
```

### 9.2 Test with Real Firebase
1. Make sure your `.env` file is set up correctly
2. Start your app:
   ```bash
   npm run dev
   ```
3. Try creating an account and logging in

## Step 10: Migrate Data (If Needed)

If you have existing data in the old Firebase project:

1. Export data from old project:
   ```bash
   # Set old project
   firebase use old-project-id
   
   # Export Firestore data
   gcloud firestore export gs://your-bucket/backup
   ```

2. Import to new project:
   ```bash
   # Set new project
   firebase use new-project-id
   
   # Import Firestore data
   gcloud firestore import gs://your-bucket/backup
   ```

## Step 11: Update CORS Settings (If Needed)

If your functions need CORS, update the CORS origins in:
- `functions/src/aiPlans.ts` - Update the `corsMiddleware` origins
- `functions/src/corsMiddleware.ts` (if it exists)

## Troubleshooting

### Issue: Functions deployment fails
- Make sure you're on the Blaze plan
- Check that Node.js version matches (should be 18)
- Verify environment variables are set

### Issue: Authentication not working
- Verify `.env` file has correct values
- Check that Email/Password auth is enabled in Firebase Console
- Clear browser cache and try again

### Issue: Firestore rules not working
- Check rules syntax in `firestore.rules`
- Verify rules are deployed: `firebase deploy --only firestore:rules`
- Check Firebase Console → Firestore → Rules tab

### Issue: Storage not working
- Verify storage rules are deployed
- Check that Storage is enabled in Firebase Console
- Verify `.env` has correct `storageBucket` value

## Next Steps

1. ✅ Create new Firebase project
2. ✅ Enable all required services
3. ✅ Get Firebase config
4. ✅ Create `.env` file
5. ✅ Update `.firebaserc`
6. ✅ Deploy Firestore rules
7. ✅ Deploy Storage rules
8. ✅ Deploy Firestore indexes
9. ✅ Set up Functions environment variables
10. ✅ Deploy Functions
11. ✅ Test the application
12. ✅ (Optional) Migrate existing data

## Important Notes

- **Never commit `.env` file to git** - it contains sensitive keys
- Keep your Firebase project ID and API keys secure
- The OpenAI API key is required for AI plan generation functions
- Make sure you're on the Blaze plan for Cloud Functions to work
- Test with emulators first before deploying to production

