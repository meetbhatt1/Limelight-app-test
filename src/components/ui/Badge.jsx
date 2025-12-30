import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "../../config/theme";

export const Badge = ({ count, color = COLORS.error }) => {
  if (!count || count === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
  },
  text: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
  },
});
