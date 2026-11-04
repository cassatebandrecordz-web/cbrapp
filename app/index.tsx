import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function InitialEntranceScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Phase 1: 'loading', Phase 2: 'poster'
  const [phase, setPhase] = useState<'loading' | 'poster'>('loading');

  // Loading animation values
  const loadingFadeAnim = useRef(new Animated.Value(1)).current;
  const loadingScaleAnim = useRef(new Animated.Value(0.96)).current;
  const pulseRingAnim = useRef(new Animated.Value(0.35)).current;

  // Poster swap animation values
  const posterFadeAnim = useRef(new Animated.Value(0)).current;
  const posterScaleAnim = useRef(new Animated.Value(1.03)).current;

  // Subtle tap feedback animation for the poster CTA
  const tapScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Loading pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseRingAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // Subtle scale in of loading brand card
    Animated.spring(loadingScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 65,
      useNativeDriver: true,
    }).start();

    // 2. Smooth "swap style" transition from loading animation to Get Started poster (~1.2s)
    const swapTimer = setTimeout(() => {
      Animated.timing(loadingFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPhase('poster');
        Animated.parallel([
          Animated.timing(posterFadeAnim, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.timing(posterScaleAnim, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 1250);

    return () => {
      clearTimeout(swapTimer);
      pulseLoop.stop();
    };
  }, []);

  const handleEnterHome = () => {
    Animated.sequence([
      Animated.timing(tapScaleAnim, {
        toValue: 0.98,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/(tabs)');
    });
  };

  // Swipe gesture responder: Allows swiping right or up to Get Started ("swap/swipe style")
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect horizontal swipe right OR vertical swipe up
        return gestureState.dx > 20 || gestureState.dy < -20;
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped right by > 40px or swiped up by > 40px, or a clean tap
        if (gestureState.dx > 40 || gestureState.dy < -40 || (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10)) {
          handleEnterHome();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar style={phase === 'loading' ? 'dark' : 'light'} />

      {/* ── PHASE 1: ANIMATED LOADING SCREEN ── */}
      {phase === 'loading' && (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingFadeAnim,
              transform: [{ scale: loadingScaleAnim }],
            },
          ]}
        >
          <View style={styles.loadingBrandBox}>
            <Image
              source={require('../assets/images/cassate_logo.png')}
              style={styles.loadingLogo}
              resizeMode="contain"
            />

            <View style={styles.loadingIndicatorRow}>
              <Animated.View style={[styles.pulseRing, { opacity: pulseRingAnim }]} />
              <View style={styles.innerDot} />
              <Text style={styles.loadingBrandText}>CASSATE BAND RECORDZ</Text>
            </View>

            <Text style={styles.loadingTagline}>POST PRODUCTION STUDIO</Text>
          </View>
        </Animated.View>
      )}

      {/* ── PHASE 2: SWAP STYLE GET STARTED POSTER (100% CLEAN & BORDERLESS) ── */}
      {phase === 'poster' && (
        <Animated.View
          style={[
            styles.posterContainer,
            {
              opacity: posterFadeAnim,
              transform: [{ scale: posterScaleAnim }, { scale: tapScaleAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Full-bleed edge-to-edge poster with ZERO artificial buttons on top */}
          <ImageBackground
            source={require('../assets/images/get_started_poster.jpg')}
            style={styles.posterBg}
            resizeMode="cover"
          >
            {/* Full-screen touch surface: Tapping anywhere on the banner (or on the Get Started button) navigates into app */}
            <TouchableOpacity
              style={styles.fullScreenTouch}
              onPress={handleEnterHome}
              activeOpacity={0.97}
              accessibilityRole="button"
              accessibilityLabel="Get Started - Cassate Band Recordz"
            >
              {/* Invisible interactive hotspot aligned over the artwork's Get Started button */}
              <View style={styles.buttonHotspot} />
            </TouchableOpacity>
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  // ── Phase 1: Loading Screen Styles ──
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FBFCF8', // Pearl White canvas matching brand theme
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingBrandBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingLogo: {
    width: 230,
    height: 76,
    marginBottom: 20,
  },
  loadingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    position: 'relative',
  },
  pulseRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FDE047',
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CA8A04',
    position: 'absolute',
    left: 4,
  },
  loadingBrandText: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loadingTagline: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
  },

  // ── Phase 2: Borderless Poster Styles ──
  posterContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 5,
    width: '100%',
    height: '100%',
  },
  posterBg: {
    flex: 1,
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
  // Hotspot over the artwork's Get Started button
  buttonHotspot: {
    width: '85%',
    maxWidth: 360,
    height: 65,
    marginBottom: Platform.OS === 'android' ? 36 : 28,
    backgroundColor: 'transparent', // 100% transparent: leaves the poster artwork clean & pristine
  },
});
