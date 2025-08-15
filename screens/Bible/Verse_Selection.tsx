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
import { useGetVerses } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

interface Verse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseCount?: number;
  copyright?: string;
}

const BibleVerseSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'de4e12af7f28f599-02';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  const chapterId = params.chapterId as string;
  const chapterNumber = params.chapterNumber as string || '1';
  const chapterReference = params.chapterReference as string;
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch verses from API
  const { data: versesResponse, isLoading, error } = useGetVerses(version, chapterId);

  const getFilteredVerses = (): Verse[] => {
    if (!versesResponse?.data) {
      return [];
    }

    const allVerses = versesResponse.data;
    
    if (!searchQuery.trim()) {
      return allVerses;
    }
    
    const query = searchQuery.trim().toLowerCase();
    return allVerses.filter(verse => 
      verse.reference.toLowerCase().includes(query) ||
      verse.content.toLowerCase().includes(query) ||
      verse.id.toLowerCase().includes(query)
    );
  };

  const handleVerseSelect = (verse: Verse) => {
    // Extract verse number from reference or ID
    const verseNumber = extractVerseNumber(verse.reference, verse.id);
    
    router.push({
      pathname: '/read/bible-reader',
      params: { 
        version,
        bookId,
        bookName,
        chapterId,
        chapterNumber,
        verseId: verse.id,
        verseNumber: verseNumber.toString(),
        verseReference: verse.reference
      }
    });
  };

  const handleReadFullChapter = () => {
    router.push({
      pathname: '/read/bible-reader',
      params: { 
        version,
        bookId,
        bookName,
        chapterId,
        chapterNumber
      }
    });
  };

  // Helper function to extract verse number from reference or ID
  const extractVerseNumber = (reference: string, id: string): number => {
    // Try to extract from reference first (e.g., "John 3:16" -> 16)
    const refMatch = reference.match(/:(\d+)$/);
    if (refMatch) {
      return parseInt(refMatch[1]);
    }
    
    // Try to extract from ID (e.g., "JHN.3.16" -> 16)
    const idParts = id.split('.');
    if (idParts.length >= 3) {
      const lastPart = parseInt(idParts[idParts.length - 1]);
      if (!isNaN(lastPart)) {
        return lastPart;
      }
    }
    
    // Fallback: try to find any number in the reference or ID
    const numberMatch = (reference + ' ' + id).match(/(\d+)/);
    return numberMatch ? parseInt(numberMatch[1]) : 1;
  };

  const VerseButton: React.FC<{ verse: Verse; index: number }> = ({ verse, index }) => {
    const verseNumber = extractVerseNumber(verse.reference, verse.id);
    
    return (
      <TouchableOpacity
        style={styles.verseButton}
        onPress={() => handleVerseSelect(verse)}
        activeOpacity={0.7}
      >
        <Text style={styles.verseButtonText}>{verseNumber}</Text>
      </TouchableOpacity>
    );
  };

  const filteredVerses = useMemo(() => getFilteredVerses(), [versesResponse, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading verses...</Text>
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
          <Text style={styles.errorTitle}>Failed to load verses</Text>
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
          <Text style={styles.headerTitle}>Select Verse</Text>
          <Text style={styles.headerSubtitle}>{bookName} {chapterNumber} - {version}</Text>
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
            placeholder="Search verses..."
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

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.readChapterButton}
          onPress={handleReadFullChapter}
        >
          <Ionicons name="book-outline" size={16} color="#FFFFFF" />
          <Text style={styles.readChapterButtonText}>Read Full Chapter</Text>
        </TouchableOpacity>
        
        {versesResponse?.data && (
          <Text style={styles.verseCount}>
            {versesResponse.data.length} {versesResponse.data.length === 1 ? 'Verse' : 'Verses'}
          </Text>
        )}
      </View>

      {/* Verses Grid or List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.trim() ? (
          // List view when searching (shows content)
          <View style={styles.versesListContainer}>
            {filteredVerses.map((verse, index) => (
              <TouchableOpacity
                key={verse.id}
                style={styles.verseListItem}
                onPress={() => handleVerseSelect(verse)}
                activeOpacity={0.7}
              >
                <View style={styles.verseListHeader}>
                  <Text style={styles.verseReference}>{verse.reference}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
                <Text style={styles.verseContent} numberOfLines={2}>
                  {verse.content.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          // Grid view when not searching (shows numbers only)
          <View style={styles.versesContainer}>
            <View style={styles.versesGrid}>
              {filteredVerses.map((verse, index) => (
                <VerseButton key={verse.id} verse={verse} index={index} />
              ))}
            </View>
          </View>
        )}
        
        {filteredVerses.length === 0 && !isLoading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="book-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noResultsTitle}>No verses found</Text>
            <Text style={styles.noResultsSubtitle}>Try adjusting your search query</Text>
          </View>
        )}
        
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  readChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  readChapterButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  verseCount: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  versesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  versesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  verseButton: {
    width: (width - 80) / 6,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  verseButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  versesListContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  verseListItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  verseListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  verseContent: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
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

export default BibleVerseSelection;