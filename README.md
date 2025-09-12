<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Thought Visualizer ✨

Inspired by the [**Google AI Studio Multimodal Challenge**](https://dev.to/vero-code/ai-thought-visualizer-id1), this is an experimental web application that transforms human language, voice, or images into structured AI concepts, then visualizes them with generative art and reconstructs them back into poetic language.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)


## 🧠 How it Works

**1. Start with an Idea (Multimodal Input)** Express your concept in one of three ways: type a phrase, upload an image, or make a voice recording.

**2. AI Analysis & Concept Creation** The Google Gemini AI analyzes your input and deconstructs it into a structured JSON `concept`, extracting key elements, mood, and atmosphere.

```bash
{
  "elements":    ["memory", "dream", "salt", "summer rain"],
  "emotion":     "melancholy",
  "mood":        "ethereal",
  "setting":     null,
  "temperature": "warm",
  "time_of_day": null
}
```

**3. Dual Creation: Image & Text** Based on this JSON concept, two creative processes unfold:

-   **Visualization:** Google Imagen generates a unique visual artwork in your chosen artistic style.
    
-   **Reconstruction:** Gemini writes a new, poetic phrase based solely on the data within the concept.
    

**4. Creative Control & History**

-   **Fine-Tune the Output:** Adjust the "creativity" (temperature) and select from various artistic styles to influence the outcome.
    
-   **Access Your History:** Your last 6 creations are automatically saved to the browser's local storage for easy access, downloading, or sharing.


## 💻 Tech Stack

#### AI & Cloud Platform

-   **Development Environment:** Google AI Studio
    
-   **AI Models:** Google Gemini 2.5 Flash & Imagen APIs
    
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

## 🎥 Demo Video
▶️ [Watch on YouTube](https://youtu.be/VN_FYk3L-QI)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.