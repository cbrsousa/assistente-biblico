# Assistente Virtual Bíblico - Biblical Chatbot

Este é um chatbot inteligente com a tecnologia Gemini, projetado para fornecer insights, responder perguntas e discutir tópicos relacionados à Bíblia Sagrada.

## Como Usar

O assistente está pronto para ser usado assim que for publicado. Basta abrir o link no seu navegador e começar a interagir. Você pode:

*   Fazer perguntas sobre a Bíblia.
*   Pedir resumos de livros ou explicações de passagens.
*   Explorar os livros e capítulos da Bíblia usando o painel de navegação.
*   Salvar respostas importantes como favoritos.

## Como Publicar (Guia Simplificado para Vercel)

Hospedar sua própria versão deste assistente é **gratuito** e leva apenas alguns minutos. Siga estes 3 passos simples.

### Pré-requisito: Obter a Chave de API do Google

Antes de tudo, você precisa da "chave" que permite que seu site converse com a inteligência artificial do Google.

1.  Acesse o **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Clique em **"Create API key"** para gerar uma nova chave.
3.  **Copie a chave gerada.** É uma sequência longa de letras e números. Guarde-a em um local seguro, pois você a usará no Passo 3.

---

### Passo 1: Copiar o Projeto para sua Conta do GitHub

Para publicar o site, você precisa ter sua própria cópia do código.

1.  **Faça um "Fork" do Repositório:**
    *   Clique no botão **"Fork"** no canto superior direito desta página. Isso criará uma cópia exata do projeto na sua conta do GitHub.

---

### Passo 2: Publicar o Site com a Vercel

Agora, vamos usar a Vercel para colocar seu site no ar e configurar sua chave secreta.

1.  **Crie uma Conta na Vercel:**
    *   Acesse **[vercel.com](https://vercel.com/)** e clique em "Sign Up". A maneira mais fácil é se inscrever usando sua conta do **GitHub**.

2.  **Importe seu Projeto:**
    *   No painel da Vercel, clique em **"Add New..."** e selecione **"Project"**.
    *   Selecione o repositório `assistente-biblico` que você acabou de copiar ("forkar") para o seu GitHub e clique em **"Import"**.

3.  **Configure a Chave Secreta (A Parte Mais Importante):**
    *   A Vercel vai te mostrar as configurações do projeto. Você não precisa mudar nada, ela já entende tudo sozinha.
    *   Apenas abra a seção **"Environment Variables"** (Variáveis de Ambiente).
    *   Adicione uma nova variável com os seguintes dados:
        *   **Name:** `API_KEY`
        *   **Value:** Cole aqui a **chave de API do Google Gemini** que você copiou no pré-requisito.
    *   Clique no botão **"Add"** para salvar a variável.

    

4.  **Publique o Site:**
    *   Clique no botão **"Deploy"**.

Aguarde um ou dois minutos e pronto! A Vercel te dará um link público e seu Assistente Bíblico estará online e funcionando para qualquer pessoa que você compartilhar.

---

## Notas de Desenvolvimento

Este é um aplicativo web estático moderno construído diretamente com React e TypeScript, que roda no navegador sem uma etapa de compilação.

*   **Não é necessário Build:** O projeto usa módulos ES e importa bibliotecas de uma CDN.
*   **Chave de API:** A chave de API do Gemini é fornecida através de uma variável de ambiente (`API_KEY`) no serviço de hospedagem, garantindo que ela permaneça segura e não seja exposta no código do navegador.
