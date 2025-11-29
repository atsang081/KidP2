import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { SearchX } from 'lucide-react-native';
import { useSpendingContext } from '@/context/SpendingContext';

type EmptyStateProps = {
  message: string;
  subMessage?: string;
};

export default function EmptyState({ message, subMessage }: EmptyStateProps) {
  const { appStyle } = useSpendingContext();
  const currentColors = Colors.getStyleColors(appStyle);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: currentColors.lightPrimary }]}>
        <SearchX size={48} color={currentColors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  iconContainer: {
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  message: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});