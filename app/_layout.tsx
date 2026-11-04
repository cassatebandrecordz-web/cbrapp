import React, { useEffect, Component, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '../src/context/AppContext';
import { COLORS } from '../src/constants/theme';

// Instruct splash screen to hide as soon as runtime starts
try {
  SplashScreen.hideAsync().catch(() => {});
} catch {
  // Ignore
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Root ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <StatusBar barStyle="light-content" />
          <View style={errorStyles.card}>
            <Text style={errorStyles.badge}>CASSATE BAND RECORDZ</Text>
            <Text style={errorStyles.title}>Studio Ready</Text>
            <Text style={errorStyles.subtitle}>
              An unexpected display glitch occurred. Tap below to reload the studio experience.
            </Text>
            <TouchableOpacity
              style={errorStyles.button}
              onPress={() => this.setState({ hasError: false, error: null })}
              activeOpacity={0.8}
            >
              <Text style={errorStyles.buttonText}>Reload Studio</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0813',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#141226',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  badge: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isAdminScreen = typeof pathname === 'string' && pathname.includes('admin');
  const isWebDesktop = Platform.OS === 'web' && width > 480 && !isAdminScreen;

  useEffect(() => {
    // Force hide native splash screen immediately when root layout mounts
    SplashScreen.hideAsync().catch(() => {});

    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <ExpoStatusBar style={isAdminScreen ? 'light' : 'dark'} />
          <View style={[styles.rootOuter, isAdminScreen && styles.adminRootOuter]}>
            <View
              style={[
                styles.rootInner,
                isAdminScreen ? styles.adminRootInner : (isWebDesktop && styles.desktopFrame),
              ]}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: isAdminScreen ? '#0A0A0F' : '#FBFCF8' },
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

                {/* Slot Booking Screen */}
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

                {/* Admin Web Portal */}
                <Stack.Screen name="admin-web" options={{ animation: 'fade' }} />
              </Stack>
            </View>
          </View>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootOuter: {
    flex: 1,
    backgroundColor: '#FBFCF8',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  adminRootOuter: {
    backgroundColor: '#0A0A0F',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  rootInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FBFCF8',
  },
  adminRootInner: {
    maxWidth: '100%',
    backgroundColor: '#0A0A0F',
  },
  desktopFrame: {
    maxWidth: 440,
    width: '100%',
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});
