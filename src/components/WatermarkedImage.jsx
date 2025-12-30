import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../config/theme";

export const WatermarkedImage = ({ source, machineId, timestamp, style }) => {
  const watermarkText = machineId
    ? `${machineId}\n${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}`
    : new Date().toLocaleString();

  const imageSource = typeof source === 'string' ? { uri: source } : source;
  
  return (
    <View style={[styles.container, style]}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.watermarkOverlay}>
        <Text style={styles.watermarkText}>{watermarkText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  watermarkOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  watermarkText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: "right",
  },
});

