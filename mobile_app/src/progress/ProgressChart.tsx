// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — ProgressChart
// Smooth bezier SVG chart · Animated draw · Touch tooltip · Gradient fill
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Circle,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { ChartDataPoint, MetricKey } from './types';
import { Colors, Typography, Spacing, CHART_HEIGHT, CHART_PADDING_H, CHART_PADDING_V } from './theme';

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  data: ChartDataPoint[];
  metric: MetricKey;
  width: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: ChartDataPoint | null;
  index: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export const ProgressChart = React.memo(({ data, metric, width }: Props) => {
  const drawAnim = useRef(new Animated.Value(0)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    point: null,
    index: -1,
  });

  const color = Colors.metricColors[metric];
  const glowColor = Colors.metricGlow[metric];
  const gradientId = `grad-${metric}`;
  const clipId = `clip-${metric}`;

  // Re-animate whenever data changes
  useEffect(() => {
    drawAnim.setValue(0);
    Animated.timing(drawAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [data, metric]);

  // ── Coordinate mapping ──────────────────────────────────────────────────────

  const chartW = width - CHART_PADDING_H * 2;
  const chartH = CHART_HEIGHT - CHART_PADDING_V * 2;

  const { minVal, maxVal, points } = useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 1, points: [] };
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.15 || 1;
    const minV = Math.max(0, min - padding);
    const maxV = max + padding;
    const pts = data.map((d, i) => ({
      x: CHART_PADDING_H + (i / Math.max(data.length - 1, 1)) * chartW,
      y: CHART_PADDING_V + chartH - ((d.value - minV) / (maxV - minV)) * chartH,
      data: d,
      index: i,
    }));
    return { minVal: minV, maxVal: maxV, points: pts };
  }, [data, chartW, chartH]);

  // ── Bezier path builder ─────────────────────────────────────────────────────

  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '' };

    let line = `M ${points[0].x} ${points[0].y}`;
    let area = `M ${points[0].x} ${CHART_HEIGHT - CHART_PADDING_V} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cp1x = p0.x + (p1.x - p0.x) * 0.4;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) * 0.4;
      const cp2y = p1.y;
      line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      area += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const lastPt = points[points.length - 1];
    area += ` L ${lastPt.x} ${CHART_HEIGHT - CHART_PADDING_V} Z`;

    return { linePath: line, areaPath: area };
  }, [points]);

  // ── Touch / tooltip ─────────────────────────────────────────────────────────

  const findNearestPoint = useCallback(
    (touchX: number) => {
      if (points.length === 0) return null;
      return points.reduce((nearest, pt) =>
        Math.abs(pt.x - touchX) < Math.abs(nearest.x - touchX) ? pt : nearest,
      );
    },
    [points],
  );

  const showTooltip = useCallback(
    (x: number) => {
      const nearest = findNearestPoint(x);
      if (!nearest) return;
      setTooltip({
        visible: true,
        x: nearest.x,
        y: nearest.y,
        point: nearest.data,
        index: nearest.index,
      });
      Animated.spring(tooltipOpacity, {
        toValue: 1,
        tension: 200,
        friction: 15,
        useNativeDriver: true,
      }).start();
    },
    [findNearestPoint, tooltipOpacity],
  );

  const hideTooltip = useCallback(() => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setTooltip((t) => ({ ...t, visible: false })));
  }, [tooltipOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        showTooltip(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        showTooltip(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setTimeout(hideTooltip, 1500);
      },
    }),
  ).current;

  // ── Y-axis labels ───────────────────────────────────────────────────────────

  const yLabels = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const val = minVal + ((maxVal - minVal) * i) / steps;
      const y = CHART_PADDING_V + chartH - (i / steps) * chartH;
      const label =
        metric === 'water'
          ? `${val.toFixed(1)}L`
          : metric === 'calories'
          ? `${Math.round(val / 100) * 100}`
          : `${Math.round(val)}`;
      return { y, label };
    });
  }, [minVal, maxVal, chartH, metric]);

  // ── X-axis labels ───────────────────────────────────────────────────────────

  const xLabels = useMemo(() => {
    if (data.length === 0) return [];
    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(data.length / maxLabels));
    return data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d, _, arr) => ({
        label: d.date,
        x:
          CHART_PADDING_H +
          (data.indexOf(d) / Math.max(data.length - 1, 1)) * chartW,
      }));
  }, [data, chartW]);

  const metricLabel = {
    calories: 'kcal',
    protein: 'g',
    carbs: 'g',
    fat: 'g',
    water: 'L',
  }[metric];

  const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);

  // ─────────────────────────────────────────────────────────────────────────────

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { width, height: CHART_HEIGHT + 40 }]}>
        <Text style={styles.emptyText}>No data for this period</Text>
      </View>
    );
  }

  return (
    <View style={{ width, height: CHART_HEIGHT + 40 }}>
      <View {...panResponder.panHandlers} style={{ width, height: CHART_HEIGHT + 40 }}>
        <Svg width={width} height={CHART_HEIGHT + 40}>
          <Defs>
            {/* Gradient fill */}
            <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <Stop offset="70%" stopColor={color} stopOpacity={0.05} />
              <Stop offset="100%" stopColor={color} stopOpacity={0} />
            </SvgGradient>
          </Defs>

          {/* Grid lines */}
          {yLabels.map((lbl, i) => (
            <G key={`grid-${i}`}>
              <Line
                x1={CHART_PADDING_H}
                y1={lbl.y}
                x2={width - CHART_PADDING_H}
                y2={lbl.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                strokeDasharray="4 8"
              />
              <SvgText
                x={CHART_PADDING_H - 4}
                y={lbl.y + 4}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.25)"
                fontWeight="500"
              >
                {lbl.label}
              </SvgText>
            </G>
          ))}

          {/* X-axis labels */}
          {xLabels.map((lbl, i) => (
            <SvgText
              key={`xlabel-${i}`}
              x={lbl.x}
              y={CHART_HEIGHT + 16}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.30)"
              fontWeight="500"
            >
              {lbl.label}
            </SvgText>
          ))}

          {/* Gradient area fill */}
          <Path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line */}
          <Path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data dots */}
          {points.map((pt, i) => (
            <Circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={tooltip.index === i ? 6 : 3}
              fill={tooltip.index === i ? color : 'rgba(255,255,255,0.0)'}
              stroke={color}
              strokeWidth={tooltip.index === i ? 2.5 : 0}
            />
          ))}

          {/* Tooltip vertical line */}
          {tooltip.visible && (
            <Line
              x1={tooltip.x}
              y1={CHART_PADDING_V}
              x2={tooltip.x}
              y2={CHART_HEIGHT - CHART_PADDING_V}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeDasharray="4 4"
            />
          )}
        </Svg>

        {/* Tooltip bubble */}
        {tooltip.visible && tooltip.point && (
          <Animated.View
            style={[
              styles.tooltip,
              {
                left: Math.min(
                  Math.max(tooltip.x - 52, 8),
                  width - 112,
                ),
                top: Math.max(tooltip.y - 72, 4),
                opacity: tooltipOpacity,
                borderColor: color,
              },
            ]}
          >
            <Text style={[styles.tooltipMetric, { color }]}>{metricName}</Text>
            <Text style={styles.tooltipValue}>
              {metric === 'water'
                ? `${tooltip.point.value.toFixed(1)}${metricLabel}`
                : `${Math.round(tooltip.point.value)}${metricLabel}`}
            </Text>
            <Text style={styles.tooltipDate}>{tooltip.point.rawDate}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
});

ProgressChart.displayName = 'ProgressChart';

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  tooltip: {
    position: 'absolute',
    width: 104,
    backgroundColor: 'rgba(13,13,26,0.95)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tooltipMetric: {
    ...Typography.label,
    marginBottom: 2,
  },
  tooltipValue: {
    ...Typography.headingM,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tooltipDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});