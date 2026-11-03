import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface CassetteLogoProps {
  size?: number;
  spinning?: boolean;
  showText?: boolean;
}

const LOGO = require('../../assets/images/cassate_logo.png');

export const CassetteLogo: React.FC<CassetteLogoProps> = ({
  size = 120,
  spinning = false,
  showText = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (spinning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [spinning]);

  const imgWidth = size * 2.2;
  const imgHeight = size * 0.92;

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.Image
        source={LOGO}
        style={{
          width: imgWidth,
          height: imgHeight,
          transform: [{ scale: pulseAnim }],
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({});
