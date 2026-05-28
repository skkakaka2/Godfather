import {MD3LightTheme} from 'react-native-paper';

export const colors = {
  background: '#f5f7fb',
  surface: '#ffffff',
  text: '#172033',
  muted: '#667085',
  border: '#d9e1ec',
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 1,
  md: 2,
  lg: 4,
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.background,
    error: colors.danger,
    errorContainer: '#fee2e2',
    onBackground: colors.text,
    onErrorContainer: '#7f1d1d',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#1e3a8a',
    onSecondaryContainer: '#172033',
    onSurface: colors.text,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    primary: colors.primary,
    primaryContainer: colors.primarySoft,
    secondary: colors.info,
    secondaryContainer: '#cffafe',
    surface: colors.surface,
    surfaceVariant: '#eef2f7',
    tertiary: colors.warning,
    tertiaryContainer: '#fef3c7',
  },
};
