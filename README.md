# LimelightIT - Offline-First Field App

A cross-platform mobile application for field operators and supervisors to capture downtime events, manage maintenance tasks, and handle alerts in manufacturing environments. Built with React Native and Expo, featuring offline-first architecture with automatic synchronization.

## How to Run

### Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm start
   # or
   expo start
   ```

3. **Run on Device/Emulator**

   ```bash
   # Android
   npm run android
   # or
   expo start --android

   # iOS (macOS only)
   npm run ios
   # or
   expo start --ios

   # Web (for testing)
   npm run web
   # or
   expo start --web
   ```

4. **Scan QR Code**
   - Install Expo Go app on your device
   - Scan the QR code from terminal
   - App will load on your device

### Production Build

#### Option 1: EAS Build (Recommended)

1. **Install EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**

   ```bash
   eas login
   ```

3. **Configure Project** (if first time)

   ```bash
   eas build:configure
   ```

4. **Build APK**

   ```bash
   # Preview/Internal build
   eas build -p android --profile preview

   # Production build
   eas build -p android --profile production
   ```

5. **Download APK**
   - Build will be processed on Expo servers
   - Download link will be provided in terminal

#### Option 2: Expo Classic Build (Deprecated but works)

```bash
npm install -g expo-cli

expo build:android -t apk
```

#### Option 3: Local Build (Advanced)

```bash
npx expo prebuild

```

## Offline & Sync Design

- **Queue-Based Architecture**: All downtime and maintenance data is queued locally in AsyncStorage when offline, with separate queues for each data type (`downtimeQueue`, `maintenanceQueue`).

- **User-Specific Filtering**: Queues are device-level but filtered by user email when displaying badges and syncing. Each user only sees and syncs their own pending items.

- **Automatic Synchronization**: When online, items auto-sync immediately upon creation. When back online after being offline, a "Tap to sync" button appears for manual sync initiation.

- **Network Status Awareness**: Real-time network monitoring with visual indicators (red badge with `!` when offline, yellow when online with pending items). Badge persists across app restarts.

- **Exponential Backoff**: Sync retries use exponential backoff (1s, 2s, 4s, 8s, max 10s) with automatic retry on network reconnection. Failed syncs remain in queue until successful.

## State Management

**Choice: Redux Toolkit**

**Why Redux Toolkit?**

- **Predictable State**: Centralized state management makes data flow clear and debuggable
- **Offline Queue Management**: Async thunks (`createAsyncThunk`) handle complex async operations like queue persistence and sync with retry logic
- **Minimal Boilerplate**: Redux Toolkit's `createSlice` reduces boilerplate compared to vanilla Redux
- **Knowledge**: Pretty good grasp of this state management over Zustand.

**Architecture:**

- `appSlice`: Authentication, user data, network status
- `queueSlice`: Offline queues, sync operations, retry logic
- `dataSlice`: Core business data (downtimes, maintenances, alerts, assignments)

## What I would Ship Next

- **Real Backend Integration**: Replace mock data with actual API endpoints, implement proper authentication (JWT validation), and add real-time alert streaming via WebSockets or SSE.

- **Photo Compression & Optimization**: Add image compression before upload, implement progressive image loading, and add photo gallery view with search/filter capabilities for better performance on low-end devices.

## Features

- Offline-first architecture with persistent queues
- Role-based UI (Operator/Supervisor)
- Downtime capture with photo watermarking
- Maintenance task management
- Alert acknowledgment workflow
- Automatic sync with network status indicators
- Light/Dark theme support (per-user preference)
- User-specific data isolation
- Photo capture with machine_id and timestamp watermark

## Tech Stack

- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Network**: @react-native-community/netinfo
- **UI Components**: Custom components along with Lucide React Native icons
- **Notifications**: react-native-toast-message

## Environment Setup

- Node.js 16+
- npm or yarn
- Expo CLI (for development)
- EAS CLI (for production builds)
- Android Studio / Xcode (for local builds)

## Security

- Mock JWT authentication (replace with real auth in production)
- tenant_id included in all data payloads
- User-specific data isolation
- No sensitive data in logs
