
import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon, ChevronUpIcon, ChevronDownIcon, RefreshIcon, TrashIcon, ImageIcon } from './Icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onReload: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onReload, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">History</h2>
          </div>
          {isOpen ? <ChevronUpIcon className="h-6 w-6 text-gray-400" /> : <ChevronDownIcon className="h-6 w-6 text-gray-400" />}
        </button>
        {isOpen && (
          <div className="p-4 border-t border-gray-700">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center">No history yet. Your creations will be saved here.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {history.map(item => (
                  <li key={item.id} className="flex items-center gap-4 p-3 bg-gray-900/70 rounded-lg">
                    <img src={item.generatedImage} alt="Generated thumbnail" className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm text-gray-300 truncate font-medium">
                        {item.uploadedImageName 
                          ? <span className="flex items-center gap-2"><ImageIcon /> Image: {item.uploadedImageName}</span>
                          : item.userInput
                        }
                      </p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                       <button
                        onClick={() => onReload(item)}
                        title="Reload this state"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <RefreshIcon className="h-5 w-5" />
                      </button>
                       <button
                        onClick={() => onDelete(item.id)}
                        title="Delete this item"
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-md transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
