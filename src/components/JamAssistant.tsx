"use client";

import React, { useState } from 'react';

// Define types for chord progression suggestions
interface ProgressionSuggestion {
  bridge: string[];
  variations: string[];
  extensions: string[];
}

type ProgressionSuggestions = {
  [key: string]: ProgressionSuggestion;
};

// Map of chord progressions to suggestions
const PROGRESSION_SUGGESTIONS: ProgressionSuggestions = {
  'I-IV-V-I': {
    bridge: [
      'vi-IV-V-V',
      'iii-vi-ii-V',
      'IV-iv-I-V'
    ],
    variations: [
      'I-IV-V-IV',
      'I-IVsus2-V-I',
      'I-IV-V7-I'
    ],
    extensions: [
      'I-IV-V-vi',
      'I-IV-V-iii-vi',
      'I-IV-V-I-V'
    ]
  },
  'I-V-vi-IV': {
    bridge: [
      'iii-vi-V-IV',
      'ii-IV-I-V',
      'vi-V-IV-V'
    ],
    variations: [
      'I-V-vi-iii-IV',
      'I-V-vi-ii-IV',
      'I-V7-vi-IV'
    ],
    extensions: [
      'I-V-vi-IV-I-V',
      'I-V-vi-IV-ii-V',
      'I-V-vi-IV-V-vi'
    ]
  },
  'ii-V-I': {
    bridge: [
      'IV-iv-I-V',
      'iii-vi-ii-V',
      'vi-IV-V-I'
    ],
    variations: [
      'ii7-V7-Imaj7',
      'ii-V7-I6',
      'iim7b5-V7-i' // minor key variant
    ],
    extensions: [
      'ii-V-I-vi',
      'ii-V-I-IV',
      'ii-V-iii-vi-ii-V-I'
    ]
  },
  'I-vi-IV-V': {
    bridge: [
      'iii-vi-ii-V',
      'ii-V-iii-vi',
      'IV-iv-I-V'
    ],
    variations: [
      'I-vi-ii-V',
      'I-vi7-IV-V7',
      'I-vim-IV-V'
    ],
    extensions: [
      'I-vi-IV-V-I-vi-ii-V',
      'I-vi-IV-V-iii-vi-IV-V',
      'I-vi-IV-V-IV-V'
    ]
  },
  'vi-IV-I-V': {
    bridge: [
      'iii-vi-ii-V',
      'ii-iii-IV-V',
      'IV-iv-I-V'
    ],
    variations: [
      'vi-IV-I-V7',
      'vi-IV-I-V/vi',
      'vi-IV-I-iii-V'
    ],
    extensions: [
      'vi-IV-I-V-IV-I-V',
      'vi-IV-I-V-vi-IV-V-I',
      'vi-IV-I-V-iii-vi-IV-V'
    ]
  },
  'custom': {
    bridge: [
      'Try a relative minor/major section',
      'Change the last chord to create tension',
      'Add a descending bassline'
    ],
    variations: [
      'Add 7th chords for more color',
      'Try chord inversions',
      'Substitute relative minor/major chords'
    ],
    extensions: [
      'Repeat with a different rhythmic pattern',
      'Add a passing chord between changes',
      'Try using a pedal tone'
    ]
  }
};

type ProgressionKey = keyof typeof PROGRESSION_SUGGESTIONS;
type SongPart = 'verse' | 'chorus' | 'bridge';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JamAssistantProps {
  // Add props as needed
}

