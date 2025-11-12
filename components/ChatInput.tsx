import React, { useState } from 'react';
import SuggestionPills from './SuggestionPills';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, suggestions }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleRandomVerse = () => {
    if (!isLoading) {
      onSendMessage('__RANDOM_VERSE_REQUEST__');
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center" style={{ height: '44px' }} aria-live="polite">
            <span className="sr-only">Assistente está digitando...</span>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        ) : (
          <SuggestionPills onSendMessage={onSendMessage} isLoading={isLoading} suggestions={suggestions} />
        )}
        <div className="flex items-center">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-2">
            <button 
              type="button"
              onClick={handleRandomVerse}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-110"
              aria-label="Obter um versículo bíblico aleatório"
              title="Obter um versículo bíblico aleatório"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Faça uma pergunta bíblica..."
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-110"
              aria-label="Enviar mensagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default ChatInput;