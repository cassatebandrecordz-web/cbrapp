import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { soundEffects } from '../src/utils/soundEffects';

export default function GetStartedScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleEnterApp = () => {
    soundEffects.playGetStarted();
    router.replace('/(tabs)');
  };

  // Poster natural aspect ratio: 577 / 1024 (~0.563)
  const POSTER_RATIO = 577 / 1024;
  const isDesktopWeb = Platform.OS === 'web' && width > 500;

  // On wide PC / desktop screens, size container proportionally to window height; on mobile, fill full viewport
  const containerWidth = isDesktopWeb
    ? Math.min(480, Math.round(height * POSTER_RATIO))
    : '100%';

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="light" />

      {/* Luxury Studio Ambient Gradient Backdrop */}
      <LinearGradient
        colors={['#05040A', '#140F04', '#05040A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Immediate Brand Fallback while background poster loads */}
      {!imageLoaded && (
        <View style={styles.loadingFallback}>
          <Image
            source={require('../assets/images/cassate_logo.png')}
            style={styles.fallbackLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FACC15" style={{ marginTop: 24 }} />
          <Text style={styles.fallbackText}>Loading Cassate Band Recordz...</Text>
        </View>
      )}

      {/* Main Banner Container */}
      <View
        style={[
          styles.posterContainer,
          isDesktopWeb && styles.desktopPosterContainer,
          {
            width: containerWidth,
            height: '100%',
          },
        ]}
      >
        <ImageBackground
          source={require('../assets/images/welcome_poster.png')}
          style={styles.posterImage}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
        >
          {/* Entire professional banner is an interactive touch surface to enter studio */}
          <TouchableOpacity
            style={styles.fullScreenTouch}
            onPress={handleEnterApp}
            activeOpacity={0.96}
            accessibilityRole="button"
            accessibilityLabel="Get Started - Enter Cassate Band Recordz"
          >
            {/* Bottom hotspot matching the Get Started button area on the banner */}
            <View style={styles.getStartedHotspot} />
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#05040A',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  loadingFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05040A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  fallbackLogo: {
    width: 210,
    height: 72,
  },
  fallbackText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  posterContainer: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#05040A',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopPosterContainer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fullScreenTouch: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  getStartedHotspot: {
    width: '84%',
    height: 54,
    marginBottom: Platform.OS === 'android' ? 36 : 28,
  },
});
