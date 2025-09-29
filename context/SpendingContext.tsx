import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Transaction, UserProfile, AppStyle, FixedDeposit, TermInterestRates } from '@/types/types';
import Colors, { setColorStyle } from '@/constants/Colors';

type SpendingContextType = {
  balance: number;
  transactions: Transaction[];
  deposits: FixedDeposit[];
  userProfile: UserProfile | null;
  addTransaction: (transaction: Transaction) => void;
  createDeposit: (amount: number, termMonths: number) => void;
  withdrawDeposit: (depositId: string) => void;
  updateUserProfile: (profile: UserProfile) => void;
  updateInterestRate: (rate: number) => void;
  updateTermInterestRates: (rates: TermInterestRates) => void;
  getInterestRateForTerm: (termMonths: number) => number;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (value: boolean) => void;
  appStyle: AppStyle;
  setAppStyle: (style: AppStyle) => void;
  clearTransactions: () => void;
  getTotalSavings: () => number;
  getAvailableBalance: () => number;
  checkAndCreditMaturedDeposits: () => number;
};

const SpendingContext = createContext<SpendingContextType | undefined>(undefined);

// Default user profile
const defaultUserProfile: UserProfile = {
  parentName: '',
  childName: '',
  parentalPassword: '1234',
  notificationsEnabled: true,
  appStyle: 'girls', // Default to girls style
  interestRate: 5.0, // Default 5% annual interest rate
  termInterestRates: {
    1: 3.0,   // 1 month: 3% annual
    3: 4.0,   // 3 months: 4% annual
    6: 5.0,   // 6 months: 5% annual
    12: 6.0,  // 12 months: 6% annual
  },
};

// Empty initial data - app starts clean
const initialTransactions: Transaction[] = [];

