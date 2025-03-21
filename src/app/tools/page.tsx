"use client";

import { useState } from 'react';
import Metronome from '../../components/Metronome';
import GuitarTuner from '../../components/GuitarTuner';

const ToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metronome' | 'tuner'>('metronome');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Guitar Tools</h1>
      
      {/* Tab navigation */}
      <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('metronome')}
          className={`py-3 px-6 ${
            activeTab === 'metronome'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Metronome
        </button>
        <button
          onClick={() => setActiveTab('tuner')}
          className={`py-3 px-6 ${
            activeTab === 'tuner'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Guitar Tuner
        </button>
      </div>
      
      {/* Tab content */}
      <div className="max-w-xl mx-auto">
        {activeTab === 'metronome' ? (
          <div className="animate-fadeIn">
            <Metronome initialTempo={90} />
            <div className="mt-6 p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg">
              <h3 className="font-medium mb-2">Tips for using the metronome:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Start with a slower tempo and gradually increase it as you build accuracy</li>
                <li>Practice with different time signatures to improve your rhythmic versatility</li>
                <li>Try accenting different beats (e.g., 2 and 4) for more advanced rhythm practice</li>
                <li>Use the metronome whenever practicing scales, chord progressions, or songs</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <GuitarTuner />
            <div className="mt-6 p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg">
              <h3 className="font-medium mb-2">Tips for using the tuner:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Find a quiet environment for the most accurate tuning results</li>
                <li>Pluck each string individually with medium strength</li>
                <li>Wait for the note to stabilize before making adjustments</li>
                <li>Tune the low E string first, then use it to tune the other strings by ear as a cross-check</li>
                <li>Microphone access is required for the tuner to work</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage; 