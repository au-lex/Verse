import React, { useState, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetChapters } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

interface Chapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  content?: string;
  copyright?: string;
  verseCount?: number;
}

const BibleChapterSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'de4e12af7f28f599-02';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch chapters from API
  const { data: chaptersResponse, isLoading, error } = useGetChapters(version, bookId);

  const getFilteredChapters = (): Chapter[] => {
    if (!chaptersResponse?.data) {
      return [];
    }

    const allChapters = chaptersResponse.data;
    
    if (!searchQuery.trim()) {
      return allChapters;
    }
    
    const query = searchQuery.trim().toLowerCase();
    return allChapters.filter(chapter => 
      chapter.number.includes(query) ||
      chapter.reference.toLowerCase().includes(query)
    );
  };

  const handleChapterSelect = (chapter: Chapter) => {
    router.push({
      pathname: '/read/verse-selection',
      params: { 
        version,
        bookId,
        bookName,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterReference: chapter.reference
      }
    });
  };

  const ChapterButton: React.FC<{ chapter: Chapter }> = ({ chapter }) => (
    <TouchableOpacity
      style={styles.chapterButton}
      onPress={() => handleChapterSelect(chapter)}
      activeOpacity={0.7}
    >
      <Text style={styles.chapterButtonText}>{chapter.number}</Text>
    </TouchableOpacity>
  );

  const filteredChapters = useMemo(() => getFilteredChapters(), [chaptersResponse, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading chapters...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load chapters</Text>
          <Text style={styles.errorSubtitle}>Please check your connection and try again</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Chapter</Text>
          <Text style={styles.headerSubtitle}>{bookName} - {version}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chapters..."
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

      {/* Chapter Info */}
      {chaptersResponse?.data && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {chaptersResponse.data.length} {chaptersResponse.data.length === 1 ? 'Chapter' : 'Chapters'} Available
          </Text>
        </View>
      )}

      {/* Chapters Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chaptersContainer}>
          <View style={styles.chaptersGrid}>
            {filteredChapters.map((chapter) => (
              <ChapterButton key={chapter.id} chapter={chapter} />
            ))}
          </View>
          
          {filteredChapters.length === 0 && !isLoading && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="book-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noResultsTitle}>No chapters found</Text>
              <Text style={styles.noResultsSubtitle}>Try adjusting your search query</Text>
            </View>
          )}
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
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
    fontSize: 12,
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
  infoContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  chaptersContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterButton: {
    width: (width - 80) / 5,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chapterButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
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
});

export default BibleChapterSelection;