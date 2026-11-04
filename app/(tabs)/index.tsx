import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Alert,
  PanResponder,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { soundEffects } from '../../src/utils/soundEffects';

// ── Carousel Banner Slides (Auto-moving every 3.5s) ──
const BANNER_SLIDES = [
  {
    id: 'mega_offer_above_2k',
    badge: '🔥 MEGA OFFER • 10% OFF',
    titleWhite: 'Book Above ₹2,000 &',
    titleGold: 'GET 10% OFF',
    description: 'Flat 10% Discount Across All Studio Services',
    ctaText: 'Claim 10% Offer →',
    serviceId: 'dubbing',
    serviceName: 'Dubbing Studio',
    studioName: 'Dubbing Studio',
    image: require('../../assets/images/hero_studio.jpg'),
    isLive: true,
  },
  {
    id: 'dubbing',
    badge: 'Live Now • Dubbing Suite',
    titleWhite: 'Professional',
    titleGold: 'Dubbing Studio',
    description: 'Acoustically Treated Vocal Booth & Neumann Mics',
    ctaText: 'Book Dubbing Now →',
    serviceId: 'dubbing',
    serviceName: 'Dubbing Studio',
    studioName: 'Dubbing Studio',
    image: require('../../assets/images/services/dubbing.jpg'),
    isLive: true,
  },
  {
    id: 'music',
    badge: 'Coming Soon • Studio Special',
    titleWhite: 'Original Music',
    titleGold: '& Sound Design',
    description: 'Cinematic Compositions & Surround Sound Stems',
    ctaText: 'Coming Soon • Book Dubbing →',
    serviceId: 'score',
    serviceName: 'Music Production',
    studioName: 'Studio B',
    image: require('../../assets/images/services/score.jpg'),
    isLive: false,
  },
  {
    id: 'di',
    badge: 'Coming Soon • 4K Master Suite',
    titleWhite: 'Cinematic DI &',
    titleGold: 'Color Grading',
    description: 'DaVinci Resolve Studio & Commercial Finishing',
    ctaText: 'Coming Soon • Book Dubbing →',
    serviceId: 'color',
    serviceName: 'DI (Color Grading)',
    studioName: 'Suite D',
    image: require('../../assets/images/services/color_grading.jpg'),
    isLive: false,
  },
];

// ── Audio Services (4 Cards) ──
const AUDIO_SERVICES = [
  {
    id: 'dubbing',
    title: 'Dubbing',
    icon: 'mic' as const,
    serviceName: 'Dubbing Studio',
    studioName: 'Dubbing Studio',
    isLive: true,
  },
  {
    id: 'music',
    title: 'Music\nProduction',
    icon: 'musical-notes' as const,
    serviceName: 'Music Production',
    studioName: 'Studio B',
    isLive: false,
  },
  {
    id: 'sfx',
    title: 'Sound\nEffects',
    icon: 'pulse' as const,
    serviceName: 'Sound Effects & Foley',
    studioName: 'Suite C',
    isLive: false,
  },
  {
    id: 'mixing',
    title: 'Mixing',
    icon: 'options' as const,
    serviceName: 'Surround Mixing Stage',
    studioName: 'Studio M',
    isLive: false,
  },
];

// ── Video Services (3 Cards) ──
const VIDEO_SERVICES = [
  {
    id: 'edit',
    title: 'Video\nEditing',
    icon: 'cut' as const,
    serviceName: 'Video Editing Suite',
    studioName: 'Suite E',
    isLive: false,
  },
  {
    id: 'di',
    title: 'DI Color\nGrading',
    icon: 'color-filter' as const,
    serviceName: 'DI (Color Grading)',
    studioName: 'Suite D',
    isLive: false,
  },
  {
    id: 'vfx',
    title: 'VFX &\nAnimation',
    icon: 'sparkles' as const,
    serviceName: 'VFX Compositing',
    studioName: 'Suite V',
    isLive: false,
  },
];

