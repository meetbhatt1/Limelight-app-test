import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SPACING, RADIUS, SHADOWS } from "../../config/theme";

export const Card = ({ children, style, onPress }) => {
  const { colors } = useTheme();
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, { backgroundColor: colors.surface }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
});
