import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetChapter, useGetBooks, useGetChapters } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

interface ParsedVerse {
  number: number;
  text: string;
  id?: string;
}

interface ChapterData {
  book: string;
  chapter: number;
  version: string;
  verses: ParsedVerse[];
  reference: string;
  copyright?: string;
}

const BibleReader: React.FC = () => {
  const params = useLocalSearchParams();
  const version = params.version as string || 'de4e12af7f28f599-02';
  const bookId = params.bookId as string;
  const bookName = params.bookName as string;
  const chapterNumber = parseInt(params.chapterNumber as string) || 1;
  const chapterId = params.chapterId as string;
  const selectedVerseId = params.verseId as string;
  const selectedVerseNumber = params.verseNumber ? parseInt(params.verseNumber as string) : null;
  
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [parsedChapterData, setParsedChapterData] = useState<ChapterData | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const verseRefs = React.useRef<{ [key: number]: View | null }>({});

  // API hooks
  const { data: chapterResponse, isLoading: chapterLoading, error: chapterError } = useGetChapter(version, chapterId);
  const { data: booksResponse } = useGetBooks(version);
  const { data: chaptersResponse } = useGetChapters(version, bookId);

  // Get current book info
  const currentBook = useMemo(() => {
    if (!booksResponse?.data || !bookId) return null;
    return booksResponse.data.find(book => book.id === bookId);
  }, [booksResponse?.data, bookId]);

  // Get available chapters for navigation
  const availableChapters = useMemo(() => {
    return chaptersResponse?.data || [];
  }, [chaptersResponse?.data]);

  // Parse HTML content to extract verses
  const parseChapterContent = (htmlContent: string): ParsedVerse[] => {
    if (!htmlContent) return [];
    
    try {
      // Remove extra whitespace and normalize
      const cleanContent = htmlContent.replace(/\s+/g, ' ').trim();
      
      // Try to match verse patterns with various formats
      const versePatterns = [
        // Pattern 1: <span class="v" id="verse-id">verse-number</span>verse-text
        /<span[^>]*class="v"[^>]*>(\d+)<\/span>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*?)(?=<span[^>]*class="v"|$)/gi,
        // Pattern 2: <span class="verse-num">verse-number</span>verse-text
        /<span[^>]*class="verse-num"[^>]*>(\d+)<\/span>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*?)(?=<span[^>]*class="verse-num"|$)/gi,
        // Pattern 3: <sup class="versenum">verse-number</sup>verse-text
        /<sup[^>]*class="versenum"[^>]*>(\d+)<\/sup>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*?)(?=<sup[^>]*class="versenum"|$)/gi,
        // Pattern 4: Any span with data-verse or similar
        /<span[^>]*(?:data-verse|data-v)="(\d+)"[^>]*>.*?<\/span>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*?)(?=<span[^>]*(?:data-verse|data-v)="\d+"|$)/gi
      ];

      let verses: ParsedVerse[] = [];
      
      for (const pattern of versePatterns) {
        const matches = [...cleanContent.matchAll(pattern)];
        
        if (matches.length > 0) {
          verses = matches.map(match => {
            const verseNumber = parseInt(match[1]);
            let verseText = match[2] || '';
            
            // Clean up the verse text
            verseText = verseText
              .replace(/<[^>]*>/g, ' ') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
            
            return {
              number: verseNumber,
              text: verseText,
              id: `${bookId}.${chapterNumber}.${verseNumber}`
            };
          }).filter(verse => verse.text.length > 0);
          
          if (verses.length > 0) {
            break; // Use the first pattern that gives results
          }
        }
      }

      // If no verses found with patterns, try to split by common verse markers
      if (verses.length === 0) {
        // Try splitting by numbers at the beginning of segments
        const segments = cleanContent.split(/(?=\d+(?:\s|&nbsp;))/);
        
        verses = segments.map((segment, index) => {
          const numberMatch = segment.match(/^(\d+)(?:\s|&nbsp;)(.*)/);
          if (numberMatch) {
            const verseNumber = parseInt(numberMatch[1]);
            let verseText = numberMatch[2] || '';
            
            // Clean up text
            verseText = verseText
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
              
            return {
              number: verseNumber,
              text: verseText,
              id: `${bookId}.${chapterNumber}.${verseNumber}`
            };
          }
          return null;
        }).filter((verse): verse is ParsedVerse => 
          verse !== null && verse.text.length > 0
        );
      }

      // Sort verses by number and ensure they're sequential
      verses.sort((a, b) => a.number - b.number);
      
      // If still no verses, create a single verse with the entire content
      if (verses.length === 0 && cleanContent.length > 0) {
        const cleanText = cleanContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanText) {
          verses = [{
            number: 1,
            text: cleanText,
            id: `${bookId}.${chapterNumber}.1`
          }];
        }
      }

      return verses;
    } catch (error) {
      console.error('Error parsing chapter content:', error);
      return [];
    }
  };

  // Process chapter data when it loads
  useEffect(() => {
    if (chapterResponse?.data) {
      const chapter = chapterResponse.data;
      
      if (chapter.content) {
        const verses = parseChapterContent(chapter.content);
        
        setParsedChapterData({
          book: currentBook?.name || bookName || 'Unknown',
          chapter: parseInt(chapter.number) || chapterNumber,
          version: version,
          verses: verses,
          reference: chapter.reference || `${bookName} ${chapterNumber}`,
          copyright: chapter.copyright
        });
      } else {
        // If no content, show error or placeholder
        setParsedChapterData({
          book: currentBook?.name || bookName || 'Unknown',
          chapter: chapterNumber,
          version: version,
          verses: [{
            number: 1,
            text: 'Content not available for this chapter.',
            id: `${bookId}.${chapterNumber}.1`
          }],
          reference: `${bookName} ${chapterNumber}`,
          copyright: chapter.copyright
        });
      }
    }
  }, [chapterResponse, currentBook, bookName, chapterNumber, bookId, version]);

  // Scroll to selected verse when data loads
  useEffect(() => {
    if (parsedChapterData && selectedVerseNumber && scrollViewRef.current) {
      // Give the ScrollView time to render
      const timer = setTimeout(() => {
        const verseRef = verseRefs.current[selectedVerseNumber];
        if (verseRef) {
          verseRef.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ 
                y: Math.max(0, y - 100), // Offset by 100px for better visibility
                animated: true 
              });
            },
            () => {
              // Fallback: scroll to approximate position
              const verseIndex = parsedChapterData.verses.findIndex(v => v.number === selectedVerseNumber);
              if (verseIndex > 0) {
                const estimatedY = verseIndex * 80; // Approximate verse height
                scrollViewRef.current?.scrollTo({ 
                  y: Math.max(0, estimatedY - 100), 
                  animated: true 
                });
              }
            }
          );
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [parsedChapterData, selectedVerseNumber]);

  // Navigate to different chapter
  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!availableChapters || availableChapters.length === 0) return;
    
    const currentIndex = availableChapters.findIndex(ch => ch.id === chapterId);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < availableChapters.length) {
      const newChapter = availableChapters[newIndex];
      
      router.push({
        pathname: '/read/bible-reader',
        params: {
          version,
          bookId,
          bookName: currentBook?.name || bookName,
          chapterId: newChapter.id,
          chapterNumber: newChapter.number
        }
      });
    }
  };

  // Navigate to different book (basic implementation)
  const navigateToBookSelection = () => {
    router.push({
      pathname: '/read/book-selection',
      params: { version }
    });
  };

  const VerseComponent: React.FC<{ verse: ParsedVerse; isHighlighted: boolean }> = ({ 
    verse, 
    isHighlighted 
  }) => (
    <View 
      style={styles.verseContainer}
      ref={(ref) => {
        verseRefs.current[verse.number] = ref;
      }}
    >
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

  // Loading state
  if (chapterLoading) {
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

  // Error state
  if (chapterError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load chapter</Text>
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
     
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <TouchableOpacity onPress={navigateToBookSelection}>
            <View style={styles.chapterNavigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateChapter('prev')}
                disabled={!availableChapters || availableChapters.findIndex(ch => ch.id === chapterId) <= 0}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={20} 
                  color={
                    !availableChapters || availableChapters.findIndex(ch => ch.id === chapterId) <= 0
                      ? "#9CA3AF" 
                      : "#111827"
                  } 
                />
              </TouchableOpacity>
              
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>
                  {parsedChapterData?.book} {parsedChapterData?.chapter}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateChapter('next')}
                disabled={
                  !availableChapters || 
                  availableChapters.findIndex(ch => ch.id === chapterId) >= availableChapters.length - 1
                }
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={
                    !availableChapters || 
                    availableChapters.findIndex(ch => ch.id === chapterId) >= availableChapters.length - 1
                      ? "#9CA3AF" 
                      : "#111827"
                  } 
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
      <Text style={{ color: '#3B82F6', fontSize: 26 , fontFamily:"Nunito-Bold"}}>A+</Text>
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
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chapterContainer}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterHeaderTitle}>
              {parsedChapterData?.reference}
            </Text>
            <Text style={styles.chapterHeaderVersion}>
              {parsedChapterData?.version}
            </Text>
          </View>
          
          <View style={styles.versesContainer}>
            {parsedChapterData?.verses.map((verse) => (
              <VerseComponent
                key={verse.id || verse.number}
                verse={verse}
                isHighlighted={selectedVerseNumber === verse.number}
              />
            ))}
            
            {parsedChapterData?.verses.length === 0 && (
              <View style={styles.noContentContainer}>
                <Ionicons name="book-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noContentTitle}>No content available</Text>
                <Text style={styles.noContentSubtitle}>This chapter may not have content in this version</Text>
              </View>
            )}
          </View>
 
        </View>
        
 
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
  noContentContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noContentTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginTop: 16,
  },
  noContentSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  copyrightContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default BibleReader;