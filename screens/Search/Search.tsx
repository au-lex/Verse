import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBibleSearch, useGetBooks } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  bookId: string;
  chapterId: string;
  verseId: string;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}

interface PopularSearch {
  id: string;
  query: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  selected: boolean;
}

const BibleSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const resultsPerPage = 20;
  const [bibleVersion] = useState<string>('de4e12af7f28f599-02'); // Default version
  const [filters, setFilters] = useState<SearchFilter[]>([
    { id: '1', label: 'Old Testament', value: 'old_testament', selected: false },
    { id: '2', label: 'New Testament', value: 'new_testament', selected: false },
    { id: '3', label: 'Psalms', value: 'psalms', selected: false },
    { id: '4', label: 'Gospels', value: 'gospels', selected: false },
  ]);

  const searchInputRef = useRef<TextInput>(null);

  // API hooks
  const bibleSearch = useBibleSearch();
  const { data: booksResponse } = useGetBooks(bibleVersion);

  const [recentSearches] = useState<RecentSearch[]>([
    { id: '1', query: 'love', timestamp: new Date() },
    { id: '2', query: 'faith hope love', timestamp: new Date() },
    { id: '3', query: 'peace', timestamp: new Date() },
    { id: '4', query: 'salvation', timestamp: new Date() },
  ]);

  const [popularSearches] = useState<PopularSearch[]>([
    { id: '1', query: 'love', category: 'Emotions', icon: 'heart-outline' },
    { id: '2', query: 'faith', category: 'Spiritual', icon: 'flame-outline' },
    { id: '3', query: 'peace', category: 'Emotions', icon: 'leaf-outline' },
    { id: '4', query: 'hope', category: 'Spiritual', icon: 'sunny-outline' },
    { id: '5', query: 'forgiveness', category: 'Spiritual', icon: 'hand-left-outline' },
    { id: '6', query: 'wisdom', category: 'Knowledge', icon: 'bulb-outline' },
  ]);

  // Helper function to get book info from API response
  const getBookInfo = (bookId: string) => {
    if (!booksResponse?.data) return null;
    return booksResponse.data.find(book => book.id === bookId);
  };

  // Helper function to parse verse reference and IDs from API response
  const parseVerseData = (verse: any) => {
    // From your API response, we can see:
    // - id: "1CO.1.21" (book.chapter.verse)
    // - orgId: "1CO.1.21" 
    // - reference: "1 Corinthians 1:21"
    // - chapterId: "1CO.1"
    // - bookId: "1CO"
    
    const idParts = verse.id.split('.');
    const bookId = verse.bookId || idParts[0];
    const chapterId = verse.chapterId;
    
    // Extract chapter and verse numbers from the ID or reference
    let chapter = 1;
    let verseNumber = 1;
    
    if (idParts.length >= 3) {
      chapter = parseInt(idParts[1]) || 1;
      verseNumber = parseInt(idParts[2]) || 1;
    } else {
      // Fallback: parse from reference like "1 Corinthians 1:21"
      const referenceMatch = verse.reference.match(/(\d+):(\d+)/);
      if (referenceMatch) {
        chapter = parseInt(referenceMatch[1]);
        verseNumber = parseInt(referenceMatch[2]);
      }
    }
    
    return {
      bookId,
      chapterId,
      chapter,
      verse: verseNumber,
    };
  };

  const handleSearch = async (query: string, page: number = 0) => {
    if (query.trim().length === 0) {
      setShowResults(false);
      setSearchResults([]);
      setCurrentPage(0);
      setHasMoreResults(false);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    if (page === 0) {
      setShowResults(true);
      setSearchResults([]);
    }

    try {
      const response = await bibleSearch.mutateAsync({
        bibleId: bibleVersion,
        query: query.trim(),
        limit: resultsPerPage,
        offset: page * resultsPerPage,
      });

      if (response.data?.verses) {
        const formattedResults: SearchResult[] = response.data.verses.map((verse) => {
          const bookInfo = getBookInfo(verse.bookId);
          const { bookId, chapterId, chapter, verse: verseNumber } = parseVerseData(verse);
          
          // Clean the text content - API returns 'text' field, not 'content'
          const cleanText = (verse.text || verse.content || '').replace(/<[^>]*>/g, '');
          
          return {
            id: verse.id,
            book: bookInfo?.name || verse.reference.split(' ')[0] || 'Unknown',
            chapter,
            verse: verseNumber,
            text: cleanText,
            reference: verse.reference,
            bookId,
            chapterId,
            verseId: verse.id,
          };
        });

        if (page === 0) {
          setSearchResults(formattedResults);
        } else {
          setSearchResults(prev => [...prev, ...formattedResults]);
        }

        setCurrentPage(page);
        setTotalResults(response.data.total || 0);
        setHasMoreResults((page + 1) * resultsPerPage < (response.data.total || 0));
      } else {
        if (page === 0) {
          setSearchResults([]);
          setTotalResults(0);
          setHasMoreResults(false);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      if (page === 0) {
        setSearchResults([]);
        setTotalResults(0);
        setHasMoreResults(false);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = () => {
    if (!isSearching && hasMoreResults) {
      handleSearch(searchQuery, currentPage + 1);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const toggleFilter = (filterId: string) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId 
        ? { ...filter, selected: !filter.selected }
        : filter
    ));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    setCurrentPage(0);
    setHasMoreResults(false);
    setTotalResults(0);
    searchInputRef.current?.blur();
  };

  // Handle navigation to reader
  const navigateToReader = (result: SearchResult) => {
    router.push({
      pathname: '/read/bible-reader',
      params: {
        version: bibleVersion,
        bookId: result.bookId,
        bookName: result.book,
        chapterId: result.chapterId,
        chapterNumber: result.chapter.toString(),
        verseId: result.verseId,
        verseNumber: result.verse.toString(),
      }
    });
  };

  const SearchResultItem: React.FC<{ item: SearchResult }> = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => navigateToReader(item)}
      activeOpacity={0.7}
    >
      <View style={styles.searchResultHeader}>
        <Text style={styles.searchResultReference}>{item.reference}</Text>
        <View style={styles.searchResultActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              // Add bookmark functionality here
            }}
          >
            <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              // Add share functionality here
            }}
          >
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.searchResultText} numberOfLines={3}>
        {item.text}
      </Text>
      <View style={styles.searchResultFooter}>
        <Text style={styles.searchResultBook}>
          {item.book} {item.chapter}:{item.verse}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const PopularSearchItem: React.FC<{ item: PopularSearch }> = ({ item }) => (
    <TouchableOpacity
      style={styles.popularSearchItem}
      onPress={() => handleQuickSearch(item.query)}
      activeOpacity={0.7}
    >
      <View style={styles.popularSearchIcon}>
        <Ionicons name={item.icon} size={20} color="#3B82F6" />
      </View>
      <View style={styles.popularSearchContent}>
        <Text style={styles.popularSearchQuery}>{item.query}</Text>
        <Text style={styles.popularSearchCategory}>{item.category}</Text>
      </View>
      <Ionicons name="search-outline" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const RecentSearchItem: React.FC<{ item: RecentSearch }> = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleQuickSearch(item.query)}
      activeOpacity={0.7}
    >
      <Ionicons name="time-outline" size={20} color="#6B7280" />
      <Text style={styles.recentSearchQuery}>{item.query}</Text>
      <TouchableOpacity style={styles.removeButton}>
        <Ionicons name="close" size={16} color="#9CA3AF" />
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search verses, books, topics..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => handleSearch(searchQuery)}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showResults ? (
          <>
            {/* Search Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {totalResults > 0 ? `${totalResults} results found` : 'No results'}
              </Text>
            </View>

            {/* Search Results */}
            {isSearching && currentPage === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => (
                      <SearchResultItem key={result.id} item={result} />
                    ))}
                    
                    {/* Load More Button */}
                    {hasMoreResults && (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={loadMoreResults}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.loadMoreText}>
                            Load More Results
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.noResultsTitle}>No results found</Text>
                    <Text style={styles.noResultsSubtitle}>
                      Try different keywords or check your spelling
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentSearchesContainer}>
                  {recentSearches.map((search) => (
                    <RecentSearchItem key={search.id} item={search} />
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.popularSearchesContainer}>
                {popularSearches.map((search) => (
                  <PopularSearchItem key={search.id} item={search} />
                ))}
              </View>
            </View>
          </>
        )}


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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
  },
  loadMoreButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 16,
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchResultReference: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  searchResultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  searchResultText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  searchResultFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  searchResultBook: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#EF4444',
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  recentSearchQuery: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#111827',
  },
  removeButton: {
    padding: 4,
  },
  popularSearchesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  popularSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  popularSearchContent: {
    flex: 1,
  },
  popularSearchQuery: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  popularSearchCategory: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});

export default BibleSearchScreen;