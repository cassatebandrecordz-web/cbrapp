import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { Header } from '../src/components/Header';
import { GlowCard } from '../src/components/GlowCard';
import { DemoNoticeBanner } from '../src/components/DemoNoticeBanner';
import { useApp } from '../src/context/AppContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const handleNotificationPress = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.targetId) {
      if (notif.type === 'booking') {
        router.push('/my-bookings');
      } else if (notif.type === 'delivery') {
        router.push(`/projects/${notif.targetId}/delivery`);
      } else {
        router.push(`/projects/${notif.targetId}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="NOTIFICATIONS"
        subtitle="Studio Alerts & Project Updates"
        showBack={true}
        showNotification={false}
        rightAction={
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllNotificationsRead}
          >
            <Ionicons name="checkmark-done-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner compact={true} />

        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>RECENT ACTIVITY FEED</Text>
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={44} color="#64748B" />
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySub}>No new studio notifications at this time.</Text>
          </View>
        ) : (
          <View style={styles.notifList}>
            {notifications.map((item) => {
              let icon: any = 'information-circle-outline';
              let iconColor = COLORS.primaryLight;

              if (item.type === 'project') {
                icon = 'layers-outline';
                iconColor = '#38BDF8';
              } else if (item.type === 'booking') {
                icon = 'calendar-outline';
                iconColor = COLORS.primary;
              } else if (item.type === 'delivery') {
                icon = 'cloud-download-outline';
                iconColor = '#10B981';
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.8}
                >
                  <GlowCard
                    style={styles.notifCard}
                    borderColor={!item.read ? '#E5E7EB' : '#E5E7EB'}
                    gradientColors={!item.read ? ['#1A170F', '#F5F6F1'] : ['#F5F6F1', '#FBFCF8']}
                  >
                    <View style={styles.notifRow}>
                      <View style={styles.iconCircle}>
                        <Ionicons name={icon} size={20} color={iconColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleLine}>
                          <Text style={[styles.notifTitle, !item.read && { color: '#F8FAFC' }]}>
                            {item.title}
                          </Text>
                          {!item.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notifMessage}>{item.message}</Text>
                        <Text style={styles.notifTime}>{item.timestamp}</Text>
                      </View>
                    </View>
                  </GlowCard>
                </TouchableOpacity>
              );
            })}
          </View>
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
  markAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#190E30',
    borderWidth: 1,
    borderColor: '#341E5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  listTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  notifList: {
    gap: 10,
  },
  notifCard: {
    marginBottom: 0,
  },
  notifRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E1238',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3C226C',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#06B6D4',
  },
  notifMessage: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  notifTime: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 6,
  },
});
