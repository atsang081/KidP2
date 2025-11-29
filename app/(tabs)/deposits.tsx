import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useSpendingContext } from '@/context/SpendingContext';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import { PiggyBank, Clock, TrendingUp, Gift, Lock } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatting';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

export default function DepositsScreen() {
  const { deposits, createDeposit, withdrawDeposit, getAvailableBalance, userProfile, appStyle, getInterestRateForTerm } = useSpendingContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(3);
  const [showParentAuth, setShowParentAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: 'create' | 'withdraw', depositId?: string } | null>(null);

  const currentColors = Colors.getStyleColors(appStyle);
  const availableBalance = getAvailableBalance();
  const scale = useSharedValue(1);

  const termOptions = [
    { months: 1, label: '1 Month', emoji: '🌱' },
    { months: 3, label: '3 Months', emoji: '🌿' },
    { months: 6, label: '6 Months', emoji: '🌳' },
    { months: 12, label: '1 Year', emoji: '🏆' },
  ];

  // Calculate projected earnings using term-specific rates
  const calculateEarnings = (depositAmount: number, months: number) => {
    const interestRate = getInterestRateForTerm(months);
    return (depositAmount * interestRate * months) / (12 * 100);
  };

  // Format time remaining
  const getTimeRemaining = (maturityDate: Date) => {
    const now = new Date();
    const diff = maturityDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Matured! 🎉';
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 1) return '1 day left';
    if (days < 7) return `${days} days left`;
    if (days < 30) {
      const weeks = Math.ceil(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} left`;
    }
    
    // More accurate month calculation
    const months = Math.round(days / 30.44); // Average days per month
    if (months === 1) return '1 month left';
    if (months < 12) return `${months} months left`;
    
    const years = Math.round(months / 12);
    return `${years} year${years > 1 ? 's' : ''} left`;
  };

  const handleCreateDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (numAmount > availableBalance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough money in your balance');
      return;
    }

    // Create deposit directly without password
    createDeposit(numAmount, selectedTerm);
    
    // Celebration animation
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );
    
    Alert.alert(
      'Deposit Created! 🎉', 
      `Your HK$${numAmount.toFixed(2)} is now growing for ${selectedTerm} months!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    setAmount('');
    setShowCreateModal(false);
  };

  const handleWithdrawDeposit = (depositId: string) => {
    setPendingAction({ type: 'withdraw', depositId });
    setShowParentAuth(true);
  };

  const handleParentAuth = () => {
    const parentPassword = userProfile?.parentalPassword || '1234';
    
    if (password !== parentPassword) {
      Alert.alert('Incorrect Password', 'Please try again');
      return;
    }

    // Only handle withdrawal actions now (create is handled directly)
    if (pendingAction?.type === 'withdraw' && pendingAction.depositId) {
      withdrawDeposit(pendingAction.depositId);
      Alert.alert('Deposit Withdrawn', 'Money has been returned to your balance');
    }

    setPassword('');
    setShowParentAuth(false);
    setPendingAction(null);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const activeDeposits = deposits.filter(d => d.status === 'active');
  const maturedDeposits = deposits.filter(d => d.status === 'matured');
  
  // Sort deposits by maturity date (earliest first)
  const sortedActiveDeposits = [...activeDeposits].sort((a, b) => 
    a.maturityDate.getTime() - b.maturityDate.getTime()
  );
  const sortedMaturedDeposits = [...maturedDeposits].sort((a, b) => 
    a.maturityDate.getTime() - b.maturityDate.getTime()
  );
  
  const allCurrentDeposits = [...sortedActiveDeposits, ...sortedMaturedDeposits];

  return (
    <View style={styles.container}>
      <Header title="My Savings Bank" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Available Balance Card */}
        <Animated.View style={[styles.balanceCard, { backgroundColor: currentColors.lightPrimary }, animatedStyle]}>
          <View style={styles.balanceHeader}>
            <PiggyBank size={32} color={currentColors.primary} />
            <Text style={styles.balanceLabel}>Available to Deposit</Text>
          </View>
          <Text style={[styles.balanceAmount, { color: currentColors.primary }]}>
            {formatCurrency(availableBalance)}
          </Text>
        </Animated.View>

        {/* Create New Deposit Button */}
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: currentColors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <TrendingUp size={24} color={Colors.white} />
          <Text style={styles.createButtonText}>Start a New Deposit 🌱</Text>
        </TouchableOpacity>

        {/* Active & Matured Deposits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Savings 🌳</Text>
          
          {allCurrentDeposits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No deposits yet! {'\n'}Start saving and watch your money grow! 🌱💰
              </Text>
            </View>
          ) : (
            allCurrentDeposits.map((deposit) => {
              const isMatured = deposit.status === 'matured' || new Date() >= deposit.maturityDate;
              const borderColor = isMatured ? Colors.green : currentColors.primary;
              
              return (
                <View key={deposit.id} style={[styles.depositCard, { borderLeftColor: borderColor }]}>
                  <View style={styles.depositHeader}>
                    <Text style={styles.depositAmount}>{formatCurrency(deposit.amount)}</Text>
                    <Text style={styles.depositRate}>{deposit.interestRate}% 📈</Text>
                    {deposit.status === 'matured' && (
                      <Text style={styles.maturedTag}>🎉 MATURED</Text>
                    )}
                  </View>
                  
                  <View style={styles.depositInfo}>
                    <View style={styles.infoRow}>
                      <Clock size={16} color={Colors.darkGray} />
                      <Text style={styles.infoText}>
                        {deposit.status === 'matured' 
                          ? 'Auto-credited to balance!' 
                          : getTimeRemaining(deposit.maturityDate)
                        }
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Gift size={16} color={Colors.green} />
                      <Text style={[styles.infoText, { color: Colors.green }]}>
                        {deposit.status === 'matured' 
                          ? `Earned: ${formatCurrency(deposit.totalReturn)}` 
                          : `Will become: ${formatCurrency(deposit.totalReturn)}`
                        }
                      </Text>
                    </View>
                  </View>

                  {deposit.status === 'active' && (
                    <TouchableOpacity 
                      style={styles.withdrawButton}
                      onPress={() => handleWithdrawDeposit(deposit.id)}
                    >
                      <Text style={styles.withdrawButtonText}>
                        {isMatured ? 'Collect Money! 🎉' : 'Withdraw Early'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {deposit.status === 'matured' && (
                    <View style={[styles.maturedInfo, { backgroundColor: Colors.lightGreen }]}>
                      <Text style={styles.maturedInfoText}>
                        ✨ Money automatically added to your balance!
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Matured Deposits Alert */}
        {maturedDeposits.length > 0 && (
          <View style={[styles.maturedAlert, { backgroundColor: Colors.lightGreen }]}>
            <Text style={styles.maturedText}>
              🎉 {maturedDeposits.length} deposit{maturedDeposits.length > 1 ? 's have' : ' has'} matured and been added to your balance!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Deposit Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Deposit 🏦</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>How much to deposit?</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>HK$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.termContainer}>
              <Text style={styles.inputLabel}>Choose deposit term:</Text>
              <View style={styles.termOptions}>
                {termOptions.map((option) => {
                  const rate = getInterestRateForTerm(option.months);
                  return (
                    <TouchableOpacity
                      key={option.months}
                      style={[
                        styles.termOption,
                        selectedTerm === option.months && { backgroundColor: currentColors.lightPrimary }
                      ]}
                      onPress={() => setSelectedTerm(option.months)}
                    >
                      <Text style={styles.termEmoji}>{option.emoji}</Text>
                      <Text style={styles.termLabel}>{option.label}</Text>
                      <Text style={styles.termRate}>{rate}% p.a.</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {amount && (
              <View style={[styles.projectionCard, { backgroundColor: Colors.lightGreen }]}>
                <Text style={styles.projectionTitle}>Your Money Will Grow! 📈</Text>
                <Text style={styles.projectionText}>
                  Deposit: {formatCurrency(parseFloat(amount) || 0)}
                </Text>
                <Text style={styles.projectionText}>
                  Interest: {formatCurrency(calculateEarnings(parseFloat(amount) || 0, selectedTerm))}
                </Text>
                <Text style={[styles.projectionTotal, { color: Colors.green }]}>
                  Total: {formatCurrency((parseFloat(amount) || 0) + calculateEarnings(parseFloat(amount) || 0, selectedTerm))}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: currentColors.primary }]}
                onPress={handleCreateDeposit}
              >
                <Text style={styles.confirmButtonText}>Create Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parent Authentication Modal */}
      <Modal visible={showParentAuth} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.authModal}>
            <Lock size={32} color={currentColors.primary} />
            <Text style={styles.authTitle}>Parents Only 🔒</Text>
            <Text style={styles.authSubtitle}>Enter password to continue</Text>
            
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />
            
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={styles.authCancelButton}
                onPress={() => {
                  setShowParentAuth(false);
                  setPassword('');
                  setPendingAction(null);
                }}
              >
                <Text style={styles.authCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.authConfirmButton, { backgroundColor: currentColors.primary }]}
                onPress={handleParentAuth}
              >
                <Text style={styles.authConfirmText}>Confirm</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    marginLeft: 8,
    color: Colors.text,
  },
  balanceAmount: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 28,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  createButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 8,
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
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  depositCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  depositHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  depositAmount: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  depositRate: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.green,
  },
  depositInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginLeft: 8,
  },
  withdrawButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  maturedAlert: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  maturedText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.green,
    textAlign: 'center',
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    backgroundColor: Colors.white,
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
  termContainer: {
    marginBottom: 20,
  },
  termOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  termOption: {
    width: '48%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  termEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  termLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  termRate: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.green,
    marginTop: 2,
  },
  maturedTag: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 10,
    color: Colors.green,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  maturedInfo: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  maturedInfoText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 12,
    color: Colors.green,
    textAlign: 'center',
  },
  projectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  projectionTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.green,
    marginBottom: 8,
    textAlign: 'center',
  },
  projectionText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  projectionTotal: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.darkGray,
    borderRadius: 12,
    padding: 14,
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.darkGray,
  },
  confirmButton: {
    borderRadius: 12,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  authModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  authTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  authSubtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 20,
  },
  passwordInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    marginBottom: 20,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  authCancelButton: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  authCancelText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.darkGray,
  },
  authConfirmButton: {
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  authConfirmText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.white,
  },
});