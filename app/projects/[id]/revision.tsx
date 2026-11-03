import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/constants/theme';
import { Header } from '../../../src/components/Header';
import { GlowCard } from '../../../src/components/GlowCard';
import { DemoNoticeBanner } from '../../../src/components/DemoNoticeBanner';
import { useApp } from '../../../src/context/AppContext';

export default function RevisionRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject, addRevision } = useApp();

  const project = getProject(id || '');

  const [timecode, setTimecode] = useState('01:24');
  const [category, setCategory] = useState<any>('Audio Balance');
  const [priority, setPriority] = useState<any>('Normal');
  const [note, setNote] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);

  const categories = [
    'Audio Balance',
    'Vocal EQ',
    'Color Adjustment',
    'Pacing / Cut',
    'Sync Issue',
    'Other',
  ];

  const priorities = ['Normal', 'High', 'Urgent'];

  const quickTimecodes = ['00:30', '01:24', '02:15', '03:40'];

  const handleSubmit = () => {
    if (!note.trim()) {
      Alert.alert('Notice', 'Please write a brief description of the required revision.');
      return;
    }

    addRevision(project?.id || '', {
      timestamp: 'Today',
      timecode: timecode.trim() || '01:00',
      category,
      priority,
      note: note.trim(),
    });

    Alert.alert(
      'Revision Request Logged (Demo)',
      `Your revision for ${timecode} [${category}] has been assigned to ${project?.editor.name}.`,
      [{ text: 'View Project Timeline', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="SUBMIT REVISION"
        subtitle={`Project: ${project?.code}`}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        <GlowCard style={styles.formCard} borderColor="#F43F5E">
          {/* Timecode Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>TIMECODE (MM:SS)</Text>
            <View style={styles.timecodeInputBox}>
              <Ionicons name="stopwatch-outline" size={18} color="#06B6D4" />
              <TextInput
                style={styles.timecodeTextInput}
                value={timecode}
                onChangeText={setTimecode}
                placeholder="01:24"
                placeholderTextColor="#64748B"
              />
            </View>
            {/* Quick timecode chips */}
            <View style={styles.chipsRow}>
              {quickTimecodes.map((tc) => (
                <TouchableOpacity
                  key={tc}
                  style={[styles.chip, timecode === tc && styles.chipActive]}
                  onPress={() => setTimecode(tc)}
                >
                  <Text style={[styles.chipText, timecode === tc && styles.chipTextActive]}>
                    {tc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>REVISION CATEGORY</Text>
            <View style={styles.pillsWrap}>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPill, isSelected && styles.catPillActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Priority Level */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PRIORITY LEVEL</Text>
            <View style={styles.priorityRow}>
              {priorities.map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      isSelected && styles.priorityBtnActive,
                      isSelected && p === 'Urgent' && styles.priorityBtnUrgent,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected && styles.priorityTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Revision Note Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>REVISION DETAILS & INSTRUCTIONS *</Text>
            <View style={styles.noteBox}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Describe desired change (e.g. reduce low-end rumble on bass drum, lift skin tone exposure, fix dialogue lip flap sync...)"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Reference File Attachment Simulation */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>REFERENCE ATTACHMENT (SIMULATED)</Text>
            <TouchableOpacity
              style={[styles.attachBox, hasAttachment && styles.attachBoxActive]}
              onPress={() => {
                setHasAttachment(!hasAttachment);
                Alert.alert(
                  'Attachment Demo',
                  !hasAttachment
                    ? 'Simulated "Client_Reference_Mix_v2.wav" attached.'
                    : 'Attachment cleared.'
                );
              }}
            >
              <Ionicons
                name={hasAttachment ? 'document-attach' : 'cloud-upload-outline'}
                size={20}
                color={hasAttachment ? '#06B6D4' : '#94A3B8'}
              />
              <Text style={styles.attachText}>
                {hasAttachment
                  ? 'Client_Reference_Mix_v2.wav (Attached • 18 MB)'
                  : 'Tap to Attach Reference Audio / Screenshot'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#F43F5E', '#BE123C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Ionicons name="send-outline" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>DISPATCH REVISION REQUEST</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlowCard>
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
  formCard: {
    marginTop: 6,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  timecodeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F1E52',
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  timecodeTextInput: {
    flex: 1,
    color: '#06B6D4',
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#16161D',
    borderWidth: 0.8,
    borderColor: '#23232E',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chipTextActive: {
    color: '#0A0A0E',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#0E0E14',
    borderWidth: 1,
    borderColor: '#23232E',
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  catPillText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#0A0A0E',
    fontWeight: '800',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#0E0E14',
    borderWidth: 1,
    borderColor: '#23232E',
  },
  priorityBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  priorityBtnUrgent: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
  },
  priorityText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
  },
  priorityTextActive: {
    color: '#0A0A0E',
    fontWeight: '800',
  },
  noteBox: {
    backgroundColor: '#0A0617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F1E52',
    padding: 10,
  },
  noteInput: {
    color: '#F8FAFC',
    fontSize: 12,
    textAlignVertical: 'top',
    minHeight: 76,
    lineHeight: 18,
  },
  attachBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E081F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F1A52',
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  attachBoxActive: {
    borderStyle: 'solid',
    borderColor: '#06B6D4',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  attachText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
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
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
