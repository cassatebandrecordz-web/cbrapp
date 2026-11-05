import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { soundEffects } from '../utils/soundEffects';

const LOGO = require('../../assets/images/cassate_logo.png');

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  showContact?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'CBR Studio',
  subtitle,
  showBack = false,
  onBack,
  showNotification = true,
  showContact = false,
  rightAction,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadNotificationsCount } = useApp();

  const handleBack = () => {
    soundEffects.playClick(850, 0.03);
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top + 8 }]}>
      <View style={styles.contentRow}>
        {/* Left Side: Back button or Studio Logo */}
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.logoBadge}
            activeOpacity={0.8}
          >
            <Image source={LOGO} style={styles.headerLogoImg} resizeMode="contain" />
          </TouchableOpacity>
        )}

        {/* Center Title */}
        <View style={styles.titleColumn}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side: Notification bell or custom action */}
        <View style={styles.rightActionsRow}>
          {showContact && (
            <TouchableOpacity
              onPress={() => router.push('/contact')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {showNotification && (
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color="#111827" />
              {unreadNotificationsCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {rightAction}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
    paddingHorizontal: 16,
    paddingBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    width: '100%',
    maxWidth: 440,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    height: 40,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoImg: {
    width: 125,
    height: 40,
  },
  titleColumn: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitleText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accentPink,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.bgPrimary,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
