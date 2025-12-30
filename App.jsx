import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./src/store/indexStore";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadUser, setNetworkStatus, resetWasOffline } from "./src/store/appSlice";
import { loadQueuesFromStorage, syncQueues } from "./src/store/queueSlice";
import { checkConnection } from "./src/config/networkService";
import { loadMaintenanceRequests as loadMaintenanceRequestsAction, setCurrentUser, loadUserData } from "./src/store/dataSlice";
import { subscribeToNetwork, cleanup } from "./src/config/networkService";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

// Hide splash screen immediately
try {
  const SplashScreen = require('expo-splash-screen');
  SplashScreen.preventAutoHideAsync();
  setTimeout(() => {
    SplashScreen.hideAsync().catch(() => { });
  }, 100);
} catch (e) {
  // expo-splash-screen not installed, that's okay
}

const AppWrapper = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        const saved = await AsyncStorage.getItem("userData");
        if (saved) {
          const userData = JSON.parse(saved);
          dispatch(loadUser(userData));

          // Load user-specific data
          if (userData.email) {
            dispatch(setCurrentUser(userData.email));
            const userKey = `userData_${userData.email}`;
            const userDataSaved = await AsyncStorage.getItem(userKey);
            if (userDataSaved) {
              const userSpecificData = JSON.parse(userDataSaved);
              dispatch(loadUserData({
                downtimes: userSpecificData.downtimes || [],
                maintenances: userSpecificData.maintenances || [],
                alerts: userSpecificData.alerts || [],
                maintenanceAssignments: userSpecificData.maintenanceAssignments || [],
                machinePhotos: userSpecificData.machinePhotos || [],
                maintenanceRequests: userSpecificData.maintenanceRequests || [],
              }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    const loadQueues = async () => {
      dispatch(loadQueuesFromStorage());
    };

    const loadMaintenanceRequests = async () => {
      try {
        const saved = await AsyncStorage.getItem("maintenanceRequests");
        if (saved) {
          const requests = JSON.parse(saved);
          dispatch(loadMaintenanceRequestsAction(requests));
        }
      } catch (error) {
        console.error("Failed to load maintenance requests:", error);
      }
    };

    const loadMaintenanceAssignments = async () => {
      try {
        const saved = await AsyncStorage.getItem("maintenanceAssignments");
        if (saved) {
          const assignments = JSON.parse(saved);
          // Load shared assignments (all supervisors can see)
          dispatch(loadUserData({
            maintenanceAssignments: assignments,
          }));
        }
      } catch (error) {
        console.error("Failed to load maintenance assignments:", error);
      }
    };

    // Check initial network status
    const checkInitialNetwork = async () => {
      const isConnected = await checkConnection();
      dispatch(setNetworkStatus({ isOnline: isConnected, wasOffline: false }));
    };
    checkInitialNetwork();

    loadSavedUser();
    loadQueues();
    loadMaintenanceRequests();
    loadMaintenanceAssignments();

    let previousConnection = null;
    const unsubscribe = subscribeToNetwork(async (isConnected) => {
      console.log('🌐 Network status:', isConnected ? 'Online' : 'Offline');

      // Update network status in Redux
      if (isConnected && previousConnection === false) {
        // Just came back online - set wasOffline flag to show sync button
        dispatch(setNetworkStatus({ isOnline: true, wasOffline: true }));
        console.log('📶 Back online! Sync button will appear.');
      } else if (!isConnected) {
        // Went offline
        dispatch(setNetworkStatus({ isOnline: false, wasOffline: true }));
      } else {
        // Online (normal state)
        dispatch(setNetworkStatus({ isOnline: true, wasOffline: false }));
      }

      previousConnection = isConnected;
    });

    // Hide splash screen after initial load
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.log("Splash screen already hidden");
      }
    };
    hideSplash();

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [dispatch]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <AppWrapper />
      </ThemeProvider>
    </Provider>
  );
}