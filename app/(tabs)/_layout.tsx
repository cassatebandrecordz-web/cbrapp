import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        size={21}
        color={color}
      />
      {focused && (
        <Animated.View style={[styles.activeIndicatorDot, { opacity: glowAnim }]} />
      )}
    </Animated.View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 52 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarActiveTintColor: '#CA8A04',
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
    borderTopWidth: 1.5,
    borderTopColor: '#E9EAE5',
    paddingTop: 6,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
  },
  activeIndicatorDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CA8A04',
  },
});
