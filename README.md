# LimelightIT - Offline-First Field App

A cross-platform mobile application for field operators and supervisors to capture downtime events, manage maintenance tasks, and handle alerts in manufacturing environments. Built with React Native and Expo, featuring offline-first architecture with automatic synchronization.

## 🚀 How to Run

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
   - Or check: https://expo.dev/accounts/[your-account]/builds

#### Option 2: Expo Classic Build (Deprecated but works)

```bash
# Install Expo CLI
npm install -g expo-cli

# Build APK
expo build:android -t apk
```

#### Option 3: Local Build (Advanced)

```bash
# Generate native code
npx expo prebuild

# Build with Android Studio or Xcode
# Follow React Native build instructions
```

## 📱 Offline & Sync Design

- **Queue-Based Architecture**: All downtime and maintenance data is queued locally in AsyncStorage when offline, with separate queues for each data type (`downtimeQueue`, `maintenanceQueue`).

- **User-Specific Filtering**: Queues are device-level but filtered by user email when displaying badges and syncing. Each user only sees and syncs their own pending items.

- **Automatic Synchronization**: When online, items auto-sync immediately upon creation. When back online after being offline, a "Tap to sync" button appears for manual sync initiation.

- **Network Status Awareness**: Real-time network monitoring with visual indicators (red badge with `!` when offline, yellow when online with pending items). Badge persists across app restarts.

- **Exponential Backoff**: Sync retries use exponential backoff (1s, 2s, 4s, 8s, max 10s) with automatic retry on network reconnection. Failed syncs remain in queue until successful.

## 🏗️ State Management

**Choice: Redux Toolkit**

**Why Redux Toolkit?**
- **Predictable State**: Centralized state management makes data flow clear and debuggable
- **Offline Queue Management**: Async thunks (`createAsyncThunk`) handle complex async operations like queue persistence and sync with retry logic
- **Minimal Boilerplate**: Redux Toolkit's `createSlice` reduces boilerplate compared to vanilla Redux
- **DevTools Integration**: Redux DevTools provide excellent debugging capabilities
- **Scalability**: Well-structured slices (app, queue, data) allow easy extension as features grow

**Architecture:**
- `appSlice`: Authentication, user data, network status
- `queueSlice`: Offline queues, sync operations, retry logic
- `dataSlice`: Core business data (downtimes, maintenances, alerts, assignments)

## 🚢 What We'd Ship Next

- **Real Backend Integration**: Replace mock data with actual API endpoints, implement proper authentication (JWT validation), and add real-time alert streaming via WebSockets or SSE.

- **Enhanced Conflict Resolution**: Implement proper idempotency keys, version vectors, or last-write-wins with timestamp comparison for handling concurrent edits when multiple users modify the same data.

- **Photo Compression & Optimization**: Add image compression before upload, implement progressive image loading, and add photo gallery view with search/filter capabilities for better performance on low-end devices.

## 📋 Features

- ✅ Offline-first architecture with persistent queues
- ✅ Role-based UI (Operator/Supervisor)
- ✅ Downtime capture with photo watermarking
- ✅ Maintenance task management
- ✅ Alert acknowledgment workflow
- ✅ Automatic sync with network status indicators
- ✅ Light/Dark theme support (per-user preference)
- ✅ User-specific data isolation
- ✅ Photo capture with machine_id and timestamp watermark

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Network**: @react-native-community/netinfo
- **UI Components**: Custom components + Lucide React Native icons
- **Notifications**: react-native-toast-message

## 📝 Environment Setup

- Node.js 16+ 
- npm or yarn
- Expo CLI (for development)
- EAS CLI (for production builds)
- Android Studio / Xcode (for local builds)

## 🔐 Security

- Mock JWT authentication (replace with real auth in production)
- `tenant_id: "demo_tenant"` included in all data payloads
- User-specific data isolation
- No sensitive data in logs

## 📄 License

Built for LimelightIT - Internal Use Only

