# Update CORS Settings for New Firebase Project

After creating your new Firebase project, you'll need to update CORS origins in your functions to include your new Firebase hosting URLs.

## Files to Update

### 1. `functions/src/corsMiddleware.ts`

Update the `origin` array to include your new Firebase hosting URLs:

```typescript
export const corsMiddleware = cors({ 
  origin: [
    'http://localhost:3000',  // Keep for local development
    'https://your-new-project-id.web.app',  // Add your new project
    'https://your-new-project-id.firebaseapp.com'  // Add your new project
  ],
  // ... rest of config
});
```

### 2. `functions/src/aiPlans.ts`

Find the `corsMiddleware` initialization (around line 14) and update similarly:

```typescript
const corsMiddleware = cors({ 
  origin: [
    'http://localhost:3000',  // Keep for local development
    'https://your-new-project-id.web.app',  // Add your new project
    'https://your-new-project-id.firebaseapp.com'  // Add your new project
  ],
  // ... rest of config
});
```

## How to Find Your Firebase Hosting URLs

1. Go to Firebase Console → Your Project
2. Navigate to **Hosting**
3. Your URLs will be:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`

## After Updating

1. Rebuild functions: `cd functions && npm run build && cd ..`
2. Redeploy functions: `firebase deploy --only functions`

## Note

If you're using custom domains, add those to the CORS origins as well.

