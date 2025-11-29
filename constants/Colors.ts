import { AppStyle } from '@/types/types';

// Boys color palette - more vibrant and cartoonish
const boysColors = {
  // Primary colors
  primary: '#00CED1',    // Dark turquoise
  lightPrimary: '#E0FFFF',
  secondary: '#1E90FF',  // Dodger blue
  accent: '#32CD32',     // Lime green
  
  // Status colors
  green: '#00FF32',      // Electric green
  red: '#FF4500',        // Orange red
  yellow: '#FFD700',     // Gold
  blue: '#0080FF',       // Azure
  purple: '#8A2BE2',     // Blue violet
  
  // Light variations
  lightGreen: '#E0FFF0',
  lightRed: '#FFE5E0',
  lightYellow: '#FFF8DC',
  lightBlue: '#E0F0FF',
  lightPurple: '#F0E6FF',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#F0F8FF',  // Alice blue
  lightGray: '#F0F0F0',
  gray: '#B0B0B0',
  darkGray: '#707070',
  text: '#2D2D2D',
  
  // Fun colors
  orange: '#FF7F00',     // Orange
  
  // Category colors array for charts and visualizations
  categoryColors: ['#00CED1', '#1E90FF', '#32CD32', '#0080FF', '#8A2BE2', '#00FF32'],
};

// Girls color palette - more vibrant and cartoonish
const girlsColors = {
  // Primary colors
  primary: '#FF69B4',    // Hot pink
  lightPrimary: '#FFE1F0',
  secondary: '#4ECDC4',  // Turquoise
  accent: '#FFD700',     // Gold
  
  // Status colors
  green: '#00FF7F',      // Spring green
  red: '#FF6B6B',        // Coral red
  yellow: '#FFD700',     // Gold
  blue: '#00BFFF',       // Deep sky blue
  purple: '#DA70D6',     // Orchid
  
  // Light variations
  lightGreen: '#E0FFF0',
  lightRed: '#FFE5E5',
  lightYellow: '#FFF8DC',
  lightBlue: '#E0F6FF',
  lightPurple: '#F8E6FF',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#FFF8F8',  // Very light pink
  lightGray: '#F0F0F0',
  gray: '#B0B0B0',
  darkGray: '#707070',
  text: '#2D2D2D',
  
  // Fun colors
  pink: '#FF1493',       // Deep pink
  orange: '#FF7F50',     // Coral
  
  // Category colors array for charts and visualizations
  categoryColors: ['#FF69B4', '#4ECDC4', '#FFD700', '#00BFFF', '#DA70D6', '#00FF7F'],
};

// Default to girls style (for backward compatibility)
let currentStyle: AppStyle = 'girls';

// Function to set the current style
export const setColorStyle = (style: AppStyle) => {
  currentStyle = style;
};

// Export the appropriate color palette based on the current style
const Colors = {
  ...girlsColors, // Default to girls style
  
  // Function to get the style-specific colors
  getStyleColors: (style: AppStyle) => {
    return style === 'boys' ? boysColors : girlsColors;
  },
  
  // Function to get the current style
  getCurrentStyle: () => currentStyle,
};

export default Colors;