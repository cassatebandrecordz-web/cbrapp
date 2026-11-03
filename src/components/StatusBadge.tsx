import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProjectStatus } from '../data/mockData';
import { COLORS } from '../constants/theme';

interface StatusBadgeProps {
  status: ProjectStatus | string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  let color = COLORS.primary;
  let bg = 'rgba(234, 179, 8, 0.14)';
  let borderColor = 'rgba(234, 179, 8, 0.35)';

  switch (status) {
    case 'Review':
    case 'Client Review':
    case 'Quality Check':
      color = COLORS.gold;
      bg = COLORS.goldBadgeBg;
      borderColor = COLORS.goldBadgeBorder;
      break;
    case 'In Progress':
      color = COLORS.cyan;
      bg = 'rgba(56, 189, 248, 0.14)';
      borderColor = 'rgba(56, 189, 248, 0.35)';
      break;
    case 'Completed':
    case 'Confirmed':
      color = COLORS.green;
      bg = 'rgba(16, 185, 129, 0.14)';
      borderColor = 'rgba(16, 185, 129, 0.35)';
      break;
    case 'Revision Required':
      color = COLORS.red;
      bg = 'rgba(239, 68, 68, 0.14)';
      borderColor = 'rgba(239, 68, 68, 0.35)';
      break;
    case 'Assigned':
      color = '#A1A1AA';
      bg = 'rgba(161, 161, 170, 0.14)';
      borderColor = 'rgba(161, 161, 170, 0.3)';
      break;
    default:
      color = COLORS.primary;
      bg = COLORS.primaryMuted;
      borderColor = 'rgba(234, 179, 8, 0.35)';
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor,
          paddingVertical: isSmall ? 2.5 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color, fontSize: isSmall ? 10 : 11 }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4.5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
