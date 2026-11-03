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
import { soundEffects } from '../src/utils/soundEffects';

export default function GetStartedScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleEnterApp = () => {
    soundEffects.playGetStarted();
    router.replace('/(tabs)');
  };

  // On wide desktop screens, constrain to exact same mobile width (440px) as Home page; on mobile, fill full screen
  const isDesktopWeb = Platform.OS === 'web' && width > 460;
  const containerWidth = isDesktopWeb ? Math.min(440, height * (577 / 1024)) : '100%';

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="light" />

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

      <View
        style={[
          styles.posterContainer,
          {
            width: containerWidth,
            height: '100%',
          },
        ]}
      >
        <ImageBackground
          source={require('../assets/images/welcome_poster.png')}
          style={styles.posterImage}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        >
          {/* Entire poster can be tapped to enter app */}
          <TouchableOpacity
            style={styles.fullScreenTouch}
            onPress={handleEnterApp}
            activeOpacity={0.9}
          >
            {/* Direct golden CTA button at the bottom */}
            <View style={styles.buttonOverlay}>
              <TouchableOpacity
                style={styles.enterButton}
                onPress={handleEnterApp}
                activeOpacity={0.8}
              >
                <Text style={styles.enterButtonText}>ENTER STUDIO ➔</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0A0813',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0813',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fallbackLogo: {
    width: 200,
    height: 70,
  },
  fallbackText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    letterSpacing: 0.5,
  },
  posterContainer: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A0813',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenTouch: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  buttonOverlay: {
    width: '85%',
    alignSelf: 'center',
    marginBottom: Platform.OS === 'android' ? 44 : 36,
  },
  enterButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  enterButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
