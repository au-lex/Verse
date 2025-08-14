import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'Nunito-SemiBold',
          fontSize: 12,
        },
   
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size = 28 }) => (
            <Image
              source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1755142158/home_dtx1ks.png' }}
              style={{
                width: 20,
                height: size,
                tintColor: color,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ color, focused, size = 28 }) => (
            <Image
              source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1755142297/reading-book_nt6ev6.png' }}
              style={{
                width: size,
                height: size,
                tintColor: color,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused, size = 20 }) => (
            <Image
              source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1755142145/setting_tq4g1a.png' }}
              style={{
                width: 20,
                height: size,
                tintColor: color,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}