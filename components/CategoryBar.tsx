import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { formatCurrency } from '@/utils/formatting';
import { useSpendingContext } from '@/context/SpendingContext';

type CategoryBarProps = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

export default function CategoryBar({ category, amount, percentage, color }: CategoryBarProps) {
  const { appStyle } = useSpendingContext();
  const currentColors = Colors.getStyleColors(appStyle);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      
      <View style={[styles.barBackground, { backgroundColor: currentColors.lightGray }]}>
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      
      <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  amount: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
  },
  barBackground: {
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  percentage: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.darkGray,
    textAlign: 'right',
  },
});