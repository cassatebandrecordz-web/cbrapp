import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function GetStartedScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const handleGetStarted = () => {
    router.push('/login');
  };

  // On wide desktop screens, constrain to exact same mobile width (440px) as Home page; on mobile, fill full screen
  const isDesktopWeb = Platform.OS === 'web' && width > 460;
  const containerWidth = isDesktopWeb ? Math.min(440, height * (577 / 1024)) : '100%';

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="light" />

      <View
        style={[
          styles.posterContainer,
          {
            width: containerWidth,
            height: '100%',
          },
        ]}
      >
        <ImageBackground
          source={require('../assets/images/welcome_poster.png')}
          style={styles.posterImage}
          resizeMode="cover"
        >
          {/* Direct touchable hit target over the "Get Started ➔" button */}
          <View style={styles.buttonOverlay}>
            <TouchableOpacity
              style={styles.buttonHitbox}
              onPress={handleGetStarted}
              activeOpacity={0.8}
              hitSlop={{ top: 20, bottom: 30, left: 20, right: 20 }}
            />
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterContainer: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  buttonOverlay: {
    position: 'absolute',
    top: '82.0%',
    left: '7.5%',
    right: '7.5%',
    height: '7.4%',
    borderRadius: 36,
    overflow: 'hidden',
  },
  buttonHitbox: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
});
