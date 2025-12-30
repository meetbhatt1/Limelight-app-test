import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
} from "../config/theme";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useTheme } from "../context/ThemeContext";

export const OperatorAssignmentModal = ({
  visible,
  onClose,
  onAssign,
  operators,
  alert,
}) => {
  const { colors } = useTheme();
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [notes, setNotes] = useState("");

  const handleAssign = () => {
    if (selectedOperator) {
      onAssign({
        operatorEmail: selectedOperator.email, // Use email instead of full object
        operatorName: selectedOperator.name,
        notes: notes.trim(),
        alert,
      });
      setSelectedOperator(null);
      setNotes("");
      onClose();
    }
  };

  const renderOperator = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.operatorItem,
        {
          backgroundColor: colors.surface,
          borderColor:
            selectedOperator?.id === item.id
              ? colors.primary
              : colors.border,
        },
      ]}
      onPress={() => setSelectedOperator(item)}
    >
      <View style={styles.operatorInfo}>
        <Text style={[styles.operatorName, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.operatorEmail, { color: colors.textSecondary }]}>
          {item.email}
        </Text>
      </View>
      {selectedOperator?.id === item.id && (
        <View
          style={[styles.checkmark, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Assign Operator
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Select an operator to investigate: {alert?.machine_id}
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Choose Operator:
          </Text>
          <FlatList
            data={operators}
            renderItem={renderOperator}
            keyExtractor={(item) => item.id}
            style={styles.operatorsList}
            showsVerticalScrollIndicator={false}
          />

          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Notes (optional):
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add any specific instructions..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              size="medium"
              style={styles.cancelButton}
            />
            <Button
              title="Assign"
              onPress={handleAssign}
              variant="primary"
              size="medium"
              disabled={!selectedOperator}
              style={styles.assignButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  operatorsList: {
    maxHeight: 200,
    marginBottom: SPACING.md,
  },
  operatorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    marginBottom: SPACING.sm,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.xs / 2,
  },
  operatorEmail: {
    fontSize: TYPOGRAPHY.sm,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  assignButton: {
    flex: 1,
  },
});

