
import React from 'react';
import type { AIConcept } from '../types';
import { Spinner } from './Spinner';

interface ConceptPanelProps {
  concept: AIConcept | null;
  isLoading: boolean;
}

const ConceptPanel: React.FC<ConceptPanelProps> = ({ concept, isLoading }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Spinner />
          <p className="mt-4 text-gray-400">Extracting concepts...</p>
        </div>
      );
    }
    if (concept) {
      return (
        <pre className="font-mono bg-gray-900/70 p-4 rounded-md overflow-x-auto">
          <code className="text-pink-300">{JSON.stringify(concept, null, 2)}</code>
        </pre>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">AI-generated concept will appear here.</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg h-full min-h-[300px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">2. AI Concept (JSON)</h2>
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConceptPanel;
