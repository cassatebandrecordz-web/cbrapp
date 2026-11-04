import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AnimatedTabIconProps {
  nameFocused: keyof typeof Ionicons.glyphMap;
  nameUnfocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  nameFocused,
  nameUnfocused,
  focused,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.16, duration: 130, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.04, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerFocused,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Ionicons
        name={focused ? nameFocused : nameUnfocused}
        size={focused ? 20 : 19}
        color={focused ? '#854D0E' : '#4B5563'}
      />
    </Animated.View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  // Android 3-button navigation bar requires safe margin of at least 26dp
  const effectiveBottomInset = isAndroid
    ? Math.max(insets.bottom, 26)
    : Math.max(insets.bottom, 8);

  const tabBarHeight = 56 + effectiveBottomInset;
  const tabPaddingBottom = effectiveBottomInset + 2;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: tabPaddingBottom,
          },
        ],
        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 2,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              nameFocused="home"
              nameUnfocused="home-outline"
              focused={focused}
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
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              nameFocused="calendar"
              nameUnfocused="calendar-outline"
              focused={focused}
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
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              nameFocused="person"
              nameUnfocused="person-outline"
              focused={focused}
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
    borderTopWidth: 1.2,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
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
    width: 44,
    height: 28,
    borderRadius: 14,
  },
  iconContainerFocused: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
});
