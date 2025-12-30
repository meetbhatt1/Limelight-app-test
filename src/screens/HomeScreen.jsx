import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Toast from 'react-native-toast-message';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  COMMON_STYLES,
} from "../config/theme";
import { useDispatch, useSelector } from "react-redux";
import { syncQueues } from "../store/queueSlice";
import { resetWasOffline } from "../store/appSlice";
import { AlertCircle } from "lucide-react-native";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { ClockAlert, Factory } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";

const MOCK_MACHINES = [
  {
    id: "M-101",
    name: "Cutter 1",
    type: "cutter",
    status: "RUN",
  },
  {
    id: "M-102",
    name: "Roller A",
    type: "roller",
    status: "IDLE",
  },
  {
    id: "M-103",
    name: "Packing West",
    type: "packer",
    status: "OFF",
  },
];

export const HomeScreen = ({ navigation }) => {
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.app.user);

  const downtimeQueue = useSelector((state) => state.queue?.downtimeQueue || []);
  const maintenanceQueue = useSelector((state) => state.queue?.maintenanceQueue || []);

  // Filter queues by current user
  const userDowntimeQueue = downtimeQueue.filter(
    (item) => item.operator === userEmail
  );
  const userMaintenanceQueue = maintenanceQueue.filter(
    (item) => item.completedBy === userEmail || item.operator === userEmail
  );

  const pendingCount = userDowntimeQueue.length + userMaintenanceQueue.length;
  const isSyncing = useSelector((state) => state.queue?.isSyncing);
  const isOnline = useSelector((state) => state.app.isOnline);
  const wasOffline = useSelector((state) => state.app.wasOffline);

  // Calculate pending count per machine
  const machinesWithPending = machines.map((machine) => {
    const machineDowntimePending = userDowntimeQueue.filter(
      (item) => item.machineId === machine.id
    ).length;
    const machineMaintenancePending = userMaintenanceQueue.filter(
      (item) => item.machineId === machine.id
    ).length;
    return {
      ...machine,
      pendingSync: machineDowntimePending + machineMaintenancePending,
    };
  });

  // Show sync button only when back online after being offline
  const showSyncButton = wasOffline && isOnline && !isSyncing;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleSync = async () => {
    if (!isOnline) {
      Toast.show({
        type: 'error',
        text1: 'No Network Available',
        text2: 'Please connect to internet to sync',
        position: 'bottom',
      });
      return;
    }

    const result = await dispatch(syncQueues());

    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(resetWasOffline());
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: `${result.payload.syncedItems} items synced successfully`,
        position: 'bottom',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Please try again',
        position: 'bottom',
      });
    }
  };

  const handleMachinePress = (machine) => {
    navigation.navigate("MachineDetail", {
      machineId: machine.id,
      machineName: machine.name,
    });
  };

  const renderMachineCard = ({ item }) => (
    <TouchableOpacity
      style={styles.machineCard}
      onPress={() => handleMachinePress(item)}
      activeOpacity={0.7}
    >
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.machineInfo}>
            <Text style={styles.machineName}>{item.name}</Text>
            <Text style={styles.machineId}>{item.id}</Text>
          </View>
          <StatusChip status={item.status} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.machineType}>
            <Text style={styles.typeLabel}>Type:</Text>
            <Text style={styles.typeValue}>{item.type}</Text>
          </View>

          {item.pendingSync > 0 && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncText}>
                <ClockAlert size={20} /> {item.pendingSync} pending
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Machines Overview</Text>
      </View>

      {pendingCount > 0 && (
        <TouchableOpacity
          onPress={showSyncButton ? handleSync : undefined}
          disabled={!showSyncButton || isSyncing}
          style={styles.syncButton}
          activeOpacity={showSyncButton ? 0.7 : 1}
        >
          {isSyncing ? (
            <>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.syncText}>Syncing...</Text>
            </>
          ) : (
            <>
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
              <Text style={[styles.syncText, { color: showSyncButton ? COLORS.primary : (isOnline ? COLORS.warning : COLORS.error) }]}>
                {showSyncButton ? 'Tap to sync' : `${pendingCount} pending`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        <Factory />
      </Text>
      <Text style={styles.emptyTitle}>No Machines</Text>
      <Text style={styles.emptyText}>No machines are configured yet</Text>
    </View>
  );

  return (
    <View style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={machinesWithPending}
        renderItem={renderMachineCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  machineCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  machineId: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  machineType: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  typeValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },
  syncBadge: {
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  // syncText: {
  //   fontSize: TYPOGRAPHY.xs,
  //   color: COLORS.warning,
  //   fontWeight: TYPOGRAPHY.semibold,
  // },
  syncButton: {
    alignItems: "center",
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
  syncText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
