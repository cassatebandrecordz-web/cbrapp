import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface StudioLogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  variant?: 'boombox-only' | 'full' | 'auto';
}

const LOGO = require('../../assets/images/cassate_logo.png');

export const StudioLogo: React.FC<StudioLogoProps> = ({
  size = 'medium',
  showTagline = false,
  variant = 'auto',
}) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  // Small: compact header logo
  if (isSmall) {
    return (
      <Image
        source={LOGO}
        style={styles.smallLogo}
        resizeMode="contain"
      />
    );
  }

  // Large / Medium
  const imgWidth = isLarge ? 260 : 200;
  const imgHeight = isLarge ? 110 : 84;

  return (
    <View style={styles.container}>
      <Image
        source={LOGO}
        style={{ width: imgWidth, height: imgHeight }}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={[styles.tagline, isLarge && styles.taglineLarge]}>
          YOUR IDEAS, WE'VE DONE IT.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLogo: {
    width: 120,
    height: 40,
  },
  tagline: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 6,
    textAlign: 'center',
  },
  taglineLarge: {
    fontSize: 13,
    letterSpacing: 1.5,
    marginTop: 8,
  },
});
