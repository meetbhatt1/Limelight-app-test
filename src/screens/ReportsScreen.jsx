import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  COMMON_STYLES,
  RADIUS,
} from "../config/theme";
import { useTheme } from "../context/ThemeContext";
import { PendingSyncBadge } from "../components/PendingSyncBadge";

// Machine seed data
const MACHINES = [
  { id: "M-101", name: "Cutter 1" },
  { id: "M-102", name: "Roller A" },
  { id: "M-103", name: "Packing West" },
];

export const ReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const currentUser = useSelector((state) => state.app.user);
  const userRole = useSelector((state) => state.app.role);
  const downtimes = useSelector((state) => state.data.downtimes || []);
  const queueDowntimes = useSelector((state) => state.queue.downtimeQueue || []);

  // Supervisors see all downtimes, operators see only their own
  const allDowntimes = useMemo(() => {
    const synced = downtimes || [];
    const queued = queueDowntimes || [];
    const all = [...synced, ...queued];

    // If supervisor, show all. If operator, filter by their email
    if (userRole === "supervisor") {
      return all;
    } else {
      return all.filter(dt => dt.operator === currentUser);
    }
  }, [downtimes, queueDowntimes, currentUser, userRole]);

  // Calculate report data per machine
  const reportData = useMemo(() => {
    return MACHINES.map((machine) => {
      const machineDowntimes = allDowntimes.filter(
        (dt) => dt.machineId === machine.id
      );

      // Get today's date for filtering
      const today = new Date().toDateString();

      // Count downtimes
      const downtimeCount = machineDowntimes.length;

      // Find top reason
      const reasonCounts = {};
      machineDowntimes.forEach((dt) => {
        const reasonKey = `${dt.parentReason} → ${dt.childReason}`;
        reasonCounts[reasonKey] = (reasonCounts[reasonKey] || 0) + 1;
      });

      const topReason =
        Object.keys(reasonCounts).length > 0
          ? Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0][0]
          : "No downtime recorded";

      // Calculate total downtime (simplified - assume 30 min per entry for demo)
      // In real app, you'd calculate from start/end times
      const totalMinutes = downtimeCount * 30;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const downtimeFormatted = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

      // Mock active/idle times (in real app, calculate from machine status history)
      const activeHours = 8 - Math.floor(totalMinutes / 60);
      const activeMinutes = 60 - (totalMinutes % 60);
      const activeFormatted = `${String(activeHours).padStart(2, "0")}:${String(
        activeMinutes
      ).padStart(2, "0")}`;

      return {
        machine: machine.id,
        machineName: machine.name,
        active: activeFormatted,
        idle: "00:30", // Mock data
        downtime: downtimeFormatted,
        downtimeCount,
        topReason,
        downtimes: machineDowntimes.slice(0, 5), // Show last 5
      };
    });
  }, [allDowntimes]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalDowntimes = allDowntimes.length;
    const totalMinutes = totalDowntimes * 30; // Simplified
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      active: "22:35", // Mock
      idle: "02:25", // Mock
      downtime: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`,
    };
  }, [allDowntimes]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Card style={styles.headerCard}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Daily Production Report
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <PendingSyncBadge />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Active
                </Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  {totals.active}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Idle
                </Text>
                <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                  {totals.idle}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Downtime
                </Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  {totals.downtime}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {reportData.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              // Navigate to machine detail screen
              if (navigation) {
                navigation.navigate("MachineReportDetail", {
                  machineId: item.machine,
                  machineName: item.machineName,
                });
              }
            }}
            activeOpacity={0.7}
          >
            <Card style={styles.machineCard}>
              <View style={styles.machineHeader}>
                <View>
                  <Text style={[styles.machineName, { color: colors.textPrimary }]}>
                    {item.machine}
                  </Text>
                  <Text style={[styles.machineNameSub, { color: colors.textSecondary }]}>
                    {item.machineName}
                  </Text>
                </View>
                <Badge count={item.downtimeCount} color={COLORS.primary} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Active
                  </Text>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>
                    {item.active}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Idle
                  </Text>
                  <Text style={[styles.statValue, { color: COLORS.warning }]}>
                    {item.idle}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Downtime
                  </Text>
                  <Text style={[styles.statValue, { color: COLORS.error }]}>
                    {item.downtime}
                  </Text>
                </View>
              </View>

              <View style={[styles.reasonBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.reasonLabel, { color: colors.textSecondary }]}>
                  Top Reason:
                </Text>
                <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
                  {item.topReason}
                </Text>
              </View>

              {/* Show recent downtime entries from operators */}
              {item.downtimes.length > 0 && (
                <View style={styles.downtimeList}>
                  <Text style={[styles.downtimeListTitle, { color: colors.textPrimary }]}>
                    Recent Downtime Entries:
                  </Text>
                  {item.downtimes.map((dt) => (
                    <View
                      key={dt.id}
                      style={[styles.downtimeEntry, { backgroundColor: colors.surface }]}
                    >
                      <View style={styles.downtimeEntryHeader}>
                        <Text style={[styles.downtimeReason, { color: colors.textPrimary }]}>
                          {dt.reason || `${dt.parentReason} → ${dt.childReason}`}
                        </Text>
                        {dt.synced === false && (
                          <View style={styles.syncBadge}>
                            <Text style={styles.syncBadgeText}>Pending</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.downtimeMeta, { color: colors.textSecondary }]}>
                        By {dt.operator} • {formatDate(dt.ts || dt.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}

        {allDowntimes.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No downtime records yet. Operators can record downtime from the Machines screen.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerCard: { flex: 1, marginBottom: 0 },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.lg,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: TYPOGRAPHY.sm },
  summaryValue: { fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold },
  machineCard: { marginBottom: SPACING.md },
  machineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  machineName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
  },
  machineNameSub: {
    fontSize: TYPOGRAPHY.sm,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  stat: { alignItems: "center" },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.xs,
  },
  statValue: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold },
  reasonBox: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  reasonLabel: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.xs,
  },
  reasonText: { fontSize: TYPOGRAPHY.base },
  downtimeList: {
    marginTop: SPACING.sm,
  },
  downtimeListTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.sm,
  },
  downtimeEntry: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  downtimeEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  downtimeReason: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    flex: 1,
  },
  downtimeMeta: {
    fontSize: TYPOGRAPHY.xs,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    textAlign: "center",
  },
  syncBadge: {
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  syncBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
