import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "../../config/theme";

export const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "run":
      case "running":
        return COLORS.running;
      case "idle":
        return COLORS.idle;
      case "off":
        return COLORS.off;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={[styles.chip, { backgroundColor: getStatusColor() + "20" }]}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {status?.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
