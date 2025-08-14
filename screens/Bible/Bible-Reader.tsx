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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface Verse {
  number: number;
  text: string;
}

interface ChapterData {
  book: string;
  chapter: number;
  version: string;
  verses: Verse[];
}

const BibleReader: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'NIV';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  const chapter = parseInt(params.chapter as string) || 1;
  const selectedVerse = params.verse ? parseInt(params.verse as string) : null;
  
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadChapterData();
  }, [bookId, chapter, version]);

  const loadChapterData = async () => {
    setLoading(true);
    try {
      // Mock Bible data - replace with your actual Bible API/database
      const mockData = getMockChapterData(bookId, chapter, version);
      setChapterData(mockData);
    } catch (error) {
      console.error('Error loading chapter data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock function - replace with your actual data source
  const getMockChapterData = (bookId: string, chapter: number, version: string): ChapterData => {
    // This is Genesis 1 as an example - you should replace this with your Bible API
    const genesis1Verses: Verse[] = [
      { number: 1, text: "In the beginning God created the heavens and the earth." },
      { number: 2, text: "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters." },
      { number: 3, text: "And God said, \"Let there be light,\" and there was light." },
      { number: 4, text: "God saw that the light was good, and he separated the light from the darkness." },
      { number: 5, text: "God called the light \"day,\" and the darkness he called \"night.\" And there was evening, and there was morning—the first day." },
      { number: 6, text: "And God said, \"Let there be a vault between the waters to separate water from water.\"" },
      { number: 7, text: "So God made the vault and separated the water under the vault from the water above it. And it was so." },
      { number: 8, text: "God called the vault \"sky.\" And there was evening, and there was morning—the second day." },
      { number: 9, text: "And God said, \"Let the water under the sky be gathered to one place, and let dry ground appear.\" And it was so." },
      { number: 10, text: "God called the dry ground \"land,\" and the gathered waters he called \"seas.\" And God saw that it was good." },
      { number: 11, text: "Then God said, \"Let the land produce vegetation: seed-bearing plants and trees on the land that bear fruit with seed in it, according to their various kinds.\" And it was so." },
      { number: 12, text: "The land produced vegetation: plants bearing seed according to their kinds and trees bearing fruit with seed in it according to their kinds. And God saw that it was good." },
      { number: 13, text: "And there was evening, and there was morning—the third day." }
    ];

    return {
      book: bookId === 'genesis' ? 'Genesis' : bookName,
      chapter: chapter,
      version: version,
      verses: genesis1Verses
    };
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const newChapter = direction === 'prev' ? chapter - 1 : chapter + 1;
    if (newChapter < 1) return; // Handle book boundaries
    
    router.push({
      pathname: '/bible-reader',
      params: {
        version,
        bookId,
        bookName,
        chapter: newChapter.toString()
      }
    });
  };

  const VerseComponent: React.FC<{ verse: Verse; isHighlighted: boolean }> = ({ 
    verse, 
    isHighlighted 
  }) => (
    <View style={styles.verseContainer}>
      <View style={[styles.verseContent, isHighlighted && styles.highlightedVerse]}>
        <Text style={[styles.verseNumber, { fontSize: fontSize - 2 }]}>
          {verse.number}
        </Text>
        <Text style={[styles.verseText, { fontSize }]}>
          {verse.text}
        </Text>
      </View>
    </View>
  );

  const FontSizeControl: React.FC = () => (
    <View style={styles.fontSizeContainer}>
      <TouchableOpacity
        style={styles.fontSizeButton}
        onPress={() => setFontSize(Math.max(12, fontSize - 2))}
      >
        <Text style={styles.fontSizeButtonText}>A-</Text>
      </TouchableOpacity>
      <Text style={styles.fontSizeLabel}>{fontSize}px</Text>
      <TouchableOpacity
        style={styles.fontSizeButton}
        onPress={() => setFontSize(Math.min(24, fontSize + 2))}
      >
        <Text style={styles.fontSizeButtonText}>A+</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading chapter...</Text>
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
          <View style={styles.chapterNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateChapter('prev')}
              disabled={chapter <= 1}
            >
              <Ionicons name="chevron-back" size={20} color={chapter <= 1 ? "#9CA3AF" : "#111827"} />
            </TouchableOpacity>
            
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>{chapterData?.book} {chapterData?.chapter}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateChapter('next')}
            >
              <Ionicons name="chevron-forward" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Font Size Controls */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <FontSizeControl />
        </View>
      )}

      {/* Chapter Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chapterContainer}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterHeaderTitle}>
              {chapterData?.book} {chapterData?.chapter}
            </Text>
            <Text style={styles.chapterHeaderVersion}>
              {chapterData?.version}
            </Text>
          </View>
          
          <View style={styles.versesContainer}>
            {chapterData?.verses.map((verse) => (
              <VerseComponent
                key={verse.number}
                verse={verse}
                isHighlighted={selectedVerse === verse.number}
              />
            ))}
          </View>
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 12,
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
  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  navButton: {
    padding: 8,
  },
  chapterInfo: {
    paddingHorizontal: 12,
  },
  chapterTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  settingsPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fontSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fontSizeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fontSizeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  fontSizeLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  chapterContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chapterHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  chapterHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  chapterHeaderVersion: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  versesContainer: {
    padding: 20,
  },
  verseContainer: {
    marginBottom: 16,
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
  },
  highlightedVerse: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  verseNumber: {
    fontFamily: 'Nunito-Bold',
    color: '#6B7280',
    marginRight: 12,
    marginTop: 2,
    minWidth: 24,
  },
  verseText: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    color: '#111827',
    lineHeight: 24,
  },
});

export default BibleReader;