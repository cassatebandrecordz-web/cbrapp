import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';
import { GlowCard } from '../../src/components/GlowCard';
import { DemoNoticeBanner } from '../../src/components/DemoNoticeBanner';
import { useApp } from '../../src/context/AppContext';
import { SERVICE_IMAGES } from '../../src/constants/serviceImages';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { services, updateBookingDraft } = useApp();

  React.useEffect(() => {
    updateBookingDraft({
      serviceId: 'dubbing',
      serviceName: 'Dubbing Studio',
      studioId: 'studio-a',
      studioName: 'Dubbing Studio',
      durationHours: 2,
    });
    router.replace('/(tabs)/booking');
  }, []);

  const service = services.find((s) => s.id === id) || services[0];

  const [selectedTierIndex, setSelectedTierIndex] = useState(1);
  const [sessionUnits, setSessionUnits] = useState(4);
  const [includeEngineer, setIncludeEngineer] = useState(true);

  const activeTier = service.tiers[selectedTierIndex] || service.tiers[0];

  const calculatedTotal =
    (activeTier.price + (includeEngineer ? 30 : 0)) * (sessionUnits > 0 ? sessionUnits : 1);

  const handleBookNow = () => {
    updateBookingDraft({
      serviceId: service.id,
      serviceName: service.name,
      durationHours: sessionUnits,
      engineerIncluded: includeEngineer,
    });
    router.push('/(tabs)/booking');
  };

  const isDubbing = service.id === 'dubbing';
  const serviceImg = SERVICE_IMAGES[service.id] || SERVICE_IMAGES.dubbing;

  return (
    <View style={styles.container}>
      <Header title={service.name.toUpperCase()} showBack={true} showContact={true} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        {/* Coming Soon Notice if not Dubbing */}
        {!isDubbing && (
          <View style={styles.comingSoonAlertBanner}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.comingSoonAlertTitle}>SERVICE COMING SOON</Text>
              <Text style={styles.comingSoonAlertText}>
                Currently, Dubbing Studio is the only active reservation suite. You can preview technical specifications below or book the Dubbing Studio.
              </Text>
            </View>
          </View>
        )}

        {/* Hero Header Card */}
        <GlowCard style={styles.heroCard}>
          {/* Service Image */}
          <View style={styles.serviceImageHeroBox}>
            <Image
              source={serviceImg}
              style={styles.serviceImageHero}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(251,252,248,0.85)']}
              style={styles.heroImageGradient}
            />
            <View style={styles.imageOverlayBadge}>
              {isDubbing ? (
                <View style={styles.heroActiveBadge}>
                  <Text style={styles.heroActiveBadgeText}>ACTIVE RESERVATION SUITE</Text>
                </View>
              ) : (
                <View style={styles.heroSoonBadge}>
                  <Text style={styles.heroSoonBadgeText}>COMING SOON</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{service.category.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>Studio Grade • 5.0</Text>
            </View>
          </View>

          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.serviceTagline}>{service.tagline}</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>BASE RATE</Text>
              <Text style={styles.heroStatValue}>
                ₹350 <Text style={styles.unitText}>/ Slot</Text>
              </Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>ESTIMATED TURNAROUND</Text>
              <Text style={styles.heroStatValue}>{service.turnaround}</Text>
            </View>
          </View>
        </GlowCard>

        {/* Overview & Acoustics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POST-PRODUCTION OVERVIEW</Text>
          <GlowCard style={styles.contentCard}>
            <Text style={styles.bodyText}>{service.description}</Text>
          </GlowCard>
        </View>

        {/* Technical Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TECHNICAL SPECIFICATIONS & ACOUSTICS</Text>
          <GlowCard style={styles.contentCard}>
            {service.specs.map((spec, idx) => (
              <View key={idx} style={styles.specRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </GlowCard>
        </View>

        {/* Hardware & Gear */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDIO HARDWARE & OUTBOARD GEAR</Text>
          <GlowCard style={styles.contentCard}>
            {service.gear.map((gear, idx) => (
              <View key={idx} style={styles.gearRow}>
                <View style={styles.gearDot} />
                <Text style={styles.gearTitle}>{gear}</Text>
              </View>
            ))}
          </GlowCard>
        </View>

        {/* Pricing Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICE TIERS & DELIVERABLES</Text>
          <View style={styles.tierCardsContainer}>
            {service.tiers.map((tier, idx) => {
              const isSelected = selectedTierIndex === idx;
              return (
                <TouchableOpacity
                  key={tier.name}
                  onPress={() => setSelectedTierIndex(idx)}
                  activeOpacity={0.85}
                >
                  <GlowCard
                    style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                  >
                    <View style={styles.tierHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tierName, isSelected && { color: COLORS.primary }]}>
                          {tier.name}
                        </Text>
                        <Text style={styles.tierDesc}>{tier.description}</Text>
                      </View>
                      <View style={[styles.tierPriceBadge, isSelected && styles.tierPriceBadgeActive]}>
                        <Text style={[styles.tierPriceVal, isSelected && { color: COLORS.primary }]}>
                          ₹{tier.price}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deliverablesList}>
                      {tier.deliverables.map((del, dIdx) => (
                        <View key={dIdx} style={styles.delRow}>
                          <Ionicons
                            name="radio-button-on"
                            size={12}
                            color={isSelected ? COLORS.primary : '#9CA3AF'}
                          />
                          <Text style={styles.delText}>{del}</Text>
                        </View>
                      ))}
                    </View>
                  </GlowCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Estimator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEMO ESTIMATOR & CUSTOMIZER</Text>
          <GlowCard style={styles.contentCard}>
            <View style={styles.estimatorRow}>
              <View>
                <Text style={styles.estimatorLabel}>Session Duration / Quantity</Text>
                <Text style={styles.estimatorSub}>Approximate hours or items required</Text>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setSessionUnits(Math.max(1, sessionUnits - 1))}
                >
                  <Ionicons name="remove" size={16} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{sessionUnits}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setSessionUnits(sessionUnits + 1)}
                >
                  <Ionicons name="add" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.estimatorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.estimatorLabel}>Chief Post-Production Engineer</Text>
                <Text style={styles.estimatorSub}>Dedicated sound designer or colorist</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, includeEngineer && styles.toggleBtnActive]}
                onPress={() => setIncludeEngineer(!includeEngineer)}
              >
                <Ionicons
                  name={includeEngineer ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={includeEngineer ? COLORS.primary : '#9CA3AF'}
                />
                <Text style={styles.toggleText}>{includeEngineer ? 'Included' : 'None'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Simulated Total</Text>
                <Text style={styles.totalSub}>Tier: {activeTier.name}</Text>
              </View>
              <Text style={styles.totalAmount}>₹{calculatedTotal}</Text>
            </View>
          </GlowCard>
        </View>

        {/* Action Button */}
        {isDubbing ? (
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={handleBookNow}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EAB308', '#CA8A04']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookNowGradient}
            >
              <Ionicons name="headset" size={20} color="#FFFFFF" />
              <Text style={styles.bookNowBtnText}>PROCEED TO DUBBING RESERVATION</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={() => {
              updateBookingDraft({
                serviceId: 'dubbing',
                serviceName: 'Dubbing Studio',
                studioId: 'studio-a',
                studioName: 'Dubbing Studio',
                durationHours: 2,
              });
              router.push('/(tabs)/booking');
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EAB308', '#CA8A04']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookNowGradient}
            >
              <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
              <Text style={styles.bookNowBtnText}>SWITCH TO DUBBING STUDIO (ACTIVE)</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  comingSoonAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.35)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  comingSoonAlertTitle: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  comingSoonAlertText: {
    color: '#6B7280',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  heroCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  serviceImageHeroBox: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  serviceImageHero: {
    width: '100%',
    height: '100%',
  },
  heroImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  heroActiveBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroActiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroSoonBadgeText: {
    color: '#92400E',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: 'rgba(234,179,8,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.35)',
  },
  categoryPillText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  serviceTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  serviceTagline: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroStatValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  unitText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  contentCard: {
    marginBottom: 0,
  },
  bodyText: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  specText: {
    color: '#374151',
    fontSize: 12,
    flex: 1,
  },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  gearDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  gearTitle: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  tierCardsContainer: {
    gap: 10,
  },
  tierCard: {
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tierCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFBEB',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  tierDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  tierPriceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tierPriceBadgeActive: {
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderColor: 'rgba(234,179,8,0.4)',
  },
  tierPriceVal: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '900',
  },
  deliverablesList: {
    marginTop: 6,
    gap: 4,
  },
  delRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  delText: {
    color: '#6B7280',
    fontSize: 11,
  },
  estimatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimatorLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  estimatorSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  counterVal: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(234,179,8,0.08)',
  },
  toggleText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  totalSub: {
    color: COLORS.primary,
    fontSize: 11,
  },
  totalAmount: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  bookNowBtn: {
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
