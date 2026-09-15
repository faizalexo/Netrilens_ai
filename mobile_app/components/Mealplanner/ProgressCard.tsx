import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AnimatedProgressRing from './AnimatedProgressRing';
import { DailyProgress } from '../types/meal';

interface MetricBarProps {
  label: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  fillStyle: object;
  iconBg: string;
  delay: number;
}

function MetricBar({ label, icon, current, target, unit, fillStyle, iconBg, delay }: MetricBarProps) {
  const barWidth = useSharedValue(0);
  const pct = Math.min((current / target) * 100, 100);

  useEffect(() => {
    barWidth.value = withDelay(
      delay,
      withTiming(pct, { duration: 1300, easing: Easing.out(Easing.cubic) })
    );
  }, [pct]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <View style={styles.metricBarWrap}>
        <View style={styles.metricTop}>
          <Text style={styles.metricName}>{label}</Text>
          <Text style={styles.metricVal}>
            {current}
            <Text style={styles.metricTarget}> / {target} {unit}</Text>
          </Text>
        </View>
        <View style={styles.metricTrack}>
          <Animated.View style={[styles.metricFill, fillStyle, animatedFill]} />
        </View>
      </View>
    </View>
  );
}

interface Props {
  progress: DailyProgress;
  overallProgress: number;
}

export default function ProgressCard({ progress, overallProgress }: Props) {
  return (
    <View style={styles.card}>
      <AnimatedProgressRing progress={overallProgress} />
      <View style={styles.metricsCol}>
        <MetricBar
          label="Calories"
          icon="🔥"
          current={progress.calories.current}
          target={progress.calories.target}
          unit="kcal"
          fillStyle={styles.fillCal}
          iconBg="rgba(255,138,91,0.15)"
          delay={300}
        />
        <MetricBar
          label="Protein"
          icon="💪"
          current={progress.protein.current}
          target={progress.protein.target}
          unit="g"
          fillStyle={styles.fillProtein}
          iconBg="rgba(139,92,246,0.15)"
          delay={450}
        />
        <MetricBar
          label="Water"
          icon="💧"
          current={progress.water.current}
          target={progress.water.target}
          unit="L"
          fillStyle={styles.fillWater}
          iconBg="rgba(94,234,212,0.13)"
          delay={600}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 22,
    paddingHorizontal: 20,
  },
  metricsCol: {
    flex: 1,
    gap: 11,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconText: {
    fontSize: 14,
  },
  metricBarWrap: {
    flex: 1,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  metricName: {
    fontSize: 11.5,
    color: '#A8ACC0',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 11.5,
    color: '#F5F6FA',
    fontWeight: '700',
  },
  metricTarget: {
    color: '#6C7088',
    fontWeight: '500',
  },
  metricTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 6,
  },
  fillCal: {
    backgroundColor: '#FFB36B',
    // gradient simulated via single color; use LinearGradient if needed
  },
  fillProtein: {
    backgroundColor: '#8B5CF6',
  },
  fillWater: {
    backgroundColor: '#5EEAD4',
  },
});
