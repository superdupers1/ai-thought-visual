import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from './Spinner';
import { ImageIcon, TextIcon, RefreshIcon, DownloadIcon, ShareIcon, CodeBracketIcon } from './Icons';
import type { AIConcept } from '../types';

interface VisualizationPanelProps {
  imageUrl: { dataUrl: string; originalUrl: string | null } | null;
  reconstructedText: string;
  isLoadingImage: boolean;
  isLoadingText: boolean;
  onRegenerateImage: () => void;
  isProcessing: boolean;
  hasConcept: boolean;
  aiConcept: AIConcept | null;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  imageUrl, 
  reconstructedText, 
  isLoadingImage, 
  isLoadingText,
  onRegenerateImage,
  isProcessing,
  hasConcept,
  aiConcept
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'copied_local'>('idle');
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Copies the best available image URL to the clipboard.
   * It prioritizes the original public URL from the Imagen service.
   * If not available (e.g., for reloaded history items), it falls back to the local data URL.
   */
  const shareImage = () => {
    if (!imageUrl) return;

    let linkToCopy: string;
    let newStatus: 'copied' | 'copied_local';

    // Prefer the original, public URL if it exists and is a valid http/https URL
    if (imageUrl.originalUrl && imageUrl.originalUrl.startsWith('http')) {
        linkToCopy = imageUrl.originalUrl;
        newStatus = 'copied';
    } else {
        // Fallback to the local data URL for offline access or history items
        linkToCopy = imageUrl.dataUrl;
        newStatus = 'copied_local';
    }
    
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setShareStatus(newStatus);
      setTimeout(() => setShareStatus('idle'), 2500);
    }, (err) => {
      console.error('Failed to copy link: ', err);
    });
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = 'ai-thought-visualization.png';
    link.href = imageUrl.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    if (!aiConcept) return;

    const dataToDownload = {
      aiConcept,
      reconstructedText,
    };
    
    const jsonString = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'ai-concept-and-text.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const ImagePlaceholder = () => (
    <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600">
      <ImageIcon />
      <p className="mt-2 text-sm text-gray-500">Image will be generated here</p>
    </div>
  );

  const getShareButtonText = () => {
    switch (shareStatus) {
      case 'copied': return 'Link Copied!';
      case 'copied_local': return 'Local Link Copied!';
      default: return 'Share';
    }
  };

  return (
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-200">3. Visualization & Reconstruction</h2>
        <div className="flex items-center gap-2">
            {hasConcept && (
                <button 
                onClick={onRegenerateImage}
                disabled={isProcessing || isLoadingImage}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                title="Regenerate image with current style"
                >
                    <RefreshIcon className="h-4 w-4" />
                    Regenerate
                </button>
            )}
            <button
              onClick={shareImage}
              disabled={!imageUrl || isProcessing}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              title="Copy link to image"
            >
              <ShareIcon className="h-4 w-4" />
              {getShareButtonText()}
            </button>
            <div className="relative" ref={downloadMenuRef}>
                <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={!hasConcept || isProcessing}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                    title="Download options"
                >
                    <DownloadIcon className="h-4 w-4" />
                    Download
                </button>
                {showDownloadMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                            <button
                                onClick={handleDownloadImage}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                                <ImageIcon />
                                Image (PNG)
                            </button>
                            <button
                                onClick={handleDownloadJson}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                                <CodeBracketIcon className="h-4 w-4"/>
                                Concept (JSON)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="w-full">
          {isLoadingImage ? (
            <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="mt-4 text-gray-400">Generating image...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl.dataUrl} alt="AI generated visualization" className="w-full aspect-square object-cover rounded-lg shadow-md" />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        {/* Text Section */}
        <div className="p-4 bg-gray-900/50 rounded-md flex flex-col items-center justify-center text-center">
          {isLoadingText ? (
            <>
              <Spinner />
              <span className="mt-3 text-gray-400">Reconstructing text...</span>
            </>
          ) : reconstructedText ? (
            <>
              <p className="text-gray-300 italic">"{reconstructedText}"</p>
              <p className="text-xs text-gray-500 mt-4">- AI-generated description</p>
            </>
          ) : (
             <div className="flex flex-col items-center text-gray-500">
                <TextIcon />
                <span className="mt-2 text-sm">Reconstructed text will appear here.</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;