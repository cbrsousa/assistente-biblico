import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Message, Bookmark } from '../types';
import type { FontSize } from '../App';
import WelcomeMessage from './WelcomeMessage';
import TextSelectionMenu from './TextSelectionMenu';
import { bibleBookRegexList } from '../data/bibleBooks';

// Regex to find Bible verse patterns like "João 3:16" or "1 Coríntios 13:4-7".
const bibleVerseRegex = new RegExp(
  `\\b([1-3]?\\s?)(${bibleBookRegexList.join('|')})\\s(\\d{1,3}:\\d{1,3}(?:-\\d{1,3})?)\\b`,
  'gi'
);

interface FormattedMessageProps {
  text: string;
  onSendMessage: (prompt: string) => void;
}

/**
 * A component that parses a string for Bible verses and turns them into clickable buttons
 * that trigger an in-app action to display the verse.
 */
const FormattedMessage: React.FC<FormattedMessageProps> = React.memo(function FormattedMessage({ text, onSendMessage }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(bibleVerseRegex)) {
    const [fullMatch] = match;
    const startIndex = match.index!;

    // Add the text before the citation
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Add the citation as a button
    parts.push(
      <button
        key={startIndex}
        onClick={() => onSendMessage(`Mostre-me o versículo ${fullMatch}.`)}
        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md px-1.5 py-0.5 mx-0.5 font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors no-underline cursor-pointer"
        title={`Ver o texto de ${fullMatch}`}
      >
        {fullMatch}
      </button>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Add any remaining text after the last citation
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no verses were found, return the original text
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
});


interface MessageBubbleProps {
  message: Message;
  onSendMessage: (prompt: string) => void;
  fontSize: FontSize;
  isBookmarked: boolean;
  onToggleBookmark: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(function MessageBubble({ message, onSendMessage, fontSize, isBookmarked, onToggleBookmark }) {
  const isModel = message.role === 'model';
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  
  const handleToggle = () => {
    onToggleBookmark(message);
    if (bookmarkRef.current) {
        bookmarkRef.current.classList.add('animate-pulse-bookmark');
        bookmarkRef.current.onanimationend = () => {
            bookmarkRef.current?.classList.remove('animate-pulse-bookmark');
        };
    }
  };
  
  return (
    <div className={`group flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in-up`}>
      <div
        className={`relative max-w-[85%] sm:max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg shadow-md transition-all ${
          isModel 
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none' 
            : 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-none'
        } ${
          isBookmarked && isModel ? 'border-l-4 border-yellow-400 dark:border-yellow-500' : ''
        }`}
      >
        {isModel && (
            <div className="absolute top-2 right-2 flex space-x-1">
                 <button
                    ref={bookmarkRef}
                    onClick={handleToggle}
                    className={`p-1 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        isBookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    aria-label={isBookmarked ? "Remover versículo salvo" : "Salvar versículo"}
                    title={isBookmarked ? "Remover versículo salvo" : "Salvar versículo"}
                >
                    {isBookmarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    )}
                </button>
            </div>
        )}
        <div className={`${fontSize} whitespace-pre-wrap leading-relaxed ${isModel ? 'pr-12' : ''}`}>
          {isModel ? <FormattedMessage text={message.text} onSendMessage={onSendMessage} /> : message.text}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold mb-1">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
              {message.sources.map((source, index) => (
                <li key={index} className="text-sm">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 dark:hover:text-blue-300">
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

interface ChatHistoryProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  fontSize: FontSize;
  bookmarks: Bookmark[];
  onToggleBookmark: (message: Message) => void;
  isMobile: boolean;
}

interface SelectionInfo {
  text: string;
  top: number;
  left: number;
}


const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, onSendMessage, fontSize, bookmarks, onToggleBookmark }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selection && selectedText && selectedText.length > 1) {
        const range = selection.getRangeAt(0);
        const anchorNode = range.commonAncestorContainer;
        
        const targetElement = anchorNode.nodeType === Node.ELEMENT_NODE 
          ? anchorNode as HTMLElement 
          : anchorNode.parentElement;

        const modelMessageBubble = targetElement?.closest('.group .bg-white, .group .dark\\:bg-gray-700');
        
        if (modelMessageBubble && chatContainerRef.current) {
          const rect = range.getBoundingClientRect();
          const containerRect = chatContainerRef.current.getBoundingClientRect();
          
          if (containerRect.width === 0 || containerRect.height === 0) {
              setSelectionInfo(null);
              return;
          }

          setSelectionInfo({
            text: selectedText,
            top: rect.top - containerRect.top + chatContainerRef.current.scrollTop - 45,
            left: rect.left - containerRect.left + rect.width / 2,
          });
          return;
        }
      }
      
      setSelectionInfo(null);
    };

    document.addEventListener('mouseup', handleSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);
  
  const handleAskAboutSelection = (text: string) => {
    onSendMessage(`Explique o que significa "${text}" no contexto bíblico.`);
    setSelectionInfo(null);
  };

  const handleGetOriginalMeaning = (text: string) => {
    onSendMessage(`__GET_ORIGINAL_MEANING__:${text}`);
    setSelectionInfo(null);
  };

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map(b => b.id)), [bookmarks]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 relative"
    >
      {selectionInfo && (
        <TextSelectionMenu 
          top={selectionInfo.top}
          left={selectionInfo.left}
          selectedText={selectionInfo.text}
          onAsk={handleAskAboutSelection}
          onGetOriginalMeaning={handleGetOriginalMeaning}
          onClose={() => setSelectionInfo(null)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && <WelcomeMessage fontSize={fontSize} onSendMessage={onSendMessage} />}
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onSendMessage={onSendMessage} 
            fontSize={fontSize}
            isBookmarked={bookmarkedIds.has(msg.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatHistory;