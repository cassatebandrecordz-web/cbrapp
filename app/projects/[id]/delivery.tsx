import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/constants/theme';
import { Header } from '../../../src/components/Header';
import { GlowCard } from '../../../src/components/GlowCard';
import { DemoNoticeBanner } from '../../../src/components/DemoNoticeBanner';
import { useApp } from '../../../src/context/AppContext';

export default function FinalDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject, projects } = useApp();

  // Find project or fallback to the completed one (proj-05: Velocity GT Supercar)
  const currentProject = getProject(id || '') || projects.find((p) => p.finalDelivery) || projects[4];
  const delivery = currentProject.finalDelivery;

  const handleDownloadFile = (fileName: string, size: string) => {
    Alert.alert(
      'Download Started (Demo)',
      `Saving "${fileName}" (${size}) to local client cache.\nChecksum verification passed (SHA256).`,
      [{ text: 'OK' }]
    );
  };

  const handleDownloadAll = () => {
    Alert.alert(
      'Complete Master Archive ZIP (Demo)',
      'Queued complete delivery archive (17.1 GB) with high-speed 1Gbps studio direct link.',
      [{ text: 'Dismiss' }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="MASTER DELIVERABLES"
        subtitle={`Package: ${currentProject.code}`}
        showBack={true}
        showContact={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        {/* Master Golden Badge Card (Screen 29) */}
        <GlowCard
          style={styles.deliveryHeroCard}
          borderColor="#10B981"
          gradientColors={['#0F2B20', '#0A1813']}
        >
          <View style={styles.topDeliveryRow}>
            <View style={styles.sealCircle}>
              <Ionicons name="checkmark-done-circle" size={36} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.masterTagRow}>
                <Text style={styles.masterTagText}>GOLDEN MASTER CERTIFIED</Text>
              </View>
              <Text style={styles.deliveryTitle}>
                {delivery?.packageTitle || `${currentProject.title} – Delivery Package`}
              </Text>
              <Text style={styles.deliveredOnText}>
                Delivered on {delivery?.deliveredDate || 'October 28, 2026'}
              </Text>
            </View>
          </View>

          <View style={styles.licenseDivider} />

          {/* Security & License Details */}
          <View style={styles.metaInfoGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>COMMERCIAL LICENSE NUMBER</Text>
              <Text style={styles.metaValueMono}>
                {delivery?.licenseNumber || 'CBR-LIC-2026-VE9942'}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DIGITAL CHECKSUM HASH</Text>
              <Text style={styles.metaValueMono} numberOfLines={1}>
                {delivery?.checksum || 'SHA256: 8f3d9a12c4b8e751a0293d0f772b146e'}
              </Text>
            </View>
          </View>
        </GlowCard>

        {/* Deliverables Files List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            DELIVERABLE FILES ({delivery?.files.length || 6})
          </Text>

          <View style={styles.filesList}>
            {delivery?.files.map((file, idx) => {
              let icon: any = 'document-outline';
              let iconColor = COLORS.primaryLight;

              if (file.type === 'master') {
                icon = 'videocam-outline';
                iconColor = '#38BDF8';
              } else if (file.type === 'stems') {
                icon = 'layers-outline';
                iconColor = COLORS.primary;
              } else if (file.type === 'license') {
                icon = 'shield-checkmark-outline';
                iconColor = '#10B981';
              }

              return (
                <GlowCard key={idx} style={styles.fileCard} borderColor="#2E2E3C">
                  <View style={styles.fileRow}>
                    <View style={styles.fileIconBox}>
                      <Ionicons name={icon} size={22} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.fileFormat}>{file.format}</Text>
                    </View>
                    <View style={styles.downloadCol}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => handleDownloadFile(file.name, file.size)}
                      >
                        <Ionicons name="download-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.downloadBtnText}>Get</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlowCard>
              );
            })}
          </View>
        </View>

        {/* Master Download CTA */}
        <TouchableOpacity
          style={styles.downloadAllBtn}
          onPress={handleDownloadAll}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Ionicons name="cloud-download" size={20} color="#FFFFFF" />
            <Text style={styles.downloadAllText}>DOWNLOAD FULL ARCHIVE (ZIP)</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  deliveryHeroCard: {
    marginBottom: 16,
  },
  topDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sealCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterTagRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  masterTagText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  deliveryTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  deliveredOnText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  licenseDivider: {
    height: 1,
    backgroundColor: '#1E3A2F',
    marginVertical: 12,
  },
  metaInfoGrid: {
    gap: 8,
  },
  metaCol: {
    gap: 2,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  metaValueMono: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filesList: {
    gap: 8,
  },
  fileCard: {
    marginBottom: 0,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1B1138',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#39236E',
  },
  fileName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  fileFormat: {
    color: COLORS.primaryLight,
    fontSize: 10,
    marginTop: 2,
  },
  downloadCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fileSize: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#24144A',
    borderWidth: 1,
    borderColor: '#4A2B8F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  downloadBtnText: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: '700',
  },
  downloadAllBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  downloadAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
