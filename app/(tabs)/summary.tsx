import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { useSpendingContext } from '@/context/SpendingContext';
import { formatCurrency } from '@/utils/formatting';
import CategoryBar from '@/components/CategoryBar';
import { LineChart } from '@/components/LineChart';
import { calculateTopCategories, getMonthData } from '@/utils/dataProcessing';
import EmptyState from '@/components/EmptyState';

export default function SummaryScreen() {
  const { transactions, balance } = useSpendingContext();
  
  // Get spending data for the current month
  const { 
    monthlySpending, 
    totalSpent, 
    daysInMonth,
    dailyData 
  } = getMonthData(transactions);
  
  // Calculate top 3 spending categories
  const topCategories = calculateTopCategories(transactions);

  return (
    <View style={styles.container}>
      <Header title="Monthly Summary" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>Total Spent</Text>
              <Text style={[styles.balanceValue, styles.spentValue]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
          </View>
        </View>
        
        {dailyData.length > 0 ? (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Daily Spending</Text>
              <LineChart data={dailyData} height={180} />
            </View>
            
            <View style={styles.categoriesCard}>
              <Text style={styles.cardTitle}>Top Spending Categories</Text>
              
              {topCategories.length > 0 ? (
                topCategories.map((category, index) => (
                  <CategoryBar 
                    key={index}
                    category={category.name}
                    amount={category.amount}
                    percentage={category.percentage}
                    color={Colors.categoryColors[index % Colors.categoryColors.length]}
                  />
                ))
              ) : (
                <Text style={styles.noDataText}>No spending categories yet</Text>
              )}
            </View>
          </>
        ) : (
          <EmptyState 
            message="No spending this month yet!"
            subMessage="Track your spending to see your Summary"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 8,
  },
  balanceValue: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  spentValue: {
    color: Colors.red,
  },
  separator: {
    width: 1,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 8,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  noDataText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    paddingVertical: 24,
  },
});