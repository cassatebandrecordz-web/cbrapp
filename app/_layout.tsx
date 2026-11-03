import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/context/AppContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 480;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <View style={styles.rootOuter}>
          <View style={[styles.rootInner, isWebDesktop && styles.desktopFrame]}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#07070A' },
                animation: 'slide_from_right',
                animationDuration: 280,
              }}
            >
              {/* Initial Screen: Get Started */}
              <Stack.Screen name="index" options={{ animation: 'none' }} />

              {/* Auth / Onboarding */}
              <Stack.Screen name="welcome" options={{ animation: 'none' }} />
              <Stack.Screen name="login" options={{ animation: 'slide_from_bottom', animationDuration: 280 }} />
              <Stack.Screen name="register" options={{ animation: 'slide_from_right', animationDuration: 280 }} />

              {/* Bottom Tabs */}
              <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 250 }} />

              {/* Service Details & Pricing */}
              <Stack.Screen name="services/[id]" options={{ animation: 'slide_from_right' }} />

              {/* Slot Booking Screen (Accessed when user clicks a service) */}
              <Stack.Screen name="booking/select" options={{ animation: 'slide_from_right' }} />

              {/* Booking Confirmation & My Bookings */}
              <Stack.Screen name="booking/confirmation" options={{ gestureEnabled: false, animation: 'fade_from_bottom' }} />
              <Stack.Screen name="my-bookings" options={{ animation: 'slide_from_right' }} />

              {/* Projects Drill-downs */}
              <Stack.Screen name="projects/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="projects/[id]/editor" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="projects/[id]/draft" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="projects/[id]/revision" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="projects/[id]/delivery" options={{ animation: 'slide_from_right' }} />

              {/* General Utility Screens */}
              <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="contact" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </View>
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootOuter: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  rootInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#07070A',
  },
  desktopFrame: {
    maxWidth: 440,
    width: '100%',
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1C1C28',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },
});
