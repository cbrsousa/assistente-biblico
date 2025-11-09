import React from 'react';

const ApiKeyMissingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-slide-in-fade p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            Configuração Necessária
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            A chave de API do Gemini não foi encontrada.
        </p>
        <div className="mt-6 text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-200">
                Para que o assistente funcione, a variável de ambiente <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded-sm font-mono text-sm">API_KEY</code> precisa ser configurada no seu ambiente de hospedagem (por exemplo, Netlify, Vercel, etc.).
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-200">
                Por favor, consulte o arquivo <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded-sm font-mono text-sm">README.md</code> para obter instruções detalhadas sobre como criar uma chave e configurá-la.
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-200">
                Se você acabou de adicionar a chave, pode ser necessário <strong className="font-semibold">reimplantar (re-deploy)</strong> sua aplicação para que a alteração tenha efeito.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyMissingScreen;
