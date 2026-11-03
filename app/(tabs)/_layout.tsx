import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS } from '../../src/constants/theme';

interface AnimatedTabIconProps {
  nameFocused: keyof typeof Ionicons.glyphMap;
  nameUnfocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  nameFocused,
  nameUnfocused,
  focused,
  color,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.22, duration: 140, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1.08, friction: 5, tension: 80, useNativeDriver: true }),
        ]),
        Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Ionicons
        name={focused ? nameFocused : nameUnfocused}
        size={20}
        color={color}
      />
      {focused && (
        <Animated.View style={[styles.activeIndicatorDot, { opacity: glowAnim }]} />
      )}
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              nameFocused="home"
              nameUnfocused="home-outline"
              focused={focused}
              color={color as string}
            />
          ),
        }}
      />

      {/* Services tab is completely hidden from bottom bar as requested */}
      <Tabs.Screen
        name="services"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              nameFocused="calendar"
              nameUnfocused="calendar-outline"
              focused={focused}
              color={color as string}
            />
          ),
        }}
      />

      {/* Projects tab is completely hidden from bottom footer navigation bar as requested */}
      <Tabs.Screen
        name="projects"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              nameFocused="person"
              nameUnfocused="person-outline"
              focused={focused}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9EAE5',
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
  },
  activeIndicatorDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
