import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from 'react-native';
import Colors from '@/constants/Colors';
import { X } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatting';
import { useSpendingContext } from '@/context/SpendingContext';
import { CategoryType } from '@/types/types';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  category: CategoryType;
};

export default function CategoryModal({ visible, onClose, category }: CategoryModalProps) {
  const { addTransaction, getAvailableBalance, appStyle } = useSpendingContext();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Refs for inputs
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  
  const currentColors = Colors.getStyleColors(appStyle);
  const availableBalance = getAvailableBalance(); // Use available balance instead of raw balance
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const shake = useSharedValue(0);
  
  // Reset and handle modal state
  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 300 });
      
      // Reset form when opening
      setAmount('');
      setDescription('');
      setError('');
      setIsFocused(false);
      
      // Focus the amount input after a slight delay to ensure modal is ready
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(0.9);
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateX: shake.value }
      ]
    };
  });
  
  const handleAmountChange = (text: string) => {
    setError('');

    // Remove all non-numeric characters except for decimal point
    let formattedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalPoints = formattedText.match(/\./g);
    if (decimalPoints && decimalPoints.length > 1) {
      const parts = formattedText.split('.');
      formattedText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Handle leading zeros (but allow a single 0 before decimal point)
    if (formattedText.startsWith('0') && formattedText.length > 1 && formattedText[1] !== '.') {
      formattedText = formattedText.substring(1);
    }
    
    // Limit to 2 decimal places
    if (formattedText.includes('.')) {
      const parts = formattedText.split('.');
      if (parts[1].length > 2) {
        formattedText = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }
    
    setAmount(formattedText);
  };
  
  const showValidationError = (message: string) => {
    setError(message);
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };
  
  const handleSubmit = () => {
    // Validate amount
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      showValidationError('Please enter a valid amount');
      amountInputRef.current?.focus();
      return;
    }
    
    // Check if enough balance
    if (numAmount > availableBalance) {
      showValidationError('Not enough money in your piggy bank');
      amountInputRef.current?.focus();
      return;
    }
    
    // Add transaction
    addTransaction({
      id: Date.now().toString(),
      title: description || `Spent on ${category}`,
      amount: numAmount,
      type: 'expense',
      category,
      date: new Date(),
    });
    
    // Reset fields and close modal
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };
  
  const handleModalContentPress = () => {
    // Do nothing but capture the press to prevent it from dismissing the modal
  };
  
  // This function focuses the amount input
  const focusAmountInput = () => {
    amountInputRef.current?.focus();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleModalContentPress}>
            <Animated.View style={[styles.modalContainer, animatedStyle]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Spending</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Text style={styles.categoryLabel}>Category</Text>
                <View style={[styles.categoryChip, { backgroundColor: currentColors.lightPrimary }]}>
                  <Text style={[styles.categoryText, { color: currentColors.primary }]}>{category}</Text>
                </View>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                
                <Text style={styles.inputLabel}>How much did you spend?</Text>
                <TouchableOpacity 
                  activeOpacity={1} 
                  onPress={focusAmountInput}
                  style={[
                    styles.amountInputContainer, 
                    { 
                      borderColor: isFocused ? currentColors.primary : Colors.lightGray,
                      borderWidth: isFocused ? 3 : 2
                    }
                  ]}
                >
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    ref={amountInputRef}
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="0.00"
                    keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                    maxLength={10}
                  />
                </TouchableOpacity>
                
                <Text style={styles.inputLabel}>What did you buy? (optional)</Text>
                <TextInput
                  ref={descriptionInputRef}
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g., Ice cream at the park"
                  maxLength={50}
                />
                
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Current Balance:</Text>
                  <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: currentColors.primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Add Spending</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  categoryLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: Colors.lightRed,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.red,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    minHeight: 50,
  },
  descriptionInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  balanceLabel: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
  },
  balanceValue: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});