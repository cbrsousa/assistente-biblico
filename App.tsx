import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import ErrorMessage from './components/ErrorMessage';
import LoginScreen from './components/LoginScreen';
import BookmarksPanel from './components/BookmarksPanel';
import BibleNavPanel from './components/BibleNavPanel';
import ApiKeyMissingScreen from './components/ApiKeyMissingScreen';
import { generateResponse, generateSpeech } from './services/geminiService';
import { verses } from './data/verses';
import { suggestionPrompts } from './data/suggestions';
import type { Message, ChatMode, Bookmark } from './types';

// Use a session storage key for login status to not persist across browser sessions
const USERNAME_KEY = 'virtual-assistant-username-session'; 
const USERS_KEY = 'virtual-assistant-users'; // For storing user credentials
const getChatHistoryKey = (username: string) => `virtual-assistant-chat-history-${username}`;
const getBookmarksKey = (username: string) => `virtual-assistant-bookmarks-${username}`;
const THEME_KEY = 'virtual-assistant-theme';
const FONT_SIZE_KEY = 'virtual-assistant-font-size';

export type FontSize = 'text-sm' | 'text-base' | 'text-lg';
export type Theme = 'light' | 'dark' | 'system';


const getBreakpoint = (width: number): string => {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  return 'xl';
};

/**
 * Strips markdown formatting from a string to prepare it for Text-to-Speech.
 * @param markdown The raw markdown string.
 * @returns A plain text string.
 */
const stripMarkdownForTTS = (markdown: string): string => {
  let text = markdown;

  // Block-level elements
  text = text
    .replace(/^#{1,6}\s/gm, '') // Headings
    .replace(/^\s*[-*+]\s/gm, '') // Unordered list items
    .replace(/^\s*\d+\.\s/gm, '') // Ordered list items
    .replace(/^\s*>\s?/gm, '') // Blockquotes
    .replace(/^---/gm, ''); // Horizontal rules

  // Inline elements
  text = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/~~(.*?)~~/g, '$1') // Strikethrough
    .replace(/`(.*?)`/g, '$1'); // Inline code

  // Cleanup
  text = text
    .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
    .trim();

  return text;
};


