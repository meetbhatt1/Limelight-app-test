import NetInfo from '@react-native-community/netinfo';

let networkListeners = [];

export const subscribeToNetwork = (callback) => {
    const unsubscribe = NetInfo.addEventListener(state => {
        callback(state.isConnected);
    });
    networkListeners.push(unsubscribe);
    return unsubscribe;
};

export const checkConnection = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
};

export const cleanup = () => {
    networkListeners.forEach(unsub => unsub());
    networkListeners = [];
};