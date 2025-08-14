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

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
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
  const [activeTab, setActiveTab] = useState<'all' | 'verses' | 'books'>('all');
  const [filters, setFilters] = useState<SearchFilter[]>([
    { id: '1', label: 'Old Testament', value: 'old_testament', selected: false },
    { id: '2', label: 'New Testament', value: 'new_testament', selected: false },
    { id: '3', label: 'Psalms', value: 'psalms', selected: false },
    { id: '4', label: 'Gospels', value: 'gospels', selected: false },
  ]);

  const searchInputRef = useRef<TextInput>(null);

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

  // Mock search results
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      book: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      reference: 'John 3:16'
    },
    {
      id: '2',
      book: '1 Corinthians',
      chapter: 13,
      verse: 4,
      text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
      reference: '1 Corinthians 13:4'
    },
    {
      id: '3',
      book: '1 John',
      chapter: 4,
      verse: 8,
      text: 'Whoever does not love does not know God, because God is love.',
      reference: '1 John 4:8'
    },
  ];

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockSearchResults.filter(result =>
        result.text.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 1000);
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
    searchInputRef.current?.blur();
  };

  const SearchResultItem: React.FC<{ item: SearchResult }> = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => router.push(`/bible/${item.book.toLowerCase().replace(/\s+/g, '-')}/${item.chapter}?verse=${item.verse}`)}
      activeOpacity={0.7}
    >
      <View style={styles.searchResultHeader}>
        <Text style={styles.searchResultReference}>{item.reference}</Text>
        <View style={styles.searchResultActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.searchResultText}>{item.text}</Text>
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
            {/* Search Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                  All Results ({searchResults.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'verses' && styles.activeTab]}
                onPress={() => setActiveTab('verses')}
              >
                <Text style={[styles.tabText, activeTab === 'verses' && styles.activeTabText]}>
                  Verses
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'books' && styles.activeTab]}
                onPress={() => setActiveTab('books')}
              >
                <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>
                  Books
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterChip, filter.selected && styles.selectedFilterChip]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filter.selected && styles.selectedFilterChipText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Results */}
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <SearchResultItem key={result.id} item={result} />
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.noResultsTitle}>No results found</Text>
                    <Text style={styles.noResultsSubtitle}>
                      Try adjusting your search or filters
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  selectedFilterChipText: {
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