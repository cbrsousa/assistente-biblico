-- Esquema Inicial para Assistente Bíblico CBR

-- Tabela de Perfis de Usuário
-- Armazena configurações e preferências individuais
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  whatsapp TEXT,
  gemini_api_key TEXT,
  theme TEXT DEFAULT 'system',
  font_size TEXT DEFAULT 'text-base',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar coluna whatsapp se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='whatsapp') THEN
    ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT;
  END IF;
END $$;

-- Tabela de Histórico de Mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Favoritos (Versículos e Insights salvos)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Segurança de Nível de Linha (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para Perfis
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas para Mensagens
CREATE POLICY "Usuários podem ver seu próprio histórico de mensagens" 
ON public.messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias mensagens" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seu próprio histórico" 
ON public.messages FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para Favoritos
CREATE POLICY "Usuários podem ver seus próprios favoritos" 
ON public.bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios favoritos" 
ON public.bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios favoritos" 
ON public.bookmarks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios favoritos" 
ON public.bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Gatilho para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, whatsapp)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'whatsapp')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    whatsapp = EXCLUDED.whatsapp;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Fallback para garantir que o usuário seja criado mesmo se houver erro no perfil
  -- Isso evita o erro "Database error saving new user" que bloqueia o cadastro
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover gatilho antigo se existir e criar o novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Comentários de ajuda
COMMENT ON TABLE public.profiles IS 'Configurações de usuário, incluindo chaves de API e temas.';
COMMENT ON TABLE public.messages IS 'Histórico completo de chats sincronizado por conta.';
COMMENT ON TABLE public.bookmarks IS 'Versículos e insights bíblicos favoritados pelo usuário.';
