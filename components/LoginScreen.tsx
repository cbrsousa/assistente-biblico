
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const ACCOUNT_KEY = 'virtual-assistant-account';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if an account already exists on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem(ACCOUNT_KEY);
    if (savedAccount) {
      setIsRegistering(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (isRegistering && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (isRegistering) {
      // Create new account
      const newAccount = {
        name,
        email,
        password // Note: In a real app, never store passwords in plain text!
      };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(newAccount));
      onLogin({ name, email });
    } else {
      // Verify credentials
      try {
        const savedAccountString = localStorage.getItem(ACCOUNT_KEY);
        if (!savedAccountString) {
            setError('Nenhuma conta encontrada. Por favor, reinicie a aplicação.');
            return;
        }

        const savedAccount = JSON.parse(savedAccountString);

        if (email.toLowerCase() === savedAccount.email.toLowerCase() && password === savedAccount.password) {
          onLogin({ name: savedAccount.name, email: savedAccount.email });
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } catch (err) {
        setError('Erro ao processar dados da conta.');
      }
    }
  };

  const handleResetAccount = () => {
    if (window.confirm('Tem certeza? Isso apagará sua conta local e você precisará criar uma nova. Seu histórico de chat não será apagado.')) {
        localStorage.removeItem(ACCOUNT_KEY);
        setIsRegistering(true);
        setName('');
        setEmail('');
        setPassword('');
        setError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in-up border border-gray-200 dark:border-gray-700">
        <div className="px-8 py-6 bg-blue-600 dark:bg-blue-800 text-white text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A9.707 9.707 0 0 0 6 18a9.735 9.735 0 0 0 3.25.555.75.75 0 0 0 .5-.707V5.24a.75.75 0 0 0-1-.707Z" />
                <path d="M12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-1 .707A9.707 9.707 0 0 1 18 18a9.735 9.735 0 0 1-3.25.555.75.75 0 0 1-.5-.707V5.24a.75.75 0 0 1 1-.707Z" />
            </svg>
            <h2 className="text-2xl font-bold">Assistente Bíblico CBR</h2>
            <p className="text-blue-100 mt-1">
                {isRegistering ? 'Crie sua conta local' : 'Bem-vindo de volta'}
            </p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {isRegistering && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Seu nome"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    {isRegistering ? 'Criar Conta' : 'Entrar'}
                </button>
            </form>

            {!isRegistering && (
                 <div className="mt-6 text-center">
                    <button 
                        onClick={handleResetAccount}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline"
                    >
                        Esqueci minha senha / Resetar conta
                    </button>
                </div>
            )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
             <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Esta conta é armazenada localmente no seu dispositivo.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
