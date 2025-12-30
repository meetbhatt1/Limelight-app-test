export const mockSync = async () => {
    console.log('🔄 Simulating sync...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ Sync complete');

    return { success: true, syncedItems: 5 };
};