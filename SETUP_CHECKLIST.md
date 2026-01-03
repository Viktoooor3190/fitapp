# Firebase Setup Checklist

Use this checklist to track your progress setting up the new Firebase project.

## Pre-Setup
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Node.js 18+ installed

## Firebase Project Creation
- [ ] Created new Firebase project in [Firebase Console](https://console.firebase.google.com/)
- [ ] Noted the new Project ID: `_________________`
- [ ] Upgraded to Blaze plan (required for Functions)

## Firebase Services Setup
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Cloud Functions enabled
- [ ] Storage enabled
- [ ] Hosting enabled (optional)

## Configuration Files
- [ ] Copied Firebase config from Console
- [ ] Created `.env` file in `fitapp/` directory
- [ ] Filled in all `VITE_FIREBASE_*` variables in `.env`
- [ ] Updated `.firebaserc` with new project ID
- [ ] Updated CORS origins in `functions/src/corsMiddleware.ts` (if needed)
- [ ] Updated CORS origins in `functions/src/aiPlans.ts` (if needed)

## Environment Variables
- [ ] Set OpenAI API key (for AI functions):
  - Option 1: Create `functions/.env` with `OPENAI_API_KEY=your-key`
  - Option 2: Use `firebase functions:config:set openai.api_key="your-key"`

## Deployment
- [ ] Deployed Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deployed Storage rules: `firebase deploy --only storage`
- [ ] Deployed Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Built functions: `cd functions && npm install && npm run build && cd ..`
- [ ] Deployed Functions: `firebase deploy --only functions`

## Testing
- [ ] Tested with emulators: `firebase emulators:start`
- [ ] Tested app locally: `npm run dev`
- [ ] Created test user account
- [ ] Tested authentication (login/logout)
- [ ] Tested Firestore read/write
- [ ] Tested Functions (if applicable)

## Post-Setup
- [ ] Verified `.env` is in `.gitignore`
- [ ] Documented any custom configurations
- [ ] Updated team members with new project details (if applicable)

## Notes
Write any important notes here:
_________________________________________________
_________________________________________________
_________________________________________________

