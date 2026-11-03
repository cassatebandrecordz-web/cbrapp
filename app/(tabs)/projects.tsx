import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { GlowCard } from '../../src/components/GlowCard';
import { useApp } from '../../src/context/AppContext';
import { soundEffects } from '../../src/utils/soundEffects';

export default function MyProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Completed'>('All');

  // Transition Animations
  const entranceFade = useRef(new Animated.Value(0)).current;
  const entranceSlide = useRef(new Animated.Value(18)).current;
  const filterFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceFade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(entranceSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleFilterChange = (tab: 'All' | 'In Progress' | 'Completed') => {
    if (tab === activeFilter) return;
    Animated.timing(filterFade, { toValue: 0.25, duration: 90, useNativeDriver: true }).start(() => {
      setActiveFilter(tab);
      Animated.timing(filterFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const filtered = projects.filter((p) => {
    if (activeFilter === 'In Progress') {
      return p.status === 'In Progress' || p.status === 'Review';
    }
    if (activeFilter === 'Completed') {
      return p.status === 'Completed';
    }
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header matching reference image: < My Projects */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            soundEffects.playClick(850, 0.03);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Projects</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ flex: 1, opacity: entranceFade, transform: [{ translateY: entranceSlide }] }}>
          {/* Filter Pills matching reference image: All, In Progress, Completed */}
          <View style={styles.filterPillsRow}>
            {(['All', 'In Progress', 'Completed'] as const).map((tab) => {
              const isSelected = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => handleFilterChange(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Project Cards with cross-fade animation */}
          <Animated.View style={[styles.projectsList, { opacity: filterFade }]}>
            {filtered.map((proj) => {
            let iconName: any = 'musical-notes';
            let iconBg = '#FFFFFF';
            let iconColor = COLORS.primaryLight;
            let statusTextColor = '#A1A1AA';

            if (proj.status === 'In Progress') {
              iconName = 'radio-outline';
              iconBg = 'rgba(56, 189, 248, 0.12)';
              iconColor = '#38BDF8';
              statusTextColor = '#38BDF8'; // cyan
            } else if (proj.status === 'Review') {
              iconName = 'film';
              iconBg = 'rgba(234, 179, 8, 0.14)';
              iconColor = COLORS.primary;
              statusTextColor = COLORS.gold; // Yellow/Gold matching image!
            } else if (proj.status === 'Completed') {
              iconName = 'checkmark-circle';
              iconBg = 'rgba(16, 185, 129, 0.14)';
              iconColor = '#10B981';
              statusTextColor = '#10B981'; // green
            }

            return (
              <TouchableOpacity
                key={proj.id}
                onPress={() => router.push(`/projects/${proj.id}`)}
                activeOpacity={0.8}
              >
                <GlowCard style={styles.projectCard}>
                  <View style={styles.cardInner}>
                    {/* Left Icon Square */}
                    <View style={[styles.projectIconBox, { backgroundColor: iconBg }]}>
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>

                    {/* Title & Subtitle (#PRJ-1082 • Review) */}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.projectTitle}>{proj.title}</Text>
                      <View style={styles.subRow}>
                        <Text style={styles.projectCode}>{proj.code}</Text>
                        <Text style={styles.subDot}>•</Text>
                        <Text style={[styles.projectStatusText, { color: statusTextColor }]}>
                          {proj.status}
                        </Text>
                      </View>
                    </View>

                    {/* Right Chevron */}
                    <Ionicons name="chevron-forward" size={18} color="#64748B" />
                  </View>
                </GlowCard>
              </TouchableOpacity>
            );
          })}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  filterPillText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#FBFCF8',
    fontWeight: '900',
  },
  projectsList: {
    gap: 10,
  },
  projectCard: {
    marginBottom: 0,
    padding: 14,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  projectCode: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  subDot: {
    color: '#64748B',
    fontSize: 11,
  },
  projectStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
