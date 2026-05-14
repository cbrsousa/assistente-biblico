
import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || (isRegistering && (!name || !whatsapp))) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      console.log('Iniciando autenticação...');
      if (!supabase.auth || typeof supabase.auth.signUp !== 'function') {
        console.error('Supabase Auth ou signUp não encontrado!', supabase);
        throw new Error('O serviço de autenticação não está disponível no momento. Verifique as configurações do Supabase.');
      }

      if (isRegistering) {
        // Create new account with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              whatsapp: whatsapp,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          onLogin({ 
            id: data.user.id,
            name: data.user.user_metadata.full_name || name || 'Usuário', 
            email: data.user.email || email,
            whatsapp: data.user.user_metadata.whatsapp || whatsapp
          });
        }
      } else {
        // Sign in with Supabase
        if (typeof supabase.auth.signInWithPassword !== 'function') {
          throw new Error('O serviço de login não está disponível no momento.');
        }
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLogin({ 
            id: data.user.id,
            name: data.user.user_metadata.full_name || 'Usuário', 
            email: data.user.email || '',
            whatsapp: data.user.user_metadata.whatsapp
          });
        }
      }
    } catch (err: any) {
      console.error('Supabase auth error:', err);
      let errorMessage = err.message || 'Ocorreu um erro na autenticação.';
      
      if (errorMessage.includes('Configuração do Supabase ausente')) {
        errorMessage = 'A configuração do Supabase está ausente. Por favor, adicione as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no menu Configurações do AI Studio (ícone de engrenagem) para habilitar o sistema de login.';
      } else if (errorMessage.includes('Email rate limit exceeded')) {
        errorMessage = 'Limite de e-mails do servidor excedido. Isso acontece porque o sistema gratuito do Supabase tem limites estritos. Por favor: 1) Verifique sua caixa de entrada e SPAM se já tentou se cadastrar; 2) Se você já criou a conta, tente apenas fazer LOGIN; 3) Aguarde de 15 a 30 minutos para tentar novamente.';
      } else if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos. Verifique se digitou corretamente ou se já confirmou seu cadastro por e-mail.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Este e-mail já está cadastrado. Tente entrar em vez de criar uma conta.';
      } else if (errorMessage.includes('Database error saving new user')) {
        errorMessage = 'Erro no banco de dados ao criar seu perfil. Isso geralmente ocorre se o WhatsApp foi adicionado mas a tabela do Supabase ainda não foi atualizada. Por favor, execute o script SQL de migração no seu painel do Supabase.';
      }
      
      setError(errorMessage);
      if (errorMessage.includes('Email rate limit exceeded') && isRegistering) {
        // Sugere ir para o login se falhou o registro por excesso de e-mail
        // (pode ser que a conta ja tenha sido criada mas o email falhou)
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in-up border border-gray-200 dark:border-gray-700">
        <div className="px-8 py-6 bg-blue-600 dark:bg-blue-800 text-white text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Assistente Bíblico CBR</h2>
            <p className="text-blue-100 mt-1">
                {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </p>
        </div>

        <div className="p-8">
            {!isSupabaseConfigured && (
                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Supabase não configurado</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Este aplicativo requer o Supabase. Vá em <strong>Configurações</strong> e adicione as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
                        </p>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                {isRegistering && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Seu nome"
                        />
                    </div>
                )}

                {isRegistering && (
                    <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                        <input
                            id="whatsapp"
                            type="tel"
                            required
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        required
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
                        required
                        minLength={6}
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
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
                </button>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
             <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Sua conta será sincronizada com o banco de dados online.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
