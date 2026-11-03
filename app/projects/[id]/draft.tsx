import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/constants/theme';
import { Header } from '../../../src/components/Header';
import { GlowCard } from '../../../src/components/GlowCard';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { DemoNoticeBanner } from '../../../src/components/DemoNoticeBanner';
import { WaveformVisualizer } from '../../../src/components/WaveformVisualizer';
import { useApp } from '../../../src/context/AppContext';

export default function DraftPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject, updateProjectProgress } = useApp();

  const project = getProject(id || '');
  const draft = project?.currentDraft;

  const [spatialAudioMode, setSpatialAudioMode] = useState<'binaural' | 'stereo'>('binaural');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if (!project || !draft) {
    return (
      <View style={styles.container}>
        <Header title="DRAFT PLAYER" showBack={true} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#94A3B8' }}>No draft uploaded for this project.</Text>
        </View>
      </View>
    );
  }

  const handleApproveDraft = () => {
    Alert.alert(
      'Approve Draft for Final Master Print?',
      `Are you satisfied with ${draft.version}? Approving will advance this project to Final Master Print & Delivery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Print',
          onPress: () => {
            updateProjectProgress(project.id, 95);
            Alert.alert(
              'Draft Approved!',
              'Project has been marked for final master stem delivery package creation.'
            );
          },
        },
      ]
    );
  };

  const isVideo = draft.mediaType === 'video';

  return (
    <View style={styles.container}>
      <Header
        title="DRAFT REVIEW PLAYER"
        subtitle={`${project.code} • ${draft.version}`}
        showBack={true}
        showContact={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        {/* Media Player Showcase (Screen 27) */}
        <GlowCard
          style={styles.playerCard}
          borderColor="#38321E"
          gradientColors={['#1E1C12', '#111116']}
        >
          {isVideo ? (
            /* Video Draft View */
            <View style={styles.videoPlayerContainer}>
              <View style={styles.videoScreen}>
                {/* Simulated cinematic frame */}
                <LinearGradient
                  colors={['#0F172A', '#1E1B4B', '#090514']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.videoOverlayInfo}>
                  <View style={styles.videoCodecBadge}>
                    <Text style={styles.videoCodecText}>4K PRORES 422 HQ • 24.00 FPS</Text>
                  </View>
                  <View style={styles.recDotRow}>
                    <View style={styles.recDot} />
                    <Text style={styles.recText}>MASTER TIMELINE</Text>
                  </View>
                </View>

                {/* Big Center Play / Pause */}
                <TouchableOpacity
                  style={styles.videoCenterPlay}
                  onPress={() => setIsVideoPlaying(!isVideoPlaying)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isVideoPlaying ? 'pause' : 'play'}
                    size={36}
                    color="#FFFFFF"
                    style={{ marginLeft: isVideoPlaying ? 0 : 3 }}
                  />
                </TouchableOpacity>

                {/* Bottom Video Progress */}
                <View style={styles.videoTimecodeBar}>
                  <Text style={styles.timecodeMono}>01:24:18</Text>
                  <View style={styles.videoTrack}>
                    <View style={styles.videoTrackFill} />
                  </View>
                  <Text style={styles.timecodeMono}>{draft.duration}:00</Text>
                </View>
              </View>
            </View>
          ) : (
            /* Audio / Dolby Atmos Draft View */
            <View style={styles.audioPlayerContainer}>
              <View style={styles.audioHeaderRow}>
                <View style={styles.audioFormatCol}>
                  <Text style={styles.audioFormatTitle}>DOLBY ATMOS 7.1.4 STREAM</Text>
                  <Text style={styles.audioFormatSub}>24-Bit / 96kHz High-Resolution Master</Text>
                </View>

                {/* Binaural vs Stereo Toggle */}
                <View style={styles.spatialToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.spatialToggleBtn,
                      spatialAudioMode === 'binaural' && styles.spatialToggleBtnActive,
                    ]}
                    onPress={() => setSpatialAudioMode('binaural')}
                  >
                    <Text
                      style={[
                        styles.spatialToggleText,
                        spatialAudioMode === 'binaural' && styles.spatialToggleTextActive,
                      ]}
                    >
                      Binaural 3D
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.spatialToggleBtn,
                      spatialAudioMode === 'stereo' && styles.spatialToggleBtnActive,
                    ]}
                    onPress={() => setSpatialAudioMode('stereo')}
                  >
                    <Text
                      style={[
                        styles.spatialToggleText,
                        spatialAudioMode === 'stereo' && styles.spatialToggleTextActive,
                      ]}
                    >
                      Stereo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Waveform Component */}
              <View style={{ marginTop: 12 }}>
                <WaveformVisualizer
                  durationText={draft.duration}
                  durationSeconds={draft.durationSeconds}
                  levels={draft.waveformLevels}
                />
              </View>
            </View>
          )}

          {/* Draft Metadata */}
          <View style={styles.draftMetaBox}>
            <View style={styles.metaTitleRow}>
              <Text style={styles.metaVersionText}>{draft.version}</Text>
              <Text style={styles.metaUploadDate}>Uploaded {draft.uploadedAt}</Text>
            </View>
            <Text style={styles.metaNotesText}>"{draft.notes}"</Text>
          </View>
        </GlowCard>

        {/* Existing Timestamp Revisions on this Draft */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REVISION PINS ON THIS TIMELINE</Text>
          {project.revisions.length === 0 ? (
            <GlowCard>
              <Text style={styles.emptyText}>No revision flags placed on this timeline yet.</Text>
            </GlowCard>
          ) : (
            project.revisions.map((rev) => (
              <GlowCard key={rev.id} style={{ marginBottom: 8 }} borderColor="#4C2582">
                <View style={styles.pinHeader}>
                  <View style={styles.pinTc}>
                    <Ionicons name="time" size={13} color="#06B6D4" />
                    <Text style={styles.pinTcText}>{rev.timecode}</Text>
                  </View>
                  <Text style={styles.pinCategory}>{rev.category}</Text>
                  <StatusBadge status={rev.status} size="small" />
                </View>
                <Text style={styles.pinNote}>"{rev.note}"</Text>
              </GlowCard>
            ))
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.requestRevBtn}
            onPress={() => router.push(`/projects/${project.id}/revision`)}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={18} color="#F43F5E" />
            <Text style={styles.requestRevText}>REQUEST REVISION AT TIMECODE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            onPress={handleApproveDraft}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.approveBtnText}>APPROVE DRAFT AS GOLDEN MASTER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  playerCard: {
    marginBottom: 16,
  },
  videoPlayerContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  videoScreen: {
    height: 195,
    backgroundColor: '#07050E',
    justifyContent: 'space-between',
    padding: 12,
  },
  videoOverlayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoCodecBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoCodecText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  recDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  recText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
  videoCenterPlay: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  videoTimecodeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timecodeMono: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  videoTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
  },
  videoTrackFill: {
    width: '42%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  audioPlayerContainer: {},
  audioHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  audioFormatCol: {
    flex: 1,
  },
  audioFormatTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  audioFormatSub: {
    color: COLORS.primaryLight,
    fontSize: 10,
    marginTop: 1,
  },
  spatialToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0E0E14',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#23232E',
  },
  spatialToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spatialToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  spatialToggleText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '700',
  },
  spatialToggleTextActive: {
    color: '#FFFFFF',
  },
  draftMetaBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2B1A4F',
  },
  metaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaVersionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  metaUploadDate: {
    color: '#94A3B8',
    fontSize: 10,
  },
  metaNotesText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
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
  emptyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pinTc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#07050E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinTcText: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  pinCategory: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  pinNote: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  requestRevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  requestRevText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  approveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
