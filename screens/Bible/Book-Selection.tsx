import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetBooks } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

// Use the API Book interface from your ApiConfig
interface Book {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters?: Chapter[];
}

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

interface BookCategory {
  id: string;
  name: string;
  testament: 'old' | 'new';
  books: Book[];
}

const BibleBookSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'de4e12af7f28f599-02'; // Default to a known Bible ID
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTestament, setActiveTestament] = useState<'old' | 'new'>('old');
  
  // Fetch books from API
  const { data: booksResponse, isLoading, error } = useGetBooks(version);

  // Helper function to categorize books by testament
  const categorizeBooks = (books: Book[]) => {
    // Old Testament book IDs (typically follow standard ordering)
    const oldTestamentIds = [
      'GEN', 'EXO', 'LEV', 'NUM', 'DEU', // Torah
      'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', // Historical
      'JOB', 'PSA', 'PRO', 'ECC', 'SNG', // Wisdom
      'ISA', 'JER', 'LAM', 'EZK', 'DAN', // Major Prophets
      'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL' // Minor Prophets
    ];

    const oldTestament: Book[] = [];
    const newTestament: Book[] = [];

    books.forEach(book => {
      // Check if book ID matches old testament pattern
      const isOldTestament = oldTestamentIds.some(otId => 
        book.id.toUpperCase().includes(otId) || 
        book.abbreviation.toUpperCase().includes(otId)
      );
      
      if (isOldTestament) {
        oldTestament.push(book);
      } else {
        newTestament.push(book);
      }
    });

    return { oldTestament, newTestament };
  };

  // Helper function to categorize books by type
  const getBookCategories = (books: Book[]): BookCategory[] => {
    if (activeTestament === 'old') {
      // Old Testament categories
      const categories = {
        'Torah': [] as Book[],
        'Historical Books': [] as Book[],
        'Wisdom Literature': [] as Book[],
        'Major Prophets': [] as Book[],
        'Minor Prophets': [] as Book[]
      };

      // Categorize based on common book abbreviations/IDs
      books.forEach(book => {
        const bookId = book.id.toUpperCase();
        const abbrev = book.abbreviation.toUpperCase();
        
        if (['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Torah'].push(book);
        } else if (['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Historical Books'].push(book);
        } else if (['JOB', 'PSA', 'PRO', 'ECC', 'SNG'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Wisdom Literature'].push(book);
        } else if (['ISA', 'JER', 'LAM', 'EZK', 'DAN'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Major Prophets'].push(book);
        } else {
          categories['Minor Prophets'].push(book);
        }
      });

      return Object.entries(categories)
        .filter(([_, books]) => books.length > 0)
        .map(([name, books]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          testament: 'old' as const,
          books
        }));
    } else {
      // New Testament categories
      const categories = {
        'Gospels': [] as Book[],
        'History': [] as Book[],
        'Pauline Letters': [] as Book[],
        'Pastoral Letters': [] as Book[],
        'General Letters': [] as Book[],
        'Prophecy': [] as Book[]
      };

      books.forEach(book => {
        const bookId = book.id.toUpperCase();
        const abbrev = book.abbreviation.toUpperCase();
        
        if (['MAT', 'MRK', 'LUK', 'JHN'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Gospels'].push(book);
        } else if (['ACT'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['History'].push(book);
        } else if (['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Pauline Letters'].push(book);
        } else if (['1TI', '2TI', 'TIT', 'PHM'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Pastoral Letters'].push(book);
        } else if (['HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['General Letters'].push(book);
        } else if (['REV'].some(id => bookId.includes(id) || abbrev.includes(id))) {
          categories['Prophecy'].push(book);
        }
      });

      return Object.entries(categories)
        .filter(([_, books]) => books.length > 0)
        .map(([name, books]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          testament: 'new' as const,
          books
        }));
    }
  };

  // Get filtered books based on search and testament
  const { currentBooks, bookCategories } = useMemo(() => {
    if (!booksResponse?.data) {
      return { currentBooks: [], bookCategories: [] };
    }

    const { oldTestament, newTestament } = categorizeBooks(booksResponse.data);
    let books = activeTestament === 'old' ? oldTestament : newTestament;
    
    // Apply search filter
    if (searchQuery.trim()) {
      books = books.filter(book => 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.nameLong.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const categories = getBookCategories(books);
    
    return { currentBooks: books, bookCategories: categories };
  }, [booksResponse?.data, searchQuery, activeTestament]);

  // Get testament counts
  const testamentCounts = useMemo(() => {
    if (!booksResponse?.data) {
      return { oldCount: 0, newCount: 0 };
    }
    
    const { oldTestament, newTestament } = categorizeBooks(booksResponse.data);
    return { 
      oldCount: oldTestament.length, 
      newCount: newTestament.length 
    };
  }, [booksResponse?.data]);

  const handleBookSelect = (book: Book) => {
    router.push({
      pathname: '/read/chapter-selection',
      params: { 
        version,
        bookId: book.id,
        bookName: book.name,
        chapters: book.chapters?.length.toString() || '1'
      }
    });
  };

  const BookCard: React.FC<{ book: Book }> = ({ book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookSelect(book)}
      activeOpacity={0.7}
    >
      <View style={styles.bookHeader}>
        <Text style={styles.bookName}>{book.name}</Text>
        <Text style={styles.bookAbbreviation}>{book.abbreviation}</Text>
      </View>
      <Text style={styles.bookChapters}>
        {book.chapters?.length || 0} {(book.chapters?.length || 0) === 1 ? 'Chapter' : 'Chapters'}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.bookArrow} />
    </TouchableOpacity>
  );

  const CategorySection: React.FC<{ category: BookCategory }> = ({ category }) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      <View style={styles.booksGrid}>
        {category.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading Bible books...</Text>
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
          <Text style={styles.errorTitle}>Failed to load books</Text>
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
          <Text style={styles.headerTitle}>Select Book</Text>
          <Text style={styles.headerVersion}>{version}</Text>
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
            placeholder="Search books..."
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

      {/* Testament Tabs */}
      <View style={styles.testamentTabs}>
        <TouchableOpacity
          style={[styles.testamentTab, activeTestament === 'old' && styles.activeTestamentTab]}
          onPress={() => setActiveTestament('old')}
        >
          <Text style={[styles.testamentTabText, activeTestament === 'old' && styles.activeTestamentTabText]}>
            Old Testament ({testamentCounts.oldCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testamentTab, activeTestament === 'new' && styles.activeTestamentTab]}
          onPress={() => setActiveTestament('new')}
        >
          <Text style={[styles.testamentTabText, activeTestament === 'new' && styles.activeTestamentTabText]}>
            New Testament ({testamentCounts.newCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bookCategories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
        
        {currentBooks.length === 0 && !isLoading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="book-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noResultsTitle}>No books found</Text>
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
  headerVersion: {
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
  testamentTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  testamentTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTestamentTab: {
    borderBottomColor: '#3B82F6',
  },
  testamentTabText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  activeTestamentTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  booksGrid: {
    backgroundColor: '#FFFFFF',
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookHeader: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  bookAbbreviation: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  bookChapters: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginRight: 12,
  },
  bookArrow: {
    // Icon styling handled by component
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

export default BibleBookSelection;