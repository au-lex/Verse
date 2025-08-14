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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  chapters: number;
  category: string;
  order: number;
}

interface BookCategory {
  id: string;
  name: string;
  testament: 'old' | 'new';
  books: BibleBook[];
}

const BibleBookSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'NIV';
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTestament, setActiveTestament] = useState<'old' | 'new'>('old');
  
  const oldTestamentBooks: BibleBook[] = [
    // Torah/Pentateuch
    { id: 'genesis', name: 'Genesis', abbreviation: 'Gen', testament: 'old', chapters: 50, category: 'Torah', order: 1 },
    { id: 'exodus', name: 'Exodus', abbreviation: 'Exod', testament: 'old', chapters: 40, category: 'Torah', order: 2 },
    { id: 'leviticus', name: 'Leviticus', abbreviation: 'Lev', testament: 'old', chapters: 27, category: 'Torah', order: 3 },
    { id: 'numbers', name: 'Numbers', abbreviation: 'Num', testament: 'old', chapters: 36, category: 'Torah', order: 4 },
    { id: 'deuteronomy', name: 'Deuteronomy', abbreviation: 'Deut', testament: 'old', chapters: 34, category: 'Torah', order: 5 },
    
    // Historical Books
    { id: 'joshua', name: 'Joshua', abbreviation: 'Josh', testament: 'old', chapters: 24, category: 'Historical', order: 6 },
    { id: 'judges', name: 'Judges', abbreviation: 'Judg', testament: 'old', chapters: 21, category: 'Historical', order: 7 },
    { id: 'ruth', name: 'Ruth', abbreviation: 'Ruth', testament: 'old', chapters: 4, category: 'Historical', order: 8 },
    { id: '1-samuel', name: '1 Samuel', abbreviation: '1 Sam', testament: 'old', chapters: 31, category: 'Historical', order: 9 },
    { id: '2-samuel', name: '2 Samuel', abbreviation: '2 Sam', testament: 'old', chapters: 24, category: 'Historical', order: 10 },
    { id: '1-kings', name: '1 Kings', abbreviation: '1 Kgs', testament: 'old', chapters: 22, category: 'Historical', order: 11 },
    { id: '2-kings', name: '2 Kings', abbreviation: '2 Kgs', testament: 'old', chapters: 25, category: 'Historical', order: 12 },
    { id: '1-chronicles', name: '1 Chronicles', abbreviation: '1 Chr', testament: 'old', chapters: 29, category: 'Historical', order: 13 },
    { id: '2-chronicles', name: '2 Chronicles', abbreviation: '2 Chr', testament: 'old', chapters: 36, category: 'Historical', order: 14 },
    { id: 'ezra', name: 'Ezra', abbreviation: 'Ezra', testament: 'old', chapters: 10, category: 'Historical', order: 15 },
    { id: 'nehemiah', name: 'Nehemiah', abbreviation: 'Neh', testament: 'old', chapters: 13, category: 'Historical', order: 16 },
    { id: 'esther', name: 'Esther', abbreviation: 'Esth', testament: 'old', chapters: 10, category: 'Historical', order: 17 },
    
    // Wisdom Literature
    { id: 'job', name: 'Job', abbreviation: 'Job', testament: 'old', chapters: 42, category: 'Wisdom', order: 18 },
    { id: 'psalms', name: 'Psalms', abbreviation: 'Ps', testament: 'old', chapters: 150, category: 'Wisdom', order: 19 },
    { id: 'proverbs', name: 'Proverbs', abbreviation: 'Prov', testament: 'old', chapters: 31, category: 'Wisdom', order: 20 },
    { id: 'ecclesiastes', name: 'Ecclesiastes', abbreviation: 'Eccl', testament: 'old', chapters: 12, category: 'Wisdom', order: 21 },
    { id: 'song-of-solomon', name: 'Song of Solomon', abbreviation: 'Song', testament: 'old', chapters: 8, category: 'Wisdom', order: 22 },
    
    // Major Prophets
    { id: 'isaiah', name: 'Isaiah', abbreviation: 'Isa', testament: 'old', chapters: 66, category: 'Major Prophets', order: 23 },
    { id: 'jeremiah', name: 'Jeremiah', abbreviation: 'Jer', testament: 'old', chapters: 52, category: 'Major Prophets', order: 24 },
    { id: 'lamentations', name: 'Lamentations', abbreviation: 'Lam', testament: 'old', chapters: 5, category: 'Major Prophets', order: 25 },
    { id: 'ezekiel', name: 'Ezekiel', abbreviation: 'Ezek', testament: 'old', chapters: 48, category: 'Major Prophets', order: 26 },
    { id: 'daniel', name: 'Daniel', abbreviation: 'Dan', testament: 'old', chapters: 12, category: 'Major Prophets', order: 27 },
    
    // Minor Prophets
    { id: 'hosea', name: 'Hosea', abbreviation: 'Hos', testament: 'old', chapters: 14, category: 'Minor Prophets', order: 28 },
    { id: 'joel', name: 'Joel', abbreviation: 'Joel', testament: 'old', chapters: 3, category: 'Minor Prophets', order: 29 },
    { id: 'amos', name: 'Amos', abbreviation: 'Amos', testament: 'old', chapters: 9, category: 'Minor Prophets', order: 30 },
    { id: 'obadiah', name: 'Obadiah', abbreviation: 'Obad', testament: 'old', chapters: 1, category: 'Minor Prophets', order: 31 },
    { id: 'jonah', name: 'Jonah', abbreviation: 'Jonah', testament: 'old', chapters: 4, category: 'Minor Prophets', order: 32 },
    { id: 'micah', name: 'Micah', abbreviation: 'Mic', testament: 'old', chapters: 7, category: 'Minor Prophets', order: 33 },
    { id: 'nahum', name: 'Nahum', abbreviation: 'Nah', testament: 'old', chapters: 3, category: 'Minor Prophets', order: 34 },
    { id: 'habakkuk', name: 'Habakkuk', abbreviation: 'Hab', testament: 'old', chapters: 3, category: 'Minor Prophets', order: 35 },
    { id: 'zephaniah', name: 'Zephaniah', abbreviation: 'Zeph', testament: 'old', chapters: 3, category: 'Minor Prophets', order: 36 },
    { id: 'haggai', name: 'Haggai', abbreviation: 'Hag', testament: 'old', chapters: 2, category: 'Minor Prophets', order: 37 },
    { id: 'zechariah', name: 'Zechariah', abbreviation: 'Zech', testament: 'old', chapters: 14, category: 'Minor Prophets', order: 38 },
    { id: 'malachi', name: 'Malachi', abbreviation: 'Mal', testament: 'old', chapters: 4, category: 'Minor Prophets', order: 39 },
  ];

  const newTestamentBooks: BibleBook[] = [
    // Gospels
    { id: 'matthew', name: 'Matthew', abbreviation: 'Matt', testament: 'new', chapters: 28, category: 'Gospels', order: 40 },
    { id: 'mark', name: 'Mark', abbreviation: 'Mark', testament: 'new', chapters: 16, category: 'Gospels', order: 41 },
    { id: 'luke', name: 'Luke', abbreviation: 'Luke', testament: 'new', chapters: 24, category: 'Gospels', order: 42 },
    { id: 'john', name: 'John', abbreviation: 'John', testament: 'new', chapters: 21, category: 'Gospels', order: 43 },
    
    // History
    { id: 'acts', name: 'Acts', abbreviation: 'Acts', testament: 'new', chapters: 28, category: 'History', order: 44 },
    
    // Paul's Letters
    { id: 'romans', name: 'Romans', abbreviation: 'Rom', testament: 'new', chapters: 16, category: 'Pauline Letters', order: 45 },
    { id: '1-corinthians', name: '1 Corinthians', abbreviation: '1 Cor', testament: 'new', chapters: 16, category: 'Pauline Letters', order: 46 },
    { id: '2-corinthians', name: '2 Corinthians', abbreviation: '2 Cor', testament: 'new', chapters: 13, category: 'Pauline Letters', order: 47 },
    { id: 'galatians', name: 'Galatians', abbreviation: 'Gal', testament: 'new', chapters: 6, category: 'Pauline Letters', order: 48 },
    { id: 'ephesians', name: 'Ephesians', abbreviation: 'Eph', testament: 'new', chapters: 6, category: 'Pauline Letters', order: 49 },
    { id: 'philippians', name: 'Philippians', abbreviation: 'Phil', testament: 'new', chapters: 4, category: 'Pauline Letters', order: 50 },
    { id: 'colossians', name: 'Colossians', abbreviation: 'Col', testament: 'new', chapters: 4, category: 'Pauline Letters', order: 51 },
    { id: '1-thessalonians', name: '1 Thessalonians', abbreviation: '1 Thess', testament: 'new', chapters: 5, category: 'Pauline Letters', order: 52 },
    { id: '2-thessalonians', name: '2 Thessalonians', abbreviation: '2 Thess', testament: 'new', chapters: 3, category: 'Pauline Letters', order: 53 },
    { id: '1-timothy', name: '1 Timothy', abbreviation: '1 Tim', testament: 'new', chapters: 6, category: 'Pastoral Letters', order: 54 },
    { id: '2-timothy', name: '2 Timothy', abbreviation: '2 Tim', testament: 'new', chapters: 4, category: 'Pastoral Letters', order: 55 },
    { id: 'titus', name: 'Titus', abbreviation: 'Titus', testament: 'new', chapters: 3, category: 'Pastoral Letters', order: 56 },
    { id: 'philemon', name: 'Philemon', abbreviation: 'Phlm', testament: 'new', chapters: 1, category: 'Pastoral Letters', order: 57 },
    
    // General Letters
    { id: 'hebrews', name: 'Hebrews', abbreviation: 'Heb', testament: 'new', chapters: 13, category: 'General Letters', order: 58 },
    { id: 'james', name: 'James', abbreviation: 'James', testament: 'new', chapters: 5, category: 'General Letters', order: 59 },
    { id: '1-peter', name: '1 Peter', abbreviation: '1 Pet', testament: 'new', chapters: 5, category: 'General Letters', order: 60 },
    { id: '2-peter', name: '2 Peter', abbreviation: '2 Pet', testament: 'new', chapters: 3, category: 'General Letters', order: 61 },
    { id: '1-john', name: '1 John', abbreviation: '1 John', testament: 'new', chapters: 5, category: 'General Letters', order: 62 },
    { id: '2-john', name: '2 John', abbreviation: '2 John', testament: 'new', chapters: 1, category: 'General Letters', order: 63 },
    { id: '3-john', name: '3 John', abbreviation: '3 John', testament: 'new', chapters: 1, category: 'General Letters', order: 64 },
    { id: 'jude', name: 'Jude', abbreviation: 'Jude', testament: 'new', chapters: 1, category: 'General Letters', order: 65 },
    
    // Prophecy
    { id: 'revelation', name: 'Revelation', abbreviation: 'Rev', testament: 'new', chapters: 22, category: 'Prophecy', order: 66 },
  ];

  const allBooks = [...oldTestamentBooks, ...newTestamentBooks];

  const getFilteredBooks = (): BibleBook[] => {
    let books = activeTestament === 'old' ? oldTestamentBooks : newTestamentBooks;
    
    if (searchQuery.trim()) {
      books = books.filter(book => 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return books;
  };

  const getBooksByCategory = (): BookCategory[] => {
    const books = getFilteredBooks();
    const categories: { [key: string]: BibleBook[] } = {};
    
    books.forEach(book => {
      if (!categories[book.category]) {
        categories[book.category] = [];
      }
      categories[book.category].push(book);
    });
    
    return Object.entries(categories).map(([name, books]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      testament: activeTestament,
      books: books.sort((a, b) => a.order - b.order)
    }));
  };

  const handleBookSelect = (book: BibleBook) => {
    router.push({
      pathname: '/read/chapter-selection',
      params: { 
        version,
        bookId: book.id,
        bookName: book.name,
        chapters: book.chapters.toString()
      }
    });
  };

  const BookCard: React.FC<{ book: BibleBook }> = ({ book }) => (
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
        {book.chapters} {book.chapters === 1 ? 'Chapter' : 'Chapters'}
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
            Old Testament ({oldTestamentBooks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testamentTab, activeTestament === 'new' && styles.activeTestamentTab]}
          onPress={() => setActiveTestament('new')}
        >
          <Text style={[styles.testamentTabText, activeTestament === 'new' && styles.activeTestamentTabText]}>
            New Testament ({newTestamentBooks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {getBooksByCategory().map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
        
        {getFilteredBooks().length === 0 && (
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