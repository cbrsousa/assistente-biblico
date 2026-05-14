
import React, { useState, useEffect, useRef } from 'react';
import ModeSelector from './ModeSelector';
import UserCounter from './UserCounter';
import { BookOpen, Settings, LogOut, Moon, Sun, Monitor, Bookmark, Menu, ChevronDown, Key } from 'lucide-react';
import type { ChatMode } from '../types';
import type { FontSize, Theme } from '../App';

interface HeaderProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onToggleNav: () => void;
  onToggleBookmarks: () => void;
  isMobile: boolean;
  isDesktopLayout: boolean;
  onLogout: () => void;
  userName?: string;
  whatsapp?: string;
  geminiApiKey?: string;
  onUpdateApiKey: (key: string) => Promise<void>;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ 
  currentMode, 
  onModeChange, 
  fontSize, 
  onFontSizeChange, 
  theme,
  onThemeChange,
  onToggleNav,
  onToggleBookmarks,
  isMobile,
  isDesktopLayout,
  onLogout,
  userName,
  whatsapp,
  geminiApiKey,
  onUpdateApiKey,
  onUpdateProfile
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsapp || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempApiKey(geminiApiKey || '');
  }, [geminiApiKey]);

  useEffect(() => {
    setTempWhatsapp(whatsapp || '');
  }, [whatsapp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const cycleFontSize = () => {
    const sizes: FontSize[] = ['text-sm', 'text-base', 'text-lg'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    onFontSizeChange(sizes[nextIndex]);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };


  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col sm:flex-row justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4 sm:mb-0">
        <button
          onClick={onToggleNav}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          aria-label="Abrir navegação da Bíblia"
        >
          <BookOpen className="h-6 w-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">
          {isMobile ? 'Assistente CBR' : 'Assistente Bíblico CBR'}
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <UserCounter />
        <ModeSelector currentMode={currentMode} onModeChange={onModeChange} isMobile={isMobile} />

        {!isDesktopLayout && (
            <button
            onClick={onToggleBookmarks}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Abrir versículos salvos"
            >
            <Bookmark className="h-6 w-6" />
            </button>
        )}

        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Abrir configurações"
          >
            <Settings className="h-6 w-6" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
               {userName && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Logado como</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{userName}</p>
                </div>
               )}

              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                 <button 
                   onClick={cycleTheme} 
                   className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center capitalize"
                   title="Alternar tema"
                 >
                    {theme === 'light' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    {theme === 'dark' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                    {theme === 'system' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    {theme}
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho da Fonte</span>
                 <button 
                   onClick={cycleFontSize} 
                   className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                   title="Alternar entre os tamanhos de fonte pequeno, normal e grande"
                 >
                    {fontSize === 'text-sm' ? 'Pequeno' : fontSize === 'text-base' ? 'Normal' : 'Grande'}
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

              <div className="px-4 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Seu WhatsApp</p>
                <div className="flex flex-col space-y-2">
                    <input
                        type="tel"
                        value={tempWhatsapp}
                        onChange={(e) => setTempWhatsapp(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={async () => {
                            setIsSavingWhatsapp(true);
                            await onUpdateProfile({ whatsapp: tempWhatsapp });
                            setIsSavingWhatsapp(false);
                        }}
                        disabled={isSavingWhatsapp}
                        className={`w-full py-1.5 text-xs font-semibold text-white rounded shadow-sm transition-all ${
                            isSavingWhatsapp ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {isSavingWhatsapp ? 'Salvando...' : 'Atualizar WhatsApp'}
                    </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

              <div className="px-4 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Chave Gemini API</p>
                <div className="flex flex-col space-y-2">
                    <input
                        type="password"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder="Cole aqui sua chave (AI Studio)..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={async () => {
                            const trimmedKey = tempApiKey.trim();
                            if (!trimmedKey) {
                                alert("Por favor, insira uma chave sólida.");
                                return;
                            }
                            setIsSavingKey(true);
                            await onUpdateApiKey(trimmedKey);
                            setIsSavingKey(false);
                            // Brief feedback
                            const btn = document.activeElement as HTMLButtonElement;
                            const originalText = btn.innerText;
                            btn.innerText = "✓ Salvo!";
                            btn.classList.replace('bg-green-600', 'bg-blue-600');
                            setTimeout(() => {
                                btn.innerText = originalText;
                                btn.classList.replace('bg-blue-600', 'bg-green-600');
                                setIsSettingsOpen(false);
                            }, 1500);
                        }}
                        disabled={isSavingKey}
                        className={`w-full py-1.5 text-xs font-semibold text-white rounded shadow-sm transition-all ${
                            isSavingKey ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                        }`}
                    >
                        {isSavingKey ? 'Salvando...' : 'Salvar no Perfil'}
                    </button>
                    <p className="text-[10px] text-gray-400 leading-tight">
                        Sua chave será armazenada no seu perfil do Supabase (e localmente) para uso futuro.
                    </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

              <button
                onClick={async () => {
                   if (window.aistudio?.openSelectKey) {
                     await window.aistudio.openSelectKey();
                   } else {
                     alert("Por favor, acesse Configurações > Segredos no menu lateral do AI Studio para configurar sua GEMINI_API_KEY.");
                   }
                   setIsSettingsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Key className="h-4 w-4 mr-2" />
                Configurar Chave API
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={() => {
                    onLogout();
                    setIsSettingsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
