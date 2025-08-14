import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  language: string;
  category: 'popular' | 'english' | 'modern' | 'traditional' | 'study';
  isDownloaded: boolean;
  downloadSize?: string;
  isSelected?: boolean;
}

interface VersionCategory {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  versions: BibleVersion[];
}

const BibleVersionScreen: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>('niv');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [downloadingVersions, setDownloadingVersions] = useState<Set<string>>(new Set());

  const versionCategories: VersionCategory[] = [
    {
      id: 'popular',
      title: 'Popular Versions',
      description: 'Most commonly used Bible translations',
      icon: 'star-outline',
      versions: [
        {
          id: 'niv',
          name: 'New International Version',
          abbreviation: 'NIV',
          description: 'A balanced translation that combines accuracy with readability',
          language: 'English',
          category: 'popular',
          isDownloaded: true,
        },
        {
          id: 'esv',
          name: 'English Standard Version',
          abbreviation: 'ESV',
          description: 'Essentially literal translation emphasizing word-for-word accuracy',
          language: 'English',
          category: 'popular',
          isDownloaded: true,
        },
        {
          id: 'nlt',
          name: 'New Living Translation',
          abbreviation: 'NLT',
          description: 'Thought-for-thought translation for easy understanding',
          language: 'English',
          category: 'popular',
          isDownloaded: false,
          downloadSize: '12 MB',
        },
        {
          id: 'kjv',
          name: 'King James Version',
          abbreviation: 'KJV',
          description: 'Classic translation with traditional English',
          language: 'English',
          category: 'popular',
          isDownloaded: true,
        },
      ]
    },
    {
      id: 'modern',
      title: 'Modern Translations',
      description: 'Contemporary language translations',
      icon: 'time-outline',
      versions: [
        {
          id: 'msg',
          name: 'The Message',
          abbreviation: 'MSG',
          description: 'Contemporary paraphrase in modern American English',
          language: 'English',
          category: 'modern',
          isDownloaded: false,
          downloadSize: '8 MB',
        },
        {
          id: 'ceb',
          name: 'Common English Bible',
          abbreviation: 'CEB',
          description: 'Translation using common English for broad accessibility',
          language: 'English',
          category: 'modern',
          isDownloaded: false,
          downloadSize: '11 MB',
        },
        {
          id: 'csb',
          name: 'Christian Standard Bible',
          abbreviation: 'CSB',
          description: 'Optimal blend of accuracy and readability',
          language: 'English',
          category: 'modern',
          isDownloaded: false,
          downloadSize: '10 MB',
        },
      ]
    },
    {
      id: 'study',
      title: 'Study Bibles',
      description: 'Enhanced versions with study notes and commentary',
      icon: 'school-outline',
      versions: [
        {
          id: 'nasb',
          name: 'New American Standard Bible',
          abbreviation: 'NASB',
          description: 'Literal translation preferred for detailed Bible study',
          language: 'English',
          category: 'study',
          isDownloaded: false,
          downloadSize: '15 MB',
        },
        {
          id: 'rsv',
          name: 'Revised Standard Version',
          abbreviation: 'RSV',
          description: 'Scholarly translation maintaining literary quality',
          language: 'English',
          category: 'study',
          isDownloaded: false,
          downloadSize: '13 MB',
        },
      ]
    },
    {
      id: 'traditional',
      title: 'Traditional Versions',
      description: 'Historic and traditional translations',
      icon: 'library-outline',
      versions: [
        {
          id: 'nkjv',
          name: 'New King James Version',
          abbreviation: 'NKJV',
          description: 'Updated KJV with modern English while preserving the original style',
          language: 'English',
          category: 'traditional',
          isDownloaded: false,
          downloadSize: '12 MB',
        },
        {
          id: 'amp',
          name: 'Amplified Bible',
          abbreviation: 'AMP',
          description: 'Expands on the meaning of key words and phrases',
          language: 'English',
          category: 'traditional',
          isDownloaded: false,
          downloadSize: '18 MB',
        },
      ]
    }
  ];

  const getCurrentVersions = (): BibleVersion[] => {
    const category = versionCategories.find(cat => cat.id === activeCategory);
    if (!category) return [];
    
    let versions = category.versions;
    
    if (searchQuery.trim()) {
      versions = versions.filter(version => 
        version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return versions;
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
  };

  const handleDownloadVersion = async (versionId: string) => {
    setDownloadingVersions(prev => new Set([...prev, versionId]));
    
    // Simulate download
    setTimeout(() => {
      setDownloadingVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(versionId);
        return newSet;
      });
      
      // Update version as downloaded
      Alert.alert('Download Complete', 'Bible version downloaded successfully!');
    }, 3000);
  };

  const handleContinue = () => {
    const selectedVersionData = versionCategories
      .flatMap(cat => cat.versions)
      .find(version => version.id === selectedVersion);
    
    if (!selectedVersionData?.isDownloaded) {
      Alert.alert(
        'Version Not Available',
        'Please download the selected version first or choose a downloaded version.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to Bible reading with selected version
    router.push({
      pathname: '/bible-reader',
      params: { version: selectedVersion }
    });
  };

  const VersionCard: React.FC<{ version: BibleVersion }> = ({ version }) => (
    <TouchableOpacity
      style={[
        styles.versionCard,
        selectedVersion === version.id && styles.selectedVersionCard
      ]}
      onPress={() => handleVersionSelect(version.id)}
      activeOpacity={0.7}
    >
      <View style={styles.versionHeader}>
        <View style={styles.versionInfo}>
          <View style={styles.versionTitleRow}>
            <Text style={styles.versionAbbreviation}>{version.abbreviation}</Text>
            {version.isDownloaded && (
              <View style={styles.downloadedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            )}
          </View>
          <Text style={styles.versionName}>{version.name}</Text>
          <Text style={styles.versionDescription}>{version.description}</Text>
        </View>
        
        <View style={styles.versionActions}>
          {selectedVersion === version.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            </View>
          )}
          
          {!version.isDownloaded && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadVersion(version.id)}
              disabled={downloadingVersions.has(version.id)}
            >
              {downloadingVersions.has(version.id) ? (
                <Ionicons name="download-outline" size={20} color="#6B7280" />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={16} color="#3B82F6" />
                  <Text style={styles.downloadButtonText}>{version.downloadSize}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Bible Version</Text>
          <Text style={styles.headerSubtitle}>Select your preferred translation</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search versions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>




      {/* Versions List */}
      <ScrollView style={styles.versionsContainer} showsVerticalScrollIndicator={false}>
        {getCurrentVersions().map((version) => (
          <VersionCard key={version.id} version={version} />
        ))}
        
        {getCurrentVersions().length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noResultsTitle}>No versions found</Text>
            <Text style={styles.noResultsSubtitle}>Try adjusting your search query</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedVersion && styles.disabledButton
          ]}
          onPress={() => router.push('/(read)/book-selection')}
          disabled={!selectedVersion}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedVersion && styles.disabledButtonText
          ]}>
            Continue Reading
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={selectedVersion ? "#FFFFFF" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#111827',
  },

  activeCategoryTab: {
    backgroundColor: '#DBEAFE',
  },
  categoryTabText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: '#3B82F6',
  },

  versionsContainer: {
    flex: 1,
    padding: 16,
  },
  versionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',

  },
  selectedVersionCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFF',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  versionInfo: {
    flex: 1,
    marginRight: 16,
  },
  versionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  versionAbbreviation: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#3B82F6',
  },
  downloadedBadge: {
    // Just the icon, no extra styling needed
  },
  versionName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  versionDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  versionActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  selectedIndicator: {
    // Just the icon, positioned by parent
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  downloadButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginTop: 16,
  },
  noResultsSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});

export default BibleVersionScreen;