import React from 'react';

interface SuggestionPillsProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const SuggestionPills: React.FC<SuggestionPillsProps> = ({ onSendMessage, isLoading, suggestions }) => {
  return (
    <div className="pb-3 px-2 flex flex-wrap gap-2 justify-center" aria-label="Sugestões de perguntas">
      {suggestions.map((text, index) => (
        <button
          key={index}
          onClick={() => onSendMessage(text)}
          disabled={isLoading}
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default SuggestionPills;