# Assistente Virtual Bíblico - Biblical Chatbot

Este é um chatbot inteligente com a tecnologia Gemini, projetado para fornecer insights, responder perguntas e discutir tópicos relacionados à Bíblia Sagrada.

## Como Usar

Este aplicativo é executado inteiramente no seu navegador. Para funcionar, ele precisa de uma chave de API do Google Gemini, que você pode obter gratuitamente.

1.  **Obtenha uma Chave de API do Gemini:**
    *   Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Clique em **"Create API key"** para gerar uma nova chave.
    *   Copie a chave gerada.

2.  **Inicie o Aplicativo:**
    *   Ao abrir o assistente pela primeira vez, ele solicitará sua chave de API.
    *   Cole a chave que você copiou no campo indicado.
    *   Sua chave é armazenada de forma segura apenas no seu navegador (`localStorage`) e nunca é enviada para nenhum servidor.

Agora você está pronto para usar o assistente!

---

## Como Publicar sua Própria Versão

Você pode hospedar sua própria versão deste assistente gratuitamente em serviços como GitHub Pages ou Netlify.

### Opção 1: Publicar no GitHub Pages (Recomendado e Simples)

1.  **Faça um "Fork" do Repositório:**
    *   Clique no botão "Fork" no canto superior direito desta página para criar uma cópia do projeto na sua conta do GitHub.

2.  **Ative o GitHub Pages:**
    *   No seu repositório "forkado", vá para **Settings** > **Pages**.
    *   Na seção "Build and deployment", em "Source", selecione **"Deploy from a branch"**.
    *   Em "Branch", selecione `main`, mantenha a pasta como `/ (root)` e clique em **Save**.

3.  **Aguarde a Publicação:**
    *   O GitHub levará alguns minutos para publicar seu site. A URL do seu site (algo como `https://SEU-USUARIO.github.io/assistente-biblico/`) aparecerá na mesma página.

4.  **Use o Aplicativo:**
    *   Visite a URL fornecida. O aplicativo solicitará sua chave de API do Gemini na primeira vez que você o usar, conforme descrito na seção "Como Usar".

### Opção 2: Publicar no Netlify

1.  **Siga o Passo 1** da seção do GitHub Pages (faça um "Fork" do repositório).

2.  **Crie uma conta** ou faça login no [Netlify](https://www.netlify.com/).

3.  No seu painel, clique em **"Add new site"** > **"Import an existing project"**.

4.  **Conecte-se ao GitHub** e selecione o repositório do seu chatbot.

5.  **Configurações de implantação**:
    *   **Deixe todos os campos em branco** (`Build command` e `Publish directory`). O Netlify detectará que é um site estático.

6.  Clique em **"Deploy site"**.

7.  **Use o Aplicativo:**
    *   Após a publicação, visite a URL do seu site no Netlify. O aplicativo solicitará sua chave de API do Gemini.

---

## Notas de Desenvolvimento

Este é um aplicativo web estático moderno construído diretamente com React e TypeScript, que roda no navegador sem uma etapa de compilação.

*   **Não é necessário Build:** O projeto usa módulos ES e importa bibliotecas de uma CDN, então você não precisa rodar `npm install` ou `npm run dev`.
*   **Chave de API Gerenciada pelo Usuário:** A aplicação é projetada para que cada usuário forneça sua própria chave de API do Gemini, que é armazenada localmente no navegador.
*   **Teste Local:** Para testar os arquivos localmente, use qualquer servidor web simples. Por exemplo, com Python instalado, navegue até a pasta do projeto no terminal e execute `python -m http.server`. Abra seu navegador em `http://localhost:8000`.
