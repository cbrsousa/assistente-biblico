import React from 'react';
import type { FontSize } from '../App';

interface WelcomeMessageProps {
  fontSize: FontSize;
  username: string;
  onSendMessage: (prompt: string) => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ fontSize, username, onSendMessage }) => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="w-full max-w-[85%] sm:max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
        <p className={`${fontSize} leading-relaxed`}>
          Graça e paz, {username}! Eu sou o Assistente Virtual Bíblico, seu guia bíblico. Como posso ajudá-lo em seus estudos hoje?
        </p>
        <p className={`${fontSize} mt-2 leading-relaxed`}>
          Use o painel de navegação à esquerda para explorar os livros da Bíblia ou simplesmente me faça uma pergunta abaixo.
        </p>
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button 
                onClick={() => onSendMessage('__DAILY_DEVOTIONAL_REQUEST__')}
                className="w-full sm:w-auto text-sm font-medium px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-md transition-colors"
            >
                Gerar Devocional do Dia
            </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;