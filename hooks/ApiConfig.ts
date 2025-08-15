import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = 'b809a3adcefd1e56002148d07435d7b2'; 

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

// Helper function to get headers
const getHeaders = () => ({
  'api-key': API_KEY,
  'Content-Type': 'application/json',
});

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

// Get a specific chapter content
export function useGetChapter(bibleId: string, chapterId: string) {
  return useQuery({
    queryKey: ['chapter', bibleId, chapterId],
    queryFn: async (): Promise<ChapterResponse> => {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch chapter');
      }

      return response.json();
    },
    enabled: !!bibleId && !!chapterId,
    staleTime: 60 * 60 * 1000, // 1 hour (chapter content rarely changes)
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
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

