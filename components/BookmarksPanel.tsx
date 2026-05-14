import React, { useState, useMemo, useEffect } from 'react';
import type { Bookmark } from '../types';

interface BookmarkItemProps {
    bookmark: Bookmark;
    onRemoveBookmark: (bookmarkId: string) => void;
    onUpdateBookmarkNote: (bookmarkId: string, notes: string) => void;
    onSendMessage: (prompt: string) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onRemoveBookmark, onUpdateBookmarkNote, onSendMessage }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(bookmark.notes || '');

    useEffect(() => {
        setNotes(bookmark.notes || '');
    }, [bookmark.notes]);
    
    const handleSave = () => {
        onUpdateBookmarkNote(bookmark.id, notes);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setNotes(bookmark.notes || '');
        setIsEditing(false);
    };

    return (
        <li className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md group">
            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{bookmark.text}</p>
            
            {isEditing ? (
                <div className="mt-3">
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Adicione suas anotações..."
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                        <button onClick={handleCancel} className="text-sm px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                        <button onClick={handleSave} className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700">Salvar</button>
                    </div>
                </div>
            ) : (
                <>
                    {bookmark.notes && (
                         <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-500 pl-2 italic">
                            {bookmark.notes}
                        </p>
                    )}
                    <div className="mt-3 flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                            title="Adicionar/Editar anotação"
                        >
                            {bookmark.notes ? 'Editar Nota' : 'Adicionar Nota'}
                        </button>
                        <button
                            onClick={() => onSendMessage(`Explique mais sobre "${bookmark.text.substring(0, 50)}...".`)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            title="Perguntar sobre este versículo"
                        >
                            Perguntar
                        </button>
                        <button 
                            onClick={() => onRemoveBookmark(bookmark.id)} 
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                            title="Remover este versículo salvo"
                        >
                            Remover
                        </button>
                    </div>
                </>
            )}
        </li>
    );
};


interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  onRemoveBookmark: (bookmarkId: string) => void;
  onUpdateBookmarkNote: (bookmarkId: string, notes: string) => void;
  onSendMessage: (prompt: string) => void;
  isDesktop: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ 
  bookmarks, 
  onRemoveBookmark,
  onUpdateBookmarkNote,
  onSendMessage,
  isDesktop,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookmarks;
    }
    return bookmarks.filter(bookmark =>
      bookmark.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookmarks, searchQuery]);
  
  const baseClasses = "bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col h-full";
  const desktopClasses = "w-80 md:w-96 flex-shrink-0";
  const mobileClasses = `w-80 fixed top-0 right-0 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;

  return (
    <aside 
      className={`${baseClasses} ${isDesktop ? desktopClasses : mobileClasses}`}
      aria-label="Painel de versículos salvos"
    >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Versículos Salvos</h2>
          {!isDesktop && (
            <button 
                onClick={onClose} 
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Fechar painel de versículos salvos"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          )}
        </header>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Pesquisar versículos salvos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Pesquisar versículos salvos"
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum versículo salvo</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Clique no ícone de marcador em uma mensagem para salvá-la aqui.</p>
            </div>
          ) : filteredBookmarks.length > 0 ? (
            <ul className="space-y-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkItem 
                    key={bookmark.id}
                    bookmark={bookmark}
                    onRemoveBookmark={onRemoveBookmark}
                    onUpdateBookmarkNote={onUpdateBookmarkNote}
                    onSendMessage={onSendMessage}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum resultado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tente uma busca diferente.</p>
            </div>
          )}
        </main>
    </aside>
  );
};

export default BookmarksPanel;