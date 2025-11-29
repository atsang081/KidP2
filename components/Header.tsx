import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Colors from '@/constants/Colors';
import { User } from 'lucide-react-native';
import ProfileModal from './ProfileModal';
import { useSpendingContext } from '@/context/SpendingContext';

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { userProfile, appStyle } = useSpendingContext();
  const currentColors = Colors.getStyleColors(appStyle);

  // If the title is "My Piggy Bank", customize it with the child's name if available
  const displayTitle = title === "My Piggy Bank" && userProfile?.childName 
    ? `${userProfile.childName}'s Piggy Bank` 
    : title;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{displayTitle}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: currentColors.lightGray }]}
          onPress={() => setShowProfileModal(true)}
        >
          <User size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ProfileModal 
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});