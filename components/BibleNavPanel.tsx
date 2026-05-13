import React, { useState, useEffect } from 'react';
import { 
  oldTestamentChronological, 
  newTestamentChronological, 
  oldTestamentCanonical, 
  newTestamentCanonical,
  allBooksAlphabetical,
  bibleBookChapters 
} from '../data/bibleBooks';
import { verses } from '../data/verses';
import type { FontSize } from '../App';

type SortMode = 'canonical' | 'chronological' | 'alphabetical' | 'search';

interface BookListProps {
  title: string;
  books: string[];
  onBookClick: (bookName: string) => void;
  onChapterClick: (bookName: string, chapter: number) => void;
  selectedBook: string | null;
  fontSize: FontSize;
  isOpen: boolean;
  onToggle: () => void;
}

const BookList: React.FC<BookListProps> = ({ title, books, onBookClick, onChapterClick, selectedBook, fontSize, isOpen, onToggle }) => (
  <div className="mb-4 last:mb-0">
    <h3 className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-3">
      <button onClick={onToggle} className="w-full flex justify-between items-center text-lg font-semibold text-gray-700 dark:text-gray-200 focus:outline-none" aria-expanded={isOpen}>
        <span>{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </h3>
    {isOpen && (
      <ul className={`grid grid-cols-2 gap-x-4 gap-y-2 ${fontSize}`}>
        {books.map(book => (
          <React.Fragment key={book}>
            <li className="col-span-1">
              <button
                onClick={() => onBookClick(book)}
                className={`w-full text-left text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:underline ${selectedBook === book ? 'font-bold' : ''}`}
                title={`Ver capítulos de ${book}`}
                aria-expanded={selectedBook === book}
              >
                {book}
              </button>
            </li>
            {selectedBook === book && (
              <li className="col-span-full mt-2 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h4 className="font-semibold mb-2 text-base text-gray-800 dark:text-gray-100">Capítulos de {book}</h4>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-1.5">
                  {Array.from({ length: bibleBookChapters[book] }, (_, i) => i + 1).map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => onChapterClick(book, chapter)}
                      className="aspect-square flex items-center justify-center text-sm p-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      title={`Ler ${book} ${chapter}`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    )}
  </div>
);


interface BibleNavPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (prompt: string) => void;
  fontSize: FontSize;
}

const BibleNavPanel: React.FC<BibleNavPanelProps> = ({ isOpen, onClose, onSendMessage, fontSize }) => {
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [isOldTestamentOpen, setIsOldTestamentOpen] = useState(true);
    const [isNewTestamentOpen, setIsNewTestamentOpen] = useState(true);
    const [sortMode, setSortMode] = useState<SortMode>('canonical');
    const [searchQuery, setSearchQuery] = useState('');
    const [verseOfDay, setVerseOfDay] = useState('');

    useEffect(() => {
      // Get a random verse on mount
      if (verses.length > 0) {
        setVerseOfDay(verses[Math.floor(Math.random() * verses.length)]);
      }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSendMessage(`__BIBLE_API_SEARCH__:${searchQuery}`);
      }
    };

    const handleBookClick = (bookName: string) => {
      setSelectedBook(prev => (prev === bookName ? null : bookName));
    };
  
    const handleChapterClick = (bookName: string, chapter: number) => {
      onSendMessage(`Mostre-me ${bookName} capítulo ${chapter}.`);
      setSelectedBook(null); // Close the chapter selector after selection
    };

    const getOldTestamentBooks = () => {
      if (sortMode === 'chronological') return oldTestamentChronological;
      return oldTestamentCanonical;
    };

    const getNewTestamentBooks = () => {
      if (sortMode === 'chronological') return newTestamentChronological;
      return newTestamentCanonical;
    };

    return (
        <aside 
          className={`
            transform transition-all duration-300 ease-in-out
            w-80 md:w-96 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col h-full z-30
            ${isOpen ? 'translate-x-0' : '-translate-x-full absolute'}
          `}
          aria-label="Navegação da Bíblia"
        >
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Navegar na Bíblia</h2>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Fechar navegação"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setSortMode('canonical')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${sortMode === 'canonical' ? 'bg-white dark:bg-gray-600 shadow-sm font-semibold' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Canônico
                </button>
                <button
                  onClick={() => setSortMode('chronological')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${sortMode === 'chronological' ? 'bg-white dark:bg-gray-600 shadow-sm font-semibold' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Cronológico
                </button>
                <button
                  onClick={() => setSortMode('alphabetical')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${sortMode === 'alphabetical' ? 'bg-white dark:bg-gray-600 shadow-sm font-semibold' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Alfabético
                </button>
              </div>

              <form onSubmit={handleSearch} className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Pesquisar versículo (ex: João 3:16)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 placeholder-gray-500"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {verseOfDay && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 flex justify-between items-center">
                    Versículo do Dia
                    <button 
                      onClick={() => setVerseOfDay(verses[Math.floor(Math.random() * verses.length)])}
                      className="hover:rotate-180 transition-transform duration-500"
                      title="Mudar versículo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.4 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </h4>
                  <p className="text-xs italic text-gray-700 dark:text-gray-300 leading-relaxed">
                    {verseOfDay}
                  </p>
                  <button 
                    onClick={() => onSendMessage(`Me explique o versículo: ${verseOfDay}`)}
                    className="mt-2 text-[10px] font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    Estudar este versículo
                  </button>
                </div>
              )}
            </header>

            <main className="flex-1 overflow-y-auto p-4">
              {sortMode === 'alphabetical' ? (
                <BookList 
                  title="Todos os Livros (A-Z)" 
                  books={allBooksAlphabetical} 
                  onBookClick={handleBookClick} 
                  onChapterClick={handleChapterClick}
                  selectedBook={selectedBook}
                  fontSize={fontSize}
                  isOpen={true} // In alphabetical mode, always show everything
                  onToggle={() => {}}
                />
              ) : (
                <>
                  <BookList 
                    title="Antigo Testamento" 
                    books={getOldTestamentBooks()} 
                    onBookClick={handleBookClick} 
                    onChapterClick={handleChapterClick}
                    selectedBook={selectedBook}
                    fontSize={fontSize}
                    isOpen={isOldTestamentOpen}
                    onToggle={() => setIsOldTestamentOpen(prev => !prev)}
                  />
                  <BookList 
                    title="Novo Testamento" 
                    books={getNewTestamentBooks()} 
                    onBookClick={handleBookClick}
                    onChapterClick={handleChapterClick}
                    selectedBook={selectedBook}
                    fontSize={fontSize}
                    isOpen={isNewTestamentOpen}
                    onToggle={() => setIsNewTestamentOpen(prev => !prev)}
                  />
                </>
              )}
            </main>
        </aside>
    )
}

export default BibleNavPanel;