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
  const posterScaleAnim = useRef(new Animated.Value(1.02)).current;

  // Draggable clap icon slider values
  const swipePan = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState<number>(width * 0.64);
  const isEnteringRef = useRef(false);

  // Medium increased size clap icon dimensions
  const thumbWidth = 68;
  const maxDrag = Math.max(70, trackWidth - thumbWidth);

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

    // 2. Smooth "swap style" transition from loading animation to Get Started poster (~1.25s)
    const swapTimer = setTimeout(() => {
      Animated.timing(loadingFadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setPhase('poster');
        Animated.parallel([
          Animated.timing(posterFadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(posterScaleAnim, {
            toValue: 1,
            duration: 350,
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
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;

    // Smoothly slide clap icon to the end point (arrow) and transition into Home
    Animated.timing(swipePan, {
      toValue: maxDrag,
      duration: 170,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    });
  };

  // PanResponder to make ONLY the Clap Icon act as an interactive slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 3,
      onPanResponderMove: (_, gestureState) => {
        if (isEnteringRef.current) return;
        const newX = Math.min(maxDrag, Math.max(0, gestureState.dx));
        swipePan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isEnteringRef.current) return;

        // If dragged more than 40% of the track OR swiped quickly to the right -> enter studio!
        if (gestureState.dx > maxDrag * 0.4 || gestureState.vx > 0.7) {
          handleEnterHome();
        } else {
          // Spring back smoothly to the starting clap box
          Animated.spring(swipePan, {
            toValue: 0,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar style={phase === 'loading' ? 'dark' : 'light'} />

      {/* ── PHASE 1: ANIMATED BRAND LOADING SCREEN ── */}
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

      {/* ── PHASE 2: ANDROID FULL-FIT BANNER WITH PROPER CLAP ICON SLIDER ── */}
      {phase === 'poster' && (
        <Animated.View
          style={[
            styles.posterContainer,
            {
              opacity: posterFadeAnim,
              transform: [{ scale: posterScaleAnim }],
            },
          ]}
        >
          {/* Full-bleed edge-to-edge Android-optimized banner (zero side crop, zero letterboxing) */}
          <ImageBackground
            source={require('../assets/images/get_started_android_banner.jpg')}
            style={styles.posterBg}
            resizeMode="cover"
          >
            {/* Full-screen tap fallback */}
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={handleEnterHome}
              activeOpacity={1}
            />

            {/* ── INTERACTIVE CLAP ICON SLIDER (Aligned precisely over banner button) ── */}
            <View
              style={styles.sliderHotspot}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setTrackWidth(w);
              }}
            >
              <TouchableOpacity
                style={styles.sliderInteractiveTrack}
                onPress={handleEnterHome}
                activeOpacity={0.96}
              >
                {/* ── MEDIUM INCREASED SIZE CLAP ICON (SLIDER THUMB) ── */}
                <Animated.View
                  style={[
                    styles.clapThumbContainer,
                    { transform: [{ translateX: swipePan }] },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Image
                    source={require('../assets/images/clip_box_thumb.png')}
                    style={styles.clapThumbImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
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

  // ── Phase 2: Android Full-Fit Poster & Slider Styles ──
  posterContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#07070A',
    zIndex: 5,
    width: '100%',
    height: '100%',
  },
  posterBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  // Precisely covers the button area in the banner (66% from top, 62% width)
  sliderHotspot: {
    position: 'absolute',
    top: '65.8%',
    left: '19%',
    right: '19%',
    height: 62,
    zIndex: 20,
    justifyContent: 'center',
  },
  sliderInteractiveTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // 100% transparent: leaves the banner's own slider board & end point pristine!
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Proper medium increased size clap icon handle
  clapThumbContainer: {
    position: 'absolute',
    left: -4,
    width: 72,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 12,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  clapThumbImage: {
    width: 70,
    height: 60,
  },
});
