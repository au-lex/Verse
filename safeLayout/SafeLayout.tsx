// components/SafeLayout.tsx
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ViewStyle } from 'react-native';

interface SafeLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'auto' | 'light' | 'dark';
  statusBarBackgroundColor?: string;
  style?: ViewStyle;
}

const SafeLayout: React.FC<SafeLayoutProps> = ({
  children,
  backgroundColor = '#F9FAFB',
  statusBarStyle = 'dark',
  statusBarBackgroundColor = '#FFFFFF',
  style,
}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
        <StatusBar 
          style={statusBarStyle} 
          backgroundColor={statusBarBackgroundColor}
          translucent={false}
        />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeLayout;