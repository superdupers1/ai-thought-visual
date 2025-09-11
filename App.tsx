import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AIConcept, HistoryItem } from './types';
import { extractConcept, generateImageFromConcept, reconstructTextFromConcept, transcribeAudio, extractConceptFromImage, compressImage } from './services/geminiService';
import InputPanel from './components/InputPanel';
import ConceptPanel from './components/ConceptPanel';
import VisualizationPanel from './components/VisualizationPanel';
import HistoryPanel from './components/HistoryPanel';
import { GithubIcon } from './components/Icons';

type GeneratedImageState = {
  dataUrl: string;
  originalUrl: string | null;
} | null;

const MAX_HISTORY_ITEMS = 6;
const HISTORY_STORAGE_KEY = 'aiThoughtVisualizerHistory';

function App() {
  const [userInput, setUserInput] = useState<string>('A fleeting memory of a forgotten dream, tasting of salt and summer rain.');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [aiConcept, setAiConcept] = useState<AIConcept | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageState>(null);
  const [reconstructedText, setReconstructedText] = useState<string>('');
  
  const [isLoadingConcept, setIsLoadingConcept] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isLoadingReconstruction, setIsLoadingReconstruction] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const [temperature, setTemperature] = useState<number>(0.7);
  const [imageStyle, setImageStyle] = useState<string>('abstract');

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isProcessing = isLoadingConcept || isLoadingImage || isLoadingReconstruction;
  const isUiLocked = isProcessing || isRecording || isTranscribing;

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }

    // Handle shared link on initial load
    const processHash = async () => {
      if (window.location.hash.startsWith('#concept=')) {
        try {
          const encoded = window.location.hash.substring(9); // remove #concept=
          const decoded = atob(decodeURIComponent(encoded));
          const conceptFromLink: AIConcept = JSON.parse(decoded);
          
          handleReset(); // Clear the board
          setAiConcept(conceptFromLink);
          
          window.history.replaceState(null, '', ' '); // Clear the hash

          setIsLoadingImage(true);
          setIsLoadingReconstruction(true);

          await Promise.all([
            runImageGeneration(conceptFromLink, imageStyle),
            runTextReconstruction(conceptFromLink, temperature)
          ]);
          
        } catch (e) {
          console.error("Failed to process shared link:", e);
          setError("The shared link is invalid or corrupted.");
        }
      }
    };
    processHash();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = (newItem: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prevHistory => {
      const newHistoryItem: HistoryItem = {
        ...newItem,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save history to localStorage", e);
        // This might happen if compression still isn't enough.
        // We could notify the user here if we wanted to be more robust.
      }
      return updatedHistory;
    });
  };

  const runImageGeneration = async (concept: AIConcept, style: string) => {
    try {
      const imageResult = await generateImageFromConcept(concept, style);
      setGeneratedImage(imageResult);
      return imageResult;
    } catch (imgError) {
      console.error("Image generation failed:", imgError);
      setError("Image generation failed. Displaying a placeholder.");
      setGeneratedImage(null);
      return null;
    } finally {
      setIsLoadingImage(false);
    }
  };

  const runTextReconstruction = async (concept: AIConcept, temp: number) => {
    try {
      const text = await reconstructTextFromConcept(concept, temp);
      setReconstructedText(text);
      return text;
    } catch (textError) {
      console.error("Text reconstruction failed:", textError);
      setReconstructedText("Could not reconstruct text from the concept.");
      return "Could not reconstruct text from the concept.";
    } finally {
      setIsLoadingReconstruction(false);
    }
  };


  const handleGenerate = useCallback(async () => {
    if (!userInput.trim() && !uploadedImage) {
      setError("Please enter a phrase or upload an image.");
      return;
    }
    
    setError(null);
    setAiConcept(null);
    setGeneratedImage(null);
    setReconstructedText('');
    setIsLoadingConcept(true);
    setIsLoadingImage(true);
    setIsLoadingReconstruction(true);

    let finalConcept: AIConcept | null = null;
    try {
      finalConcept = uploadedImage 
        ? await extractConceptFromImage(uploadedImage, temperature)
        : await extractConcept(userInput, temperature);
        
      setAiConcept(finalConcept);
      setIsLoadingConcept(false);

      const [imageResult, text] = await Promise.all([
        runImageGeneration(finalConcept, imageStyle),
        runTextReconstruction(finalConcept, temperature)
      ]);
      
      if (!imageResult || !text) {
        throw new Error("Generation failed in one of the steps.");
      }

      // Compress image for history to avoid storage quota errors
      try {
        const compressedImageUrl = await compressImage(imageResult.dataUrl);
        saveToHistory({
          userInput: uploadedImage ? '' : userInput,
          uploadedImageName: uploadedImage?.name || null,
          aiConcept: finalConcept,
          generatedImage: compressedImageUrl,
          reconstructedText: text
        });
      } catch (compressionError) {
        console.error("Could not compress image for history, saving original.", compressionError);
        saveToHistory({
          userInput: uploadedImage ? '' : userInput,
          uploadedImageName: uploadedImage?.name || null,
          aiConcept: finalConcept,
          generatedImage: imageResult.dataUrl,
          reconstructedText: text
        });
      }

    } catch (conceptError) {
      console.error("Concept extraction failed:", conceptError);
      setError("Could not extract a concept. Please try a different input.");
      setIsLoadingConcept(false);
      setIsLoadingImage(false);
      setIsLoadingReconstruction(false);
    }
  }, [userInput, uploadedImage, temperature, imageStyle]);

  const handleRegenerateImage = useCallback(async () => {
    if (!aiConcept) return;

    setError(null);
    setIsLoadingImage(true);
    setGeneratedImage(null);
    await runImageGeneration(aiConcept, imageStyle);

  }, [aiConcept, imageStyle]);
  
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          setIsRecording(false);
          setIsTranscribing(true);
          setError(null);
          setUploadedImage(null);

          streamRef.current?.getTracks().forEach(track => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];

          if (audioBlob.size === 0) {
            setError("Recording was too short or silent. Please try again.");
            setIsTranscribing(false);
            return;
          }

          try {
            const transcribedText = await transcribeAudio(audioBlob);
            setUserInput(transcribedText);
          } catch (transcriptionError) {
            console.error("Audio transcription failed:", transcriptionError);
            setError("Could not transcribe the audio. Please try again.");
          } finally {
            setIsTranscribing(false);
          }
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access was denied. Please enable it in your browser settings.");
      }
    }
  }, [isRecording]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setUserInput(''); // Clear text input when image is selected
      setError(null);
    }
  };
  
  const handleClearImage = () => {
    setUploadedImage(null);
  };

  const handleReset = () => {
    setUserInput('');
    setUploadedImage(null);
    setAiConcept(null);
    setGeneratedImage(null);
    setReconstructedText('');
    setError(null);
  };

  const handleReloadHistory = (item: HistoryItem) => {
    setError(null);
    setUserInput(item.userInput);
    // Note: We can't restore the file object, so we show the name. 
    // The user would need to re-upload if they want to re-generate from the image.
    setUploadedImage(null);
    setAiConcept(item.aiConcept);
    setGeneratedImage({ dataUrl: item.generatedImage, originalUrl: null });
    setReconstructedText(item.reconstructedText);
  };
  
  const handleDeleteHistory = (id: string) => {
    setHistory(prev => {
      const updatedHistory = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to update history in localStorage", e);
      }
      return updatedHistory;
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
        <header className="text-center mb-10 mt-10">
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                AI Thought Visualizer
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mt-10 ">
              From human language, voice, or an image to a structured AI concept, then into a new visual and back to language.
            </p>
        </header>

        <main className="flex-grow">
          <InputPanel 
            userInput={userInput}
            setUserInput={setUserInput}
            onGenerate={handleGenerate}
            onReset={handleReset}
            isProcessing={isUiLocked}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onToggleRecording={handleToggleRecording}
            onImageChange={handleImageChange}
            uploadedImage={uploadedImage}
            onClearImage={handleClearImage}
            temperature={temperature}
            setTemperature={setTemperature}
            imageStyle={imageStyle}
            setImageStyle={setImageStyle}
          />

          {history.length > 0 && (
            <HistoryPanel 
              history={history}
              onReload={handleReloadHistory}
              onDelete={handleDeleteHistory}
            />
          )}

          {error && (
            <div className="my-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ConceptPanel concept={aiConcept} isLoading={isLoadingConcept} />
            <div className="lg:col-span-2">
              <VisualizationPanel 
                imageUrl={generatedImage} 
                reconstructedText={reconstructedText}
                isLoadingImage={isLoadingImage}
                isLoadingText={isLoadingReconstruction}
                onRegenerateImage={handleRegenerateImage}
                isProcessing={isUiLocked}
                hasConcept={!!aiConcept}
                aiConcept={aiConcept}
              />
            </div>
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Google Gemini & Imagen</p>
           <a href="https://github.com/vero-code/ai-thought-visual" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-purple-400 transition-colors mt-2">
            <GithubIcon />
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;