// ── Additional Services (3 Cards) ──
const ADDITIONAL_SERVICES = [
  {
    id: 'poster',
    title: 'Poster\nDesign',
    icon: 'color-palette' as const,
    serviceName: 'Poster Design Studio',
    studioName: 'Suite P',
    isLive: false,
  },
  {
    id: 'subtitles',
    title: 'Subtitles\n& CC',
    icon: 'chatbubble-ellipses' as const,
    serviceName: 'Subtitles & Localization',
    studioName: 'Suite S',
    isLive: false,
  },
  {
    id: 'ai_works',
    title: 'AI Audio\nWorks',
    icon: 'hardware-chip' as const,
    serviceName: 'AI Creative Works & Audio',
    studioName: 'AI Studio Lab',
    isLive: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { updateBookingDraft } = useApp();

  // Carousel State & Animations
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideFadeAnim = useRef(new Animated.Value(1)).current;

  // Active touch feedback state
  const [pressedServiceId, setPressedServiceId] = useState<string | null>(null);

  // Auto-scroll banner automatically every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goToNextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [currentSlideIndex]);

  const goToNextSlide = () => {
    Animated.sequence([
      Animated.timing(slideFadeAnim, { toValue: 0.25, duration: 160, useNativeDriver: true }),
      Animated.timing(slideFadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
    setCurrentSlideIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const goToPrevSlide = () => {
    Animated.sequence([
      Animated.timing(slideFadeAnim, { toValue: 0.25, duration: 160, useNativeDriver: true }),
      Animated.timing(slideFadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
    setCurrentSlideIndex((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1));
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlideIndex) return;
    soundEffects.playClick(900, 0.03, 'sine');
    Animated.sequence([
      Animated.timing(slideFadeAnim, { toValue: 0.25, duration: 160, useNativeDriver: true }),
      Animated.timing(slideFadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
    setCurrentSlideIndex(idx);
  };

  // Manual swipe gestures (swiping left / right changes slide manually)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 14;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 35) {
          soundEffects.playClick(850, 0.03, 'sine');
          goToPrevSlide();
        } else if (gestureState.dx < -35) {
          soundEffects.playClick(950, 0.03, 'sine');
          goToNextSlide();
        }
      },
    })
  ).current;

  // Direct Dubbing Booking Handler -> Opens Slot Booking Screen
  const handleBookDubbing = () => {
    soundEffects.playServiceClick();
    updateBookingDraft({
      serviceId: 'dubbing',
      serviceName: 'Dubbing Studio',
      studioId: 'studio-dubbing',
      studioName: 'Dubbing Studio',
      durationHours: 2,
    });
    router.push('/booking/select');
  };

  // Service Selection Handler
  // - Dubbing is ACTIVE -> routes directly to booking
  // - Music, SFX, Mixing, Edit, DI, VFX are COMING SOON -> prompts user
  const handleServiceSelect = (service: {
    id: string;
    title: string;
    serviceName: string;
    studioName: string;
    isLive?: boolean;
  }) => {
    soundEffects.playServiceClick();
    setPressedServiceId(service.id);
    setTimeout(() => {
      setPressedServiceId(null);
    }, 280);

    if (service.isLive || service.id === 'dubbing') {
      handleBookDubbing();
    } else {
      Alert.alert(
        `${service.title.replace('\n', ' ')} • Coming Soon`,
        `Our ${service.title.replace('\n', ' ')} suite is currently undergoing acoustic calibration & upgrades.\n\nCurrently, our Dubbing Studio is the only active reservation service!`,
        [
          {
            text: 'Book Dubbing Studio',
            onPress: handleBookDubbing,
          },
          { text: 'Got It', style: 'cancel' },
        ]
      );
    }
  };

  const activeSlide = BANNER_SLIDES[currentSlideIndex];
  const isDesktopWeb = Platform.OS === 'web' && width > 480;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Top Header Bar (Pearl White & Gold) ── */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={19} color="#111827" />
        </TouchableOpacity>

        {/* Cassate Band Recordz Gold Logo */}
        <View style={styles.headerCenteredLogo}>
          <Image
            source={require('../../assets/images/cassate_logo.png')}
            style={styles.headerLogoImg}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={18} color="#111827" />
          <View style={styles.notifBadgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktopWeb && styles.desktopScrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Promotional Auto-Moving Carousel Banner ── */}
        <View style={styles.bannerOuterWrapper}>
          <View style={styles.bannerContainer} {...panResponder.panHandlers}>
            <Animated.View style={[styles.bannerAnimatedView, { opacity: slideFadeAnim }]}>
              <ImageBackground
                source={activeSlide.image}
                style={styles.bannerBgImage}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(15,15,22,0.94)', 'rgba(25,25,35,0.78)', 'rgba(15,15,22,0.94)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bannerGradient}
                >
                  <View style={styles.bannerContentCol}>
                    {/* Ribbon Badge */}
                    <View
                      style={[
                        styles.ribbonBadge,
                        activeSlide.isLive ? styles.ribbonBadgeLive : styles.ribbonBadgeSoon,
                      ]}
                    >
                      <Text style={styles.ribbonBadgeText}>{activeSlide.badge}</Text>
                    </View>

                    {/* Heading */}
                    <View style={styles.bannerTitleRow}>
                      <Text style={styles.bannerTitleWhite}>{activeSlide.titleWhite} </Text>
                      <Text style={styles.bannerTitleGold}>{activeSlide.titleGold}</Text>
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.bannerSubtitle} numberOfLines={1}>{activeSlide.description}</Text>

                    {/* CTA Button */}
                    <TouchableOpacity
                      style={styles.bannerCtaBtn}
                      onPress={() =>
                        activeSlide.isLive
                          ? handleBookDubbing()
                          : handleServiceSelect({
                              id: activeSlide.serviceId,
                              title: activeSlide.serviceName,
                              serviceName: activeSlide.serviceName,
                              studioName: activeSlide.studioName,
                              isLive: false,
                            })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.bannerCtaBtnText}>{activeSlide.ctaText}</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Animated.View>
          </View>

          {/* 3 Dots Pagination Indicator */}
          <View style={styles.dotsRow}>
            {BANNER_SLIDES.map((_, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => goToSlide(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 2. Audio Services Section (Minimal Pearl White & Gold) ── */}
        <View style={styles.sectionBlock}>
          {/* Section Header with Pill & Extending Gold Line */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderPill}>
              <View style={styles.pillIconCircle}>
                <Ionicons name="headset" size={11} color="#000000" />
              </View>
              <Text style={styles.sectionHeaderTitle}>Audio Services</Text>
            </View>
            <View style={styles.sectionHeaderLine} />
          </View>

          {/* 4 Minimal White Square Cards in a Row */}
          <View style={styles.audioCardsRow}>
            {AUDIO_SERVICES.map((svc) => {
              const isPressed = pressedServiceId === svc.id;
              const isDubbing = svc.id === 'dubbing';

              return (
                <TouchableOpacity
                  key={svc.id}
                  style={[
                    styles.minimalCard,
                    isDubbing ? styles.dubbingCard : styles.standardCard,
                    isPressed && styles.cardPressed,
                  ]}
                  onPress={() => handleServiceSelect(svc)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.cardIconBox, isDubbing && styles.cardIconBoxDubbing]}>
                    <Ionicons name={svc.icon} size={17} color={isDubbing ? '#854D0E' : '#CA8A04'} />
                  </View>

                  <View style={styles.cardTitleBox}>
                    <Text
                      style={[styles.cardTitle, isDubbing && styles.cardTitleDubbing]}
                      numberOfLines={2}
                    >
                      {svc.title}
                    </Text>
                  </View>

                  {/* Clean status slot: COMING SOON pill or BOOK NOW pill for Dubbing */}
                  <View style={styles.cardStatusSlot}>
                    {!isDubbing ? (
                      <View style={styles.soonPill}>
                        <Text style={styles.soonPillText}>COMING SOON</Text>
                      </View>
                    ) : (
                      <View style={styles.livePill}>
                        <View style={styles.livePillDot} />
                        <Text style={styles.livePillText}>BOOK NOW</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 3. Video Services Section (Minimal Pearl White & Gold) ── */}
        <View style={styles.sectionBlock}>
          {/* Section Header with Pill & Extending Gold Line */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderPill}>
              <View style={styles.pillIconCircle}>
                <Ionicons name="videocam" size={11} color="#000000" />
              </View>
              <Text style={styles.sectionHeaderTitle}>Video Services</Text>
            </View>
            <View style={styles.sectionHeaderLine} />
          </View>

          {/* 3 Minimal White Square Cards in a Row */}
          <View style={styles.videoCardsRow}>
            {VIDEO_SERVICES.map((svc) => {
              const isPressed = pressedServiceId === svc.id;

              return (
                <TouchableOpacity
                  key={svc.id}
                  style={[
                    styles.minimalCard,
                    styles.videoCardSize,
                    isPressed && styles.cardPressed,
                  ]}
                  onPress={() => handleServiceSelect(svc)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardIconBox}>
                    <Ionicons name={svc.icon} size={17} color="#CA8A04" />
                  </View>

                  <View style={styles.cardTitleBox}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {svc.title}
                    </Text>
                  </View>

                  {/* Clean status slot */}
                  <View style={styles.cardStatusSlot}>
                    <View style={styles.soonPill}>
                      <Text style={styles.soonPillText}>COMING SOON</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 4. Additional Services Section (Minimal Pearl White & Gold) ── */}
        <View style={styles.sectionBlock}>
          {/* Section Header with Pill & Extending Gold Line */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderPill}>
              <View style={styles.pillIconCircle}>
                <Ionicons name="layers" size={11} color="#000000" />
              </View>
              <Text style={styles.sectionHeaderTitle}>Additional Services</Text>
            </View>
            <View style={styles.sectionHeaderLine} />
          </View>

          {/* 3 Minimal White Square Cards in a Row */}
          <View style={styles.videoCardsRow}>
            {ADDITIONAL_SERVICES.map((svc) => {
              const isPressed = pressedServiceId === svc.id;

              return (
                <TouchableOpacity
                  key={svc.id}
                  style={[
                    styles.minimalCard,
                    styles.videoCardSize,
                    isPressed && styles.cardPressed,
                  ]}
                  onPress={() => handleServiceSelect(svc)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardIconBox}>
                    <Ionicons name={svc.icon} size={17} color="#CA8A04" />
                  </View>

                  <View style={styles.cardTitleBox}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {svc.title}
                    </Text>
                  </View>

                  {/* Clean status slot */}
                  <View style={styles.cardStatusSlot}>
                    <View style={styles.soonPill}>
                      <Text style={styles.soonPillText}>COMING SOON</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCF8', // Pearl White Canvas
    alignItems: 'center',
  },
  topHeader: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 6,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
    zIndex: 20,
  },
  headerCenteredLogo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoImg: {
    width: 125,
    height: 34,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  desktopScrollContent: {
    width: 440,
    alignSelf: 'center',
  },

  // ── Banner Styles ──
  bannerOuterWrapper: {
    marginBottom: 6,
  },
  bannerContainer: {
    height: 132,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    backgroundColor: '#111827',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  bannerAnimatedView: {
    width: '100%',
    height: '100%',
  },
  bannerBgImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  bannerContentCol: {
    width: '92%',
    alignItems: 'flex-start',
  },
  ribbonBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  ribbonBadgeLive: {
    backgroundColor: '#FACC15',
  },
  ribbonBadgeSoon: {
    backgroundColor: '#F59E0B',
  },
  ribbonBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bannerTitleWhite: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  bannerTitleGold: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bannerSubtitle: {
    color: '#D1D5DB',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  bannerCtaBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerCtaBtnText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 5,
    marginBottom: 2,
  },
  dot: {
    height: 3,
    borderRadius: 1.5,
  },
  dotActive: {
    width: 12,
    backgroundColor: '#EAB308',
  },
  dotInactive: {
    width: 4,
    backgroundColor: '#D1D5DB',
  },

  // ── Section Headers (Minimal White & Gold) ──
  sectionBlock: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingLeft: 4,
    paddingRight: 9,
    paddingVertical: 2.5,
    gap: 5,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pillIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    color: '#111827',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: '#EAB308',
    marginLeft: 6,
    borderRadius: 1,
    opacity: 0.7,
  },

  // ── Minimal White Cards ──
  audioCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  videoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  minimalCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    height: 88,
    minHeight: 88,
    maxHeight: 88,
  },
  dubbingCard: {
    borderWidth: 1.3,
    borderColor: '#EAB308',
    backgroundColor: '#FFFDF5',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  standardCard: {
    borderColor: '#E5E7EB',
  },
  videoCardSize: {
    height: 88,
    minHeight: 88,
    maxHeight: 88,
  },
  cardPressed: {
    borderColor: '#CA8A04',
    transform: [{ scale: 0.96 }],
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  cardIconBoxDubbing: {
    backgroundColor: '#FDE047',
  },
  cardTitleBox: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 1,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 9.2,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 11.5,
  },
  cardTitleDubbing: {
    color: '#000000',
    fontWeight: '900',
  },
  cardStatusSlot: {
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3',
    borderWidth: 0.6,
    borderColor: '#EAB308',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  livePillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16A34A',
  },
  livePillText: {
    color: '#854D0E',
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  soonPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 0.6,
    borderColor: '#FDE68A',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonPillText: {
    color: '#92400E',
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
