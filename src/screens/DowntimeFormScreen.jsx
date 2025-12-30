import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  COMMON_STYLES,
} from "../config/theme";
import { useDispatch, useSelector } from "react-redux";
import Toast from 'react-native-toast-message';
import { addToQueue } from "../store/queueSlice";
import { addDowntime } from "../store/dataSlice";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { WatermarkedImage } from "../components/WatermarkedImage";

const REASON_TREE = [
  {
    code: "NO-ORDER",
    label: "No Order",
    children: [
      { code: "PLANNED", label: "Planned" },
      { code: "UNPLANNED", label: "Unplanned" },
    ],
  },
  {
    code: "POWER",
    label: "Power",
    children: [
      { code: "GRID", label: "Grid" },
      { code: "INTERNAL", label: "Internal" },
    ],
  },
  {
    code: "CHANGEOVER",
    label: "Changeover",
    children: [
      { code: "TOOLING", label: "Tooling" },
      { code: "PRODUCT", label: "Product" },
    ],
  },
];

export const DowntimeFormScreen = ({ route, navigation }) => {
  const { machineId } = route.params;
  const { colors } = useTheme();

  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoTimestamp, setPhotoTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParentSelect = (parent) => {
    setSelectedParent(parent);
    setSelectedChild(null);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera roll permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      setPhotoTimestamp(new Date().toISOString());
      Toast.show({
        type: 'success',
        text1: 'Photo Selected',
        text2: 'Watermark will be added automatically',
        position: 'bottom',
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      setPhotoTimestamp(new Date().toISOString());
      Toast.show({
        type: 'success',
        text1: 'Photo Captured',
        text2: 'Watermark will be added automatically',
        position: 'bottom',
      });
    }
  };

  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.user);

  const handleSubmit = () => {
    const downtimeEntry = {
      id: `dt_${Date.now()}`,
      machineId,
      parentReason: selectedParent.label,
      childReason: selectedChild.label,
      reason: `${selectedParent.label} → ${selectedChild.label}`,
      operator: user,
      ts: new Date().toISOString(),
      synced: false,
      tenant_id: "demo_tenant",
      photo: photo ? {
        uri: photo,
        timestamp: photoTimestamp,
        machineId: machineId,
      } : null,
    };

    dispatch(addToQueue({ type: "downtime", data: downtimeEntry }));
    dispatch(addDowntime(downtimeEntry));

    Toast.show({
      type: 'success',
      text1: 'Downtime Recorded',
      text2: 'Queued for sync when online',
      position: 'bottom',
    });

    navigation.goBack();
  };


  return (
    <View
      style={[COMMON_STYLES.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Category</Text>
          <View style={styles.reasonGrid}>
            {REASON_TREE.map((parent) => (
              <TouchableOpacity
                key={parent.code}
                style={[
                  styles.reasonButton,
                  selectedParent?.code === parent.code &&
                  styles.reasonButtonActive,
                ]}
                onPress={() => handleParentSelect(parent)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedParent?.code === parent.code &&
                    styles.reasonTextActive,
                  ]}
                >
                  {parent.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {selectedParent && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select Specific Reason</Text>
            <View style={styles.reasonGrid}>
              {selectedParent.children.map((child) => (
                <TouchableOpacity
                  key={child.code}
                  style={[
                    styles.reasonButton,
                    selectedChild?.code === child.code &&
                    styles.reasonButtonActive,
                  ]}
                  onPress={() => handleChildSelect(child)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedChild?.code === child.code &&
                      styles.reasonTextActive,
                    ]}
                  >
                    {child.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>3. Add Photo (Optional)</Text>
          {photo ? (
            <View>
              <WatermarkedImage
                source={{ uri: photo }}
                machineId={machineId}
                timestamp={photoTimestamp}
                style={styles.photoPreview}
              />
              <Button
                title="Remove Photo"
                onPress={() => {
                  setPhoto(null);
                  setPhotoTimestamp(null);
                }}
                variant="outline"
                style={styles.photoButton}
              />
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
                <Text style={styles.photoEmoji}>📷</Text>
                <Text style={styles.photoOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoOption} onPress={pickImage}>
                <Text style={styles.photoEmoji}>🖼️</Text>
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Button
          title="Record Downtime"
          onPress={handleSubmit}
          loading={loading}
          size="large"
          disabled={!selectedParent || !selectedChild}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  reasonButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    minWidth: "48%",
    alignItems: "center",
  },
  reasonButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "20",
  },
  reasonText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  reasonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  photoButtons: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  photoOption: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  photoOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    marginBottom: SPACING.md,
  },
  photoButton: {
    marginTop: SPACING.sm,
  },
});
