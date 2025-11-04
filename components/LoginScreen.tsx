import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
  onRegister: (username: string, password: string) => Promise<{success: boolean, message: string}>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      const result = await onRegister(username, password);
      if (result.success) {
        setSuccess(result.message);
        setIsRegistering(false); // Switch to login form
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message);
      }
    } else {
      const loggedIn = onLogin(username, password);
      if (!loggedIn) {
        setError('Nome de usuário ou senha inválidos.');
      }
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-slide-in-fade grid md:grid-cols-2 items-center overflow-hidden">
        
        {/* Left Side: Logo and Welcome Message */}
        <div className="p-8 md:p-12 text-center bg-gray-50 dark:bg-gray-800 hidden md:block">
            <div className="text-6xl font-extrabold text-blue-600 dark:text-blue-500 mb-6 tracking-wider">CBR</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Bem-vindo!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Seu guia de estudos bíblicos está pronto para ajudar.
            </p>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12">
            <div className="text-center mb-6 md:hidden">
              <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-500 mb-4 tracking-wider">CBR</div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Assistente Virtual Bíblico
              </h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-1">
              {isRegistering ? 'Criar Conta' : 'Fazer Login'}
            </h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              {isRegistering ? 'Preencha os campos para se cadastrar.' : 'Insira suas credenciais para continuar.'}
            </p>

            {error && <div className="p-3 text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 rounded-md mb-4">{error}</div>}
            {success && <div className="p-3 text-sm text-green-700 dark:text-green-200 bg-green-100 dark:bg-green-900 rounded-md mb-4">{success}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="username" className="sr-only">Nome de usuário</label>
                <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>
            {isRegistering && (
                <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirmar Senha</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar Senha"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                </div>
            )}
            <button
                type="submit"
                disabled={!username.trim() || !password.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                {isRegistering ? 'Cadastrar' : 'Entrar'}
            </button>
            </form>
            <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            {isRegistering ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
            <button onClick={toggleForm} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                {isRegistering ? 'Entrar' : 'Cadastre-se'}
            </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;