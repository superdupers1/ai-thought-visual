import { GoogleGenAI, Type } from "@google/genai";
import type { AIConcept } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const conceptSchema = {
  type: Type.OBJECT,
  properties: {
    emotion: { type: Type.STRING, description: "The primary emotion conveyed.", nullable: true },
    elements: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Key objects, entities, or concrete nouns in the phrase."
    },
    setting: { type: Type.STRING, description: "The physical or abstract location.", nullable: true },
    time_of_day: { type: Type.STRING, description: "e.g., dawn, noon, twilight, midnight.", nullable: true },
    mood: { type: Type.STRING, description: "The overall atmosphere or feeling.", nullable: true },
    temperature: { type: Type.STRING, description: "e.g., warm, cool, freezing.", nullable: true },
  },
  required: ["elements"]
};

// Helper to convert Blob/File to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // remove the prefix e.g. "data:image/png;base64,"
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses a base64 image string by converting it to JPEG and resizing if needed.
 * This is crucial for storing images in localStorage without exceeding the quota.
 * @param base64Str The base64 string of the image (e.g., from a canvas or file read).
 * @param quality The quality of the output JPEG (0.0 to 1.0).
 * @param maxWidth The maximum width of the output image.
 * @param maxHeight The maximum height of the output image.
 * @returns A promise that resolves with the compressed base64 JPEG string.
 */
export function compressImage(base64Str: string, quality = 0.85, maxWidth = 1024, maxHeight = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let { width, height } = img;

      // Calculate the new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (err) => {
      console.error("Image compression failed:", err);
      reject(new Error("Failed to load image for compression."));
    };
  });
}


export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const audioData = await blobToBase64(audioBlob);
  
  const audioPart = {
      inlineData: {
          mimeType: audioBlob.type,
          data: audioData,
      },
  };

  const textPart = {
      text: "Transcribe this audio recording accurately. The output should be only the transcribed text, with no additional commentary.",
  };

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, audioPart] },
  });

  return response.text.trim();
}

async function parseConceptResponse(responseText: string): Promise<AIConcept> {
  try {
    const jsonText = responseText.trim();
    // Gemini with JSON schema might still wrap output in markdown
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(cleanedJsonText);
    return parsed as AIConcept;
  } catch (e) {
    console.error("Failed to parse JSON from concept extraction:", responseText);
    throw new Error("The AI returned an invalid data structure for the concept.");
  }
}

export async function extractConceptFromImage(imageFile: File, temperature: number): Promise<AIConcept> {
  const imageData = await blobToBase64(imageFile);
  
  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: imageData,
    },
  };

  const textPart = {
    text: "Extract key concepts from this image: describe objects, mood, setting, time of day, and overall atmosphere. Return strict JSON with fields {emotion, elements[], setting, time_of_day, mood, temperature}."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: conceptSchema,
      temperature,
    }
  });

  return parseConceptResponse(response.text);
}


export async function extractConcept(userInput: string, temperature: number): Promise<AIConcept> {
  const prompt = `Analyze the following phrase and extract its core concepts into a strict JSON object that adheres to the provided schema. The phrase is: "${userInput}". Only return the JSON object, with no additional text, explanation, or markdown formatting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: conceptSchema,
      temperature,
    }
  });
  
  return parseConceptResponse(response.text);
}

export async function generateImageFromConcept(concept: AIConcept, style: string): Promise<{ dataUrl: string, originalUrl: string | null }> {
  const elementsString = concept.elements.join(', ');
  const prompt = `Create a visually striking digital art piece in a ${style} style. It should be an ethereal and metaphorical representation of the following concepts, not a literal depiction. Embody a mood of "${concept.mood || 'neutral'}" with an emotion of "${concept.emotion || 'ambiguous'}". The scene involves: ${elementsString}. The setting is ${concept.setting || 'abstract'}, during the ${concept.time_of_day || 'undefined time'}. The feeling of temperature is ${concept.temperature || 'neutral'}. Focus on dynamic colors, light, and texture.`;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const generatedImage = response.generatedImages[0];
    const base64ImageBytes = generatedImage.image.imageBytes;
    const dataUrl = `data:image/png;base64,${base64ImageBytes}`;
    // FIX: Property 'url' does not exist on type 'GeneratedImage'. The property has been removed from the SDK.
    const originalUrl = null;
    return { dataUrl, originalUrl };
  } else {
    throw new Error("No image was generated by the API.");
  }
}

export async function reconstructTextFromConcept(concept: AIConcept, temperature: number): Promise<string> {
  const prompt = `Based *only* on the following JSON object representing a concept, write a short, evocative, and poetic description in one or two sentences. Do not mention that it's based on JSON. The description should be imaginative and flow naturally. JSON: ${JSON.stringify(concept)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature,
    }
  });

  return response.text.trim();
}