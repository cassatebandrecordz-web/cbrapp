import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function InitialLoadingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth subtle fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Fast, seamless transition directly to Home page
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleInstantEnter = () => {
    router.replace('/(tabs)');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleInstantEnter}
      activeOpacity={1}
    >
      <StatusBar style="dark" />
      <Animated.View style={[styles.brandBox, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/images/cassate_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.spinnerRow}>
          <ActivityIndicator size="small" color="#CA8A04" />
          <Text style={styles.loadingText}>CASSATE BAND RECORDZ</Text>
        </View>
        <Text style={styles.tagline}>POST PRODUCTION STUDIO</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCF8', // Pearl White Canvas matching Home page
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  brandBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 220,
    height: 75,
    marginBottom: 18,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagline: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
  },
});
