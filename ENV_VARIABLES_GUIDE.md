# Environment Variables Guide

This document explains all environment variables used in the FitApp project and how to obtain them.

## Required Variables

### Firebase Configuration (Required)
All Firebase variables are already configured for project `fitapp-2863e`.

**Where to get them:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/fitapp-2863e/settings/general)
2. Scroll to "Your apps" section
3. Click on your Web app (or create one)
4. Copy the configuration values

**Variables:**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket URL
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Google Analytics ID (optional)

**Important:** The `VITE_` prefix is **required** for all frontend environment variables. Vite only exposes variables with this prefix to client-side code via `import.meta.env`. If you have Firebase config values without the `VITE_` prefix, you need to add it when creating your `.env` file.

### OpenAI API Key (Required for AI Functions)
**Location:** `functions/.env`

**Where to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (you'll only see it once!)
5. Add it to `functions/.env` as `OPENAI_API_KEY=your-key-here`

**Note:** This is required for AI workout and nutrition plan generation features.

## Optional Variables

### Supabase Configuration (Optional)
Only needed if you're using Supabase features.

**Where to get them:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a project or select existing one
3. Go to Settings → API
4. Copy the values

**Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_PROJECT_ID` - Used for generating TypeScript types

### Build Configuration (Optional)
- `VITE_BASE_PATH` - Base path for production deployment (default: "/")
  - Only needed if deploying to a subdirectory
  - Example: `/fitapp` if deploying to `yoursite.com/fitapp`

- `TEMPO` - Enable Tempo devtools (set to "true" to enable)
  - Optional development tool
  - Leave empty to disable

### AWS Configuration (Optional)
Only needed if using AWS services (mentioned in docs but not actively used).

**Where to get them:**
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create an IAM user with appropriate permissions
3. Create access keys for the user

**Variables:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., "us-east-1")

## File Locations

### Main Application
- **File:** `.env` (in `fitapp/` directory)
- **Contains:** All VITE_* variables for the frontend

### Firebase Functions
- **File:** `functions/.env`
- **Contains:** `OPENAI_API_KEY` for Cloud Functions

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git (they're in `.gitignore`)
- Never share your API keys publicly
- Rotate keys if they're accidentally exposed
- Use different keys for development and production

## Quick Setup Checklist

- [x] Firebase variables (already configured)
- [ ] OpenAI API key (add to `functions/.env`)
- [ ] Supabase variables (if using Supabase)
- [ ] AWS variables (if using AWS)

## Testing Your Configuration

After setting up your environment variables:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Check Firebase connection:**
   - Try logging in/out
   - Check browser console for Firebase config logs

3. **Test AI functions:**
   - Make sure `functions/.env` has `OPENAI_API_KEY`
   - Deploy functions: `firebase deploy --only functions`
   - Test AI plan generation

