import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/constants/theme';
import { Header } from '../../../src/components/Header';
import { GlowCard } from '../../../src/components/GlowCard';
import { DemoNoticeBanner } from '../../../src/components/DemoNoticeBanner';
import { useApp } from '../../../src/context/AppContext';

export default function EditorAssignmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject } = useApp();

  const project = getProject(id || '');
  const editor = project?.editor;

  const [chatMessage, setChatMessage] = useState('');

  if (!editor) {
    return (
      <View style={styles.container}>
        <Header title="EDITOR INFO" showBack={true} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#94A3B8' }}>No editor profile assigned.</Text>
        </View>
      </View>
    );
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      Alert.alert('Notice', 'Please type a quick note for your supervising editor.');
      return;
    }
    Alert.alert(
      'Message Sent (Demo)',
      `Your note: "${chatMessage}" has been routed to ${editor.name}'s studio console desk.`,
      [{ text: 'OK', onPress: () => setChatMessage('') }]
    );
  };

  const handleCallDemo = () => {
    Alert.alert(
      'Studio Intercom Patch (Demo)',
      `Dialing internal studio extension for ${editor.name} (${editor.phone})...`,
      [{ text: 'End Call' }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="SUPERVISING EDITOR"
        subtitle={`Project: ${project?.code}`}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        {/* Editor Profile Card (Screen 26) */}
        <GlowCard
          style={styles.profileCard}
          borderColor="#38321E"
          gradientColors={['#1E1C12', '#14141A']}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={40} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.editorName}>{editor.name}</Text>
              <Text style={styles.editorRole}>{editor.role}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{editor.rating} / 5.0 Rating</Text>
              </View>
            </View>
          </View>

          <View style={styles.expRow}>
            <Ionicons name="ribbon-outline" size={16} color={COLORS.primary} />
            <Text style={styles.expText}>{editor.experience}</Text>
          </View>

          <View style={styles.contactChipsRow}>
            <TouchableOpacity style={styles.contactChip} onPress={handleCallDemo}>
              <Ionicons name="call-outline" size={14} color={COLORS.primary} />
              <Text style={styles.contactChipText}>{editor.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactChip}
              onPress={() =>
                Alert.alert('Email Client (Demo)', `Opening mail composer to ${editor.email}`)
              }
            >
              <Ionicons name="mail-outline" size={14} color="#FFFFFF" />
              <Text style={styles.contactChipText} numberOfLines={1}>
                {editor.email}
              </Text>
            </TouchableOpacity>
          </View>
        </GlowCard>

        {/* Selected Film & Music Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURE CREDITS & AWARDS</Text>
          <GlowCard style={styles.contentCard}>
            {editor.credits.map((cred, idx) => (
              <View key={idx} style={styles.creditItem}>
                <Ionicons name="film-outline" size={16} color={COLORS.primaryLight} />
                <Text style={styles.creditText}>{cred}</Text>
              </View>
            ))}
          </GlowCard>
        </View>

        {/* Studio Direct Message / Talkback Simulation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDIO TALKBACK / DIRECT MESSAGE</Text>
          <GlowCard style={styles.contentCard} borderColor="#38321E">
            <Text style={styles.talkbackSub}>
              Send timestamp notes, reference links, or questions directly to the control room.
            </Text>

            <View style={styles.messageInputBox}>
              <TextInput
                style={styles.messageInput}
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholder={`Type message to ${editor.name}...`}
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendMessage}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#EAB308', '#CA8A04']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendGradient}
              >
                <Ionicons name="paper-plane-outline" size={16} color="#0A0A0E" />
                <Text style={styles.sendBtnText}>DISPATCH NOTE TO CONSOLE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlowCard>
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
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  editorRole: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#341E66',
  },
  expText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  contactChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  contactChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E081F',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F1B52',
    gap: 6,
  },
  contactChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
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
  contentCard: {
    marginBottom: 0,
  },
  creditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  creditText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  talkbackSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 16,
  },
  messageInputBox: {
    backgroundColor: '#0B0616',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D1B4E',
    padding: 10,
    marginBottom: 12,
  },
  messageInput: {
    color: '#F8FAFC',
    fontSize: 12,
    textAlignVertical: 'top',
    minHeight: 64,
  },
  sendBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
