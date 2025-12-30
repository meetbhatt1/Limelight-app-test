import { Platform, StatusBar } from 'react-native';

// LIGHT THEME
export const lightColors = {
    primary: '#1e40af',
    primaryDark: '#1e3a8a',
    primaryLight: '#60a5fa',

    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    running: '#10b981',
    idle: '#f59e0b',
    off: '#6b7280',

    background: '#f3f4f6',
    backgroundDark: '#e5e7eb',
    surface: '#ffffff',
    surfaceDark: '#f9fafb',

    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    textWhite: '#ffffff',

    border: '#e5e7eb',
    borderDark: '#d1d5db',

    severityHigh: '#ef4444',
    severityMedium: '#f59e0b',
    severityLow: '#3b82f6',
};

// DARK THEME
export const darkColors = {
    primary: '#60a5fa',
    primaryDark: '#93c5fd',
    primaryLight: '#1e40af',

    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',

    running: '#34d399',
    idle: '#fbbf24',
    off: '#9ca3af',

    background: '#111827',
    backgroundDark: '#1f2937',
    surface: '#1f2937',
    surfaceDark: '#374151',

    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textLight: '#9ca3af',
    textWhite: '#ffffff',

    border: '#374151',
    borderDark: '#4b5563',

    severityHigh: '#f87171',
    severityMedium: '#fbbf24',
    severityLow: '#60a5fa',
};

// For backward compatibility
export const COLORS = lightColors;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

export const RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const COMMON_STYLES = {
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
};

export const getThemeColors = (isDark) => {
    return isDark ? darkColors : lightColors;
};