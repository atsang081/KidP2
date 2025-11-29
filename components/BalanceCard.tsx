import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { formatCurrency } from '@/utils/formatting';
import { useSpendingContext } from '@/context/SpendingContext';

type BalanceCardProps = {
  balance: number;
};

export default function BalanceCard({ balance }: BalanceCardProps) {
  const { appStyle } = useSpendingContext();
  const currentColors = Colors.getStyleColors(appStyle);

  return (
    <View style={[styles.container, { backgroundColor: currentColors.primary }]}>
      <Text style={styles.label}>Money Ready to Spend 💵</Text>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      <View style={styles.piggyBankContainer}>
        <Text style={styles.piggyEmoji}>🐷</Text>
      </View>
      {balance < 10 && (
        <Text style={styles.lowBalanceText}>
          Ask parents for allowance! 🙏
        </Text>
      )}
      {balance >= 50 && (
        <Text style={styles.goodBalanceText}>
          Great savings! Consider a deposit! 🌱
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balance: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 40,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  piggyBankContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  piggyEmoji: {
    fontSize: 50,
  },
  lowBalanceText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  goodBalanceText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
});