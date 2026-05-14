
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClear: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClear }) => {
  return (
    <div 
      className="max-w-4xl mx-auto bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-md relative mb-4 flex justify-between items-center shadow-lg" 
      role="alert"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div>
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline text-base">{message}</span>
        </div>
        {(message.toLowerCase().includes('chave de api') || message.toLowerCase().includes('api key')) && (
          <button
            onClick={async () => {
              if (window.aistudio?.openSelectKey) {
                await window.aistudio.openSelectKey();
              } else {
                alert("Por favor, acesse Configurações > Segredos no menu lateral do AI Studio para configurar sua GEMINI_API_KEY.");
              }
            }}
            className="ml-0 sm:ml-4 px-3 py-1 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-800 dark:text-red-100 rounded text-sm font-medium transition-colors border border-red-300 dark:border-red-600"
          >
            Configurar Chave
          </button>
        )}
      </div>
      <button
        onClick={onClear}
        className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Fechar mensagem de erro"
      >
        <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Fechar</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </button>
    </div>
  );
};

export default ErrorMessage;