import React from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/appSlice";
import { clearUserData } from "../store/dataSlice";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext"; // Add this
import { SPACING, TYPOGRAPHY, RADIUS } from "../config/theme";

export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.app);
  const { colors, isDark, toggleTheme } = useTheme(); // Use theme

  const handleLogout = () => {
    dispatch(clearUserData());
    dispatch(logout());
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
        >
          <Text style={styles.avatarText}>
            {role === "operator" ? "👷" : "👔"}
          </Text>
        </View>

        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {user || "User"}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.roleText, { color: colors.textWhite }]}>
            {role?.toUpperCase()}
          </Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Tenant ID:
          </Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>
            demo_tenant
          </Text>
        </View>

        {/* Theme Toggle - Now Actually Working! */}
        <View style={styles.setting}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <Button
          title="Switch to Airplane Mode Demo"
          onPress={() => alert("Turn on Airplane Mode to test offline!")}
          variant="outline"
          style={styles.demoButton}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

        <Text style={[styles.version, { color: colors.textLight }]}>
          v1.0 • Built for LimelightIT
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: SPACING.md,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  roleText: {
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  label: {},
  value: {
    fontWeight: TYPOGRAPHY.semibold,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.base,
  },
  demoButton: {
    marginTop: SPACING.lg,
    width: "100%",
  },
  logoutButton: {
    marginTop: SPACING.md,
    width: "100%",
  },
  version: {
    marginTop: SPACING.xl,
    fontSize: TYPOGRAPHY.xs,
  },
});
