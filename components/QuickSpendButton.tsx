import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { useSpendingContext } from '@/context/SpendingContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type QuickSpendButtonProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export default function QuickSpendButton({ title, icon, onPress }: QuickSpendButtonProps) {
  const { appStyle } = useSpendingContext();
  const currentColors = Colors.getStyleColors(appStyle);
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconContainer, { backgroundColor: currentColors.white }]}>
          {icon}
        </View>
        <Text style={[styles.title, { color: currentColors.text }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'ComicNeue-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
});