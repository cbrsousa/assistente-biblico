# Assistente Virtual Bíblico - Biblical Chatbot

This is an intelligent chatbot powered by Gemini, designed to provide insights, answer questions, and discuss topics related to the Holy Bible.

## Deploying to GitHub Pages

This project is configured to be deployed as a static website on GitHub Pages. Follow these steps carefully to deploy your version.

---

### Step 1: Push Your Code to GitHub

1.  Ensure your code is pushed to your GitHub repository (e.g., `cbr-ia/assistente-biblico`).
2.  Make sure your main branch is named `main`.

---

### Step 2: Create a `.nojekyll` File

GitHub Pages uses a static site generator called Jekyll by default. To prevent it from interfering with your app, you should disable it.

1.  In the root directory of your project, create a new, empty file named `.nojekyll`.
    ```bash
    touch .nojekyll
    ```
2.  Commit and push this new file to your repository.
    ```bash
    git add .nojekyll
    git commit -m "Add .nojekyll file to disable Jekyll"
    git push
    ```

---

### Step 3: Configure GitHub Pages

1.  In your repository on GitHub, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under "Build and deployment", for the **Source**, select **Deploy from a branch**.
4.  Under **Branch**, select `main` and the folder `/ (root)`.
5.  Click **Save**.

After a few minutes, your site will be live. The URL will be displayed on the GitHub Pages settings page and should look like this: `https://cbr-ia.github.io/assistente-biblico/`

---

### Important Note on File Structure & Cleanup

This project places static assets like `logo.svg`, `manifest.json`, and `service-worker.js` in the root directory.

**ACTION REQUIRED:** If you have an old `public` folder from previous versions, please **delete it**. It is no longer used and can cause issues.

The file structure should be clean, with these main assets at the top level alongside `index.html`.

---

## Development Notes

This is a modern, static web application built directly with React and TypeScript that runs in the browser without a build step.

*   **No Build Required:** The project uses ES modules and imports libraries from a CDN, so you do not need to run `npm install` or `npm run dev`.
*   **API Key:** The application is designed to get the Gemini API key from an environment variable (`process.env.API_KEY`) that is securely provided by the hosting environment (like Google AI Studio). You do not need to create a `.env` file or manage the key in the code.
*   **Local Testing:** To test the files locally, you can use any simple web server. For example, if you have Python installed, navigate to your project folder in the terminal and run `python -m http.server`. Then, open your browser to `http://localhost:8000`. Note that API calls may not work locally without a method to provide the API key.