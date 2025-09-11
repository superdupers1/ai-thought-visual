<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Thought Visualizer ✨

Inspired by the [**Google AI Studio Multimodal Challenge**](https://dev.to/challenges/google-ai-studio-2025-09-03), this is an experimental web application that transforms human language, voice, or images into structured AI concepts, then visualizes them with generative art and reconstructs them back into poetic language.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)


## 🌟 Key Features

* **Multimodal Input:** Start with a typed phrase, an uploaded image, or a voice recording.
* **AI Concept Extraction:** Uses Google Gemini to deconstruct the input into a structured JSON "concept" containing elements, mood, setting, etc.
* **Generative Visualization:** Uses Google Imagen to generate a unique visual representation of the AI concept in various artistic styles.
* **Textual Reconstruction:** Employs Gemini again to write a new, poetic phrase based only on the structured AI concept.
* **Creative Controls:** Adjust the "creativity" (temperature) and artistic style to influence the generated output.
* **History Panel:** Your last 6 creations are automatically saved to your browser's local storage for easy access.

## 🧠 How it works

1.  **Input**: type a phrase, upload an image, or record audio.
    
2. **Concept Extraction** → compact JSON:
    
   ```bash
   {
      "elements":  ["memory","dream","salt","summer rain"],
      "emotion":  "melancholy",
      "mood":  "ethereal",
      "setting":  null,
      "temperature":  "warm"
      "time_of_day":  null,
   }
3. **Imagen Prompting**: JSON → dynamic prompt (+ chosen Style).
    
4. **Generative Visualization (Imagen)**: renders the artwork.
    
5. **Reconstruction (Gemini)**: new, poetic text based only on the JSON.
    
6. **Controls**: Creativity (temperature), Style presets, Regenerate (image-only or full).
    
7. **History**: last 6 creations in localStorage; quick restore/share/download.



## 💻 Tech Stack

#### AI & Cloud Platform

-   **Development Environment:** Google AI Studio
    
-   **AI Models:** Google Gemini 2.5 Pro & Imagen APIs
    
-   **Deployment:** Google Cloud Run
 
#### Frontend

-   **Framework:** React
    
-   **Language:** TypeScript
    
-   **Build Tool:** Vite
    
-   **Styling:** Tailwind CSS


## 🛠️ Getting Started & Running Locally

Follow these steps to run the project on your local machine.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vero-code/ai-thought-visual.git
    cd ai-thought-visual
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    * Create a new file named `.env` in the root of the project.
    * Open the file and add your Google Gemini API key:
        ```
        VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```
    * You can get your API key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the development server:**
    `npm run dev`

The application should now be running on `http://localhost:5173` (or another port if 5173 is busy).


## 🚀 Deploy to Cloud Run

```bash
 # Build
 container gcloud builds submit --tag gcr.io/PROJECT_ID/ai-thought-visual

 # Deploy gcloud run deploy ai-thought-visual \
  --image gcr.io/PROJECT_ID/ai-thought-visual \
  --platform managed --region REGION --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,ENABLE_AUDIO=true,ENABLE_IMAGE_UPLOAD=true
```

> **Security note:** keep API keys on the server side (Cloud Run env or Secret Manager).  
> Dev-only `VITE_GEMINI_API_KEY` is fine locally, but do not expose keys in client bundles in production.

## ⚠️ Known issues

-   **Share**: on localhost it may copy a `data:` URL (cropped canvas). On Cloud Run it copies the full **http(s)** `originalImageUrl` from Imagen.
    
-   **Rate limits**: handle 429/5xx with a retry.


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.