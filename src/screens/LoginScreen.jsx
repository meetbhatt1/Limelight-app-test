import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { login } from "../store/appSlice";
import { clearUserData, setCurrentUser, loadUserData } from "../store/dataSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/theme";
import { Button } from "../components/ui/Button";
import { useDispatch } from "react-redux";

export const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset error
    setEmailError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter an email");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(async () => {
      const mockToken = `mock_jwt_${Date.now()}_${role}_${email.replace("@", "_at_")}`;
      const userEmail = email.trim();
      dispatch(clearUserData());

      try {
        const assignments = await AsyncStorage.getItem('maintenanceAssignments');
        const requests = await AsyncStorage.getItem('maintenanceRequests');

        const sharedData = {
          maintenanceAssignments: assignments ? JSON.parse(assignments) : [],
          maintenanceRequests: requests ? JSON.parse(requests) : [],
        };

        // Load user-specific data
        const userKey = `userData_${userEmail}`;
        const saved = await AsyncStorage.getItem(userKey);
        if (saved) {
          const userData = JSON.parse(saved);
          dispatch(loadUserData({
            downtimes: userData.downtimes || [],
            maintenances: userData.maintenances || [],
            alerts: userData.alerts || [],
            maintenanceAssignments: sharedData.maintenanceAssignments, // Shared
            machinePhotos: userData.machinePhotos || [],
            maintenanceRequests: sharedData.maintenanceRequests, // Shared
          }));
        } else {
          // New user - load only shared data
          dispatch(loadUserData({
            downtimes: [],
            maintenances: [],
            alerts: [],
            maintenanceAssignments: sharedData.maintenanceAssignments,
            machinePhotos: [],
            maintenanceRequests: sharedData.maintenanceRequests,
          }));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Load empty data on error
        dispatch(loadUserData({
          downtimes: [],
          maintenances: [],
          alerts: [],
          maintenanceAssignments: [],
          machinePhotos: [],
          maintenanceRequests: [],
        }));
      }

      // Set current user and login
      dispatch(setCurrentUser(userEmail));
      dispatch(login({ email: userEmail, role, token: mockToken }));

      setLoading(false);
      // Use reset instead of replace to avoid navigation errors
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header Section */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>L</Text>
          </View>
          <Text style={styles.title}>LimelightIT</Text>
          <Text style={styles.subtitle}>Field Operations</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="operator@example.com"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(""); // Clear error on type
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "operator" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("operator")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === "operator" && styles.roleTextActive,
                  ]}
                >
                  👷 Operator
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "supervisor" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("supervisor")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === "supervisor" && styles.roleTextActive,
                  ]}
                >
                  👔 Supervisor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={styles.loginButton}
          />

          {/* Info Text */}
          <Text style={styles.infoText}>
            Any email will work for demo purposes
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  logoText: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48, // Good touch target
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  roleContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  roleButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.background,
    minHeight: 48,
    justifyContent: "center",
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "20",
  },
  roleText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  roleTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  infoText: {
    textAlign: "center",
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
});
