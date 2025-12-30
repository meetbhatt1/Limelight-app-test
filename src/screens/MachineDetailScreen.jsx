import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  COMMON_STYLES,
} from "../config/theme";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Camera, Clock, Wrench, BarChart } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { addMachinePhoto, requestMaintenance } from "../store/dataSlice";

const MACHINES = [
  { id: "M-101", name: "Cutter 1", type: "cutter" },
  { id: "M-102", name: "Roller A", type: "roller" },
  { id: "M-103", name: "Packing West", type: "packer" },
];

export const MachineDetailScreen = ({ route, navigation }) => {
  const { machineId } = route.params;
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const downtimes = useSelector((state) => state.data.downtimes);
  const maintenances = useSelector((state) => state.data.maintenances);
  const maintenanceAssignments = useSelector(
    (state) => state.data.maintenanceAssignments
  );
  const userRole = useSelector((state) => state.app.role);
  const userEmail = useSelector((state) => state.app.user);

  const machine = MACHINES.find((m) => m.id === machineId) || {
    id: machineId,
    name: "Unknown Machine",
    type: "unknown",
  };

  // Get machine status from assignments or default
  const machineStatus = useMemo(() => {
    const assignment = maintenanceAssignments.find(
      (a) => a.machineId === machineId && a.status !== "completed"
    );
    if (assignment) return "IDLE"; // Under maintenance
    return "RUN"; // Default
  }, [maintenanceAssignments, machineId]);

  // Calculate stats from real downtime data
  const machineDowntimes = useMemo(
    () => downtimes.filter((dt) => dt.machineId === machineId),
    [downtimes, machineId]
  );

  const stats = useMemo(() => {
    const downtimeCount = machineDowntimes.length;
    const totalMinutes = downtimeCount * 30; // Simplified calculation
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const downtimeFormatted = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    const activeHours = 8 - Math.floor(totalMinutes / 60);
    const activeMinutes = 60 - (totalMinutes % 60);
    const activeFormatted = `${String(activeHours).padStart(2, "0")}:${String(
      activeMinutes
    ).padStart(2, "0")}`;

    return {
      active: activeFormatted,
      idle: "00:30", // Mock
      downtime: downtimeFormatted,
    };
  }, [machineDowntimes]);

  const [isDowntime, setIsDowntime] = useState(false);

  const handleStartDowntime = () => {
    navigation.navigate("DowntimeForm", { machineId: machine.id });
  };

  const handleEndDowntime = () => {
    setIsDowntime(false);
    Toast.show({
      type: "success",
      text1: "Downtime Ended",
      text2: `Record downtime reason to complete`,
      position: "bottom",
    });
    navigation.navigate("DowntimeForm", { machineId: machine.id });
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Needed",
        text2: "Camera roll permission is required",
        position: "bottom",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Store photo in Redux
      dispatch(
        addMachinePhoto({
          machineId: machine.id,
          uri: result.assets[0].uri,
          operator: userEmail,
        })
      );
      Toast.show({
        type: "success",
        text1: "Photo Added",
        text2: "Photo attached to machine record",
        position: "bottom",
      });
    }
  };

  const handleMaintenance = () => {
    const assignment = maintenanceAssignments.find(
      (a) => a.machineId === machineId && a.status !== "completed"
    );

    if (userRole === "operator") {
      // If operator, check if they're assigned or request assignment
      if (assignment) {
        if (assignment.assignedTo === userEmail) {
          Toast.show({
            type: "info",
            text1: "Your Assignment",
            text2: `You are assigned to investigate ${machineId}`,
            position: "bottom",
          });
          navigation.navigate("MaintenanceTab");
        } else {
          Toast.show({
            type: "info",
            text1: "Already Assigned",
            text2: `Assigned to: ${assignment.assignedTo}`,
            position: "bottom",
          });
        }
      } else {
        // Request assignment from supervisor
        dispatch(
          requestMaintenance({
            machineId: machineId,
            requestedBy: userEmail,
            requestedTo: null, // Any supervisor
          })
        );
        Toast.show({
          type: "success",
          text1: "Maintenance Requested",
          text2: "Supervisor will be notified to assign maintenance",
          position: "bottom",
        });
      }
    } else {
      // Supervisor can assign directly
      if (assignment) {
        Toast.show({
          type: "info",
          text1: "Maintenance Assigned",
          text2: `Assigned to: ${assignment.assignedTo}`,
          position: "bottom",
        });
      } else {
        navigation.navigate("MaintenanceTab");
      }
    }
  };

  const handleReports = () => {
    if (userRole === "supervisor") {
      // Navigate to main tabs first, then reports
      navigation.navigate("Main", { screen: "ReportsTab" });
    } else {
      Toast.show({
        type: "info",
        text1: "Reports",
        text2: "Reports are available to supervisors only",
        position: "bottom",
      });
    }
  };

  const quickStats = [
    { label: "Active Time", value: stats.active, color: COLORS.success },
    { label: "Idle Time", value: stats.idle, color: COLORS.warning },
    { label: "Downtime", value: stats.downtime, color: COLORS.error },
  ];

  // Get recent activity from downtimes
  const recentActivity = useMemo(() => {
    return machineDowntimes
      .slice(0, 3)
      .map((dt) => ({
        title: `Downtime: ${dt.reason || `${dt.parentReason} → ${dt.childReason}`}`,
        time: new Date(dt.ts || dt.timestamp).toLocaleString(),
      }))
      .reverse();
  }, [machineDowntimes]);

  return (
    <View style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Machine Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.machineInfo}>
              <Text style={[styles.machineName, { color: colors.textPrimary }]}>
                {machine.name}
              </Text>
              <Text style={[styles.machineId, { color: colors.textSecondary }]}>
                {machine.id}
              </Text>
              <Text style={[styles.machineType, { color: colors.textLight }]}>
                {machine.type}
              </Text>
            </View>
            <StatusChip status={machineStatus} />
          </View>
        </Card>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Today's Summary
          </Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Downtime Control */}
        <Card style={styles.actionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Downtime Control
          </Text>
          {isDowntime ? (
            <View>
              <View style={[styles.activeDowntime, { backgroundColor: COLORS.error + "10" }]}>
                <Text style={[styles.activeText, { color: COLORS.error }]}>
                  ⏱️ Downtime Active
                </Text>
                <Text style={[styles.activeTime, { color: colors.textSecondary }]}>
                  Tap below to record reason and end
                </Text>
              </View>
              <Button
                title="End Downtime"
                onPress={handleEndDowntime}
                variant="success"
                size="large"
              />
            </View>
          ) : (
            <Button
              title="Record Downtime"
              onPress={handleStartDowntime}
              variant="danger"
              size="large"
            />
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={handleAddPhoto}
            >
              <Camera size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Add Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={handleMaintenance}
            >
              <Wrench size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Maintenance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={handleReports}
            >
              <BarChart size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Reports
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Activity
          </Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyActivity, { color: colors.textSecondary }]}>
              No recent activity
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  machineId: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  machineType: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textLight,
    textTransform: "capitalize",
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  actionCard: {
    marginBottom: SPACING.md,
  },
  activeDowntime: {
    backgroundColor: COLORS.error + "10",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  activeText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  activeTime: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginHorizontal: SPACING.xs,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.sm,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  emptyActivity: {
    fontSize: TYPOGRAPHY.sm,
    fontStyle: "italic",
    textAlign: "center",
    padding: SPACING.md,
  },
  activityCard: {
    marginBottom: SPACING.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
});
