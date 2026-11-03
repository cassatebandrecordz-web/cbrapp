import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

interface GlowCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientColors?: readonly [string, string, ...string[]];
  borderColor?: string;
  onPress?: () => void;
  activeOpacity?: number;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  style,
  gradientColors,
  borderColor = COLORS.border,
  onPress,
  activeOpacity = 0.85,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.card, { borderColor }, style]}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
});
