# Assistente Virtual Bíblico - Biblical Chatbot

This is an intelligent chatbot powered by Gemini, designed to provide insights, answer questions, and discuss topics related to the Holy Bible.

## Deploying to Netlify (Free Tier)

This project is configured to be deployed as a static website on Netlify. The free tier is generous and perfect for this type of application. Follow these steps to deploy your version.

---

### Step 1: Push Your Code to a Git Provider

1.  Ensure your code is pushed to a repository on GitHub, GitLab, or Bitbucket.
2.  Make sure your main branch is up-to-date.

---

### Step 2: Deploy on Netlify

1.  **Sign up or Log in** to your [Netlify](https://www.netlify.com/) account.
2.  From your dashboard, click **"Add new site"** and then select **"Import an existing project"**.
3.  **Connect to your Git provider** (e.g., GitHub) and authorize Netlify.
4.  **Select the repository** for this project.
5.  **Configure deployment settings**:
    *   **Branch to deploy**: `main` (or your primary branch).
    *   **Build command**: Leave this field **empty**. This project runs without a build step.
    *   **Publish directory**: Leave this field **empty** or set it to `/` (root).
6.  Click **"Deploy site"**. Netlify will start deploying your application.

---

### Step 3: Set Environment Variables

Your Gemini API Key needs to be provided to the application as an environment variable.

1.  In your new site's dashboard on Netlify, go to **Site configuration** > **Build & deploy** > **Environment**.
2.  Under **Environment variables**, click **"Edit variables"**.
3.  Add a new variable:
    *   **Key**: `API_KEY`
    *   **Value**: Paste your actual Gemini API Key here.
4.  Click **Save**.
5.  To apply the new environment variable, you need to trigger a new deploy. Go to the **Deploys** tab for your site and in the "Production deploys" section, open the "Trigger deploy" dropdown and select **"Deploy site"**.

After a few minutes, your site will be live with the API key configured. You can find your site's URL on the Netlify dashboard.

---

## Development Notes

This is a modern, static web application built directly with React and TypeScript that runs in the browser without a build step.

*   **No Build Required:** The project uses ES modules and imports libraries from a CDN, so you do not need to run `npm install` or `npm run dev`.
*   **API Key:** The application is designed to get the Gemini API key from an environment variable (`process.env.API_KEY`) that is securely provided by the hosting environment (like Netlify). You do not need to create a `.env` file or manage the key in the code.
*   **Local Testing:** To test the files locally, you can use any simple web server. For example, if you have Python installed, navigate to your project folder in the terminal and run `python -m http.server`. Then, open your browser to `http://localhost:8000`. Note that API calls may not work locally without a method to provide the API key.