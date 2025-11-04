import React, { useState } from 'react';
import { oldTestamentChronological, newTestamentChronological, bibleBookChapters } from '../data/bibleBooks';
import type { FontSize } from '../App';

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

    const handleBookClick = (bookName: string) => {
      setSelectedBook(prev => (prev === bookName ? null : bookName));
    };
  
    const handleChapterClick = (bookName: string, chapter: number) => {
      onSendMessage(`Mostre-me ${bookName} capítulo ${chapter}.`);
      setSelectedBook(null); // Close the chapter selector after selection
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
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
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
            </header>

            <main className="flex-1 overflow-y-auto p-4">
               <BookList 
                 title="Antigo Testamento" 
                 books={oldTestamentChronological} 
                 onBookClick={handleBookClick} 
                 onChapterClick={handleChapterClick}
                 selectedBook={selectedBook}
                 fontSize={fontSize}
                 isOpen={isOldTestamentOpen}
                 onToggle={() => setIsOldTestamentOpen(prev => !prev)}
               />
               <BookList 
                 title="Novo Testamento" 
                 books={newTestamentChronological} 
                 onBookClick={handleBookClick}
                 onChapterClick={handleChapterClick}
                 selectedBook={selectedBook}
                 fontSize={fontSize}
                 isOpen={isNewTestamentOpen}
                 onToggle={() => setIsNewTestamentOpen(prev => !prev)}
               />
            </main>
        </aside>
    )
}

export default BibleNavPanel;