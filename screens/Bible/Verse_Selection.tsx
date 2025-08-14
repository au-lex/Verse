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

const BibleVerseSelection: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'NIV';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  const chapter = parseInt(params.chapter as string) || 1;
  const totalVerses = parseInt(params.verses as string) || 1;
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getFilteredVerses = (): number[] => {
    const allVerses = Array.from({ length: totalVerses }, (_, i) => i + 1);
    
    if (!searchQuery.trim()) {
      return allVerses;
    }
    
    const query = searchQuery.trim().toLowerCase();
    return allVerses.filter(verse => 
      verse.toString().includes(query)
    );
  };

  const handleVerseSelect = (verse: number) => {
    // Navigate to the actual Bible reading page or handle verse selection
    router.push({
      pathname: '/bible-reader',
      params: { 
        version,
        bookId,
        bookName,
        chapter: chapter.toString(),
        verse: verse.toString()
      }
    });
    
    // Or you could show an alert/modal with the verse content
    // Alert.alert('Selected', `${bookName} ${chapter}:${verse}`);
  };

  const VerseButton: React.FC<{ verse: number }> = ({ verse }) => (
    <TouchableOpacity
      style={styles.verseButton}
      onPress={() => handleVerseSelect(verse)}
      activeOpacity={0.7}
    >
      <Text style={styles.verseButtonText}>{verse}</Text>
    </TouchableOpacity>
  );

  const filteredVerses = getFilteredVerses();

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
          <Text style={styles.headerSubtitle}>{bookName} {chapter} - {version}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>


      {/* Verses Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.versesContainer}>
          <View style={styles.versesGrid}>
            {filteredVerses.map((verse) => (
              <VerseButton key={verse} verse={verse} />
            ))}
          </View>
          
          {filteredVerses.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="book-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noResultsTitle}>No verses found</Text>
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
    width: (width - 80) / 5,
    aspectRatio: 1,

    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    margin: 2,
    marginBottom: 12,
  },
  verseButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },

});

export default BibleVerseSelection;