export function SpendingProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [deposits, setDeposits] = useState<FixedDeposit[]>([]);
  const [balance, setBalance] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [appStyle, setAppStyle] = useState<AppStyle>('girls');

  // Calculate balance
  useEffect(() => {
    let newBalance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'income' || transaction.type === 'deposit_matured') {
        newBalance += transaction.amount;
      } else if (transaction.type === 'expense' || transaction.type === 'deposit') {
        newBalance -= transaction.amount;
      }
      // Note: 'deposit' transactions now properly reduce the balance
      // 'deposit_matured' transactions add the total return back
    });
    setBalance(newBalance);
  }, [transactions]);

  // Update color style when appStyle changes
  useEffect(() => {
    setColorStyle(appStyle);
  }, [appStyle]);

  // Load data from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Check for first launch
        let firstLaunch = true;
        
        if (Platform.OS === 'web') {
          // For web, use localStorage
          const storedTransactions = localStorage.getItem('transactions');
          if (storedTransactions) {
            // Parse stored data and convert date strings to Date objects
            const parsedTransactions = JSON.parse(storedTransactions).map((transaction: any) => ({
              ...transaction,
              date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
            }));
            setTransactions(parsedTransactions);
          }

          // Load deposits
          const storedDeposits = localStorage.getItem('deposits');
          if (storedDeposits) {
            const parsedDeposits = JSON.parse(storedDeposits).map((deposit: any) => ({
              ...deposit,
              startDate: deposit.startDate instanceof Date ? deposit.startDate : new Date(deposit.startDate),
              maturityDate: deposit.maturityDate instanceof Date ? deposit.maturityDate : new Date(deposit.maturityDate)
            }));
            setDeposits(parsedDeposits);
          }
          
          // Load user profile
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            
            // Migration: Add termInterestRates if missing
            if (!profile.termInterestRates) {
              profile.termInterestRates = {
                1: 3.0,   // 1 month: 3% annual
                3: 4.0,   // 3 months: 4% annual
                6: 5.0,   // 6 months: 5% annual
                12: 6.0,  // 12 months: 6% annual
              };
            }
            
            setUserProfile(profile);
            
            // Set the app style based on stored preference
            if (profile.appStyle) {
              setAppStyle(profile.appStyle);
            }
            
            firstLaunch = false;
          }
          
          // Check first launch
          const launchFlag = localStorage.getItem('hasLaunched');
          if (launchFlag) {
            firstLaunch = false;
          }
        } else {
          // For native platforms, use SecureStore
          const storedTransactions = await SecureStore.getItemAsync('transactions');
          if (storedTransactions) {
            // Parse stored data and convert date strings to Date objects
            const parsedTransactions = JSON.parse(storedTransactions).map((transaction: any) => ({
              ...transaction,
              date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
            }));
            setTransactions(parsedTransactions);
          }

          // Load deposits
          const storedDeposits = await SecureStore.getItemAsync('deposits');
          if (storedDeposits) {
            const parsedDeposits = JSON.parse(storedDeposits).map((deposit: any) => ({
              ...deposit,
              startDate: deposit.startDate instanceof Date ? deposit.startDate : new Date(deposit.startDate),
              maturityDate: deposit.maturityDate instanceof Date ? deposit.maturityDate : new Date(deposit.maturityDate)
            }));
            setDeposits(parsedDeposits);
          }
          
          // Load user profile
          const storedProfile = await SecureStore.getItemAsync('userProfile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            
            // Migration: Add termInterestRates if missing
            if (!profile.termInterestRates) {
              profile.termInterestRates = {
                1: 3.0,   // 1 month: 3% annual
                3: 4.0,   // 3 months: 4% annual
                6: 5.0,   // 6 months: 5% annual
                12: 6.0,  // 12 months: 6% annual
              };
            }
            
            setUserProfile(profile);
            
            // Set the app style based on stored preference
            if (profile.appStyle) {
              setAppStyle(profile.appStyle);
            }
            
            firstLaunch = false;
          }
          
          // Check first launch
          const launchFlag = await SecureStore.getItemAsync('hasLaunched');
          if (launchFlag) {
            firstLaunch = false;
          }
        }
        
        setIsFirstLaunch(firstLaunch);
      } catch (error) {
        console.error('Error loading data from storage:', error);
      }
    }

    loadData();
  }, []);



  // Save data to storage whenever transactions change
  useEffect(() => {
    async function saveData() {
      try {
        if (Platform.OS === 'web') {
          // For web, use localStorage (not secure, but works for demo)
          localStorage.setItem('transactions', JSON.stringify(transactions));
        } else {
          // For native platforms, use SecureStore
          await SecureStore.setItemAsync('transactions', JSON.stringify(transactions));
        }
      } catch (error) {
        console.error('Error saving data to storage:', error);
      }
    }

    // Always save transactions to maintain state persistence
    saveData();
  }, [transactions]);

  // Save deposits to storage whenever deposits change
  useEffect(() => {
    async function saveDeposits() {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('deposits', JSON.stringify(deposits));
        } else {
          await SecureStore.setItemAsync('deposits', JSON.stringify(deposits));
        }
      } catch (error) {
        console.error('Error saving deposits to storage:', error);
      }
    }

    // Always save deposits to maintain state persistence
    saveDeposits();
  }, [deposits]);

  // Save user profile whenever it changes
  useEffect(() => {
    async function saveUserProfile() {
      if (!userProfile) return;
      
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
          localStorage.setItem('hasLaunched', 'true');
        } else {
          await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
          await SecureStore.setItemAsync('hasLaunched', 'true');
        }
      } catch (error) {
        console.error('Error saving user profile:', error);
      }
    }

    if (userProfile) {
      saveUserProfile();
    }
  }, [userProfile]);

  // Add a new transaction with duplicate prevention
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => {
      // Check for duplicate matured deposit transactions
      if (transaction.type === 'deposit_matured' && transaction.depositId) {
        const existingMaturedTransaction = prev.find(t => 
          t.type === 'deposit_matured' && 
          t.depositId === transaction.depositId
        );
        
        if (existingMaturedTransaction) {
          return prev; // Don't add duplicate
        }
      }
      
      return [transaction, ...prev];
    });
  };

  // Manual function to check and credit matured deposits (useful for testing)
  const checkAndCreditMaturedDeposits = () => {
    const now = new Date();
    const maturedDeposits = deposits.filter(d => 
      d.status === 'active' && now >= d.maturityDate
    );
    
    if (maturedDeposits.length > 0) {
      let processed = 0;
      // Process each matured deposit
      maturedDeposits.forEach(deposit => {
        // Check if this deposit has already been processed
        const existingTransaction = transactions.find(t => 
          t.type === 'deposit_matured' && 
          t.depositId === deposit.id
        );
        
        if (!existingTransaction) {
          // Update deposit status to matured
          setDeposits(prev => 
            prev.map(d => 
              d.id === deposit.id 
                ? { ...d, status: 'matured' as const }
                : d
            )
          );
          
          // Add transaction for the matured deposit
          addTransaction({
            id: `manual_mature_${Date.now()}_${deposit.id}`,
            title: `Deposit Matured! 🎉`,
            amount: deposit.totalReturn,
            type: 'deposit_matured',
            category: 'Deposit',
            date: new Date(),
            depositId: deposit.id,
          });
          
          processed++;
        } else {
          // Already processed, skip
        }
      });
      
      return processed;
    }
    
    return 0;
  };

  // Check for matured deposits and auto-credit them
  useEffect(() => {
    const checkMaturedDeposits = () => {
      const now = new Date();
      const maturedDeposits = deposits.filter(d => 
        d.status === 'active' && now >= d.maturityDate
      );
      
      if (maturedDeposits.length > 0) {
        // Process each matured deposit
        maturedDeposits.forEach(deposit => {
          // Check if this deposit has already been processed
          const existingTransaction = transactions.find(t => 
            t.type === 'deposit_matured' && 
            t.depositId === deposit.id
          );
          
          if (!existingTransaction) {
            // Update deposit status to matured
            setDeposits(prev => 
              prev.map(d => 
                d.id === deposit.id 
                  ? { ...d, status: 'matured' as const }
                  : d
              )
            );
            
            // Add transaction for the matured deposit
            addTransaction({
              id: `auto_mature_${Date.now()}_${deposit.id}`,
              title: `Deposit Matured! 🎉`,
              amount: deposit.totalReturn,
              type: 'deposit_matured',
              category: 'Deposit',
              date: new Date(),
              depositId: deposit.id,
            });
            
            // Auto-credit completed
          } else {
            // Already processed, skip
          }
        });
      }
    };

    // Check immediately when component mounts or deposits change
    checkMaturedDeposits();
    
    // Then check every 30 seconds
    const interval = setInterval(checkMaturedDeposits, 30000);
    
    return () => clearInterval(interval);
  }, [deposits, transactions]); // Include transactions in dependencies

  // Create a new fixed deposit
  const createDeposit = (amount: number, termMonths: number) => {
    const interestRate = getInterestRateForTerm(termMonths);
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);
    
    const totalReturn = amount + (amount * interestRate * termMonths) / (12 * 100);
    
    const deposit: FixedDeposit = {
      id: Date.now().toString(),
      amount,
      interestRate,
      termMonths,
      startDate,
      maturityDate,
      status: 'active',
      totalReturn,
    };
    
    setDeposits(prev => [...prev, deposit]);
    
    // Add transaction for the deposit
    addTransaction({
      id: `dep_${Date.now()}`,
      title: `Fixed Deposit (${termMonths} months)`,
      amount,
      type: 'deposit',
      category: 'Deposit',
      date: new Date(),
      depositId: deposit.id,
    });
  };

  // Withdraw a deposit (early or at maturity)
  const withdrawDeposit = (depositId: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return;
    
    // If deposit is already matured via auto-credit, just mark as withdrawn
    if (deposit.status === 'matured') {
      setDeposits(prev => 
        prev.map(d => 
          d.id === depositId 
            ? { ...d, status: 'withdrawn' as const }
            : d
        )
      );
      return;
    }
    
    // For active deposits, process withdrawal
    setDeposits(prev => 
      prev.map(d => 
        d.id === depositId 
          ? { ...d, status: 'withdrawn' as const }
          : d
      )
    );
    
    // No need to add transaction since the money is returned by removing from deposits
    // The balance calculation will automatically reflect the available amount
  };

  // Update interest rate (parent only)
  const updateInterestRate = (rate: number) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, interestRate: rate };
      setUserProfile(updatedProfile);
    }
  };

  // Update term-specific interest rates (parent only)
  const updateTermInterestRates = (rates: TermInterestRates) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, termInterestRates: rates };
      setUserProfile(updatedProfile);
    }
  };

  // Get interest rate for a specific term
  const getInterestRateForTerm = (termMonths: number): number => {
    if (!userProfile?.termInterestRates) {
      return userProfile?.interestRate || 5.0;
    }
    
    const termRates = userProfile.termInterestRates;
    switch (termMonths) {
      case 1:
        return termRates[1] || 3.0;
      case 3:
        return termRates[3] || 4.0;
      case 6:
        return termRates[6] || 5.0;
      case 12:
        return termRates[12] || 6.0;
      default:
        return userProfile.interestRate || 5.0;
    }
  };

  // Get total savings (only fixed-term deposits)
  const getTotalSavings = () => {
    const activeDeposits = deposits
      .filter(d => d.status === 'active')
      .reduce((sum, d) => sum + d.amount, 0);
    return activeDeposits; // Only return deposits amount, not balance
  };

  // Get available balance (balance already includes deposit deductions)
  const getAvailableBalance = () => {
    // Since deposits are now properly subtracted in the main balance calculation,
    // we just return the balance as-is
    return Math.max(0, balance);
  };

  // Update user profile
  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Update app style when profile is updated
    if (profile.appStyle) {
      setAppStyle(profile.appStyle);
    }
    
    setIsFirstLaunch(false);
  };

  // Clear all transactions and reset all data
  const clearTransactions = async () => {
    // Clear state immediately
    setTransactions([]);
    setDeposits([]);
    setBalance(0);
    setUserProfile(null);
    setIsFirstLaunch(true);
    setAppStyle('girls');
    setColorStyle('girls');
    
    // Clear storage
    try {
      if (Platform.OS === 'web') {
        // Clear only the specific localStorage items used by the app
        const keys = ['transactions', 'deposits', 'userProfile', 'hasLaunched'];
        for (const key of keys) {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // Key not found or already deleted
          }
        }
      } else {
        // Clear all SecureStore items one by one
        const keys = ['transactions', 'deposits', 'userProfile', 'hasLaunched', 'appStyle'];
        for (const key of keys) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            // Key not found or already deleted
          }
        }
      }
    } catch (error) {
      // Error clearing storage
    }
  };

  return (
    <SpendingContext.Provider 
      value={{ 
        balance, 
        transactions, 
        deposits,
        userProfile, 
        addTransaction, 
        createDeposit,
        withdrawDeposit,
        updateUserProfile,
        updateInterestRate,
        updateTermInterestRates,
        getInterestRateForTerm,
        isFirstLaunch,
        setIsFirstLaunch,
        appStyle,
        setAppStyle,
        clearTransactions,
        getTotalSavings,
        getAvailableBalance,
        checkAndCreditMaturedDeposits
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
}

export const useSpendingContext = () => {
  const context = useContext(SpendingContext);
  if (context === undefined) {
    throw new Error('useSpendingContext must be used within a SpendingProvider');
  }
  return context;
};