const App: React.FC = () => {
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(() => sessionStorage.getItem(USERNAME_KEY));
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  
  const [isNavOpen, setIsNavOpen] = useState<boolean>(true); // Bible Nav state
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false); // Bookmarks state

  const [mode, setMode] = useState<ChatMode>('fast');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem(FONT_SIZE_KEY);
    if (savedSize === 'text-sm' || savedSize === 'text-base' || savedSize === 'text-lg') {
        return savedSize as FontSize;
    }
    return 'text-base';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as Theme) || 'system';
  });

  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint(window.innerWidth));
  const isMobile = breakpoint === 'xs';
  const isDesktopLayout = breakpoint !== 'xs' && breakpoint !== 'sm';

  // Check for API Key on initial load
  useEffect(() => {
    // The hosting platform (like Netlify) replaces `process.env.API_KEY` with the actual value.
    // If it's not set, it will be falsy. This check prevents the app from loading
    // without the required configuration, providing a better user experience.
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not set. The app will not function correctly.");
      setApiKeyMissing(true);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      const newIsDesktopLayout = newBreakpoint !== 'xs' && newBreakpoint !== 'sm';
      
      setBreakpoint(newBreakpoint);

      // If switching to mobile view, ensure panels are closed.
      if (!newIsDesktopLayout) {
        setIsNavOpen(false);
        setIsBookmarksOpen(false);
      } else {
        // If switching to desktop, open nav by default and close bookmark overlay.
        setIsNavOpen(true);
        setIsBookmarksOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSuggestions = useCallback(() => {
    const shuffled = [...suggestionPrompts].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  }, []);

  // Load data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      updateSuggestions(); // Set initial suggestions
      try {
        const chatHistoryKey = getChatHistoryKey(currentUser);
        const savedMessages = localStorage.getItem(chatHistoryKey);
        setMessages(savedMessages ? JSON.parse(savedMessages) : []);
      } catch (error) {
        console.error("Failed to load messages from localStorage", error);
        setMessages([]);
      }
      
      try {
        const bookmarksKey = getBookmarksKey(currentUser);
        const savedBookmarks = localStorage.getItem(bookmarksKey);
        setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);
      } catch (error) {
        console.error("Failed to load bookmarks from localStorage", error);
        setBookmarks([]);
      }
    }
  }, [currentUser, updateSuggestions]);


  // Save messages when they change
  useEffect(() => {
    if (currentUser && messages.length > 0) {
      try {
        const chatHistoryKey = getChatHistoryKey(currentUser);
        localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
      }
    } else if (currentUser && messages.length === 0) {
        // Also handle clearing history
        localStorage.removeItem(getChatHistoryKey(currentUser));
    }
  }, [messages, currentUser]);

  // Save bookmarks when they change
  useEffect(() => {
    if (currentUser) {
      try {
        const bookmarksKey = getBookmarksKey(currentUser);
        localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage", error);
      }
    }
  }, [bookmarks, currentUser]);

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);
  
  const handleAudioGenerated = useCallback((messageId: string, audioData: string) => {
    setAudioCache(prev => {
        const newCache = new Map(prev);
        newCache.set(messageId, audioData);
        return newCache;
    });
  }, []);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    updateSuggestions();

    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();

    // Close sidebars on mobile when a message is sent for better focus
    if (!isDesktopLayout) {
      setIsNavOpen(false);
      setIsBookmarksOpen(false);
    }

    if (prompt === '__RANDOM_VERSE_REQUEST__') {
      setIsLoading(true);
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: randomVerse,
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 500);
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
    };
    
    const historyForAPI = [...messages];
    setMessages(prev => [...prev, userMessage]);
    
    let finalPrompt = prompt;
    
    if (prompt === '__DAILY_DEVOTIONAL_REQUEST__') {
        userMessage.text = "Gerar um devocional diário.";
        finalPrompt = `Gere um devocional diário conciso e inspirador. O devocional deve incluir:
1.  **Um Versículo Chave**: Um versículo bíblico como foco principal.
2.  **Uma Meditação**: Uma reflexão de 2-3 parágrafos sobre o versículo, explicando seu significado e relevância.
3.  **Uma Oração Curta**: Uma breve oração relacionada ao tema da meditação.
Tudo deve estar alinhado com a Doutrina Batista Renovada e Carismática.`;
    }
    else if (prompt.startsWith('__GET_ORIGINAL_MEANING__:')) {
        const word = prompt.substring('__GET_ORIGINAL_MEANING__:'.length);
        userMessage.text = `Qual o significado original de "${word}"?`; // Update user message to be more readable
        finalPrompt = `Qual é o significado original (grego ou hebraico) da palavra ou frase "${word}"?

Forneça a sua resposta na seguinte estrutura usando Markdown:
1.  **Palavra Original**: [A palavra em grego ou hebraico]
2.  **Transliteração**: [A transliteração da palavra]
3.  **Significado Principal**: [O significado principal da palavra]
4.  **Análise Contextual**: [Uma explicação detalhada do significado da palavra no contexto bíblico, como ela é usada em outras passagens e sua importância teológica, alinhada à Doutrina Batista Renovada e Carismática.]`;
    } else if (
        (prompt.toLowerCase().startsWith('mostre-me ') && prompt.includes(' capítulo ')) ||
        (prompt.toLowerCase().startsWith('mostre-me o versículo '))) {
      const passageIdentifier = prompt.substring(prompt.indexOf(' ')).trim().replace(/\.$/, '');
      finalPrompt = `Forneça o texto bíblico para ${passageIdentifier}.

Após o texto, adicione uma seção separada e claramente marcada como "### Comentários".

Nesta seção de comentários, forneça uma análise detalhada da passagem, incluindo:
1.  **Contexto**: O contexto histórico e literário.
2.  **Análise do Texto**: Explicação de termos-chave, possivelmente com referência ao grego ou hebraico.
3.  **Temas Teológicos**: Os principais temas e doutrinas abordados na passagem.
4.  **Aplicações Práticas**: Como os ensinamentos podem ser aplicados hoje.

Toda a sua resposta, incluindo o texto e os comentários, deve ser estritamente baseada na Bíblia Sagrada e alinhada com a Doutrina Batista Renovada e Carismática, conforme definido em suas instruções de sistema. Use Markdown para formatar a resposta de forma clara (negrito para títulos, listas, etc.).`;
    }

    try {
      const botMessageId = crypto.randomUUID();
      // Add an empty message to start streaming into.
      if (mode !== 'imageGeneration') {
        setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);
      }
      
      // Generate response
      const finalBotResponse = await generateResponse(
          finalPrompt, 
          mode, 
          historyForAPI, 
          (chunk) => {
              setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
              ));
          }
      );
      
      if (mode === 'imageGeneration') {
          const botMessage: Message = {
            id: botMessageId,
            role: 'model',
            text: finalBotResponse.text,
            imageUrl: finalBotResponse.imageUrl,
          };
          setMessages(prev => [...prev, botMessage]);
      } else {
        // After stream is complete, update the message with the final data (including sources)
        setMessages(prev => prev.map(msg =>
            msg.id === botMessageId 
            ? { ...msg, text: finalBotResponse.text, sources: finalBotResponse.sources } 
            : msg
        ));

        // Pre-generate audio in the background for faster playback
        if (finalBotResponse.text) {
          generateSpeech(stripMarkdownForTTS(finalBotResponse.text))
            .then(base64Audio => {
              handleAudioGenerated(botMessageId, base64Audio);
            })
            .catch(err => {
              // Fail silently, user can still generate manually.
              console.error("Background audio generation failed:", err);
            });
        }
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`${errorMessage}`);
      // Revert to the state before adding the user's message
      setMessages(historyForAPI);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, mode, updateSuggestions, isDesktopLayout, handleAudioGenerated]);

  const handleRegister = async (username: string, password: string): Promise<{success: boolean, message: string}> => {
    // In a real app, this would be an API call. For this demo, we use localStorage.
    // This is NOT secure and is for demonstration purposes only.
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (users.some((user: any) => user.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists. Please choose another.' };
      }

      users.push({ username, password }); // Storing passwords in plaintext is insecure.
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (e) {
      console.error("Registration failed", e);
      return { success: false, message: 'An error occurred during registration. Please try again.' };
    }
  };

  const handleLogin = (username: string, password: string): boolean => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (!storedUsers) return false;

      const users = JSON.parse(storedUsers);
      const user = users.find((u: any) => u.username === username && u.password === password);

      if (user) {
        sessionStorage.setItem(USERNAME_KEY, username);
        setCurrentUser(username);
        // Data for the new user will be loaded by the useEffect hook
        return true;
      }
      return false;
    } catch(e) {
      console.error("Login failed", e);
      return false;
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem(USERNAME_KEY);
    setCurrentUser(null);
  };

  const handleToggleBookmark = useCallback((message: Message) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(b => b.id === message.id);
      if (isBookmarked) {
        return prev.filter(b => b.id !== message.id);
      } else {
        return [...prev, { id: message.id, text: message.text, notes: '' }];
      }
    });
  }, []);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);
  
  const handleUpdateBookmarkNote = useCallback((bookmarkId: string, notes: string) => {
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, notes } : b));
  }, []);


  if (apiKeyMissing) {
    return <ApiKeyMissingScreen />;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <BibleNavPanel
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSendMessage={handleSendMessage}
        fontSize={fontSize}
      />
      
      {/* Backdrop for mobile overlays */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          !isDesktopLayout && (isNavOpen || isBookmarksOpen) ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => {
          setIsNavOpen(false);
          setIsBookmarksOpen(false);
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header 
          currentMode={mode} 
          onModeChange={setMode} 
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          theme={theme}
          onThemeChange={setTheme}
          onToggleNav={() => setIsNavOpen(!isNavOpen)}
          onToggleBookmarks={() => setIsBookmarksOpen(!isBookmarksOpen)}
          onLogout={handleLogout}
          isMobile={isMobile}
          isDesktopLayout={isDesktopLayout}
        />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden bg-gray-200 dark:bg-gray-800">
            <ChatHistory 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              fontSize={fontSize}
              username={currentUser}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              isMobile={isMobile}
              audioCache={audioCache}
              onAudioGenerated={handleAudioGenerated}
            />
            {error && <ErrorMessage message={error} onClear={() => setError(null)} />}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} suggestions={suggestions} />
          </main>
          
          {/* Desktop, fixed panel */}
          {isDesktopLayout && (
            <BookmarksPanel
              bookmarks={bookmarks}
              onRemoveBookmark={handleRemoveBookmark}
              onUpdateBookmarkNote={handleUpdateBookmarkNote}
              onSendMessage={handleSendMessage}
              isDesktop={true}
            />
          )}
        </div>
      </div>

      {/* Mobile, overlay panel */}
      {!isDesktopLayout && (
        <BookmarksPanel
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          bookmarks={bookmarks}
          onRemoveBookmark={handleRemoveBookmark}
          onUpdateBookmarkNote={handleUpdateBookmarkNote}
          onSendMessage={handleSendMessage}
          isDesktop={false}
        />
      )}
    </div>
  );
};

export default App;