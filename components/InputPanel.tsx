
import React, { useRef } from 'react';
import { MicrophoneIcon, StopIcon, UploadIcon, XCircleIcon } from './Icons';
import { Spinner } from './Spinner';

const IMAGE_STYLES = ["abstract", "cosmic", "watercolor", "neon", "minimal", "surreal", "impressionistic", "sci-fi"];

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  isProcessing: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedImage: File | null;
  onClearImage: () => void;
  temperature: number;
  setTemperature: (value: number) => void;
  imageStyle: string;
  setImageStyle: (value: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  userInput, 
  setUserInput, 
  onGenerate, 
  onReset, 
  isProcessing, 
  isRecording, 
  isTranscribing, 
  onToggleRecording,
  onImageChange,
  uploadedImage,
  onClearImage,
  temperature,
  setTemperature,
  imageStyle,
  setImageStyle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
    <label htmlFor="userInput" className="block text-lg font-semibold text-gray-300 mb-2">
        {isRecording ? (
            <span className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Recording...
            </span>
          ) : (
            "1. Start with a phrase, your voice, or an image"
          )}
      </label>
      
      {uploadedImage ? (
        <div className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md flex items-center justify-between">
          <span className="text-gray-400 truncate pr-2">
            Image selected: <span className="font-medium text-gray-200">{uploadedImage.name}</span>
          </span>
          <button onClick={onClearImage} disabled={isProcessing} className="flex-shrink-0 text-gray-500 hover:text-white transition-colors" aria-label="Clear image">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., 'A whisper of winter on a forgotten photograph...'"
          className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow resize-none"
          disabled={isProcessing || isRecording}
        />
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="creativity" className="block text-sm font-medium text-gray-400">Creativity: <span className="font-semibold text-gray-200">{temperature.toFixed(1)}</span></label>
          <input
            id="creativity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            disabled={isProcessing}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-400">Style</label>
          <select
            id="style"
            value={imageStyle}
            onChange={(e) => setImageStyle(e.target.value)}
            disabled={isProcessing}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow disabled:opacity-50"
          >
            {IMAGE_STYLES.map(style => (
              <option key={style} value={style} className="capitalize">{style.charAt(0).toUpperCase() + style.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <button
          onClick={onGenerate}
          disabled={isProcessing || (!userInput.trim() && !uploadedImage)}
          className="w-full sm:w-auto flex-grow justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing && !isRecording && !isTranscribing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Visualizing...
            </>
          ) : (
            'Visualize Thought'
          )}
        </button>

        <div className="flex-grow sm:flex-grow-0 flex gap-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={isProcessing}
            />
            <button
                onClick={handleUploadClick}
                disabled={isProcessing}
                aria-label="Upload an image"
                className="h-12 w-12 flex-shrink-0 inline-flex items-center justify-center p-3 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <UploadIcon className="h-5 w-5" />
            </button>
            <button
                onClick={onToggleRecording}
                disabled={isProcessing && !isRecording}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                className={`h-12 w-12 flex-shrink-0 inline-flex items-center justify-center p-3 border text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 focus:ring-red-500'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-gray-500'
              }`}
            >
              {isTranscribing ? <Spinner /> : isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
            </button>
            <button
                onClick={onReset}
                disabled={isProcessing}
                className="h-12 px-6 flex-shrink-0 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
                Clear
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
