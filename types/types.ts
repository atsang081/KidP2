export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'deposit' | 'deposit_matured';
  category: CategoryType;
  date: Date;
  depositId?: string; // Links to a specific deposit
};

export type FixedDeposit = {
  id: string;
  amount: number;
  interestRate: number; // Annual percentage
  termMonths: number; // Duration in months
  startDate: Date;
  maturityDate: Date;
  status: 'active' | 'matured' | 'withdrawn';
  totalReturn: number; // Amount + interest
};

export type CategoryType = 'Food' | 'Transport' | 'Entertainment' | 'Education' | 'Pocket Money' | 'Gift' | 'Other' | 'Deposit';

export type CategorySummary = {
  name: CategoryType;
  amount: number;
  percentage: number;
};

export type DailySpendingDataPoint = {
  day: string;
  amount: number;
};

export type MonthSummary = {
  monthlySpending: number;
  totalSpent: number;
  daysInMonth: number;
  dailyData: DailySpendingDataPoint[];
};

export type AppStyle = 'boys' | 'girls';

export type UserProfile = {
  parentName: string;
  childName: string;
  parentalPassword: string;
  notificationsEnabled: boolean;
  appStyle: AppStyle;
  interestRate: number; // Default interest rate for deposits
  termInterestRates: TermInterestRates; // Term-specific interest rates
};

export type TermInterestRates = {
  1: number;  // 1 month
  3: number;  // 3 months
  6: number;  // 6 months
  12: number; // 12 months (1 year)
};

export type AppSettings = {
  interestRate: number;
  parentPassword: string;
  currency: 'HKD';
  language: 'en';
};