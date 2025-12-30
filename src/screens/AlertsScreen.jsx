import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert as RNAlert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  COMMON_STYLES,
} from "../config/theme";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { generateMockAlert } from "../utils/generateMockAlert";
import { OperatorAssignmentModal } from "../components/OperatorAssignmentModal";
import { assignMaintenance, updateAlert, updateMaintenanceRequest } from "../store/dataSlice";
import Toast from "react-native-toast-message";
import { PendingSyncBadge } from "../components/PendingSyncBadge";

export const AlertsScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const supervisor = useSelector((state) => state.app.user);
  const operators = useSelector((state) => state.data.operators);
  const maintenanceAssignments = useSelector(
    (state) => state.data.maintenanceAssignments
  );
  const maintenanceRequests = useSelector(
    (state) => state.data.maintenanceRequests || []
  );

  const [alerts, setAlerts] = useState([
    { ...generateMockAlert(), severity: "high" },
    {
      ...generateMockAlert(),
      severity: "medium",
      status: "acknowledged",
      acknowledgedBy: "supervisor@test.com",
    },
  ]);

  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Filter out alerts for machines with active maintenance assignments
  const visibleAlerts = useMemo(() => {
    const assignedMachineIds = maintenanceAssignments
      .filter((a) => a.status !== "completed")
      .map((a) => a.machineId);
    return alerts.filter((alert) => !assignedMachineIds.includes(alert.machine_id));
  }, [alerts, maintenanceAssignments]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setAlerts((prev) => [generateMockAlert(), ...prev]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return COLORS.error;
      case "medium":
        return COLORS.warning;
      case "low":
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "created":
        return COLORS.error;
      case "acknowledged":
        return COLORS.warning;
      case "cleared":
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const handleAcknowledge = (alert) => {
    setSelectedAlert(alert);
    setAssignmentModalVisible(true);
  };

  const handleAssignOperator = ({ operatorEmail, operatorName, notes, alert }) => {
    // Update alert status
    const updatedAlert = {
      ...alert,
      status: "acknowledged",
      acknowledgedBy: supervisor,
      acknowledgedAt: new Date().toISOString(),
      assignedTo: operatorEmail, // Store email ID
      assignmentNotes: notes,
    };

    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? updatedAlert : a))
    );

    // Dispatch to Redux
    dispatch(updateAlert(updatedAlert));
    dispatch(
      assignMaintenance({
        machineId: alert.machine_id,
        assignedTo: operatorEmail, // Use email ID
        assignedBy: supervisor,
        alertId: alert.id,
        notes: notes,
      })
    );

    // If there was a maintenance request for this machine, mark it as assigned
    const relatedRequest = maintenanceRequests.find(
      (r) => r.machineId === alert.machine_id && r.status === "pending"
    );
    if (relatedRequest) {
      dispatch(
        updateMaintenanceRequest({
          machineId: alert.machine_id,
          requestedBy: relatedRequest.requestedBy,
          status: "assigned",
          assignedTo: operatorEmail,
        })
      );
    }

    Toast.show({
      type: "success",
      text1: "Operator Assigned",
      text2: `${operatorEmail} will investigate ${alert.machine_id}`,
      position: "bottom",
    });
  };

  const handleClear = (alert) => {
    RNAlert.alert(
      "Clear Alert",
      `This will mark the alert as resolved. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            const updatedAlert = {
              ...alert,
              status: "cleared",
              clearedBy: supervisor,
              clearedAt: new Date().toISOString(),
            };
            setAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? updatedAlert : a))
            );
            dispatch(updateAlert(updatedAlert));

            // Complete maintenance assignment if exists
            const assignment = maintenanceAssignments.find(
              (a) => a.machineId === alert.machine_id
            );
            if (assignment) {
              dispatch(
                completeMaintenance({ machineId: alert.machine_id })
              );
            }

            Toast.show({
              type: "success",
              text1: "Alert Cleared",
              text2: `${alert.machine_id} alert resolved`,
              position: "bottom",
            });
          },
        },
      ]
    );
  };

  const renderAlert = ({ item }) => (
    <Card style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <View
              style={[
                styles.severityDot,
                { backgroundColor: getSeverityColor(item.severity) },
              ]}
            />
            <Text style={styles.alertMessage}>{item.msg}</Text>
          </View>
          <Text style={styles.alertMachine}>Machine: {item.machine_id}</Text>
          <Text style={styles.alertTime}>
            {new Date(item.ts).toLocaleString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusChip,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.assignedTo && (
        <View style={styles.assignedInfo}>
          <Text style={[styles.assignedText, { color: colors.textSecondary }]}>
            Assigned to: {item.assignedTo}
          </Text>
          {item.assignmentNotes && (
            <Text style={[styles.assignedText, { color: colors.textLight, fontSize: TYPOGRAPHY.xs, marginTop: SPACING.xs }]}>
              Notes: {item.assignmentNotes}
            </Text>
          )}
        </View>
      )}

      {item.status !== "cleared" && (
        <View style={styles.alertActions}>
          {item.status === "created" && (
            <Button
              title="Acknowledge & Assign"
              onPress={() => handleAcknowledge(item)}
              variant="primary"
              size="small"
            />
          )}
          {item.status === "acknowledged" && (
            <Button
              title="Clear Alert"
              onPress={() => handleClear(item)}
              variant="success"
              size="small"
            />
          )}
        </View>
      )}
    </Card>
  );

  return (
    <View
      style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              System Alerts
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Acknowledge and clear system-generated alerts
            </Text>
          </View>
          <PendingSyncBadge />
        </View>
      </View>

      {/* Show Maintenance Requests from Operators - visible to all supervisors */}
      {maintenanceRequests.filter((r) => r.status === "pending").length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={[styles.requestsTitle, { color: colors.textPrimary }]}>
            Maintenance Requests ({maintenanceRequests.filter((r) => r.status === "pending").length})
          </Text>
          {maintenanceRequests
            .filter((r) => r.status === "pending")
            .map((request, index) => (
              <Card key={`req-${request.machineId}-${request.requestedBy}-${index}`} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestMachine, { color: colors.textPrimary }]}>
                      {request.machineId}
                    </Text>
                    <Text style={[styles.requestOperator, { color: colors.textSecondary }]}>
                      Requested by: {request.requestedBy}
                    </Text>
                    <Text style={[styles.requestTime, { color: colors.textLight }]}>
                      {new Date(request.requestedAt).toLocaleString()}
                    </Text>
                  </View>
                  <Button
                    title="Assign"
                    onPress={() => {
                      // Create a mock alert for this request to use the assignment modal
                      const mockAlert = {
                        id: `req-${request.machineId}`,
                        machine_id: request.machineId,
                        msg: `Maintenance requested by ${request.requestedBy}`,
                        ts: request.requestedAt,
                        severity: "medium",
                        status: "created",
                      };
                      setSelectedAlert(mockAlert);
                      setAssignmentModalVisible(true);
                    }}
                    variant="primary"
                    size="small"
                  />
                </View>
              </Card>
            ))}
        </View>
      )}
      <FlatList
        data={visibleAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No alerts at this time
            </Text>
          </View>
        }
      />

      <OperatorAssignmentModal
        visible={assignmentModalVisible}
        onClose={() => {
          setAssignmentModalVisible(false);
          setSelectedAlert(null);
        }}
        onAssign={handleAssignOperator}
        operators={operators}
        alert={selectedAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  alertCard: {
    marginBottom: SPACING.md,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  alertMessage: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  alertMachine: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  alertTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textLight,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    alignSelf: "flex-start",
    height: 24,
    justifyContent: "center",
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
  },
  alertActions: {
    marginTop: SPACING.md,
  },
  assignedInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.info + "10",
    borderRadius: RADIUS.sm,
  },
  assignedText: {
    fontSize: TYPOGRAPHY.sm,
    fontStyle: "italic",
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
  },
  requestsSection: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  requestsTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.md,
  },
  requestCard: {
    marginBottom: SPACING.sm,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  requestMachine: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.xs / 2,
  },
  requestOperator: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.xs / 2,
  },
  requestTime: {
    fontSize: TYPOGRAPHY.xs,
  },
});
