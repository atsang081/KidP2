import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useSpendingContext } from '@/context/SpendingContext';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import { Settings, Lock, TrendingUp, DollarSign, User, Palette } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatting';
import { TermInterestRates } from '@/types/types';

export default function ParentDashboard() {
  const { 
    userProfile, 
    updateUserProfile, 
    updateTermInterestRates,
    getInterestRateForTerm,
    addTransaction, 
    getTotalSavings,
    getAvailableBalance,
    appStyle,
    setAppStyle,
    clearTransactions 
  } = useSpendingContext();

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showTermRates, setShowTermRates] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeNote, setIncomeNote] = useState('');
  const [termRates, setTermRates] = useState<TermInterestRates>({
    1: 3.0,
    3: 4.0,
    6: 5.0,
    12: 6.0,
  });

  const currentColors = Colors.getStyleColors(appStyle);
  const parentPassword = userProfile?.parentalPassword || '1234';

  const handleAuthentication = () => {
    if (password === parentPassword) {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setPassword('');
    } else {
      Alert.alert('Incorrect Password', 'Please try again');
    }
  };

  const handleAddIncome = () => {
    const amount = parseFloat(incomeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    addTransaction({
      id: Date.now().toString(),
      title: incomeNote || 'Allowance',
      amount,
      type: 'income',
      category: 'Pocket Money',
      date: new Date(),
    });

    Alert.alert(
      'Income Added! 💰', 
      `${formatCurrency(amount)} has been added to ${userProfile?.childName || 'your child'}'s balance`,
      [{ text: 'Great!', style: 'default' }]
    );

    setIncomeAmount('');
    setIncomeNote('');
    setShowAddIncome(false);
  };

  const handleUpdateTermRates = () => {
    // Validate all term rates
    const rates = Object.values(termRates);
    if (rates.some(rate => isNaN(rate) || rate < 0 || rate > 20)) {
      Alert.alert('Invalid Rates', 'Please enter rates between 0% and 20%');
      return;
    }

    updateTermInterestRates(termRates);
    Alert.alert(
      'Term Rates Updated! 📈',
      'Deposit interest rates have been updated',
      [{ text: 'Done', style: 'default' }]
    );

    setShowTermRates(false);
  };

  // Initialize term rates from user profile
  const initializeTermRates = () => {
    if (userProfile?.termInterestRates) {
      setTermRates(userProfile.termInterestRates);
    }
    setShowTermRates(true);
  };

  const handleStyleChange = (style: 'boys' | 'girls') => {
    setAppStyle(style);
    if (userProfile) {
      updateUserProfile({ ...userProfile, appStyle: style });
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all transactions and deposits. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearTransactions();
              Alert.alert('Data Reset', 'All data has been cleared successfully!');
            } catch (error) {
              Alert.alert('Reset Error', 'There was an error clearing the data. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Parent Dashboard" />
        
        <View style={styles.authContainer}>
          <View style={[styles.lockContainer, { backgroundColor: currentColors.lightPrimary }]}>
            <Lock size={64} color={currentColors.primary} />
          </View>
          
          <Text style={styles.authTitle}>Parents Only 🔒</Text>
          <Text style={styles.authSubtitle}>
            Enter your password to access parent controls
          </Text>
          
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter parent password"
            secureTextEntry
            onSubmitEditing={handleAuthentication}
          />
          
          <TouchableOpacity 
            style={[styles.authButton, { backgroundColor: currentColors.primary }]}
            onPress={handleAuthentication}
          >
            <Text style={styles.authButtonText}>Access Dashboard</Text>
          </TouchableOpacity>
          
          <Text style={styles.hintText}>
            💡 Hint: Default password is "1234"
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Parent Dashboard" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Child Overview */}
        <View style={[styles.overviewCard, { backgroundColor: currentColors.lightPrimary }]}>
          <Text style={styles.overviewTitle}>
            {userProfile?.childName || 'Your Child'}'s Money 👶
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available Balance</Text>
              <Text style={[styles.statValue, { color: currentColors.primary }]}>
                {formatCurrency(getAvailableBalance())}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Savings</Text>
              <Text style={[styles.statValue, { color: Colors.green }]}>
                {formatCurrency(getTotalSavings())}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: Colors.lightGreen }]}
            onPress={() => setShowAddIncome(true)}
          >
            <DollarSign size={32} color={Colors.green} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Add Allowance 💰</Text>
              <Text style={styles.actionSubtitle}>Give your child pocket money</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: Colors.lightPurple }]}
            onPress={initializeTermRates}
          >
            <Settings size={32} color={Colors.purple} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Term Deposit Rates 🏦</Text>
              <Text style={styles.actionSubtitle}>
                Set different rates for each term length
              </Text>
            </View>
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* Add Income Modal */}
      <Modal visible={showAddIncome} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Allowance 💰</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>HK$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={incomeAmount}
                  onChangeText={setIncomeAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={incomeNote}
                onChangeText={setIncomeNote}
                placeholder="e.g., Weekly allowance, reward"
                maxLength={50}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddIncome(false);
                  setIncomeAmount('');
                  setIncomeNote('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: currentColors.primary }]}
                onPress={handleAddIncome}
              >
                <Text style={styles.confirmButtonText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Term-Specific Interest Rates Modal */}
      <Modal visible={showTermRates} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Term Deposit Rates 🏦</Text>
            <Text style={styles.modalSubtitle}>
              Set different interest rates for each deposit term
            </Text>
            
            <View style={styles.termRatesContainer}>
              <View style={styles.termRateItem}>
                <Text style={styles.termRateLabel}>🌱 1 Month</Text>
                <View style={styles.rateInputContainer}>
                  <TextInput
                    style={styles.rateInput}
                    value={termRates[1].toString()}
                    onChangeText={(text) => setTermRates(prev => ({ ...prev, 1: parseFloat(text) || 0 }))}
                    keyboardType="decimal-pad"
                    placeholder="3.0"
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>

              <View style={styles.termRateItem}>
                <Text style={styles.termRateLabel}>🌿 3 Months</Text>
                <View style={styles.rateInputContainer}>
                  <TextInput
                    style={styles.rateInput}
                    value={termRates[3].toString()}
                    onChangeText={(text) => setTermRates(prev => ({ ...prev, 3: parseFloat(text) || 0 }))}
                    keyboardType="decimal-pad"
                    placeholder="4.0"
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>

              <View style={styles.termRateItem}>
                <Text style={styles.termRateLabel}>🌳 6 Months</Text>
                <View style={styles.rateInputContainer}>
                  <TextInput
                    style={styles.rateInput}
                    value={termRates[6].toString()}
                    onChangeText={(text) => setTermRates(prev => ({ ...prev, 6: parseFloat(text) || 0 }))}
                    keyboardType="decimal-pad"
                    placeholder="5.0"
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>

              <View style={styles.termRateItem}>
                <Text style={styles.termRateLabel}>🏆 12 Months</Text>
                <View style={styles.rateInputContainer}>
                  <TextInput
                    style={styles.rateInput}
                    value={termRates[12].toString()}
                    onChangeText={(text) => setTermRates(prev => ({ ...prev, 12: parseFloat(text) || 0 }))}
                    keyboardType="decimal-pad"
                    placeholder="6.0"
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: Colors.lightGreen }]}>
              <Text style={styles.infoText}>
                💡 Tip: Longer terms usually have higher rates to encourage saving!
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowTermRates(false);
                  // Reset to current values
                  if (userProfile?.termInterestRates) {
                    setTermRates(userProfile.termInterestRates);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: currentColors.primary }]}
                onPress={handleUpdateTermRates}
              >
                <Text style={styles.confirmButtonText}>Update Rates</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockContainer: {
    borderRadius: 50,
    padding: 24,
    marginBottom: 24,
  },
  authTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 8,
  },
  authSubtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 32,
  },
  passwordInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  authButton: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  hintText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  overviewTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  styleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  styleOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    width: '45%',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  styleLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
    padding: 12,
  },
  noteInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
  },

  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.darkGray,
  },
  confirmButton: {
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  termRatesContainer: {
    marginBottom: 20,
  },
  termRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  termRateLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    minWidth: 100,
    height: 48,
  },
  rateInput: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
    padding: 8,
    textAlign: 'center',
    flex: 1,
    minHeight: 32,
  },
  percentSymbol: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.darkGray,
  },
});