import React from 'react';
import type { ChatMode } from '../types';

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  isMobile: boolean;
}

const modes: { id: ChatMode; name: string; description: string }[] = [
  { id: 'fast', name: 'Rápido', description: 'Respostas rápidas e contínuas.' },
  { id: 'standard', name: 'Padrão', description: 'Respostas equilibradas.' },
  { id: 'deepThought', name: 'Pensamento Profundo', description: 'Para consultas complexas.' },
  { id: 'webSearch', name: 'Pesquisa Web', description: 'Baseado em resultados da web.' },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, isMobile }) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="mode-select" className={`${isMobile ? 'sr-only' : ''} text-sm font-medium text-gray-700 dark:text-gray-300`}>Modo:</label>
      <select
        id="mode-select"
        value={currentMode}
        onChange={(e) => onModeChange(e.target.value as ChatMode)}
        className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
      >
        {modes.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModeSelector;