import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { useSpendingContext } from '@/context/SpendingContext';
import { PiggyBank, Lock, Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/formatting';

export default function AddMoneyScreen() {
  const { addTransaction, userProfile, appStyle } = useSpendingContext();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showParentAuth, setShowParentAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const currentColors = Colors.getStyleColors(appStyle);
  
  // Animated values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Get password from userProfile or use default
  const parentPassword = userProfile?.parentalPassword || '1234';

  const handleAddMoney = () => {
    setShowParentAuth(true);
  };

  const handleParentAuth = () => {
    if (password === parentPassword) {
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        setErrorMessage('Please enter a valid amount');
        return;
      }
      
      addTransaction({
        id: Date.now().toString(),
        title: note || 'Pocket Money',
        amount: numAmount,
        type: 'income',
        category: 'Pocket Money',
        date: new Date(),
      });
      
      // Reset fields and show success
      setAmount('');
      setNote('');
      setPassword('');
      setErrorMessage('');
      setShowParentAuth(false);
      
      // Show success message and animate
      setSuccessMessage(`Added ${formatCurrency(numAmount)}!`);
      scale.value = withSpring(1.1, {}, () => {
        scale.value = withSpring(1);
      });
      
      // Fade out success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } else {
      setErrorMessage('Incorrect password');
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Header title="Add Pocket Money" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.iconContainer, { backgroundColor: currentColors.lightPrimary }]}>
          <PiggyBank size={80} color={currentColors.primary} />
        </View>
        
        <Text style={styles.title}>Add Money to Piggy Bank</Text>
        <Text style={styles.subtitle}>
          Parents: Enter the amount to add to {userProfile?.childName ? userProfile.childName + "'s" : "your child's"} balance
        </Text>
        
        {successMessage ? (
          <Animated.View style={[styles.successContainer, animatedStyle]}>
            <Check size={24} color={Colors.white} />
            <Text style={styles.successText}>{successMessage}</Text>
          </Animated.View>
        ) : null}
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={[styles.amountInputContainer, { borderColor: currentColors.primary }]}>
            <Text style={styles.currencySymbol}>HK$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="e.g., Weekly allowance, birthday gift"
            maxLength={50}
          />
        </View>
        
        {!showParentAuth ? (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: currentColors.primary }]}
            onPress={handleAddMoney}
          >
            <Text style={styles.addButtonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.parentAuthContainer}>
            <View style={[styles.lockIconContainer, { backgroundColor: currentColors.lightPrimary }]}>
              <Lock size={24} color={currentColors.primary} />
            </View>
            <Text style={styles.parentAuthTitle}>Parents Only</Text>
            <Text style={styles.parentAuthSubtitle}>Enter parent password to add money</Text>
            
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />
            
            <View style={styles.authButtonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowParentAuth(false);
                  setPassword('');
                  setErrorMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: currentColors.primary }]}
                onPress={handleParentAuth}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
  },
  title: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.darkGray,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  successText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: Colors.lightRed,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
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
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  currencySymbol: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
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
    backgroundColor: Colors.white,
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  parentAuthContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  lockIconContainer: {
    padding: 12,
    borderRadius: 30,
    marginBottom: 16,
  },
  parentAuthTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  parentAuthSubtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    width: '100%',
    marginBottom: 24,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
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
    paddingVertical: 12,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});