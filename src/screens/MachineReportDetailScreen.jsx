import React, { useMemo } from "react";
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
import { Card } from "../components/ui/Card";
import { useTheme } from "../context/ThemeContext";
import { WatermarkedImage } from "../components/WatermarkedImage";
import { StatusChip } from "../components/ui/StatusChip";

const MACHINES = [
  { id: "M-101", name: "Cutter 1", type: "cutter" },
  { id: "M-102", name: "Roller A", type: "roller" },
  { id: "M-103", name: "Packing West", type: "packer" },
];

export const MachineReportDetailScreen = ({ route, navigation }) => {
  const { machineId } = route.params;
  const { colors } = useTheme();

  const currentUser = useSelector((state) => state.app.user);
  const userRole = useSelector((state) => state.app.role);
  const downtimes = useSelector((state) => state.data.downtimes || []);
  const queueDowntimes = useSelector((state) => state.queue.downtimeQueue || []);
  const maintenanceAssignments = useSelector(
    (state) => state.data.maintenanceAssignments || []
  );
  const machinePhotos = useSelector((state) => state.data.machinePhotos || []);

  const machine = MACHINES.find((m) => m.id === machineId) || {
    id: machineId,
    name: "Unknown Machine",
    type: "unknown",
  };

  // Get all downtimes for this machine (supervisors see all, operators see their own)
  const machineDowntimes = useMemo(() => {
    const all = [...downtimes, ...queueDowntimes];
    const filtered = userRole === "supervisor" 
      ? all 
      : all.filter(dt => dt.operator === currentUser);
    return filtered.filter((dt) => dt.machineId === machineId);
  }, [downtimes, queueDowntimes, machineId, currentUser, userRole]);

  // Get machine photos (supervisors see all, operators see their own)
  const machinePhotosList = useMemo(() => {
    const filtered = userRole === "supervisor"
      ? machinePhotos
      : machinePhotos.filter(p => p.operator === currentUser);
    return filtered.filter((photo) => photo.machineId === machineId);
  }, [machinePhotos, machineId, currentUser, userRole]);

  // Get downtime photos
  const downtimePhotos = useMemo(() => {
    return machineDowntimes
      .filter((dt) => dt.photo && dt.photo.uri)
      .map((dt) => ({
        ...dt.photo,
        reason: dt.reason || `${dt.parentReason} → ${dt.childReason}`,
        operator: dt.operator,
        timestamp: dt.ts || dt.timestamp,
      }));
  }, [machineDowntimes]);

  // Check for maintenance request
  const maintenanceRequest = useMemo(() => {
    return maintenanceAssignments.find(
      (a) => a.machineId === machineId && a.status === "assigned"
    );
  }, [maintenanceAssignments, machineId]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Machine Header */}
        <Card style={styles.headerCard}>
          <View style={styles.machineHeader}>
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
            <StatusChip status="RUN" />
          </View>
        </Card>

        {/* Machine Photos Section */}
        {machinePhotosList.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Machine Photos
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {machinePhotosList.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <WatermarkedImage
                      source={{ uri: photo.uri }}
                      machineId={machineId}
                      timestamp={photo.timestamp}
                      style={styles.photoThumbnail}
                    />
                    <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>
                      {photo.operator || "Operator"}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card>
        )}

        {/* Downtime Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Downtime Records ({machineDowntimes.length})
          </Text>

          {machineDowntimes.length > 0 ? (
            <View style={styles.downtimeList}>
              {machineDowntimes.map((dt) => (
                <View
                  key={dt.id}
                  style={[styles.downtimeItem, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.downtimeHeader}>
                    <Text style={[styles.downtimeReason, { color: colors.textPrimary }]}>
                      {dt.reason || `${dt.parentReason} → ${dt.childReason}`}
                    </Text>
                    {dt.synced === false && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.downtimeMeta, { color: colors.textSecondary }]}>
                    By {dt.operator} • {formatDate(dt.ts || dt.timestamp)}
                  </Text>

                  {/* Show photo if available */}
                  {dt.photo && dt.photo.uri && (
                    <View style={styles.downtimePhoto}>
                      <WatermarkedImage
                        source={{ uri: dt.photo.uri }}
                        machineId={machineId}
                        timestamp={dt.photo.timestamp}
                        style={styles.downtimePhotoImage}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No downtime records for this machine
            </Text>
          )}
        </Card>

        {/* Maintenance Request Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Maintenance Request
          </Text>
          {maintenanceRequest ? (
            <View style={[styles.maintenanceRequest, { backgroundColor: colors.surface }]}>
              <Text style={[styles.maintenanceStatus, { color: COLORS.warning }]}>
                ⚠️ Maintenance Requested
              </Text>
              <View style={styles.maintenanceDetails}>
                <Text style={[styles.maintenanceDetail, { color: colors.textSecondary }]}>
                  Assigned to: {maintenanceRequest.assignedTo}
                </Text>
                <Text style={[styles.maintenanceDetail, { color: colors.textSecondary }]}>
                  Assigned by: {maintenanceRequest.assignedBy}
                </Text>
                <Text style={[styles.maintenanceDetail, { color: colors.textSecondary }]}>
                  Date: {formatDate(maintenanceRequest.assignedAt)}
                </Text>
                {maintenanceRequest.notes && (
                  <Text style={[styles.maintenanceNotes, { color: colors.textPrimary }]}>
                    Notes: {maintenanceRequest.notes}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No maintenance requested for this machine
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
  machineHeader: {
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
    marginBottom: SPACING.xs,
  },
  machineId: {
    fontSize: TYPOGRAPHY.base,
    marginBottom: SPACING.xs,
  },
  machineType: {
    fontSize: TYPOGRAPHY.sm,
    textTransform: "capitalize",
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.md,
  },
  photosContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  photoItem: {
    alignItems: "center",
  },
  photoThumbnail: {
    width: 150,
    height: 150,
    marginBottom: SPACING.xs,
  },
  photoLabel: {
    fontSize: TYPOGRAPHY.xs,
  },
  downtimeList: {
    gap: SPACING.sm,
  },
  downtimeItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  downtimeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  downtimeReason: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    flex: 1,
  },
  downtimeMeta: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.sm,
  },
  downtimePhoto: {
    marginTop: SPACING.sm,
  },
  downtimePhotoImage: {
    width: "100%",
    height: 200,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  pendingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.semibold,
  },
  maintenanceRequest: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  maintenanceStatus: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.sm,
  },
  maintenanceDetails: {
    gap: SPACING.xs,
  },
  maintenanceDetail: {
    fontSize: TYPOGRAPHY.sm,
  },
  maintenanceNotes: {
    fontSize: TYPOGRAPHY.sm,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    fontStyle: "italic",
    textAlign: "center",
    padding: SPACING.md,
  },
});

