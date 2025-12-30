import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Factory,
  Wrench,
  AlertTriangle,
  BarChart,
  User,
} from "lucide-react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MachineDetailScreen } from "../screens/MachineDetailScreen";
import { MaintenanceScreen } from "../screens/MaintainanceScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { DowntimeFormScreen } from "../screens/DowntimeFormScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MachineReportDetailScreen } from "../screens/MachineReportDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, role, token } = useSelector((state) => state.app);
  const { colors } = useTheme();

  // Check if user has valid token (JWT validation)
  const hasValidToken = isAuthenticated && token && token.startsWith("mock_jwt_");

  const tabBarOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    headerShown: false,
  };

  const OperatorTabs = () => (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Machines",
          tabBarIcon: ({ color, size }) => (
            <Factory color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MaintenanceTab"
        component={MaintenanceScreen}
        options={{
          tabBarLabel: "Maintenance",
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );

  const SupervisorTabs = () => (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <AlertTriangle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, size }) => (
            <BarChart color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        {!isAuthenticated || !hasValidToken ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={role === "operator" ? OperatorTabs : SupervisorTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MachineDetail"
              component={MachineDetailScreen}
              options={({ route }) => ({
                title: route.params?.machineName || "Machine Details",
              })}
            />
            <Stack.Screen
              name="DowntimeForm"
              component={DowntimeFormScreen}
              options={{ title: "Record Downtime" }}
            />
            <Stack.Screen
              name="MachineReportDetail"
              component={MachineReportDetailScreen}
              options={({ route }) => ({
                title: route.params?.machineName || "Machine Report",
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
