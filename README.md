# 🏦 Kids Piggy Bank - Financial Education App

## 🌐 Live Demo
**Try the app now**: [https://atsang081.github.io/KidP2](https://atsang081.github.io/KidP2)

*No installation required - works directly in your web browser!*

A React Native educational app designed to teach children about money management, savings, and financial responsibility.

## 📱 Features

### Core Functionality
- **💰 Balance Management**: Track available balance and spending
- **💳 Transaction History**: Record income and expenses with categories
- **🏦 Fixed-Term Deposits**: Create deposits with different terms (1, 3, 6, 12 months)
- **📈 Interest Calculation**: Term-specific interest rates for deposits
- **🔄 Auto-Maturity**: Automatic crediting of matured deposits

### Parental Controls
- **🔒 Password Protection**: Secure parent dashboard access
- **💸 Add Allowance**: Parents can add money to child's account
- **⚙️ Rate Management**: Configure interest rates for different deposit terms
- **🎨 Theme Selection**: Choose between Boys and Girls themes

### Educational Elements
- **📊 Visual Feedback**: Clean interface focusing on numerical values
- **🌱 Growth Visualization**: Watch deposits grow over time
- **💡 Financial Tips**: Educational content about smart money habits

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API
- **Storage**: Expo SecureStore / localStorage
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Currency**: Hong Kong Dollar (HKD)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- Expo CLI
- iOS Simulator / Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/atsang081/KidP2.git
cd KidP2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Open the app:
   - **Web**: Press `w` to open in browser
   - **iOS**: Press `i` to open in iOS Simulator
   - **Android**: Press `a` to open in Android Emulator
   - **Mobile**: Scan QR code with Expo Go app

## 📱 Usage

### For Children
1. **Add Money**: Ask parents to add allowance
2. **Track Spending**: Record purchases in different categories
3. **Create Deposits**: Save money in fixed-term deposits
4. **Watch Growth**: See how deposits earn interest over time

### For Parents
1. **Access Dashboard**: Use password (default: "1234")
2. **Add Allowance**: Give children pocket money
3. **Set Interest Rates**: Configure rates for different deposit terms
4. **Monitor Progress**: View child's financial activity

## 🎨 Themes

The app supports two visual themes:
- **🌸 Girls Theme**: Pink and floral color palette
- **🚀 Boys Theme**: Blue and energetic color palette

## 💾 Data Storage

- **Web**: localStorage (development/demo)
- **Mobile**: Expo SecureStore (production)
- **Persistence**: All data survives app restarts

## 🔒 Security

- **Parent Authentication**: Password-protected parent features
- **Secure Storage**: Financial data encrypted on device
- **Input Validation**: Comprehensive form validation

## 📚 Educational Value

This app teaches children:
- **💰 Money Management**: Track income and expenses
- **💵 Budgeting**: Understand spending categories
- **🏦 Banking Concepts**: Learn about deposits and interest
- **📈 Financial Growth**: See how saving money over time pays off
- **🤔 Decision Making**: Choose between spending and saving

## 🔧 Development

### Project Structure
```
├── app/                    # Screen components
│   └── (tabs)/            # Tab-based navigation screens
├── components/            # Reusable UI components
├── constants/             # App constants and colors
├── context/              # React Context for state management
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Key Components
- **SpendingContext**: Central state management
- **Parent Dashboard**: Administrative controls
- **Deposits Screen**: Fixed-term deposit management
- **Transaction History**: Financial activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Icons by Lucide
- Designed for educational purposes
- Created to promote financial literacy in children

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Happy Learning! 🎓💰**