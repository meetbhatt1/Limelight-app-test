import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import queueReducer from './queueSlice';
import dataReducer from './dataSlice';

const store = configureStore({
    reducer: {
        app: appReducer,
        queue: queueReducer,
        data: dataReducer
    }
});

export default store;