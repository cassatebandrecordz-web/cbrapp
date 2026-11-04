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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InitialEntranceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Slider animation values
  const swipePan = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState<number>(Math.min(350, width - 40));
  const isEnteringRef = useRef(false);

  // Chevron pulse animation inside slider
  const chevronPulseAnim = useRef(new Animated.Value(0.4)).current;

  const thumbWidth = 62;
  const maxDrag = Math.max(80, trackWidth - thumbWidth - 8);

  useEffect(() => {
    // 1. Loading pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseRingAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // Chevron breathing animation
    const chevronLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(chevronPulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    chevronLoop.start();

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
      chevronLoop.stop();
    };
  }, []);

  const handleEnterHome = () => {
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;

    // Animate thumb smoothly to the end if not already there
    Animated.timing(swipePan, {
      toValue: maxDrag,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      // Fade out and route to Home
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    });
  };

  // PanResponder to make the Clip Box work as an interactive slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 4,
      onPanResponderGrant: () => {
        // User touched clip box
      },
      onPanResponderMove: (_, gestureState) => {
        if (isEnteringRef.current) return;
        const newX = Math.min(maxDrag, Math.max(0, gestureState.dx));
        swipePan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isEnteringRef.current) return;

        // If dragged more than 45% of the track OR fast flick to the right -> complete slide & enter!
        if (gestureState.dx > maxDrag * 0.45 || gestureState.vx > 0.8) {
          handleEnterHome();
        } else {
          // Spring back smoothly to start
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

  // Text opacity interpolation: Fades out as clip box slides over it
  const textOpacity = swipePan.interpolate({
    inputRange: [0, maxDrag * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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

      {/* ── PHASE 2: SWAP STYLE GET STARTED SCREEN WITH WORKING CLIP BOX SLIDER ── */}
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
          {/* Full-bleed edge-to-edge backdrop with zero borders */}
          <ImageBackground
            source={require('../assets/images/get_started_backdrop.jpg')}
            style={styles.posterBg}
            resizeMode="cover"
          >
            {/* ── WORKING CLIP BOX SLIDER BUTTON ── */}
            <View
              style={[
                styles.sliderWrapper,
                { paddingBottom: Math.max(insets.bottom, 24) + 16 },
              ]}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setTrackWidth(w);
              }}
            >
              <TouchableOpacity
                style={styles.sliderTrack}
                onPress={handleEnterHome}
                activeOpacity={0.95}
              >
                {/* Background Text & Chevrons */}
                <Animated.View style={[styles.trackContentRow, { opacity: textOpacity }]}>
                  <Text style={styles.trackText}>Get Started</Text>
                  <Animated.View style={{ opacity: chevronPulseAnim, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="chevron-forward" size={16} color="#FACC15" />
                    <Ionicons name="chevron-forward" size={16} color="#CA8A04" style={{ marginLeft: -8 }} />
                  </Animated.View>
                </Animated.View>

                {/* Right Arrow End Badge */}
                <View style={styles.arrowEndBadge}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>

                {/* ── DRAGGABLE CLIP BOX (SLIDER THUMB) ── */}
                <Animated.View
                  style={[
                    styles.clipBoxThumb,
                    { transform: [{ translateX: swipePan }] },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Image
                    source={require('../assets/images/clip_box_thumb.png')}
                    style={styles.clipThumbImage}
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

  // ── Phase 2: Poster & Working Clip Box Slider Styles ──
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
  sliderWrapper: {
    width: '88%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(12, 12, 16, 0.94)',
    borderWidth: 2,
    borderColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  trackContentRow: {
    position: 'absolute',
    left: 0,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingLeft: 36,
  },
  trackText: {
    color: '#FACC15',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  arrowEndBadge: {
    position: 'absolute',
    right: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E24',
    borderWidth: 1.2,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipBoxThumb: {
    width: 62,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  clipThumbImage: {
    width: 60,
    height: 50,
  },
});
