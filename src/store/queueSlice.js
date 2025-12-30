import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    downtimeQueue: [],
    maintenanceQueue: [],
    isSyncing: false,
    lastSync: null,
    syncAttempts: 0, // NEW
    syncError: null,  // NEW
};

export const loadQueuesFromStorage = createAsyncThunk(
    'queue/load',
    async () => {
        const downtime = await AsyncStorage.getItem('downtimeQueue');
        const maintenance = await AsyncStorage.getItem('maintenanceQueue');
        return {
            downtimeQueue: downtime ? JSON.parse(downtime) : [],
            maintenanceQueue: maintenance ? JSON.parse(maintenance) : []
        };
    }
);

export const addToQueue = createAsyncThunk(
    'queue/add',
    async ({ type, data }, { dispatch, getState }) => {
        const queueKey = type === 'downtime' ? 'downtimeQueue' : 'maintenanceQueue';

        const current = await AsyncStorage.getItem(queueKey);
        const queue = current ? JSON.parse(current) : [];

        const newItem = {
            ...data,
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            synced: false,
            tenant_id: "demo_tenant",
        };

        queue.push(newItem);
        await AsyncStorage.setItem(queueKey, JSON.stringify(queue));

        dispatch(queueSlice.actions.addToQueueLocal({ type, item: newItem }));

        // Auto-sync if online (but don't show button)
        const state = getState();
        const isOnline = state.app?.isOnline;
        if (isOnline && !state.app?.wasOffline) {
            // Only auto-sync if we're online and haven't been offline
            dispatch(syncQueues());
        }

        return { type, item: newItem };
    }
);

// NEW: Sync with retry logic and exponential backoff
export const syncQueues = createAsyncThunk(
    'queue/sync',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const state = getState();
        const { downtimeQueue, maintenanceQueue, syncAttempts } = state.queue;
        const currentUser = state.app?.user;

        // Filter queues by current user (only sync items created by this user)
        const userDowntimeQueue = downtimeQueue.filter(
            item => item.operator === currentUser
        );
        const userMaintenanceQueue = maintenanceQueue.filter(
            item => item.completedBy === currentUser || item.operator === currentUser
        );

        const totalItems = userDowntimeQueue.length + userMaintenanceQueue.length;

        if (totalItems === 0) {
            return { success: true, syncedItems: 0 };
        }

        dispatch(queueSlice.actions.setSyncing(true));

        try {
            // Simulate network delay with potential failure
            const delay = Math.min(1000 * Math.pow(2, syncAttempts), 10000); // Exponential backoff: 1s, 2s, 4s, 8s, max 10s

            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate 20% failure rate on first attempt
                    if (syncAttempts === 0 && Math.random() < 0.2) {
                        reject(new Error('Network timeout'));
                    } else {
                        resolve();
                    }
                }, delay);
            });

            // Mock API calls for each item
            console.log(`✅ Syncing ${totalItems} items for user ${currentUser}...`);

            // Remove synced items from queues
            const remainingDowntime = downtimeQueue.filter(
                item => item.operator !== currentUser
            );
            const remainingMaintenance = maintenanceQueue.filter(
                item => item.completedBy !== currentUser && item.operator !== currentUser
            );

            // Update queues in AsyncStorage
            await AsyncStorage.setItem('downtimeQueue', JSON.stringify(remainingDowntime));
            await AsyncStorage.setItem('maintenanceQueue', JSON.stringify(remainingMaintenance));

            // Update Redux state - set queues to remaining items
            dispatch(queueSlice.actions.setQueues({
                downtimeQueue: remainingDowntime,
                maintenanceQueue: remainingMaintenance,
            }));
            dispatch(queueSlice.actions.resetSyncAttempts());

            return {
                success: true,
                syncedItems: totalItems,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            dispatch(queueSlice.actions.incrementSyncAttempts());
            return rejectWithValue(error.message);
        } finally {
            dispatch(queueSlice.actions.setSyncing(false));
        }
    }
);

const queueSlice = createSlice({
    name: 'queue',
    initialState,
    reducers: {
        setSyncing: (state, action) => {
            state.isSyncing = action.payload;
        },
        addToQueueLocal: (state, action) => {
            const { type, item } = action.payload;
            if (type === 'downtime') {
                state.downtimeQueue.push(item);
            } else {
                state.maintenanceQueue.push(item);
            }
        },
        setQueues: (state, action) => {
            const { downtimeQueue, maintenanceQueue } = action.payload;
            if (downtimeQueue !== undefined) state.downtimeQueue = downtimeQueue;
            if (maintenanceQueue !== undefined) state.maintenanceQueue = maintenanceQueue;
        },
        clearQueues: (state) => {
            state.downtimeQueue = [];
            state.maintenanceQueue = [];
        },
        incrementSyncAttempts: (state) => {
            state.syncAttempts += 1;
        },
        resetSyncAttempts: (state) => {
            state.syncAttempts = 0;
            state.syncError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadQueuesFromStorage.fulfilled, (state, action) => {
                state.downtimeQueue = action.payload.downtimeQueue;
                state.maintenanceQueue = action.payload.maintenanceQueue;
            })
            .addCase(syncQueues.fulfilled, (state, action) => {
                state.lastSync = action.payload.timestamp;
                state.syncError = null;
            })
            .addCase(syncQueues.rejected, (state, action) => {
                state.syncError = action.payload;
            });
    }
});

export const {
    setSyncing,
    addToQueueLocal,
    setQueues,
    clearQueues,
    incrementSyncAttempts,
    resetSyncAttempts
} = queueSlice.actions;

export default queueSlice.reducer;