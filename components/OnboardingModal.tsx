import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Colors from '@/constants/Colors';
import { PiggyBank, User, Lock, ArrowRight } from 'lucide-react-native';
import { useSpendingContext } from '@/context/SpendingContext';
import { UserProfile, AppStyle } from '@/types/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

type OnboardingModalProps = {
  visible: boolean;
};

export default function OnboardingModal({ visible }: OnboardingModalProps) {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [parentalPassword, setParentalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [appStyle, setAppStyle] = useState<AppStyle>('girls');
  const [error, setError] = useState('');

  const { updateUserProfile } = useSpendingContext();

  // Run animations when visibility changes
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 500 });
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(0.9);
      translateY.value = withSpring(50);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleButtonPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    if (currentStep === 1) {
      if (!parentName.trim()) {
        setError("Please enter the parent's name");
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!childName.trim()) {
        setError("Please enter the child's name");
        return;
      }
      setError('');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!parentalPassword.trim() || parentalPassword.length < 4) {
        setError('Please enter a password with at least 4 characters');
        return;
      }
      
      if (parentalPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setError('');
      setCurrentStep(4);
    } else if (currentStep === 4) {
      completeOnboarding();
    }
  };

  const handleStyleSelect = (style: AppStyle) => {
    setAppStyle(style);
  };

  const completeOnboarding = () => {
    const userProfile: UserProfile = {
      parentName,
      childName,
      parentalPassword,
      notificationsEnabled: true,
      appStyle,
      interestRate: 5.0, // Default interest rate
      termInterestRates: {
        1: 3.0,   // 1 month: 3% annual
        3: 4.0,   // 3 months: 4% annual
        6: 5.0,   // 6 months: 5% annual
        12: 6.0,  // 12 months: 6% annual
      },
    };

    updateUserProfile(userProfile);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={styles.iconContainer}>
              <User size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Kids Piggy Bank!</Text>
            <Text style={styles.subtitle}>Let's start by getting to know you.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Parent/Guardian Name</Text>
              <TextInput
                style={styles.input}
                value={parentName}
                onChangeText={setParentName}
                placeholder="Enter your name"
                autoFocus
              />
            </View>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.iconContainer}>
              <PiggyBank size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Who's learning to save?</Text>
            <Text style={styles.subtitle}>
              This app will help them track their pocket money!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Child's Name</Text>
              <TextInput
                style={styles.input}
                value={childName}
                onChangeText={setChildName}
                placeholder="Enter child's name"
                autoFocus
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.iconContainer}>
              <Lock size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Just one more step!</Text>
            <Text style={styles.subtitle}>
              Create a parent password to manage money securely.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Parent Password</Text>
              <TextInput
                style={styles.input}
                value={parentalPassword}
                onChangeText={setParentalPassword}
                placeholder="Create a password"
                secureTextEntry
              />
              
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry
              />
              
              <Text style={styles.helperText}>
                This password will be required when adding funds to the piggy bank.
              </Text>
            </View>
          </>
        );
      case 4:
        return (
          <>
            <View style={styles.iconContainer}>
              <PiggyBank size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Choose a style</Text>
            <Text style={styles.subtitle}>
              Pick a style that your child will love!
            </Text>

            <View style={styles.styleOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.styleOption,
                  appStyle === 'boys' && styles.selectedStyleOption,
                  { backgroundColor: Colors.getStyleColors('boys').lightPrimary }
                ]}
                onPress={() => handleStyleSelect('boys')}
              >
                <Text style={[
                  styles.styleOptionText,
                  { color: Colors.getStyleColors('boys').primary }
                ]}>
                  Boys Style
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.styleOption,
                  appStyle === 'girls' && styles.selectedStyleOption,
                  { backgroundColor: Colors.getStyleColors('girls').lightPrimary }
                ]}
                onPress={() => handleStyleSelect('girls')}
              >
                <Text style={[
                  styles.styleOptionText,
                  { color: Colors.getStyleColors('girls').primary }
                ]}>
                  Girls Style
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, containerStyle]}>
          <View style={styles.stepsIndicator}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  currentStep === step && styles.activeStepDot,
                  currentStep > step && styles.completedStepDot,
                ]}
              />
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderStep()}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Animated.View style={buttonAnimStyle}>
              <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                <Text style={styles.buttonText}>
                  {currentStep === 4 ? 'Get Started' : 'Next'}
                </Text>
                <ArrowRight size={20} color={Colors.white} />
              </TouchableOpacity>
            </Animated.View>

            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setCurrentStep(currentStep - 1);
                  setError('');
                }}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
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
    padding: 24,
    alignItems: 'center',
  },
  stepsIndicator: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
  },
  completedStepDot: {
    backgroundColor: Colors.green,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    width: '100%',
  },
  iconContainer: {
    backgroundColor: Colors.lightPrimary,
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  helperText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 4,
  },
  errorText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.red,
    marginBottom: 16,
  },
  styleOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },
  styleOption: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleOption: {
    borderColor: Colors.primary,
  },
  styleOptionText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 200,
  },
  buttonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.white,
    marginRight: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.darkGray,
  },
});