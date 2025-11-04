

import React, { useEffect, useRef } from 'react';

interface TextSelectionMenuProps {
  top: number;
  left: number;
  selectedText: string;
  onAsk: (text: string) => void;
  onGetOriginalMeaning: (text: string) => void;
  onClose: () => void;
}

const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({ top, left, selectedText, onAsk, onGetOriginalMeaning, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu if a click happens outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleAsk = () => {
    onAsk(selectedText);
  };

  const handleGetOriginalMeaning = () => {
    onGetOriginalMeaning(selectedText);
  };
  
  // Truncate text for display in the button
  const buttonText = selectedText.length > 20 
    ? `"${selectedText.substring(0, 20)}..."` 
    : `"${selectedText}"`;

  return (
    <div
      ref={menuRef}
      className="absolute z-30 transform -translate-x-1/2" // Center the menu horizontally
      style={{ top: `${top}px`, left: `${left}px` }}
      role="dialog"
      aria-label="Ações para o texto selecionado"
    >
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 flex items-center p-1 divide-x divide-gray-200 dark:divide-gray-700">
        <button
          onClick={handleAsk}
          className="px-3 py-1 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title={`Perguntar sobre ${buttonText}`}
        >
          Perguntar sobre {buttonText}
        </button>
        <button
          onClick={handleGetOriginalMeaning}
          className="px-3 py-1 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title={`Obter significado original de ${buttonText}`}
        >
          Significado Original
        </button>
      </div>
    </div>
  );
};

export default TextSelectionMenu;