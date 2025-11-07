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

Para que o chatbot funcione, ele precisa da sua chave de API do Google Gemini.

1.  **Crie sua Chave de API:**
    *   Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Clique em **"Create API key"** para gerar uma nova chave.
    *   **Copie a chave** que foi gerada. Guarde-a em segurança.

2.  **Adicione a Chave no Netlify:**
    *   No painel do seu site recém-criado no Netlify, vá para **Site configuration** > **Build & deploy** > **Environment**.
    *   Em **Environment variables**, clique em **"Edit variables"**.
    *   Adicione uma nova variável:
        *   **Key**: `API_KEY`
        *   **Value**: Cole a sua chave de API que você copiou do Google AI Studio.
    *   Clique em **Save**.

3.  **Ative a Chave:**
    *   Para que a nova chave seja usada, você precisa reimplantar o site.
    *   Vá para a aba **Deploys** do seu site.
    *   No topo, clique no botão **"Trigger deploy"** e selecione **"Deploy site"**.

Após alguns minutos, seu site estará no ar e funcionando com a sua chave de API configurada. Você pode encontrar o URL do seu site no painel do Netlify.

---

## Notas de Desenvolvimento

Este é um aplicativo web estático moderno construído diretamente com React e TypeScript, que roda no navegador sem uma etapa de compilação.

*   **Não é necessário Build:** O projeto usa módulos ES e importa bibliotecas de uma CDN, então você não precisa rodar `npm install` ou `npm run dev`.
*   **Chave de API:** A aplicação é projetada para obter a chave de API do Gemini de uma variável de ambiente (`process.env.API_KEY`) que é fornecida de forma segura pelo ambiente de hospedagem (como o Netlify). Você não precisa criar um arquivo `.env` ou gerenciar a chave no código.
*   **Teste Local:** Para testar os arquivos localmente, você pode usar qualquer servidor web simples. Por exemplo, se você tem Python instalado, navegue até a pasta do seu projeto no terminal e execute `python -m http.server`. Em seguida, abra seu navegador em `http://localhost:8000`. Note que as chamadas de API podem não funcionar localmente sem um método para fornecer a chave de API.