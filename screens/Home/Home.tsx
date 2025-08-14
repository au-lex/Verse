import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Verse {
  reference: string;
  text: string;
  version: string;
}

interface RecentReadingItem {
  book: string;
  chapter: string;
  lastRead: string;
}

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const BibleHomeScreen: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState<Verse>({
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    version: "NIV"
  });

  const [recentReading, setRecentReading] = useState<RecentReadingItem[]>([
    { book: "Genesis", chapter: "1", lastRead: "2 hours ago" },
    { book: "Matthew", chapter: "5", lastRead: "Yesterday" },
    { book: "Psalms", chapter: "23", lastRead: "3 days ago" }
  ]);

  const quickActions: QuickAction[] = [
    { 
      icon: "book-outline", 
      label: "Read", 
      color: "#3B82F6",
      onPress: () => router.push('/bible-versions')
    },
    { 
      icon: "search-outline", 
      label: "Search", 
      color: "#10B981",
      onPress: () => router.push('/search/Index')
    },
    { 
      icon: "bookmark-outline", 
      label: "Bookmarks", 
      color: "#8B5CF6",
      onPress: () => router.push('/bookmarks')
    },
    { 
      icon: "download-outline", 
      label: "Offline", 
      color: "#F59E0B",
      onPress: () => router.push('/offline')
    }
  ];

  const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );

  const RecentReadingItemComponent: React.FC<{ 
    item: RecentReadingItem; 
    onPress: () => void 
  }> = ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.recentReadingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recentReadingLeft}>
        <View style={styles.recentReadingIcon}>
          <Ionicons name="book-outline" size={20} color="#3B82F6" />
        </View>
        <View>
          <Text style={styles.recentReadingTitle}>
            {item.book} {item.chapter}
          </Text>
          <Text style={styles.recentReadingTime}>{item.lastRead}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Bible</Text>
            <Text style={styles.headerSubtitle}>Good morning! Ready to read?</Text>
          </View>
          <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="moon" size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="notifications" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verse of the Day */}
        <View style={styles.verseOfDayCard}>
          <Text style={styles.verseOfDayTitle}>Verse of the Day</Text>
          <Text style={styles.verseText}>
            "{currentVerse.text}"
          </Text>
          <View style={styles.verseFooter}>
            <Text style={styles.verseReference}>{currentVerse.reference}</Text>
            <Text style={styles.verseVersion}>{currentVerse.version}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} />
            ))}
          </View>
        </View>

        {/* Continue Reading */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            <TouchableOpacity onPress={() => router.push('/reading-history')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.continueReadingCard}
            onPress={() => router.push('/bible/genesis/1')}
          >
            <View style={styles.continueReadingContent}>
              <View>
                <Text style={styles.continueReadingTitle}>Genesis 1</Text>
                <Text style={styles.continueReadingSubtitle}>Last read: 2 hours ago</Text>
              </View>
              <View style={styles.continueReadingRight}>
                <View style={styles.progressDot} />
                <Text style={styles.progressText}>85% complete</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '85%' }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Reading */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reading</Text>
          <View style={styles.recentReadingContainer}>
            {recentReading.map((item, index) => (
              <RecentReadingItemComponent
                key={index}
                item={item}
                onPress={() => router.push(`/bible/${item.book.toLowerCase()}/${item.chapter}`)}
              />
            ))}
          </View>
        </View>



      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',

  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  verseOfDayCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#3B82F6',

  },
  verseOfDayTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  verseText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  verseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseReference: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  verseVersion: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    width: (width - 48) / 2,

  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  continueReadingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,

  },
  continueReadingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueReadingTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  continueReadingSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  continueReadingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  recentReadingContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentReadingItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',

  },
  recentReadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentReadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentReadingTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  recentReadingTime: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'Nunito-Bold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
});

export default BibleHomeScreen;