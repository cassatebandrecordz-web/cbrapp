import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  PanResponder,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function InitialEntranceScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // State to clean up intro animation layer after smooth fade-out
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  // Cinematic Intro Animation Values
  const loadingFadeAnim = useRef(new Animated.Value(1)).current;
  const loadingScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseRingAnim = useRef(new Animated.Value(0.4)).current;
  const pulseRingScaleAnim = useRef(new Animated.Value(0.85)).current;

  // 7-Bar Golden Equalizer Animation Values
  const barHeights = useRef([
    new Animated.Value(14),
    new Animated.Value(24),
    new Animated.Value(12),
    new Animated.Value(34),
    new Animated.Value(18),
    new Animated.Value(28),
    new Animated.Value(16),
  ]).current;

  // Poster transition values
  const posterFadeAnim = useRef(new Animated.Value(1)).current;

  // Interactive Clapperboard Slider Values
  const swipePan = useRef(new Animated.Value(0)).current;
  const isEnteringRef = useRef(false);

  // Chevron breathing pulse
  const chevronPulseAnim = useRef(new Animated.Value(0.35)).current;

  // Slider layout dimensions
  const [measuredTrackWidth, setMeasuredTrackWidth] = useState<number>(0);
  const trackWidth = measuredTrackWidth || Math.min(300, Math.round(width * 0.74));
  const thumbWidth = 56;
  const maxDrag = Math.max(70, trackWidth - thumbWidth - 10);

  useEffect(() => {
    // 1. Equalizer Bars Rhythmic Studio Animation
    const animateBar = (val: Animated.Value, minH: number, maxH: number, dur: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: maxH, duration: dur, useNativeDriver: false }),
          Animated.timing(val, { toValue: minH, duration: dur * 0.85, useNativeDriver: false }),
        ])
      );
    };

    const loops = [
      animateBar(barHeights[0], 10, 28, 380),
      animateBar(barHeights[1], 16, 44, 460),
      animateBar(barHeights[2], 12, 32, 340),
      animateBar(barHeights[3], 20, 52, 520),
      animateBar(barHeights[4], 14, 38, 410),
      animateBar(barHeights[5], 18, 46, 470),
      animateBar(barHeights[6], 10, 26, 360),
    ];
    loops.forEach((l) => l.start());

    // 2. Golden Sonic Pulse Rings
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRingAnim, { toValue: 0.9, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseRingAnim, { toValue: 0.25, duration: 650, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseRingScaleAnim, { toValue: 1.15, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseRingScaleAnim, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        ]),
      ])
    );
    pulseLoop.start();

    // 3. Chevron Breathing in Slider
    const chevronLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(chevronPulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ])
    );
    chevronLoop.start();

    // 4. Smooth auto-transition into Poster Screen (1.1s duration, zero black logo)
    const timer = setTimeout(() => {
      dissolveIntro();
    }, 1150);

    return () => {
      clearTimeout(timer);
      loops.forEach((l) => l.stop());
      pulseLoop.stop();
      chevronLoop.stop();
    };
  }, []);

  const dissolveIntro = () => {
    Animated.parallel([
      Animated.timing(loadingFadeAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(loadingScaleAnim, {
        toValue: 1.05,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLoadingComplete(true);
    });
  };

  // Navigates smoothly to login: slides thumb across and fades into /login
  const handleEnterHome = () => {
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;

    Animated.timing(swipePan, {
      toValue: maxDrag,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/login');
      });
    });
  };

  // Bulletproof PanResponder attached to the entire interactive slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dx) > 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        // Instant visual acknowledgment
      },
      onPanResponderMove: (_, gestureState) => {
        if (isEnteringRef.current) return;
        const newX = Math.min(maxDrag, Math.max(0, gestureState.dx));
        swipePan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isEnteringRef.current) return;

        // User tapped the slider OR slid > 25% of track OR flicked fast to the right
        const isTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
        const isSlide = gestureState.dx > maxDrag * 0.28 || gestureState.vx > 0.45;

        if (isTap || isSlide) {
          handleEnterHome();
        } else {
          // Spring back smoothly to start position
          Animated.spring(swipePan, {
            toValue: 0,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        if (!isEnteringRef.current) {
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

  // Text fades out smoothly as thumb slides across
  const labelOpacity = swipePan.interpolate({
    inputRange: [0, Math.max(1, maxDrag * 0.45), maxDrag],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── PHASE 2: ANDROID FULL-FIT POSTER SCREEN ── */}
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
          {/* ── NATIVE INTERACTIVE CLAPPERBOARD SLIDER ── */}
          {/* Positioned precisely at 71.1% of height where the button sits in the banner */}
          <View
            style={[
              styles.sliderHotspot,
              { width: trackWidth },
            ]}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 120 && w !== measuredTrackWidth) {
                setMeasuredTrackWidth(w);
              }
            }}
            {...panResponder.panHandlers}
          >
            {/* Glowing Golden Capsule Track */}
            <View style={styles.sliderCapsuleTrack}>
              {/* Background Text & Pulsing Chevrons */}
              <Animated.View style={[styles.sliderLabelRow, { opacity: labelOpacity }]}>
                <Text style={styles.sliderLabelText}>Get Started</Text>
                <Animated.View
                  style={{
                    opacity: chevronPulseAnim,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 4,
                  }}
                >
                  <Ionicons name="chevron-forward" size={15} color="#FACC15" />
                  <Ionicons name="chevron-forward" size={15} color="#EAB308" style={{ marginLeft: -8 }} />
                  <Ionicons name="chevron-forward" size={15} color="#CA8A04" style={{ marginLeft: -8 }} />
                </Animated.View>
              </Animated.View>

              {/* End Arrow Badge */}
              <View style={styles.sliderArrowEndBadge}>
                <Ionicons name="arrow-forward" size={18} color="#000000" />
              </View>

              {/* ── DRAGGABLE CLAPPERBOARD THUMB ── */}
              <Animated.View
                style={[
                  styles.clapThumbContainer,
                  { transform: [{ translateX: swipePan }] },
                ]}
              >
                <Image
                  source={require('../assets/images/clip_box_thumb.png')}
                  style={styles.clapThumbImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      {/* ── PHASE 1: CINEMATIC STUDIO INTRO ANIMATION (Replaces Black Logo) ── */}
      {!loadingComplete && (
        <Animated.View
          style={[
            styles.introContainer,
            {
              opacity: loadingFadeAnim,
              transform: [{ scale: loadingScaleAnim }],
            },
          ]}
          pointerEvents={loadingComplete ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={styles.introContent}
            onPress={dissolveIntro}
            activeOpacity={0.98}
          >
            {/* Pulsing Concentric Golden Glow Rings */}
            <View style={styles.visualizerGlowAnchor}>
              <Animated.View
                style={[
                  styles.sonicPulseRingOuter,
                  {
                    opacity: pulseRingAnim,
                    transform: [{ scale: pulseRingScaleAnim }],
                  },
                ]}
              />
              <View style={styles.sonicPulseRingInner} />

              {/* 7-Bar Golden Equalizer Waves */}
              <View style={styles.equalizerRow}>
                {barHeights.map((hAnim, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.equalizerBar,
                      {
                        height: hAnim,
                        backgroundColor:
                          idx === 3
                            ? '#FEF08A'
                            : idx === 1 || idx === 5
                            ? '#FACC15'
                            : '#EAB308',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Glowing Studio Typography */}
            <Text style={styles.introTitle}>CBR STUDIO</Text>

            <View style={styles.introDividerRow}>
              <View style={styles.introDividerLine} />
              <Ionicons name="mic" size={12} color="#FACC15" />
              <View style={styles.introDividerLine} />
            </View>

            <Text style={styles.introSubtitle}>POST PRODUCTION STUDIO</Text>

            <View style={styles.introStatusPill}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.introStatusText}>STUDIO READY</Text>
            </View>
          </TouchableOpacity>
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

  // ── Phase 1: Cinematic Studio Intro Styles (Obsidian & Gold) ──
  introContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#09090E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  introContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  visualizerGlowAnchor: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  sonicPulseRingOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(250, 204, 21, 0.45)',
    backgroundColor: 'rgba(250, 204, 21, 0.05)',
  },
  sonicPulseRingInner: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 60,
  },
  equalizerBar: {
    width: 6,
    borderRadius: 3,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  introTitle: {
    color: '#FACC15',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(250, 204, 21, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    marginBottom: 8,
  },
  introDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  introDividerLine: {
    width: 36,
    height: 1,
    backgroundColor: 'rgba(250, 204, 21, 0.4)',
  },
  introSubtitle: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 18,
  },
  introStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  introStatusText: {
    color: '#FACC15',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // ── Phase 2: Android Full-Fit Poster & Working Slider Styles ──
  posterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  // Centered precisely over button at 71.1% of viewport height
  sliderHotspot: {
    position: 'absolute',
    top: '71.1%',
    alignSelf: 'center',
    height: 56,
    marginTop: -28, // Perfectly centers 56px height at 71.1%
    zIndex: 30,
    elevation: 16,
    maxWidth: 320,
  },
  sliderCapsuleTrack: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#121008',
    borderWidth: 2,
    borderColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 12,
  },
  sliderLabelRow: {
    position: 'absolute',
    left: 56,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLabelText: {
    color: '#FACC15',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  sliderArrowEndBadge: {
    position: 'absolute',
    right: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  clapThumbContainer: {
    position: 'absolute',
    left: 3,
    width: 58,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    elevation: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  clapThumbImage: {
    width: 56,
    height: 48,
  },
});
