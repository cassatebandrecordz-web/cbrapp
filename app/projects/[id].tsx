import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { GlowCard } from '../../src/components/GlowCard';
import { useApp } from '../../src/context/AppContext';
import { soundEffects } from '../../src/utils/soundEffects';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject, projects } = useApp();

  const project = getProject(id || '') || projects[1]; // default to Short Film Dubbing

  // 5 pipeline milestones matching reference image
  const steps = ['Booked', 'Recording', 'Editing', 'Review', 'Delivery'];

  const [playingFileId, setPlayingFileId] = useState<string | null>(null);

  const handleDownload = (fileName: string, size: string) => {
    Alert.alert(
      'Download Started',
      `Downloading "${fileName}" (${size}) to your device.`,
      [{ text: 'OK' }]
    );
  };

  const handlePlayToggle = (fileId: string) => {
    if (playingFileId === fileId) {
      setPlayingFileId(null);
    } else {
      setPlayingFileId(fileId);
    }
  };

  const handleApproveDownload = () => {
    Alert.alert(
      'Approve & Download Masters',
      `Approve ${project.title} and download all delivery stems and master audio files?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Download',
          onPress: () => {
            Alert.alert(
              'Master Approved!',
              'Downloading complete production archive ZIP (370.5 MB).'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header matching reference image: < Project Details */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            soundEffects.playClick(850, 0.03);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/projects');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Project Details</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Info Card matching reference image */}
        <GlowCard style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            {/* Clapperboard Icon Box */}
            <View style={styles.clapperIconBox}>
              <Ionicons name="film" size={22} color={COLORS.primary} />
            </View>

            {/* Title & Code */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectCode}>{project.code}</Text>
            </View>

            {/* Yellow/Gold "Review" Badge matching exact reference image! */}
            <View style={styles.goldReviewBadge}>
              <Text style={styles.goldReviewText}>{project.status}</Text>
            </View>
          </View>

          {/* 5-Step Pipeline Milestone Stepper matching reference image:
              Booked -> Recording -> Editing -> Review -> Delivery
          */}
          <View style={styles.stepperWrapper}>
            <View style={styles.stepperRow}>
              {steps.map((st, idx) => {
                const isPassed = idx <= project.currentStepIndex;
                const isCurrent = idx === project.currentStepIndex;
                const isLast = idx === steps.length - 1;

                return (
                  <React.Fragment key={st}>
                    <View style={styles.stepCol}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotActive,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed ? (
                          <Ionicons name="checkmark" size={11} color="#0A0A0E" />
                        ) : (
                          <View style={styles.stepDotEmpty} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          isPassed && styles.stepTextActive,
                          isCurrent && { color: '#FFFFFF', fontWeight: '800' },
                        ]}
                      >
                        {st}
                      </Text>
                    </View>

                    {!isLast && (
                      <View
                        style={[
                          styles.stepperLine,
                          idx < project.currentStepIndex && styles.stepperLineActive,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </GlowCard>

        {/* "Files" Section matching reference image */}
        <Text style={styles.filesSectionHeader}>Files</Text>

        <View style={styles.filesList}>
          {project.files.map((file) => {
            const isPlaying = playingFileId === file.id;

            return (
              <GlowCard key={file.id} style={styles.fileCard}>
                <View style={styles.fileRow}>
                  {/* Play / Pause Button */}
                  <TouchableOpacity
                    style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                    onPress={() => handlePlayToggle(file.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginLeft: isPlaying ? 0 : 2 }}
                    />
                  </TouchableOpacity>

                  {/* File Name & Size */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{file.size}</Text>
                  </View>

                  {/* Download Button */}
                  <TouchableOpacity
                    style={styles.downloadIconBtn}
                    onPress={() => handleDownload(file.name, file.size)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="download-outline" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>
              </GlowCard>
            );
          })}
        </View>

        {/* Primary Action: "Approve & Download" matching reference image */}
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={handleApproveDownload}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#EAB308', '#CA8A04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.approveGradient}
          >
            <Text style={styles.approveBtnText}>Approve & Download Master</Text>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0E0E14',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  infoCard: {
    padding: 14,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clapperIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#27164C',
    borderWidth: 1,
    borderColor: '#42247A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  projectCode: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  goldReviewBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  goldReviewText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  stepperWrapper: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#241643',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: 52,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1C1236',
    borderWidth: 1.5,
    borderColor: '#392368',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  stepDotCurrent: {
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  stepDotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A38',
  },
  stepText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  stepTextActive: {
    color: '#CBD5E1',
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#241544',
    marginBottom: 14,
  },
  stepperLineActive: {
    backgroundColor: COLORS.primary,
  },
  filesSectionHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  filesList: {
    gap: 10,
  },
  fileCard: {
    marginBottom: 0,
    padding: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#24154A',
    borderWidth: 1,
    borderColor: '#432680',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fileSize: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  downloadIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 28,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  approveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    color: '#0A0A0E',
    fontSize: 14,
    fontWeight: '900',
  },
});
