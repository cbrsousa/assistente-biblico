
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import ErrorMessage from './components/ErrorMessage';
import BookmarksPanel from './components/BookmarksPanel';
import BibleNavPanel from './components/BibleNavPanel';
import LoginScreen from './components/LoginScreen';
import { generateResponse } from './services/geminiService';
import { supabase } from './lib/supabase';
import { verses } from './data/verses';
import { suggestionPrompts } from './data/suggestions';
import { fetchVerseFromBibleApi } from './services/bibleApiService';
import type { Message, ChatMode, Bookmark, User } from './types';

// Simplified localStorage keys for a single, public experience
const CHAT_HISTORY_KEY = 'virtual-assistant-chat-history';
const BOOKMARKS_KEY = 'virtual-assistant-bookmarks';
const THEME_KEY = 'virtual-assistant-theme';
const FONT_SIZE_KEY = 'virtual-assistant-font-size';
const API_KEY_LOCALSTORAGE_KEY = 'virtual-assistant-api-key';

export type FontSize = 'text-sm' | 'text-base' | 'text-lg';
export type Theme = 'light' | 'dark' | 'system';


const getBreakpoint = (width: number): string => {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  return 'xl';
};


const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
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
  
  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMessages([]);
    setBookmarks([]);
  };

  const handleUpdateApiKey = async (newKey: string) => {
    // Always save to localStorage as a primary or fallback mechanism
    localStorage.setItem(API_KEY_LOCALSTORAGE_KEY, newKey);
    
    if (!currentUser?.id) {
        // If not logged in, just updating local state is enough for now
        setCurrentUser(prev => prev ? { ...prev, geminiApiKey: newKey } : null);
        return;
    }
    
    // Using upsert in case the profile record doesn't exist yet
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ 
        id: currentUser.id,
        gemini_api_key: newKey, 
        updated_at: new Date().toISOString() 
      });

    if (updateError) {
      console.warn("Could not save to Supabase, but key is saved in localStorage:", updateError);
      // We don't want to nag the user with a permanent error if it's just a missing table
      // but we should still let them know in a less intrusive way if it's a real error.
      if (updateError.message.includes('schema cache')) {
        console.log("A tabela 'profiles' não foi encontrada no Supabase. Usando armazenamento local.");
      } else {
        setError(`Erro ao salvar na nuvem: ${updateError.message}. A chave foi salva localmente.`);
      }
    } else {
      setError(null);
    }
    
    setCurrentUser(prev => prev ? { ...prev, geminiApiKey: newKey } : null);
  };

  // Auth State Listener
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const localKey = localStorage.getItem(API_KEY_LOCALSTORAGE_KEY);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gemini_api_key')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          email: session.user.email || '',
          geminiApiKey: profile?.gemini_api_key || localKey || undefined
        });
      } else if (localKey) {
        // We can have a local key even without a user session if we allow it
        // but for now let's just keep it in mind
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const localKey = localStorage.getItem(API_KEY_LOCALSTORAGE_KEY);
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('gemini_api_key')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          email: session.user.email || '',
          geminiApiKey: profile?.gemini_api_key || localKey || undefined
        });
      } else {
        setCurrentUser(null);
        setMessages([]);
        setBookmarks([]);
      }
    });

    return () => subscription.unsubscribe();
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

  // Load data from Supabase when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.id) return;

      // Load Profile (including Gemini API Key)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setCurrentUser(prev => ({
          ...prev!,
          name: profileData.full_name || prev!.name,
          geminiApiKey: profileData.gemini_api_key,
        }));
      }

      // Load Messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
      } else if (messagesData) {
        setMessages(messagesData.map(m => ({
          id: m.id,
          role: m.role,
          text: m.text,
          sources: m.sources,
        })));
      }

      // Load Bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', currentUser.id);

      if (bookmarksError) {
        console.error('Error loading bookmarks:', bookmarksError);
      } else if (bookmarksData) {
        setBookmarks(bookmarksData.map(b => ({
          id: b.id,
          text: b.text,
          notes: b.notes,
        })));
      }
    };

    loadUserData();
  }, [currentUser?.id]);

  useEffect(() => {
    updateSuggestions(); // Set initial suggestions
  }, [updateSuggestions]);

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);
  

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    updateSuggestions();

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
    
    // Save User Message to Supabase
    if (currentUser?.id) {
      supabase.from('messages').insert({
        id: userMessage.id,
        user_id: currentUser.id,
        role: userMessage.role,
        text: userMessage.text,
      }).then(({ error }) => {
        if (error) console.error('Error saving user message:', error);
      });
    }
    
    const historyForAPI = [...messages];
    setMessages(prev => [...prev, userMessage]);
    
    let finalPrompt = prompt;

    if (prompt.startsWith('__BIBLE_API_SEARCH__:')) {
      const query = prompt.substring('__BIBLE_API_SEARCH__:'.length);
      userMessage.text = `Pesquisar versículo: ${query}`;
      setIsLoading(true);
      
      const results = await fetchVerseFromBibleApi(query);
      if (results && results.length > 0) {
        const fullText = results.map(v => `**${v.book} ${v.chapter}:${v.verse}**\n${v.text}`).join('\n\n');
        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: 'model',
          text: `### 📖 Texto Bíblico Encontrado\n\n${fullText}\n\n---\n*Fonte: Bible-api.com (Tradução Almeida)*`,
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Save to Supabase
        if (currentUser?.id) {
          supabase.from('messages').insert([
            { id: userMessage.id, user_id: currentUser.id, role: 'user', text: userMessage.text },
            { id: botMessage.id, user_id: currentUser.id, role: 'model', text: botMessage.text }
          ]);
        }
        
        setIsLoading(false);
        return;
      } else {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: 'model',
          text: `Desculpe, não consegui encontrar a referência "${query}" usando a API de pesquisa rápida. Vou tentar consultar meu conhecimento teológico.`,
        };
        setMessages(prev => [...prev, botMessage]);
        finalPrompt = `Forneça o texto bíblico para "${query}" e um breve comentário pastoral alinhado à Doutrina Batista Renovada e Carismática.`;
      }
    }
    
    if (prompt === '__DAILY_DEVOTIONAL_REQUEST__') {
        userMessage.text = "Gerar um devocional diário.";
        finalPrompt = `Gere um devocional diário profundo, rico em detalhes e espiritualmente edificante. Siga rigorosamente a Doutrina Batista Renovada e Carismática. O devocional deve ser estruturado da seguinte forma usando Markdown:

# Devocional Diário: [Título Inspirador]

### 📖 Versículo Chave
**[Citação Bíblica]** - "[Texto do versículo]"

### 🏛️ Contexto Histórico e Literário
[Uma explicação detalhada sobre quem escreveu, o momento histórico, o destinatário original e o propósito da passagem.]

### 🔍 Significado Original (Insights Linguísticos)
[Análise de 1 ou 2 palavras-chave no original Grego ou Hebraico, fornecendo a transliteração e o significado profundo que amplia a compreensão do texto.]

### 🔥 Meditação Teológica (Palavra Rhema)
[Uma reflexão profunda sobre o significado espiritual do texto, com foco na soberania de Deus, na obra redentora de Cristo e na atuação dinâmica do Espírito Santo na vida do crente.]

### 🔗 Referências Cruzadas
[Liste 2 ou 3 versículos que complementam ou reforçam o ensino desta passagem.]

### 🛠️ Aplicação Prática e Desafio
[Orientações concretas de como viver esta verdade hoje. Inclua um pequeno "Desafio de Fé" para o leitor colocar em prática.]

### 🙏 Oração do Dia
[Uma oração fervorosa, cheia de fé e gratidão, convidando a presença do Espírito Santo.]

Mantenha um tom pastoral, acolhedor e encorajador.`;
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
      setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);
      
      // Generate response
      const finalBotResponse = await generateResponse(
          finalPrompt, 
          mode, 
          historyForAPI, 
          (chunk) => {
              setMessages(prev => {
                if (prev.length === 0) return prev;
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.id === botMessageId) {
                  const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunk };
                  return [...prev.slice(0, -1), updatedLastMessage];
                }
                return prev;
              });
          },
          currentUser?.geminiApiKey
      );
      
      // After stream is complete, update the message with the final data (including sources)
      setMessages(prev => prev.map(msg =>
          msg.id === botMessageId 
          ? { ...msg, text: finalBotResponse.text, sources: finalBotResponse.sources } 
          : msg
      ));

      // Save Bot Message to Supabase
      if (currentUser?.id) {
        supabase.from('messages').insert({
          id: botMessageId,
          user_id: currentUser.id,
          role: 'model',
          text: finalBotResponse.text,
          sources: finalBotResponse.sources,
        }).then(({ error }) => {
          if (error) console.error('Error saving bot message:', error);
        });
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      // Remove the last message (the empty bot message) on error
      setMessages(prev => prev.filter(m => m.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, mode, updateSuggestions, isDesktopLayout]);

  const handleToggleBookmark = useCallback((message: Message) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(b => b.id === message.id);
      if (isBookmarked) {
        // Remove from Supabase
        if (currentUser?.id) {
          supabase.from('bookmarks').delete().eq('id', message.id).then(({ error }) => {
            if (error) console.error('Error removing bookmark:', error);
          });
        }
        return prev.filter(b => b.id !== message.id);
      } else {
        const newBookmark = { id: message.id, text: message.text, notes: '' };
        // Save to Supabase
        if (currentUser?.id) {
          supabase.from('bookmarks').insert({
            ...newBookmark,
            user_id: currentUser.id
          }).then(({ error }) => {
            if (error) console.error('Error saving bookmark:', error);
          });
        }
        return [...prev, newBookmark];
      }
    });
  }, [currentUser?.id]);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    if (currentUser?.id) {
      supabase.from('bookmarks').delete().eq('id', bookmarkId).then(({ error }) => {
        if (error) console.error('Error removing bookmark:', error);
      });
    }
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, [currentUser?.id]);
  
  const handleUpdateBookmarkNote = useCallback((bookmarkId: string, notes: string) => {
    if (currentUser?.id) {
      supabase.from('bookmarks').update({ notes }).eq('id', bookmarkId).then(({ error }) => {
        if (error) console.error('Error updating bookmark note:', error);
      });
    }
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, notes } : b));
  }, [currentUser?.id]);


  // Render Flow: Login -> Main App
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
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
          isMobile={isMobile}
          isDesktopLayout={isDesktopLayout}
          onLogout={handleLogout}
          userName={currentUser.name}
          geminiApiKey={currentUser.geminiApiKey}
          onUpdateApiKey={handleUpdateApiKey}
        />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden bg-gray-200 dark:bg-gray-800">
            <ChatHistory 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              fontSize={fontSize}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              isMobile={isMobile}
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
