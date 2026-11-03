import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface WaveformVisualizerProps {
  levels?: number[];
  durationText?: string;
  durationSeconds?: number;
  interactive?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  levels = [30, 45, 60, 75, 90, 85, 70, 95, 60, 40, 55, 70, 85, 90, 65, 80, 95, 75, 60, 45, 55, 70, 85, 65, 50, 40, 60, 75, 85, 55],
  durationText = '03:42',
  durationSeconds = 222,
  interactive = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSecond, setCurrentSecond] = useState(38);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSecond((prev) => {
          if (prev >= durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = currentSecond / durationSeconds;
  const activeBarIndex = Math.floor(progress * levels.length);

  return (
    <View style={styles.container}>
      {/* Top Playback Bar */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={() => setIsPlaying(!isPlaying)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color="#0A0A0E"
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>

        <View style={styles.timeInfo}>
          <Text style={styles.currentTimeText}>{formatTime(currentSecond)}</Text>
          <Text style={styles.durationDivider}>/</Text>
          <Text style={styles.totalDurationText}>{durationText}</Text>
        </View>

        <View style={styles.audioFormatBadge}>
          <View style={styles.indicatorDot} />
          <Text style={styles.formatText}>24-BIT / 96kHz</Text>
        </View>
      </View>

      {/* Waveform Bars */}
      <View style={styles.waveformRow}>
        {levels.map((lvl, index) => {
          const isPassed = index <= activeBarIndex;
          const isCurrent = index === activeBarIndex;

          return (
            <TouchableOpacity
              key={index}
              disabled={!interactive}
              onPress={() => {
                const targetSec = Math.floor((index / levels.length) * durationSeconds);
                setCurrentSecond(targetSec);
              }}
              style={styles.barTouchTarget}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(8, (lvl / 100) * 50),
                    backgroundColor: isPassed
                      ? isCurrent
                        ? '#FFFFFF'
                        : COLORS.primary
                      : '#272734',
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Audio Scrubber Track */}
      <View style={styles.scrubberBg}>
        <View style={[styles.scrubberFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121217',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242430',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  durationDivider: {
    color: '#71717A',
    fontSize: 12,
  },
  totalDurationText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  audioFormatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    gap: 5,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  formatText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    paddingHorizontal: 2,
  },
  barTouchTarget: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 1,
  },
  bar: {
    width: 3.5,
    borderRadius: 1.5,
  },
  scrubberBg: {
    height: 3,
    backgroundColor: '#20202A',
    borderRadius: 1.5,
    marginTop: 8,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
});
