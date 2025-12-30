// src/store/dataSlice.js
import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock operators list (in real app, this would come from backend)
const MOCK_OPERATORS = [
    { id: "op1", email: "operator1@limelight.com", name: "John Doe" },
    { id: "op2", email: "operator2@limelight.com", name: "Jane Smith" },
    { id: "op3", email: "operator3@limelight.com", name: "Mike Johnson" },
];

const initialState = {
    downtimes: [],
    maintenances: [],
    alerts: [],
    operators: MOCK_OPERATORS,
    maintenanceAssignments: [], // { machineId, assignedTo, assignedBy, assignedAt, status: 'assigned'|'in_progress'|'completed' }
    machinePhotos: [], // { machineId, uri, timestamp, operator }
    maintenanceRequests: [], // { machineId, requestedBy, requestedAt, requestedTo, status: 'pending'|'assigned'|'rejected' }
    currentUser: null, // Track current user for data filtering
};

const dataSlice = createSlice({
    name: "data",
    initialState,
    reducers: {
        addDowntime: (state, action) => {
            state.downtimes.unshift(action.payload);
            // Persist to user-specific storage
            if (state.currentUser) {
                const userKey = `userData_${state.currentUser}`;
                AsyncStorage.getItem(userKey).then(saved => {
                    const userData = saved ? JSON.parse(saved) : {};
                    // Only save downtimes created by this user
                    userData.downtimes = state.downtimes.filter(dt => dt.operator === state.currentUser);
                    AsyncStorage.setItem(userKey, JSON.stringify(userData)).catch(err =>
                        console.error("Failed to save user data:", err)
                    );
                }).catch(err => console.error("Failed to load user data:", err));
            }
        },
        addMaintenance: (state, action) => {
            state.maintenances.unshift(action.payload);
        },
        addAlert: (state, action) => {
            state.alerts.unshift(action.payload);
        },
        updateAlert: (state, action) => {
            const index = state.alerts.findIndex(a => a.id === action.payload.id);
            if (index !== -1) state.alerts[index] = action.payload;
        },
        assignMaintenance: (state, action) => {
            const { machineId, assignedTo, assignedBy, alertId, notes } = action.payload;
            // Remove any existing assignment for this machine
            state.maintenanceAssignments = state.maintenanceAssignments.filter(
                a => a.machineId !== machineId
            );
            // Add new assignment
            const assignment = {
                machineId,
                assignedTo,
                assignedBy,
                assignedAt: new Date().toISOString(),
                alertId,
                status: 'assigned',
                notes: notes || '',
            };
            state.maintenanceAssignments.push(assignment);

            // Persist to AsyncStorage (shared across all users for supervisors)
            AsyncStorage.setItem('maintenanceAssignments', JSON.stringify(state.maintenanceAssignments));
        },
        updateMaintenanceStatus: (state, action) => {
            const { machineId, status } = action.payload;
            const assignment = state.maintenanceAssignments.find(
                a => a.machineId === machineId
            );
            if (assignment) {
                assignment.status = status;
            }
        },
        completeMaintenance: (state, action) => {
            const { machineId } = action.payload;
            state.maintenanceAssignments = state.maintenanceAssignments.filter(
                a => a.machineId !== machineId
            );
        },
        addMachinePhoto: (state, action) => {
            const { machineId, uri, operator } = action.payload;
            const photo = {
                machineId,
                uri,
                timestamp: new Date().toISOString(),
                operator,
            };
            state.machinePhotos.push(photo);

            // Persist to user-specific storage
            if (state.currentUser) {
                const userKey = `userData_${state.currentUser}`;
                AsyncStorage.getItem(userKey).then(saved => {
                    const userData = saved ? JSON.parse(saved) : {};
                    userData.machinePhotos = state.machinePhotos.filter(p => p.operator === state.currentUser);
                    AsyncStorage.setItem(userKey, JSON.stringify(userData)).catch(err =>
                        console.error("Failed to save user data:", err)
                    );
                }).catch(err => console.error("Failed to load user data:", err));
            }
        },
        requestMaintenance: (state, action) => {
            const { machineId, requestedBy, requestedTo } = action.payload;
            // Remove any existing request for this machine by this operator
            state.maintenanceRequests = state.maintenanceRequests.filter(
                r => !(r.machineId === machineId && r.requestedBy === requestedBy)
            );
            // Add new request
            const newRequest = {
                machineId,
                requestedBy,
                requestedTo, // Supervisor email (can be null for "any supervisor")
                requestedAt: new Date().toISOString(),
                status: 'pending',
            };
            state.maintenanceRequests.push(newRequest);

            // Persist to AsyncStorage (shared - all supervisors can see)
            AsyncStorage.setItem('maintenanceRequests', JSON.stringify(state.maintenanceRequests));
        },
        updateMaintenanceRequest: (state, action) => {
            const { machineId, requestedBy, status, assignedTo } = action.payload;
            const request = state.maintenanceRequests.find(
                r => r.machineId === machineId && r.requestedBy === requestedBy
            );
            if (request) {
                request.status = status;
                if (assignedTo) {
                    request.assignedTo = assignedTo;
                }
                // Persist to AsyncStorage
                AsyncStorage.setItem('maintenanceRequests', JSON.stringify(state.maintenanceRequests));
            }
        },
        loadMaintenanceRequests: (state, action) => {
            if (action.payload) {
                state.maintenanceRequests = action.payload;
            }
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearUserData: (state) => {
            // Clear user-specific data (but keep operators list)
            state.downtimes = [];
            state.maintenances = [];
            state.alerts = [];
            state.maintenanceAssignments = [];
            state.machinePhotos = [];
            state.maintenanceRequests = [];
            state.currentUser = null;
        },
        loadUserData: (state, action) => {
            const { downtimes, maintenances, alerts, maintenanceAssignments, machinePhotos, maintenanceRequests } = action.payload;
            if (downtimes !== undefined) state.downtimes = downtimes;
            if (maintenances !== undefined) state.maintenances = maintenances;
            if (alerts !== undefined) state.alerts = alerts;
            if (maintenanceAssignments !== undefined) state.maintenanceAssignments = maintenanceAssignments;
            if (machinePhotos !== undefined) state.machinePhotos = machinePhotos;
            if (maintenanceRequests !== undefined) state.maintenanceRequests = maintenanceRequests;
        }
    }
});

export const {
    addDowntime,
    addMaintenance,
    addAlert,
    updateAlert,
    assignMaintenance,
    updateMaintenanceStatus,
    completeMaintenance,
    addMachinePhoto,
    requestMaintenance,
    updateMaintenanceRequest,
    loadMaintenanceRequests,
    setCurrentUser,
    clearUserData,
    loadUserData
} = dataSlice.actions;

export default dataSlice.reducer;
