import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface DemoNoticeBannerProps {
  compact?: boolean;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({ compact = false }) => {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Ionicons name="information-circle-outline" size={compact ? 14 : 16} color={COLORS.accentLilac} />
      <Text style={[styles.text, compact && styles.compactText]}>
        DEMO MODE: Simulated studio reservations & mock editing pipelines. No real payment is collected.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(109, 40, 217, 0.18)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  compactContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  text: {
    color: '#DDD6FE',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
  compactText: {
    fontSize: 10,
    lineHeight: 13,
  },
});
