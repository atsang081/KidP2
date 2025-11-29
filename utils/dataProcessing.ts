import { Transaction, CategorySummary, DailySpendingDataPoint, MonthSummary } from '@/types/types';

// Calculate the top spending categories
export function calculateTopCategories(transactions: Transaction[]): CategorySummary[] {
  // Filter for expenses only in the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const expenseTransactions = transactions.filter(t => 
    t.type === 'expense' && 
    t.date.getMonth() === currentMonth &&
    t.date.getFullYear() === currentYear
  );
  
  // Group by category and sum amounts
  const categoryMap: Record<string, number> = {};
  
  expenseTransactions.forEach(transaction => {
    const { category, amount } = transaction;
    if (categoryMap[category]) {
      categoryMap[category] += amount;
    } else {
      categoryMap[category] = amount;
    }
  });
  
  // Convert to array and sort by amount
  const categories = Object.entries(categoryMap).map(([name, amount]) => ({
    name: name as any,
    amount,
    percentage: 0, // Will be calculated next
  }));
  
  // Sort by amount (descending)
  categories.sort((a, b) => b.amount - a.amount);
  
  // Calculate total spent
  const totalSpent = categories.reduce((total, category) => total + category.amount, 0);
  
  // Calculate percentage
  categories.forEach(category => {
    category.percentage = totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;
  });
  
  // Return top 3 categories (or all if less than 3)
  return categories.slice(0, 3);
}

// Get monthly spending data
export function getMonthData(transactions: Transaction[]): MonthSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter for current month transactions
  const monthTransactions = transactions.filter(t => 
    t.date.getMonth() === currentMonth &&
    t.date.getFullYear() === currentYear
  );
  
  // Calculate total spent
  const totalSpent = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Generate daily spending data
  const dailySpending: Record<number, number> = {};
  
  // Initialize days
  for (let day = 1; day <= daysInMonth; day++) {
    dailySpending[day] = 0;
  }
  
  // Add expense amounts to days
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const day = t.date.getDate();
      dailySpending[day] += t.amount;
    });
  
  // Convert to array for chart
  const dailyData: DailySpendingDataPoint[] = [];
  
  // Only include data up to current day
  const currentDay = now.getDate();
  for (let day = 1; day <= currentDay; day++) {
    dailyData.push({
      day: day.toString(),
      amount: dailySpending[day],
    });
  }
  
  return {
    monthlySpending: totalSpent,
    totalSpent,
    daysInMonth,
    dailyData,
  };
}