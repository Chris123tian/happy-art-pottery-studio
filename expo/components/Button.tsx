import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [baseStyles.button];

    if (variant === 'primary') {
      styles.push(baseStyles.primaryButton);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondaryButton);
    } else if (variant === 'outline') {
      styles.push(baseStyles.outlineButton);
    }

    if (disabled || loading) {
      styles.push(baseStyles.disabledButton);
    }

    if (style) {
      styles.push(style);
    }

    return styles;
  };

  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [baseStyles.text];

    if (variant === 'outline') {
      styles.push(baseStyles.outlineText);
    }

    if (disabled || loading) {
      styles.push(baseStyles.disabledText);
    }

    if (textStyle) {
      styles.push(textStyle);
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.sm,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
});
