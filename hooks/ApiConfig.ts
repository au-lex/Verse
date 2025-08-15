import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = 'b809a3adcefd1e56002148d07435d7b2'; 

// Storage keys
const STORAGE_KEYS = {
  CHAPTER: (bibleId: string, chapterId: string) => `chapter_${bibleId}_${chapterId}`,
  CHAPTERS_LIST: (bibleId: string, bookId: string) => `chapters_${bibleId}_${bookId}`,
  OFFLINE_CHAPTERS: 'offline_chapters_index',
};

// Types - Bible API structure
interface Bible {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  type: string;
  updatedAt: string;
  relatedDbl?: string;
  audioBibles?: Bible[];
}

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

interface SearchResult {
  query: string;
  limit: number;
  offset: number;
  total: number;
  verseCount: number;
  verses: Array<{
    id: string;
    orgId: string;
    bibleId: string;
    bookId: string;
    chapterId: string;
    content: string;
    reference: string;
  }>;
}

interface BiblesResponse {
  data: Bible[];
}

interface BooksResponse {
  data: Book[];
}

interface ChaptersResponse {
  data: Chapter[];
}

interface ChapterResponse {
  data: Chapter;
  meta: {
    fums: string;
    fumsId: string;
    fumsJsInclude: string;
    fumsJs: string;
    fumsNoScript: string;
  };
}

interface SearchResponse {
  data: SearchResult;
}

interface CachedChapter {
  data: ChapterResponse;
  cachedAt: number;
  bibleId: string;
  chapterId: string;
  reference: string;
}

// Helper function to get headers
const getHeaders = () => ({
  'api-key': API_KEY,
  'Content-Type': 'application/json',
});

// Helper function to check network connectivity
const isOnline = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Storage helpers
const saveChapterToStorage = async (
  bibleId: string, 
  chapterId: string, 
  chapterData: ChapterResponse
): Promise<void> => {
  try {
    const cachedChapter: CachedChapter = {
      data: chapterData,
      cachedAt: Date.now(),
      bibleId,
      chapterId,
      reference: chapterData.data.reference,
    };

    // Save the chapter
    const storageKey = STORAGE_KEYS.CHAPTER(bibleId, chapterId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(cachedChapter));

    // Update the offline chapters index
    await updateOfflineChaptersIndex(bibleId, chapterId, chapterData.data.reference);
    
    console.log(`Chapter ${chapterData.data.reference} saved offline`);
  } catch (error) {
    console.error('Error saving chapter to storage:', error);
  }
};

const getChapterFromStorage = async (
  bibleId: string, 
  chapterId: string
): Promise<ChapterResponse | null> => {
  try {
    const storageKey = STORAGE_KEYS.CHAPTER(bibleId, chapterId);
    const cachedData = await AsyncStorage.getItem(storageKey);
    
    if (cachedData) {
      const parsedData: CachedChapter = JSON.parse(cachedData);
      console.log(`Loaded chapter ${parsedData.reference} from offline storage`);
      return parsedData.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading chapter from storage:', error);
    return null;
  }
};

const updateOfflineChaptersIndex = async (
  bibleId: string, 
  chapterId: string, 
  reference: string
): Promise<void> => {
  try {
    const existingIndex = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CHAPTERS);
    const index = existingIndex ? JSON.parse(existingIndex) : {};
    
    if (!index[bibleId]) {
      index[bibleId] = {};
    }
    
    index[bibleId][chapterId] = {
      reference,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_CHAPTERS, JSON.stringify(index));
  } catch (error) {
    console.error('Error updating offline chapters index:', error);
  }
};

// Get offline chapters for a bible
export const getOfflineChapters = async (bibleId: string) => {
  try {
    const indexData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CHAPTERS);
    if (indexData) {
      const index = JSON.parse(indexData);
      return index[bibleId] || {};
    }
    return {};
  } catch (error) {
    console.error('Error getting offline chapters:', error);
    return {};
  }
};

// Clear offline data for a specific chapter
export const clearOfflineChapter = async (bibleId: string, chapterId: string) => {
  try {
    const storageKey = STORAGE_KEYS.CHAPTER(bibleId, chapterId);
    await AsyncStorage.removeItem(storageKey);
    
    // Update index
    const indexData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CHAPTERS);
    if (indexData) {
      const index = JSON.parse(indexData);
      if (index[bibleId] && index[bibleId][chapterId]) {
        delete index[bibleId][chapterId];
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_CHAPTERS, JSON.stringify(index));
      }
    }
    
    console.log(`Cleared offline data for chapter ${chapterId}`);
  } catch (error) {
    console.error('Error clearing offline chapter:', error);
  }
};

