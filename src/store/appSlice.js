import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    pendingSyncCount: 0,
    isOnline: true, // Network status
    wasOffline: false, // Track if we were offline (to show sync button)
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        login: (state, action) => {
            const { email, role, token } = action.payload;
            state.user = email;
            state.role = role;
            state.token = token;
            state.isAuthenticated = true;

            // Save to AsyncStorage
            AsyncStorage.setItem('userData', JSON.stringify({
                email, role, token, isAuthenticated: true
            })).catch(err => console.error("Failed to save user data:", err));
        },
        logout: (state) => {
            state.user = null;
            state.role = null;
            state.token = null;
            state.isAuthenticated = false;
            AsyncStorage.removeItem('userData');
            // Note: We don't clear queues here as they should persist per device
            // But we'll filter by user when displaying
        },
        setPendingSyncCount: (state, action) => {
            state.pendingSyncCount = action.payload;
        },
        // NEW: Load saved user
        loadUser: (state, action) => {
            if (action.payload) {
                state.user = action.payload.email;
                state.role = action.payload.role;
                state.token = action.payload.token;
                state.isAuthenticated = action.payload.isAuthenticated;
            }
        },
        setNetworkStatus: (state, action) => {
            const { isOnline, wasOffline } = action.payload;
            state.isOnline = isOnline;
            if (wasOffline !== undefined) {
                state.wasOffline = wasOffline;
            }
        },
        resetWasOffline: (state) => {
            state.wasOffline = false;
        }
    }
});

export const { login, logout, setPendingSyncCount, loadUser, setNetworkStatus, resetWasOffline } = appSlice.actions;
export default appSlice.reducer;