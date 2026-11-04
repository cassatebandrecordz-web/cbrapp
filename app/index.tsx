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

  // State to clean up loading layer after smooth fade-out
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  // Loading animation values
  const loadingFadeAnim = useRef(new Animated.Value(1)).current;
  const loadingScaleAnim = useRef(new Animated.Value(0.96)).current;
  const pulseRingAnim = useRef(new Animated.Value(0.35)).current;

  // Poster transition values
  const posterFadeAnim = useRef(new Animated.Value(1)).current;

  // Draggable clap icon slider values
  const swipePan = useRef(new Animated.Value(0)).current;
  const isEnteringRef = useRef(false);

  // Calculated dimensions (stable across renders, avoids onLayout jitter)
  const trackWidth = Math.min(270, Math.round(width * 0.60));
  const thumbWidth = 70;
  const maxDrag = Math.max(65, trackWidth - thumbWidth + 8);

  useEffect(() => {
    // 1. Loading pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseRingAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // Gentle scale in of loading brand box
    Animated.spring(loadingScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 65,
      useNativeDriver: true,
    }).start();

    // 2. Smooth zero-glitch transition (~1.25s): Loading layer smoothly fades out to reveal pre-warmed poster
    const swapTimer = setTimeout(() => {
      Animated.timing(loadingFadeAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }).start(() => {
        setLoadingComplete(true);
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

    // Smooth slide of clap thumb to the arrow end point
    Animated.timing(swipePan, {
      toValue: maxDrag,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      // Smooth fade into tabs
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    });
  };

  // PanResponder for the Clap Icon: Supports smooth slide AND instant tap without any glitch
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
      onPanResponderMove: (_, gestureState) => {
        if (isEnteringRef.current) return;
        const newX = Math.min(maxDrag, Math.max(0, gestureState.dx));
        swipePan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isEnteringRef.current) return;

        // Tap detected (minimal movement) OR slide detected (dragged past 35% or flicked)
        const isTap = Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8;
        const isSlide = gestureState.dx > maxDrag * 0.35 || gestureState.vx > 0.6;

        if (isTap || isSlide) {
          handleEnterHome();
        } else {
          // Spring back smoothly to the starting clap box position
          Animated.spring(swipePan, {
            toValue: 0,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── PHASE 2: ANDROID FULL-FIT POSTER SCREEN (Always mounted underneath for zero image decode flash) ── */}
      <Animated.View
        style={[
          styles.posterContainer,
          { opacity: posterFadeAnim },
        ]}
      >
        <ImageBackground
          source={require('../assets/images/get_started_android_banner.jpg')}
          style={styles.posterBg}
          resizeMode="cover"
        >
          {/* Full-screen tap surface outside the slider */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={handleEnterHome}
            activeOpacity={1}
          />

          {/* ── INTERACTIVE CLAP ICON SLIDER (Aligned precisely over banner button) ── */}
          <View
            style={[
              styles.sliderHotspot,
              { width: trackWidth },
            ]}
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

      {/* ── PHASE 1: BRAND LOADING SCREEN (Overlays poster and smoothly dissolves away) ── */}
      {!loadingComplete && (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingFadeAnim,
              transform: [{ scale: loadingScaleAnim }],
            },
          ]}
          pointerEvents={loadingComplete ? 'none' : 'auto'}
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

  // ── Phase 1: Loading Screen Styles (Overlays Phase 2 smoothly) ──
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FBFCF8', // Pearl White canvas matching brand theme
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
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
    zIndex: 10,
    width: '100%',
    height: '100%',
  },
  posterBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  // Precisely covers the button area in the banner (66.2% from top, centered)
  sliderHotspot: {
    position: 'absolute',
    top: '65.8%',
    alignSelf: 'center',
    height: 62,
    zIndex: 25,
    justifyContent: 'center',
  },
  sliderInteractiveTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // 100% transparent: leaves banner's own slider board & end point pristine
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Medium increased size clap icon handle
  clapThumbContainer: {
    position: 'absolute',
    left: -4,
    width: 72,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 35,
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
