# Toraaah Bible Reading App

A React Native Bible reading app with offline support and search functionality.

## 📱 Quick Demo

**OPEN THE URL WITH EXPO GO**: [URL](https://expo.dev/preview/update?message=full+app+done&updateRuntimeVersion=1.0.0&createdAt=2025-08-15T02%3A54%3A23.282Z&slug=exp&projectId=76b8965a-5547-47d5-8b8d-f156f20d9a28&group=b7649382-322c-4ead-a16f-892a504cc6cd)
**Download APK**: [Download Android APK](https://expo.dev/accounts/aulex/projects/verse/builds/74f7ea14-b954-4ed2-ab6e-475adc341077)

**Expo Development Build**: Use Expo Go app and scan QR code when running `npx expo start`

## 🚀 Setup Instructions

### Prerequisites    
- Node.js (v16+)
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
git clone git@github.com:au-lex/Verse.git
cd cd verse
npm install

# Start development server
npx expo start

# Or build APK
expo build:android
```

## 🏗️ Technical Approach

### Architecture
- **Screens**: Version selector → Books list → Chapter reading
- **Navigation**: React Navigation for smooth transitions
- **Offline**: AsyncStorage for chapter caching
- **State Management**: TanStack Query for API calls and caching

### Key Features
- Browse Bible versions and books
- Read chapters with formatted verses
- Offline reading (auto-cached chapters)
- Search within selected version
- Loading states and error handling
- Smooth animations

## 📚 Third-Party Libraries

**@tanstack/react-query**
- **Why**: Excellent for data fetching with built-in caching and offline support
- **Benefits**: Automatic caching, loading states, background updates, perfect for the offline requirement

**@react-navigation/native**
- **Why**: Standard navigation library with smooth transitions

**@react-native-async-storage/async-storage**
- **Why**: Reliable local storage for offline chapter caching

## 🚧 Trade-offs & Limitations


- Simple cache strategy (no size management)
- No reading progress sync across devices

## 🧪 Testing
```bash
npm test
```

## 📱 App Flow
1. Select Bible version
2. Choose book from list
3. Select chapter to read verses
4. Chapters auto-cache for offline reading
5. Search with keyword etc

---
Built for Toraaah React Native Developer Assessement by Aulex
