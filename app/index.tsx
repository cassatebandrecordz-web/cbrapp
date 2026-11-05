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
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function InitialEntranceScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Clean up intro animation layer after fade-out
  const [introComplete, setIntroComplete] = useState<boolean>(false);

  // ── Cinematic Animated Logo Opening Values ──
  const introFadeAnim = useRef(new Animated.Value(1)).current;
  const introScaleAnim = useRef(new Animated.Value(1)).current;

  // Logo Scale & Pulse Animations (useNativeDriver: true)
  const logoScaleAnim = useRef(new Animated.Value(0.7)).current;
  const logoPulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRingScaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseRingOpacityAnim = useRef(new Animated.Value(0.35)).current;

  // Poster transition values
  const posterFadeAnim = useRef(new Animated.Value(1)).current;

  // Interactive Slider values
  const swipePan = useRef(new Animated.Value(0)).current;
  const buttonPressScale = useRef(new Animated.Value(1)).current;
  const chevronPulseAnim = useRef(new Animated.Value(0.35)).current;
  const isEnteringRef = useRef(false);

  // Dynamic track width and drag distance calculation
  const trackWidth = Math.min(310, Math.round(width * 0.76));
  const thumbWidth = 56;
  const maxDrag = Math.max(80, trackWidth - thumbWidth - 10);
  const maxDragRef = useRef(maxDrag);
  maxDragRef.current = maxDrag;

  useEffect(() => {
    // 1. Logo Scale-in on Open
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 65,
      useNativeDriver: true,
    }).start();

    // 2. Continuous Golden Breathing Pulse on Logo
    const logoPulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulseAnim, { toValue: 1.05, duration: 750, useNativeDriver: true }),
        Animated.timing(logoPulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true }),
      ])
    );
    logoPulseLoop.start();

    // 3. Glowing Sonic Aura Rings expanding from behind the logo
    const ringLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRingOpacityAnim, { toValue: 0.85, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseRingOpacityAnim, { toValue: 0.2, duration: 650, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseRingScaleAnim, { toValue: 1.25, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseRingScaleAnim, { toValue: 0.85, duration: 650, useNativeDriver: true }),
        ]),
      ])
    );
    ringLoop.start();

    // 4. Chevrons Breathing in Get Started Slider
    const chevronLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(chevronPulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ])
    );
    chevronLoop.start();

    // 5. Smooth auto-transition into Poster Screen after 1.25s
    const timer = setTimeout(() => {
      dissolveIntro();
    }, 1250);

    return () => {
      clearTimeout(timer);
      logoPulseLoop.stop();
      ringLoop.stop();
      chevronLoop.stop();
    };
  }, []);

  const dissolveIntro = () => {
    Animated.parallel([
      Animated.timing(introFadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(introScaleAnim, {
        toValue: 1.04,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIntroComplete(true);
    });
  };

  // Navigates smoothly to login: slides thumb across and fades into /login
  const handleEnterHome = () => {
    if (isEnteringRef.current) return;
    isEnteringRef.current = true;

    // Slide clapperboard thumb smoothly to arrow end
    Animated.timing(swipePan, {
      toValue: maxDragRef.current,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      // Fade out entrance screen and route to /login
      Animated.timing(posterFadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/login');
      });
    });
  };

  // Bulletproof PanResponder attached to the interactive slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 3,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dx) > 3,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        Animated.spring(buttonPressScale, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isEnteringRef.current) return;
        const limit = maxDragRef.current;
        const newX = Math.min(limit, Math.max(0, gestureState.dx));
        swipePan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(buttonPressScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        if (isEnteringRef.current) return;

        // User tapped the button (dx < 10) OR slid > 25% of track OR flicked fast to the right
        const isTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
        const isSlide = gestureState.dx > maxDragRef.current * 0.25 || gestureState.vx > 0.4;

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
        Animated.spring(buttonPressScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

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

  // Text fades out as thumb slides across
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
          {/* Full-screen tap surface outside the slider for instant access */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={handleEnterHome}
            activeOpacity={1}
          />

          {/* ── INTERACTIVE GET STARTED SLIDER & BUTTON ── */}
          {/* Solid capsule perfectly centered at 71.1% of height over banner button */}
          <Animated.View
            style={[
              styles.sliderHotspot,
              {
                width: trackWidth,
                transform: [{ translateY: -29 }, { scale: buttonPressScale }],
              },
            ]}
            {...panResponder.panHandlers}
          >
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
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      {/* ── PHASE 1: ANIMATED STUDIO LOGO ON OPEN (Replaces Black Logo) ── */}
      {!introComplete && (
        <Animated.View
          style={[
            styles.introContainer,
            {
              opacity: introFadeAnim,
              transform: [{ scale: introScaleAnim }],
            },
          ]}
          pointerEvents={introComplete ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={styles.introContent}
            onPress={dissolveIntro}
            activeOpacity={0.98}
          >
            {/* Glowing Golden Sonic Rings behind the Logo */}
            <View style={styles.logoAnchor}>
              <Animated.View
                style={[
                  styles.sonicPulseRingOuter,
                  {
                    opacity: pulseRingOpacityAnim,
                    transform: [{ scale: pulseRingScaleAnim }],
                  },
                ]}
              />
              <View style={styles.sonicPulseRingInner} />

              {/* ── ANIMATED GOLDEN STUDIO EMBLEM ── */}
              <Animated.View
                style={[
                  styles.logoEmblemContainer,
                  {
                    transform: [
                      { scale: Animated.multiply(logoScaleAnim, logoPulseAnim) },
                    ],
                  },
                ]}
              >
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.logoEmblemImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            {/* Glowing Studio Typography */}
            <Text style={styles.introTitle}>CBR STUDIO</Text>

            <View style={styles.introDividerRow}>
              <View style={styles.introDividerLine} />
              <Ionicons name="mic" size={13} color="#FACC15" />
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

  // ── Phase 1: Animated Logo Opening Styles (Obsidian & Gold) ──
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
  logoAnchor: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  sonicPulseRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(250, 204, 21, 0.45)',
    backgroundColor: 'rgba(250, 204, 21, 0.06)',
  },
  sonicPulseRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(250, 204, 21, 0.35)',
  },
  logoEmblemContainer: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: '#12121A',
    borderWidth: 2,
    borderColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 14,
    overflow: 'hidden',
  },
  logoEmblemImage: {
    width: 104,
    height: 104,
    borderRadius: 20,
  },
  introTitle: {
    color: '#FACC15',
    fontSize: 25,
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
    width: 40,
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
    paddingVertical: 5,
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
    height: 58,
    zIndex: 30,
    elevation: 16,
    maxWidth: 320,
  },
  sliderCapsuleTrack: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#141208',
    borderWidth: 2,
    borderColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 14,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
