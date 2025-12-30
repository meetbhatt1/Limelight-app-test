import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "../../config/theme";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.textLight;
    switch (variant) {
      case "primary":
        return COLORS.primary;
      case "success":
        return COLORS.success;
      case "danger":
        return COLORS.error;
      case "outline":
        return "transparent";
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    return variant === "outline" ? COLORS.primary : COLORS.textWhite;
  };

  const getSize = () => {
    switch (size) {
      case "small":
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case "large":
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl };
      default:
        return {
          paddingVertical: SPACING.sm + 4,
          paddingHorizontal: SPACING.lg,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getSize(),
        variant === "outline" && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // iOS minimum touch target
  },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
