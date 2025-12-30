import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../config/theme";
import store from "../store/indexStore";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference per user
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Get current user from Redux store
        const state = store.getState();
        const userEmail = state.app?.user;
        
        if (!userEmail) {
          // Load global theme as fallback
          const savedTheme = await AsyncStorage.getItem("appTheme");
          if (savedTheme !== null) {
            setIsDark(savedTheme === "dark");
          }
          setIsLoading(false);
          return;
        }

        const themeKey = `appTheme_${userEmail}`;
        const savedTheme = await AsyncStorage.getItem(themeKey);
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        } else {
          // Default to light theme
          setIsDark(false);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
    
    // Subscribe to user changes
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const userEmail = state.app?.user;
      if (userEmail) {
        loadTheme();
      }
    });

    return () => unsubscribe();
  }, []);

  // Save theme preference per user
  const toggleTheme = async () => {
    try {
      const state = store.getState();
      const userEmail = state.app?.user;
      
      const newTheme = !isDark;
      setIsDark(newTheme);
      
      if (userEmail) {
        const themeKey = `appTheme_${userEmail}`;
        await AsyncStorage.setItem(themeKey, newTheme ? "dark" : "light");
      } else {
        // Fallback to global theme
        await AsyncStorage.setItem("appTheme", newTheme ? "dark" : "light");
      }
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const theme = {
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
