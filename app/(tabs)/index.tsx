import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useSpendingContext } from '@/context/SpendingContext';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import QuickSpendButton from '@/components/QuickSpendButton';
import { Coffee, Cookie, Book, Gamepad2, Music, Gift, TrendingUp, PiggyBank } from 'lucide-react-native';
import CategoryModal from '@/components/CategoryModal';
import { CategoryType } from '@/types/types';
import OnboardingModal from '@/components/OnboardingModal';
import { formatCurrency } from '@/utils/formatting';

export default function HomeScreen() {
  const { getAvailableBalance, getTotalSavings, userProfile, isFirstLaunch, deposits, appStyle } = useSpendingContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const bounceAnim = useState(new Animated.Value(1))[0];
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  
  const currentColors = Colors.getStyleColors(appStyle);
  const availableBalance = getAvailableBalance();
  const totalSavings = getTotalSavings();
  
  // Check for matured deposits
  const maturedDeposits = deposits.filter(d => d.status === 'matured');

  useEffect(() => {
    // Bounce animation for balance
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [availableBalance]);

  useEffect(() => {
    // Show welcome message if user profile exists
    if (userProfile?.childName && !isFirstLaunch) {
      setShowWelcomeMessage(true);
      
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [userProfile, isFirstLaunch]);

  const handleCategoryPress = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="My Piggy Bank 🏦" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showWelcomeMessage && userProfile?.childName && (
          <View style={[styles.welcomeContainer, { backgroundColor: currentColors.lightPrimary }]}>
            <Text style={[styles.welcomeText, { color: currentColors.primary }]}>
              Welcome back, {userProfile.childName}! 👋
            </Text>
          </View>
        )}
        
        {/* Matured Deposits Alert */}
        {maturedDeposits.length > 0 && (
          <TouchableOpacity style={[styles.maturedAlert, { backgroundColor: Colors.lightGreen }]}>
            <Text style={styles.maturedText}>
              🎉 {maturedDeposits.length} deposit{maturedDeposits.length > 1 ? 's have' : ' has'} matured!
            </Text>
            <Text style={styles.maturedSubtext}>Money automatically added to your balance! Check "Savings" tab for details.</Text>
          </TouchableOpacity>
        )}
        
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <BalanceCard balance={availableBalance} />
        </Animated.View>
        
        {/* Fixed Deposits Card */}
        {totalSavings > 0 && (
          <View style={[styles.savingsCard, { backgroundColor: Colors.lightGreen }]}>
            <View style={styles.savingsHeader}>
              <TrendingUp size={24} color={Colors.green} />
              <Text style={styles.savingsLabel}>Fixed Deposits</Text>
            </View>
            <Text style={[styles.savingsAmount, { color: Colors.green }]}>
              {formatCurrency(totalSavings)}
            </Text>
            <Text style={styles.savingsSubtext}>
              You're saving HK${totalSavings.toFixed(2)} in deposits! 🌱
            </Text>
          </View>
        )}
        
        <View style={styles.spendSection}>
          <Text style={styles.sectionTitle}>I want to spend on... 💳</Text>
          
          <View style={styles.quickSpendGrid}>
            <QuickSpendButton 
              title="Drink 🥤" 
              icon={<Coffee color={Colors.blue} size={32} />}
              onPress={() => handleCategoryPress('Food')}
            />
            <QuickSpendButton 
              title="Snack 🍪" 
              icon={<Cookie color={Colors.pink} size={32} />}
              onPress={() => handleCategoryPress('Food')}
            />
            <QuickSpendButton 
              title="Book 📚" 
              icon={<Book color={Colors.orange} size={32} />}
              onPress={() => handleCategoryPress('Education')}
            />
            <QuickSpendButton 
              title="Games 🎮" 
              icon={<Gamepad2 color={Colors.purple} size={32} />}
              onPress={() => handleCategoryPress('Entertainment')}
            />
            <QuickSpendButton 
              title="Fun 🎵" 
              icon={<Music color={Colors.green} size={32} />}
              onPress={() => handleCategoryPress('Entertainment')}
            />
            <QuickSpendButton 
              title="Other 🎁" 
              icon={<Gift color={Colors.red} size={32} />}
              onPress={() => handleCategoryPress('Other')}
            />
          </View>
        </View>
        
        {/* Educational Tips */}
        <View style={[styles.tipCard, { backgroundColor: Colors.lightYellow }]}>
          <Text style={styles.tipTitle}>💡 Smart Money Tip!</Text>
          <Text style={styles.tipText}>
            {availableBalance < 10 
              ? "Ask your parents for allowance to add money to your piggy bank!"
              : "Great job saving! Consider putting some money in a deposit to watch it grow! 🌱"
            }
          </Text>
        </View>
      </ScrollView>

      <CategoryModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
        category={selectedCategory || 'Other'}
      />
      
      <OnboardingModal visible={isFirstLaunch} />
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  welcomeContainer: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  maturedAlert: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  maturedText: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.green,
    textAlign: 'center',
    marginBottom: 4,
  },
  maturedSubtext: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.green,
    textAlign: 'center',
  },
  savingsCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsLabel: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  savingsAmount: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  savingsSubtext: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 12,
    color: Colors.darkGray,
  },
  sectionTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  spendSection: {
    marginTop: 24,
  },
  quickSpendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  tipTitle: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  tipText: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});