import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import Colors from '@/constants/Colors';
import { DailySpendingDataPoint } from '@/types/types';

type LineChartProps = {
  data: DailySpendingDataPoint[];
  height: number;
};

export default function LineChart({ data, height }: LineChartProps) {
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.amount), 0.1);
  
  // Animation progress
  const progress = useSharedValue(0);
  
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1000 });
  }, [data]);

  return (
    <View style={[styles.container, { height }]}>
      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        <Text style={styles.axisLabel}>${maxValue.toFixed(0)}</Text>
        <Text style={styles.axisLabel}>${(maxValue / 2).toFixed(0)}</Text>
        <Text style={styles.axisLabel}>$0</Text>
      </View>
      
      <View style={styles.chartArea}>
        {/* Horizontal grid lines */}
        <View style={[styles.gridLine, { top: 0 }]} />
        <View style={[styles.gridLine, { top: height / 2 }]} />
        <View style={[styles.gridLine, { top: height - 1 }]} />
        
        {/* Data points and lines */}
        <View style={styles.dataContainer}>
          {data.map((point, index) => {
            const animatedStyle = useAnimatedStyle(() => {
              const heightPercentage = (point.amount / maxValue) * 100;
              return {
                height: `${heightPercentage * progress.value}%`,
              };
            });
            
            return (
              <View key={index} style={styles.dataPointContainer}>
                <Animated.View style={[styles.bar, animatedStyle, { backgroundColor: Colors.primary }]} />
                <Text style={styles.dayLabel}>{point.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.darkGray,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  dataContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  dataPointContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 10,
    color: Colors.darkGray,
    marginTop: 4,
  },
});

export { LineChart }