const JamAssistant: React.FC<JamAssistantProps> = () => {
  const [selectedProgression, setSelectedProgression] = useState<ProgressionKey>('I-IV-V-I');
  const [customProgression, setCustomProgression] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [songPart, setSongPart] = useState<SongPart>('verse');

  const progressionOptions: ProgressionKey[] = ['I-IV-V-I', 'I-V-vi-IV', 'ii-V-I', 'I-vi-IV-V', 'vi-IV-I-V', 'custom'];

  const handleProgressionChange = (progression: ProgressionKey) => {
    setSelectedProgression(progression);
    setShowSuggestions(false);
  };

  const handleCustomProgressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomProgression(e.target.value);
  };

  const getSuggestions = () => {
    setShowSuggestions(true);
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const suggestions = PROGRESSION_SUGGESTIONS[selectedProgression];

    return (
      <div className="mt-6 space-y-6">
        <h3 className="font-semibold text-lg">Suggestions for {selectedProgression === 'custom' ? customProgression : selectedProgression}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-3">Bridge Ideas</h4>
            <ul className="space-y-2">
              {suggestions.bridge.map((idea: string, index: number) => (
                <li key={`bridge-${index}`} className="p-2 bg-white dark:bg-secondary-800 rounded">
                  {idea}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-secondary-600 dark:text-secondary-400 mb-3">Variations</h4>
            <ul className="space-y-2">
              {suggestions.variations.map((variation: string, index: number) => (
                <li key={`variation-${index}`} className="p-2 bg-white dark:bg-secondary-800 rounded">
                  {variation}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-secondary-600 dark:text-secondary-400 mb-3">Extensions</h4>
            <ul className="space-y-2">
              {suggestions.extensions.map((extension: string, index: number) => (
                <li key={`extension-${index}`} className="p-2 bg-white dark:bg-secondary-800 rounded">
                  {extension}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
          <h4 className="font-medium mb-3">Song Structure Suggestion</h4>
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 rounded-md text-sm">
              Intro: {selectedProgression === 'custom' ? customProgression : selectedProgression}
            </div>
            <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-md text-sm">
              Verse: {selectedProgression === 'custom' ? customProgression : selectedProgression} (x2)
            </div>
            <div className="px-3 py-1 bg-primary-200 dark:bg-primary-800/30 rounded-md text-sm">
              Pre-Chorus: {suggestions.variations[0]}
            </div>
            <div className="px-3 py-1 bg-primary-300 dark:bg-primary-700/40 rounded-md text-sm">
              Chorus: {suggestions.extensions[0]}
            </div>
            <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-md text-sm">
              Verse: {selectedProgression === 'custom' ? customProgression : selectedProgression} (x2)
            </div>
            <div className="px-3 py-1 bg-primary-200 dark:bg-primary-800/30 rounded-md text-sm">
              Pre-Chorus: {suggestions.variations[0]}
            </div>
            <div className="px-3 py-1 bg-primary-300 dark:bg-primary-700/40 rounded-md text-sm">
              Chorus: {suggestions.extensions[0]}
            </div>
            <div className="px-3 py-1 bg-primary-500 dark:bg-primary-600/50 rounded-md text-sm text-white">
              Bridge: {suggestions.bridge[0]}
            </div>
            <div className="px-3 py-1 bg-primary-300 dark:bg-primary-700/40 rounded-md text-sm">
              Chorus: {suggestions.extensions[0]}
            </div>
            <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-md text-sm">
              Outro: {selectedProgression === 'custom' ? customProgression : selectedProgression}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Chord Progression</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select a progression or enter your own:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {progressionOptions.map((progression) => (
                <button
                  key={progression}
                  onClick={() => handleProgressionChange(progression)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedProgression === progression
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  {progression}
                </button>
              ))}
            </div>
          </div>
          
          {selectedProgression === 'custom' && (
            <div>
              <label htmlFor="custom-progression" className="block text-sm font-medium mb-2">
                Enter your progression (e.g., &quot;Cmaj7-Am7-Fmaj7-G7&quot;):
              </label>
              <input
                id="custom-progression"
                type="text"
                value={customProgression}
                onChange={handleCustomProgressionChange}
                placeholder="e.g., Cmaj7-Am7-Fmaj7-G7"
                className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">This progression is for the:</label>
            <div className="flex space-x-2">
              {(['verse', 'chorus', 'bridge'] as const).map((part) => (
                <button
                  key={part}
                  onClick={() => setSongPart(part)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    songPart === part
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700'
                  }`}
                >
                  {part.charAt(0).toUpperCase() + part.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={getSuggestions}
            className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
          >
            Get Suggestions
          </button>
        </div>
      </div>
      
      {renderSuggestions()}
    </div>
  );
};

export default JamAssistant; 