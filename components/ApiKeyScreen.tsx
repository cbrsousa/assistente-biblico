import React, { useState } from 'react';

interface ApiKeyScreenProps {
  onSave: (apiKey: string) => void;
  initialError?: string | null;
}

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onSave, initialError }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(initialError || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Por favor, insira uma chave de API.');
      return;
    }
    onSave(apiKey.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-slide-in-fade p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H3.75v-2.25H1.5v-2.25H-1.5A2.25 2.25 0 010 15V9a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 016 9v1.5h1.5v1.5h1.5a3 3 0 116 0z" transform="translate(1.5, -1.5)"/>
        </svg>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4">
          Chave de API do Gemini Necessária
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Para começar, por favor, insira sua chave de API do Google Gemini.
        </p>
        
        <div className="mt-6 text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong className="font-semibold">Sua chave é segura.</strong> Ela é armazenada <strong className="font-semibold">apenas no seu navegador</strong> e nunca é enviada para nossos servidores.
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                Você pode obter sua chave de API gratuitamente no{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Google AI Studio
                </a>.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="api-key" className="sr-only">Chave de API do Gemini</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="Cole sua chave de API aqui"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Salvar e Continuar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyScreen;
