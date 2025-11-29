import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Header from '@/components/Header';
import { useSpendingContext } from '@/context/SpendingContext';
import Colors from '@/constants/Colors';
import { formatDate, formatCurrency } from '@/utils/formatting';
import { CircleArrowDown as ArrowDownCircle, CircleArrowUp as ArrowUpCircle } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';

export default function HistoryScreen() {
  const { transactions, appStyle } = useSpendingContext();
  const [filter, setFilter] = useState('all'); // 'all', 'spent', 'received'
  const currentColors = Colors.getStyleColors(appStyle);

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'spent') return transaction.type === 'expense';
    if (filter === 'received') return transaction.type === 'income';
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: Colors.white, shadowColor: Colors.darkGray }]}>
      <View style={styles.iconContainer}>
        {item.type === 'expense' ? (
          <ArrowUpCircle color={Colors.red} size={32} />
        ) : (
          <ArrowDownCircle color={Colors.green} size={32} />
        )}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text 
        style={[
          styles.transactionAmount, 
          item.type === 'expense' ? styles.expense : styles.income
        ]}>
        {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Header title="My Spending History" />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: filter === 'all' ? currentColors.primary : Colors.lightGray }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText, 
            { color: filter === 'all' ? Colors.white : Colors.darkGray }
          ]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: filter === 'spent' ? currentColors.primary : Colors.lightGray }
          ]}
          onPress={() => setFilter('spent')}
        >
          <Text style={[
            styles.filterText, 
            { color: filter === 'spent' ? Colors.white : Colors.darkGray }
          ]}>Spent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: filter === 'received' ? currentColors.primary : Colors.lightGray }
          ]}
          onPress={() => setFilter('received')}
        >
          <Text style={[
            styles.filterText, 
            { color: filter === 'received' ? Colors.white : Colors.darkGray }
          ]}>Received</Text>
        </TouchableOpacity>
      </View>

      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState 
          message={`No ${filter === 'all' ? 'transactions' : filter === 'spent' ? 'spending' : 'money received'} yet!`}
          subMessage={filter === 'all' ? "Your transactions will appear here" : filter === 'spent' ? "Track what you spend money on" : "Money added will show here"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterText: {
    fontFamily: 'ComicNeue-Bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  transactionCategory: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 2,
  },
  transactionDate: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  transactionAmount: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
  },
  expense: {
    color: Colors.red,
  },
  income: {
    color: Colors.green,
  },
});