// Clear all offline data
export const clearAllOfflineData = async () => {
  try {
    const indexData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CHAPTERS);
    if (indexData) {
      const index = JSON.parse(indexData);
      
      // Remove all cached chapters
      for (const bibleId in index) {
        for (const chapterId in index[bibleId]) {
          const storageKey = STORAGE_KEYS.CHAPTER(bibleId, chapterId);
          await AsyncStorage.removeItem(storageKey);
        }
      }
    }
    
    // Clear the index
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_CHAPTERS);
    console.log('All offline data cleared');
  } catch (error) {
    console.error('Error clearing all offline data:', error);
  }
};

// Get all available Bibles
export function useGetBibles() {
  return useQuery({
    queryKey: ['bibles'],
    queryFn: async (): Promise<BiblesResponse> => {
      const response = await fetch(`${API_BASE_URL}/bibles`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch bibles');
      }

      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (bibles don't change often)
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Get books for a specific Bible
export function useGetBooks(bibleId: string) {
  return useQuery({
    queryKey: ['books', bibleId],
    queryFn: async (): Promise<BooksResponse> => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/books`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch books');
      }

      return response.json();
    },
    enabled: !!bibleId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Get chapters for a specific book
export function useGetChapters(bibleId: string, bookId: string) {
  return useQuery({
    queryKey: ['chapters', bibleId, bookId],
    queryFn: async (): Promise<ChaptersResponse> => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch chapters');
      }

      return response.json();
    },
    enabled: !!bibleId && !!bookId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Get a specific chapter content with offline caching
export function useGetChapter(bibleId: string, chapterId: string) {
  return useQuery({
    queryKey: ['chapter', bibleId, chapterId],
    queryFn: async (): Promise<ChapterResponse> => {
      // Check if we're online
      const online = await isOnline();
      
      if (!online) {
        // Try to get from offline storage
        const cachedChapter = await getChapterFromStorage(bibleId, chapterId);
        if (cachedChapter) {
          return cachedChapter;
        }
        throw new Error('Chapter not available offline. Please connect to the internet to download it.');
      }

      // We're online, fetch from API
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        // If API fails, try offline storage as fallback
        const cachedChapter = await getChapterFromStorage(bibleId, chapterId);
        if (cachedChapter) {
          console.log('API failed, using cached version');
          return cachedChapter;
        }
        
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch chapter');
      }

      const chapterData = await response.json();
      
      // Save to offline storage after successful fetch
      await saveChapterToStorage(bibleId, chapterId, chapterData);
      
      return chapterData;
    },
    enabled: !!bibleId && !!chapterId,
    staleTime: 60 * 60 * 1000, // 1 hour (chapter content rarely changes)
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry if we're offline and have no cached data
      if (error.message.includes('not available offline')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to preload a chapter for offline use
export function usePreloadChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bibleId, chapterId }: { bibleId: string; chapterId: string }) => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to preload chapter');
      }

      const chapterData = await response.json();
      
      // Save to offline storage
      await saveChapterToStorage(bibleId, chapterId, chapterData);
      
      // Also update the query cache
      queryClient.setQueryData(['chapter', bibleId, chapterId], chapterData);
      
      return chapterData;
    },
  });
}

// Search verses in a Bible
export function useBibleSearch() {
  return useMutation({
    mutationFn: async ({
      bibleId,
      query,
      limit = 50,
      offset = 0,
    }: {
      bibleId: string;
      query: string;
      limit?: number;
      offset?: number;
    }): Promise<SearchResponse> => {
      const searchParams = new URLSearchParams({
        query,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/search?${searchParams}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
      }

      return response.json();
    },
  });
}

// Get verses for a specific chapter
export function useGetVerses(bibleId: string, chapterId: string) {
  return useQuery({
    queryKey: ['verses', bibleId, chapterId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}/verses`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch verses');
      }

      return response.json();
    },
    enabled: !!bibleId && !!chapterId,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Get a specific verse
export function useGetVerse(bibleId: string, verseId: string) {
  return useQuery({
    queryKey: ['verse', bibleId, verseId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/verses/${verseId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch verse');
      }

      return response.json();
    },
    enabled: !!bibleId && !!verseId,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}