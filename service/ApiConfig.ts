// Example API service structure
const BibleAPI = {
  baseURL: 'https://api.scripture.api.bible/v1',
  headers: { 'api-key': 'YOUR_KEY' },
  
  getBibles: () => fetch(`${baseURL}/bibles`, {headers}),
  getBooks: (bibleId) => fetch(`${baseURL}/bibles/${bibleId}/books`, {headers}),
  getChapters: (bibleId, bookId) => fetch(`${baseURL}/bibles/${bibleId}/books/${bookId}/chapters`, {headers}),
  getChapter: (bibleId, chapterId) => fetch(`${baseURL}/bibles/${bibleId}/chapters/${chapterId}`, {headers}),
  search: (bibleId, query) => fetch(`${baseURL}/bibles/${bibleId}/search?query=${query}&limit=50`, {headers})
};