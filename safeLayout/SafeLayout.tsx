
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ViewStyle } from 'react-native';
import { Stack } from 'expo-router';

interface SafeLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'auto' | 'light' | 'dark';
  statusBarBackgroundColor?: string;
  style?: ViewStyle;
  headerShown?: boolean;
  title?: string;
}

const SafeLayout: React.FC<SafeLayoutProps> = ({
  children,
  backgroundColor = '#F9FAFB',
  statusBarStyle = 'dark',
  statusBarBackgroundColor = '#FFFFFF',
  style,
  headerShown = false,
  title,
}) => {
  return (
    <SafeAreaProvider>

      <Stack.Screen 
        options={{ 
          headerShown,
          title: title || '',
          headerStyle: {
            backgroundColor: statusBarBackgroundColor,
          },
          headerTitleStyle: {
            fontFamily: 'Nunito-SemiBold',
            color: '#111827',
          },
        }} 
      />
      
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