# Assistente Virtual Bíblico - Biblical Chatbot

Este é um chatbot inteligente com a tecnologia Gemini, projetado para fornecer insights, responder perguntas e discutir tópicos relacionados à Bíblia Sagrada.

## Como Publicar sua Própria Versão (Gratuitamente no Netlify)

Siga estes passos para publicar e configurar sua própria versão do assistente.

---

### Passo 1: Obtenha o Código

- **Se você está vendo este projeto no AI Studio:** Clique em "Copiar para o seu espaço de trabalho" para criar sua própria cópia do projeto.
- **Se você está no GitHub:** Faça um "Fork" deste repositório para a sua conta do GitHub.

---

### Passo 2: Publique no Netlify

1.  **Crie uma conta** ou faça login no [Netlify](https://www.netlify.com/) (o plano gratuito é suficiente).
2.  No seu painel, clique em **"Add new site"** e escolha **"Import an existing project"**.
3.  **Conecte-se ao seu provedor Git** (por exemplo, GitHub) e autorize o Netlify.
4.  **Selecione o repositório** do seu projeto de chatbot.
5.  **Configurações de implantação**:
    *   **Branch to deploy**: `main` (ou sua branch principal).
    *   **Build command**: Deixe este campo **vazio**.
    *   **Publish directory**: Deixe este campo **vazio**.
6.  Clique em **"Deploy site"**. O Netlify começará a publicar sua aplicação.

---

### Passo 3: Adicione sua Chave de API do Gemini (O Passo Mais Importante!)

Para que o chatbot funcione, ele precisa da sua chave de API do Google Gemini. Siga este guia detalhado.

**Parte A: Criar sua Chave de API**

1.  Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Clique no botão **"Create API key"**.
3.  Uma nova chave será gerada. **Copie esta chave** clicando no ícone ao lado dela. Guarde-a em um local seguro temporariamente, pois você precisará dela no próximo passo.

**Parte B: Adicionar a Chave no Netlify (Passo a Passo Detalhado)**

Aqui está um guia passo a passo, o mais claro possível, para adicionar sua chave no Netlify.

1.  **Abra o seu site no Netlify:**
    *   Faça login na sua conta Netlify.
    *   Na lista de sites ("Sites"), clique no nome do seu projeto de chatbot (por exemplo, `meu-chatbot-biblico.netlify.app`).

2.  **Acesse as Configurações do Site:**
    *   Você verá a página de visão geral do seu site ("Site overview"). No menu de navegação do site (geralmente no topo), clique em **"Site configuration"**.

3.  **Encontre as Variáveis de Ambiente:**
    *   Após clicar em "Site configuration", um menu aparecerá na lateral esquerda.
    *   Nesse menu, procure e clique na opção **"Build & deploy"**.
    *   Um submenu se abrirá. Dentro dele, clique em **"Environment"**.
    *   O caminho completo que você deve seguir é: **Site configuration -> Build & deploy -> Environment**.

4.  **Adicione a Nova Variável:**
    *   Na página "Environment", procure a seção chamada **"Environment variables"** (Variáveis de Ambiente).
    *   Clique no botão **"Edit variables"** (Editar variáveis).
    *   Você verá campos para adicionar uma nova variável.
    *   No primeiro campo, chamado **"Key"** (Chave), digite **exatamente** `API_KEY`. (É muito importante que seja tudo em maiúsculas).
    *   No segundo campo, chamado **"Value"** (Valor), **cole a chave de API** que você copiou do Google AI Studio na Parte A.
    *   Clique no botão **"Save"** (Salvar) para confirmar.

5.  **Reimplante o Site para Ativar a Chave (Passo Final e Obrigatório):**
    *   A variável de ambiente só funcionará após uma nova implantação (deploy).
    *   No menu superior do seu site no Netlify, clique na aba **"Deploys"**.
    *   No canto superior direito da página de deploys, você verá um botão chamado **"Trigger deploy"**. Clique nele.
    *   No menu que aparecer, clique em **"Deploy site"**.

Pronto! O Netlify irá reconstruir seu site em um ou dois minutos. Quando o status do novo deploy for "Published" (Publicado), sua chave de API estará funcionando e o chatbot estará pronto para ser usado.

---

## Notas de Desenvolvimento

Este é um aplicativo web estático moderno construído diretamente com React e TypeScript, que roda no navegador sem uma etapa de compilação.

*   **Não é necessário Build:** O projeto usa módulos ES e importa bibliotecas de uma CDN, então você não precisa rodar `npm install` ou `npm run dev`.
*   **Chave de API:** A aplicação é projetada para obter a chave de API do Gemini de uma variável de ambiente (`process.env.API_KEY`) que é fornecida de forma segura pelo ambiente de hospedagem (como o Netlify). Você não precisa criar um arquivo `.env` ou gerenciar a chave no código.
*   **Teste Local:** Para testar os arquivos localmente, você pode usar qualquer servidor web simples. Por exemplo, se você tem Python instalado, navegue até a pasta do seu projeto no terminal e execute `python -m http.server`. Em seguida, abra seu navegador em `http://localhost:8000`. Note que as chamadas de API podem não funcionar localmente sem um método para fornecer a chave de API.