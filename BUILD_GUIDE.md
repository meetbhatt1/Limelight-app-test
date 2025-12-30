# Build Guide - Step by Step

## Prerequisites

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

2. **Expo Account** (free)
   - Sign up at: https://expo.dev/signup

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

## Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

## Step 3: Configure Project (First Time Only)

```bash
eas build:configure
```

This will:
- Create/update `eas.json` (already created)
- Link your project to Expo

## Step 4: Build APK

### Option A: Preview Build (Recommended for Testing)

```bash
npm run build:android
# or
eas build -p android --profile preview
```

### Option B: Production Build

```bash
npm run build:android:prod
# or
eas build -p android --profile production
```

## Step 5: Monitor Build

- Build will be queued on Expo servers
- You'll see a build URL in terminal
- Visit: https://expo.dev/accounts/[your-username]/builds
- Build typically takes 10-20 minutes

## Step 6: Download APK

- Once build completes, download link will be available
- Click "Download" button on build page
- Install APK on Android device (enable "Install from Unknown Sources")

## Alternative: Local Build (Advanced)

If you prefer building locally:

```bash
# Install dependencies
npm install

# Generate native code
npx expo prebuild

# Open in Android Studio
# File → Open → Select 'android' folder
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## Troubleshooting

### "EAS CLI not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "Project not configured"
```bash
eas build:configure
```

### Build fails
- Check `eas.json` configuration
- Ensure `app.json` has correct package name
- Verify all dependencies are installed

## Quick Commands Reference

```bash
# Development
npm start                    # Start dev server
npm run android             # Run on Android emulator/device

# Building
npm run build:android       # Preview APK build
npm run build:android:prod  # Production APK build

# EAS Commands
eas login                   # Login to Expo
eas build:configure         # Configure project
eas build:list              # List all builds
eas build:view              # View latest build
```

## Build Status

After running build command, you'll see:
```
✔ Build started
📦 Build ID: xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
🔗 View build: https://expo.dev/accounts/[username]/builds/[build-id]
```

Click the link to monitor progress!

