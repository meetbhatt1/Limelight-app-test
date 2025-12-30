import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToQueue } from "../store/queueSlice";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  COMMON_STYLES,
} from "../config/theme";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";
import { PendingSyncBadge } from "../components/PendingSyncBadge";

const MOCK_MAINTENANCE = [
  {
    id: "maint-1",
    machineId: "M-101",
    machineName: "Cutter 1",
    task: "Oil level check",
    type: "time-based",
    dueDate: "2025-12-28",
    status: "due",
  },
  {
    id: "maint-2",
    machineId: "M-102",
    machineName: "Roller A",
    task: "Belt tension inspection",
    type: "usage-based",
    dueDate: "2025-12-26",
    status: "overdue",
  },
  {
    id: "maint-3",
    machineId: "M-103",
    machineName: "Packing West",
    task: "Filter replacement",
    type: "time-based",
    dueDate: "2025-12-25",
    status: "done",
    completedAt: "2025-12-25T10:30:00Z",
  },
];

export const MaintenanceScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.app.user);
  const userRole = useSelector((state) => state.app.role);
  const maintenanceAssignments = useSelector(
    (state) => state.data.maintenanceAssignments
  );

  // Combine mock tasks with assigned maintenance from supervisor
  const allTasks = useMemo(() => {
    const assignedTasks = maintenanceAssignments
      .filter((assignment) => assignment.assignedTo === userEmail)
      .map((assignment) => ({
        id: `assigned-${assignment.machineId}`,
        machineId: assignment.machineId,
        machineName: `Machine ${assignment.machineId}`,
        task: `Investigate ${assignment.machineId} - System Alert`,
        type: "assigned",
        dueDate: new Date(assignment.assignedAt).toLocaleDateString(),
        status: assignment.status === "assigned" ? "due" : "done",
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        notes: assignment.notes,
      }));

    return [...assignedTasks, ...MOCK_MAINTENANCE];
  }, [maintenanceAssignments, userEmail]);

  const [tasks, setTasks] = useState(allTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notes, setNotes] = useState("");

  // Update tasks when assignments change
  React.useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case "overdue":
        return COLORS.error;
      case "due":
        return COLORS.warning;
      case "done":
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "overdue":
        return "🔴 Overdue";
      case "due":
        return "🟡 Due";
      case "done":
        return "✅ Done";
      default:
        return status;
    }
  };

  const handleTaskPress = (task) => {
    if (task.status !== "done") {
      setSelectedTask(task);
      setModalVisible(true);
    }
  };

  const handleComplete = () => {
    if (!selectedTask) return;

    const updatedTask = {
      ...selectedTask,
      status: "done",
      completedAt: new Date().toISOString(),
      notes: notes,
      synced: false,
      completedBy: userEmail,
    };

    setTasks(tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t)));

    // Add to queue for sync
    dispatch(
      addToQueue({
        type: "maintenance",
        data: updatedTask,
      })
    );

    console.log("Maintenance completed:", updatedTask);

    setModalVisible(false);
    setSelectedTask(null);
    setNotes("");

    Alert.alert(
      "Success",
      "Maintenance task marked as complete (queued for sync)"
    );
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
      disabled={item.status === "done"}
      activeOpacity={0.7}
    >
      <Card>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.task}</Text>
            <Text style={styles.machineName}>{item.machineName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{item.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due:</Text>
            <Text style={styles.detailValue}>{item.dueDate}</Text>
          </View>
          {item.assignedBy && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned by:</Text>
              <Text style={styles.detailValue}>{item.assignedBy}</Text>
            </View>
          )}
          {item.completedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const dueCount = tasks.filter((t) => t.status === "due").length;

  return (
    <View style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}>
      {/* Pending Sync Badge */}
      <View style={styles.badgeContainer}>
        <PendingSyncBadge />
      </View>

      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{overdueCount}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            {dueCount}
          </Text>
          <Text style={styles.summaryLabel}>Due Soon</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {tasks.filter((t) => t.status === "done").length}
          </Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Complete Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Maintenance</Text>

            {selectedTask && (
              <>
                <Text style={styles.modalTask}>{selectedTask.task}</Text>
                <Text style={styles.modalMachine}>
                  {selectedTask.machineName}
                </Text>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes (optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add any notes about the maintenance..."
                    placeholderTextColor={COLORS.textLight}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setModalVisible(false);
                      setNotes("");
                    }}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button
                    title="Mark Complete"
                    onPress={handleComplete}
                    variant="success"
                    style={styles.modalButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    padding: SPACING.md,
    paddingBottom: 0,
    alignItems: "flex-end",
  },
  summaryContainer: {
    flexDirection: "row",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  taskCard: {
    marginBottom: SPACING.md,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  taskInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  machineName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  taskDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalTask: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  modalMachine: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  notesContainer: {
    marginBottom: SPACING.lg,
  },
  notesLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});
