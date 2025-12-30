import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { syncQueues } from "../store/queueSlice";
import { resetWasOffline } from "../store/appSlice";
import { Badge } from "./ui/Badge";
import { COLORS, SPACING, TYPOGRAPHY } from "../config/theme";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native";
import { AlertCircle } from "lucide-react-native";

export const PendingSyncBadge = () => {
  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.app.user);
  const downtimeQueue = useSelector((state) => state.queue?.downtimeQueue || []);
  const maintenanceQueue = useSelector((state) => state.queue?.maintenanceQueue || []);
  const isOnline = useSelector((state) => state.app.isOnline);
  const wasOffline = useSelector((state) => state.app.wasOffline);
  const isSyncing = useSelector((state) => state.queue?.isSyncing);

  // Filter queues by current user
  const userDowntimeQueue = downtimeQueue.filter(
    (item) => item.operator === userEmail
  );
  const userMaintenanceQueue = maintenanceQueue.filter(
    (item) => item.completedBy === userEmail || item.operator === userEmail
  );

  const pendingCount = userDowntimeQueue.length + userMaintenanceQueue.length;

  const handleSync = async () => {
    if (isSyncing || pendingCount === 0) return;

    // Check if offline
    if (!isOnline) {
      Toast.show({
        type: "error",
        text1: "No Network Available",
        text2: "Please connect to internet to sync",
        position: "bottom",
      });
      return;
    }

    const result = await dispatch(syncQueues());

    if (result.meta.requestStatus === "fulfilled") {
      // Reset wasOffline flag after successful sync
      dispatch(resetWasOffline());
      Toast.show({
        type: "success",
        text1: "Sync Complete",
        text2: `${result.payload.syncedItems} items synced successfully`,
        position: "bottom",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Sync Failed",
        text2: "Please try again",
        position: "bottom",
      });
    }
  };

  if (pendingCount === 0) return null;

  // Show sync button only when back online after being offline
  const showSyncButton = wasOffline && isOnline && !isSyncing;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={showSyncButton ? handleSync : undefined}
      disabled={!showSyncButton || isSyncing}
      activeOpacity={showSyncButton ? 0.7 : 1}
    >
      {isSyncing ? (
        <View style={styles.syncingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.syncText}>Syncing...</Text>
        </View>
      ) : (
        <View style={styles.badgeContainer}>
          <View style={styles.badgeWrapper}>
            <Badge 
              count={pendingCount} 
              color={isOnline ? COLORS.warning : COLORS.error} 
            />
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <AlertCircle size={12} color={COLORS.error} />
              </View>
            )}
          </View>
          {showSyncButton ? (
            <Text style={[styles.badgeText, { color: COLORS.primary }]}>
              Tap to sync
            </Text>
          ) : (
            <Text style={[styles.badgeText, { color: isOnline ? COLORS.warning : COLORS.error }]}>
              {pendingCount} pending
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  badgeWrapper: {
    position: "relative",
  },
  offlineIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.semibold,
  },
  syncingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  syncText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
});

