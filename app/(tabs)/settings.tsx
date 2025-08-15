import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeLayout from '@/safeLayout/SafeLayout';


interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoScroll: true,
    highlightVerses: true,
    keepScreenOn: false,
    downloadOffline: false,
    fontSize: 16,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing Bible app! Download it now and enhance your Bible study experience.',
        title: 'Bible App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRate = () => {
    // Replace with your actual app store URLs
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=your.app.id';
    const appStoreUrl = 'https://apps.apple.com/app/id1234567890';
    
    Alert.alert(
      'Rate Our App',
      'Would you like to rate our app in the store?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Rate Now', 
          onPress: () => {
            // Open appropriate store based on platform
            Linking.openURL(playStoreUrl); // or appStoreUrl for iOS
          }
        },
      ]
    );
  };

  const handleContact = () => {
    const email = 'support@bibleapp.com';
    const subject = 'Bible App Support';
    const body = 'Hello, I need help with...';
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'reading',
      title: 'Reading Experience',
      items: [
        {
          id: 'fontSize',
          title: 'Font Size',
          subtitle: `${settings.fontSize}px`,
          icon: 'text-outline',
          type: 'navigation',
          onPress: () => router.push('/font-size-settings'),
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Easier reading in low light',
          icon: 'moon-outline',
          type: 'toggle',
          value: settings.darkMode,
          onToggle: (value) => handleToggle('darkMode', value),
        },
        {
          id: 'highlightVerses',
          title: 'Highlight Selected Verses',
          subtitle: 'Show highlighted verses in blue',
          icon: 'color-palette-outline',
          type: 'toggle',
          value: settings.highlightVerses,
          onToggle: (value) => handleToggle('highlightVerses', value),
        },
        {
          id: 'autoScroll',
          title: 'Auto Scroll',
          subtitle: 'Automatically scroll to selected verse',
          icon: 'arrow-down-circle-outline',
          type: 'toggle',
          value: settings.autoScroll,
          onToggle: (value) => handleToggle('autoScroll', value),
        },
        {
          id: 'keepScreenOn',
          title: 'Keep Screen On',
          subtitle: 'Prevent screen from dimming while reading',
          icon: 'sunny-outline',
          type: 'toggle',
          value: settings.keepScreenOn,
          onToggle: (value) => handleToggle('keepScreenOn', value),
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Daily Verse Notifications',
          subtitle: 'Receive daily Bible verses',
          icon: 'notifications-outline',
          type: 'toggle',
          value: settings.notifications,
          onToggle: (value) => handleToggle('notifications', value),
        },
        {
          id: 'notificationTime',
          title: 'Notification Time',
          subtitle: '8:00 AM',
          icon: 'time-outline',
          type: 'navigation',
          onPress: () => router.push('/notification-settings'),
        },
      ],
    },
    {
      id: 'storage',
      title: 'Storage & Data',
      items: [
        {
          id: 'downloadOffline',
          title: 'Download for Offline Reading',
          subtitle: 'Access Bible without internet',
          icon: 'download-outline',
          type: 'toggle',
          value: settings.downloadOffline,
          onToggle: (value) => handleToggle('downloadOffline', value),
        },
        {
          id: 'manageDownloads',
          title: 'Manage Downloads',
          subtitle: 'View and delete downloaded content',
          icon: 'folder-outline',
          type: 'navigation',
          onPress: () => router.push('/manage-downloads'),
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: 'trash-outline',
          type: 'action',
          onPress: handleClearCache,
        },
      ],
    },
    {
      id: 'about',
      title: 'About & Support',
      items: [
        {
          id: 'share',
          title: 'Share App',
          subtitle: 'Tell others about this app',
          icon: 'share-outline',
          type: 'action',
          onPress: handleShare,
        },
        {
          id: 'rate',
          title: 'Rate App',
          subtitle: 'Rate us in the app store',
          icon: 'star-outline',
          type: 'action',
          onPress: handleRate,
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get help or send feedback',
          icon: 'mail-outline',
          type: 'action',
          onPress: handleContact,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: () => router.push('/privacy-policy'),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Terms and conditions',
          icon: 'document-text-outline',
          type: 'navigation',
          onPress: () => router.push('/terms-of-service'),
        },
        {
          id: 'version',
          title: 'App Version',
          subtitle: '1.0.0',
          icon: 'information-circle-outline',
          type: 'navigation',
        },
      ],
    },
  ];

  const SettingsItemComponent: React.FC<{ item: SettingsItem }> = ({ item }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={item.onPress}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>
          <Ionicons name={item.icon} size={22} color="#3B82F6" />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
          thumbColor={item.value ? '#3B82F6' : '#F9FAFB'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  const SettingsSectionComponent: React.FC<{ section: SettingsSection }> = ({ section }) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <View key={item.id}>
            <SettingsItemComponent item={item} />
            {index < section.items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeLayout headerShown={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section) => (
          <SettingsSectionComponent key={section.id} section={section} />
        ))}
        
        {/* Bottom spacing */}
        <View style={{ height: 15 }} />
      </ScrollView>
    </SafeLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  settingsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
});

export default SettingsPage;