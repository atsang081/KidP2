import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Colors from '@/constants/Colors';
import { X, ShoppingBag, Pizza, Bus, Gamepad2, Book, Palette, Music, Gift, Coffee, Cookie } from 'lucide-react-native';
import { CategoryType } from '@/types/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type CategoryItem = {
  id: string;
  name: CategoryType;
  icon: React.ReactNode;
  color: string;
};

type AllCategoriesModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: CategoryType) => void;
};

export default function AllCategoriesModal({
  visible,
  onClose,
  onSelectCategory,
}: AllCategoriesModalProps) {
  // Animation values
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  // Category data
  const categories: CategoryItem[] = [
    {
      id: '1',
      name: 'Food',
      icon: <Cookie size={32} color={Colors.orange} />,
      color: Colors.lightYellow,
    },
    {
      id: '2',
      name: 'Transport',
      icon: <Bus size={32} color={Colors.green} />,
      color: Colors.lightGreen,
    },
    {
      id: '3',
      name: 'Entertainment',
      icon: <Gamepad2 size={32} color={Colors.purple} />,
      color: Colors.lightPurple,
    },
    {
      id: '4',
      name: 'Education',
      icon: <Book size={32} color={Colors.blue} />,
      color: Colors.lightBlue,
    },
    {
      id: '5',
      name: 'Pocket Money',
      icon: <ShoppingBag size={32} color={Colors.primary} />,
      color: Colors.lightPrimary,
    },
    {
      id: '6',
      name: 'Gift',
      icon: <Gift size={32} color={Colors.red} />,
      color: Colors.lightRed,
    },
    {
      id: '7',
      name: 'Other',
      icon: <Palette size={32} color={Colors.secondary} />,
      color: Colors.lightBlue,
    },
  ];

  // Update animation values when visibility changes
  useState(() => {
    if (visible) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(0.9);
    }
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const handleCategorySelect = (category: CategoryType) => {
    onSelectCategory(category);
    onClose();
  };

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: item.color }]}
      onPress={() => handleCategorySelect(item.name)}
    >
      <View style={styles.categoryIcon}>{item.icon}</View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, animatedStyle]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>All Categories</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.subtitle}>Select a category to add spending</Text>

                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  contentContainerStyle={styles.categoriesList}
                />
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
    maxHeight: '80%',
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
  subtitle: {
    fontFamily: 'ComicNeue-Regular',
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryName: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
});