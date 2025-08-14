import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const BibleChapterSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'NIV';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  const totalChapters = parseInt(params.chapters as string) || 1;
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getFilteredChapters = (): number[] => {
    const allChapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
    
    if (!searchQuery.trim()) {
      return allChapters;
    }
    
    const query = searchQuery.trim().toLowerCase();
    return allChapters.filter(chapter => 
      chapter.toString().includes(query)
    );
  };

  const handleChapterSelect = (chapter: number) => {
    // Get verse count for the selected chapter (you can implement a lookup table)
    const verseCount = getVerseCount(bookId, chapter);
    
    router.push({
      pathname: '/read/verse-selection',
      params: { 
        version,
        bookId,
        bookName,
        chapter: chapter.toString(),
        verses: verseCount.toString()
      }
    });
  };

  // Helper function to get verse count (implement based on your data source)
  const getVerseCount = (bookId: string, chapter: number): number => {
    // This is a simplified example - you should implement proper verse counting
    // based on your Bible data source
    const verseCounts: { [key: string]: { [key: number]: number } } = {
      'genesis': { 1: 31, 2: 25, 3: 24, 4: 26, 5: 32 },
      'matthew': { 1: 25, 2: 23, 3: 17, 4: 25, 5: 48 },
      // Add more books and chapters as needed
    };
    
    return verseCounts[bookId]?.[chapter] || 25; // Default to 25 verses
  };

  const ChapterButton: React.FC<{ chapter: number }> = ({ chapter }) => (
    <TouchableOpacity
      style={styles.chapterButton}
      onPress={() => handleChapterSelect(chapter)}
      activeOpacity={0.7}
    >
      <Text style={styles.chapterButtonText}>{chapter}</Text>
    </TouchableOpacity>
  );

  const filteredChapters = getFilteredChapters();

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

      {/* Chapters Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chaptersContainer}>
          <View style={styles.chaptersGrid}>
            {filteredChapters.map((chapter) => (
              <ChapterButton key={chapter} chapter={chapter} />
            ))}
          </View>
          
          {filteredChapters.length === 0 && (
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
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    margin: 2,
    marginBottom: 12,
  },
  chapterButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },

});

export default BibleChapterSelection;