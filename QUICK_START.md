# Quick Start: New Firebase Setup

## Fastest Path to Get Running

### 1. Create Firebase Project (5 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it and note the **Project ID**
4. Enable: Authentication, Firestore, Functions, Storage

### 2. Get Config (2 minutes)
1. Project Settings → Your apps → Web icon
2. Copy the config values

### 3. Update Files (3 minutes)

**Create `.env` file:**
```bash
cd fitapp
# Create .env file with your Firebase config
```

**Update `.firebaserc`:**
```json
{
  "projects": {
    "default": "YOUR-NEW-PROJECT-ID"
  }
}
```

### 4. Deploy (5 minutes)
```bash
# Deploy rules
firebase deploy --only firestore:rules,storage

# Deploy functions
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 5. Test (2 minutes)
```bash
npm run dev
```

## Total Time: ~17 minutes

For detailed instructions, see `FIREBASE_MIGRATION_GUIDE.md`

