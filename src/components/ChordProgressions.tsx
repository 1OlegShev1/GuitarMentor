"use client";

import { useState } from 'react';

// Define key-value pairs for available keys
const KEYS = [
  { value: 'C', label: 'C' },
  { value: 'G', label: 'G' },
  { value: 'D', label: 'D' },
  { value: 'A', label: 'A' },
  { value: 'E', label: 'E' },
  { value: 'B', label: 'B' },
  { value: 'F#', label: 'F#' },
  { value: 'F', label: 'F' },
  { value: 'Bb', label: 'Bb' },
  { value: 'Eb', label: 'Eb' },
  { value: 'Ab', label: 'Ab' },
  { value: 'Db', label: 'Db' },
];

// Define common chord progressions
const PROGRESSIONS = [
  {
    id: '1-4-5-1',
    name: 'I - IV - V - I',
    numerals: ['I', 'IV', 'V', 'I'],
    description: 'The foundation of countless songs in rock, blues, folk, and pop music.',
  },
  {
    id: '1-5-6-4',
    name: 'I - V - vi - IV',
    numerals: ['I', 'V', 'vi', 'IV'],
    description: 'Known as the "pop-punk progression" or "Axis of Awesome" progression, used in hundreds of pop songs.',
  },
  {
    id: '2-5-1',
    name: 'ii - V - I',
    numerals: ['ii', 'V', 'I'],
    description: 'The most common jazz progression, often expanded with additional chords.',
  },
  {
    id: '1-6-4-5',
    name: 'I - vi - IV - V',
    numerals: ['I', 'vi', 'IV', 'V'],
    description: 'The classic "doo-wop" progression used in countless early rock and pop songs.',
  },
  {
    id: '1-4-6-5',
    name: 'I - IV - vi - V',
    numerals: ['I', 'IV', 'vi', 'V'],
    description: 'A versatile progression that works well in many genres.',
  },
  {
    id: '6-4-1-5',
    name: 'vi - IV - I - V',
    numerals: ['vi', 'IV', 'I', 'V'],
    description: 'The minor variant of the pop progression, with a darker feel.',
  },
];

// Chords in each key (major)
const KEY_CHORDS: Record<string, string[]> = {
  'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
  'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
  'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
  'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
  'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
  'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
};

// Map numeral to index in the key chords array
const NUMERAL_TO_INDEX: Record<string, number> = {
  'I': 0,
  'ii': 1,
  'iii': 2,
  'IV': 3,
  'V': 4,
  'vi': 5,
  'vii°': 6,
};

// Interface for the component props
interface ChordProgressionsProps {
  // Add props as needed
}

const ChordProgressions: React.FC<ChordProgressionsProps> = () => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedProgression, setSelectedProgression] = useState<string>('1-4-5-1');
  const [customProgression, setCustomProgression] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Get the current progression details
  const currentProgression = PROGRESSIONS.find(prog => prog.id === selectedProgression);

  // Get chords for the selected progression in the selected key
  const getChordsForProgression = (): string[] => {
    if (isCustom) {
      return customProgression.map(numeral => {
        const index = NUMERAL_TO_INDEX[numeral];
        return index !== undefined ? KEY_CHORDS[selectedKey][index] : '';
      });
    }
    
    if (!currentProgression) return [];
    
    return currentProgression.numerals.map(numeral => {
      const index = NUMERAL_TO_INDEX[numeral];
      return index !== undefined ? KEY_CHORDS[selectedKey][index] : '';
    });
  };

  // Handle progression change
  const handleProgressionChange = (id: string) => {
    setSelectedProgression(id);
    setIsCustom(false);
  };

  // Create a custom progression
  const startCustomProgression = () => {
    setCustomProgression(['I', 'IV', 'V']); // Default starting point
    setIsCustom(true);
  };

  // Update a numeral in the custom progression
  const updateCustomProgression = (index: number, numeral: string) => {
    const newProgression = [...customProgression];
    newProgression[index] = numeral;
    setCustomProgression(newProgression);
  };

  // Add a chord to the custom progression
  const addChord = () => {
    setCustomProgression([...customProgression, 'I']);
  };

  // Remove a chord from the custom progression
  const removeChord = (index: number) => {
    setCustomProgression(customProgression.filter((_, i) => i !== index));
  };

  const progressionChords = getChordsForProgression();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-medium">Key:</label>
          <select 
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-1"
          >
            {KEYS.map(key => (
              <option key={key.value} value={key.value}>{key.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a Progression:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {PROGRESSIONS.map(progression => (
            <button
              key={progression.id}
              onClick={() => handleProgressionChange(progression.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedProgression === progression.id && !isCustom
                  ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 border'
                  : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="font-medium">{progression.name}</div>
              <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                {progression.description.substring(0, 60)}...
              </div>
            </button>
          ))}
          
          <button
            onClick={startCustomProgression}
            className={`p-3 rounded-lg text-left transition-colors ${
              isCustom
                ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 border'
                : 'bg-white dark:bg-secondary-800 border border-dashed border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            <div className="font-medium">Custom Progression</div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
              Create your own chord progression...
            </div>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow-inner mb-6">
        <h2 className="font-semibold mb-4">
          {isCustom ? 'Custom Progression' : currentProgression?.name}
          <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-2">
            in {selectedKey} Major
          </span>
        </h2>
        
        <div className="flex flex-wrap gap-4 items-center mb-4">
          {isCustom ? (
            <>
              {customProgression.map((numeral, index) => (
                <div key={index} className="relative">
                  <select
                    value={numeral}
                    onChange={(e) => updateCustomProgression(index, e.target.value)}
                    className="bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-md px-3 py-2 pr-8"
                  >
                    <option value="I">I</option>
                    <option value="ii">ii</option>
                    <option value="iii">iii</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="vi">vi</option>
                    <option value="vii°">vii°</option>
                  </select>
                  <button 
                    onClick={() => removeChord(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addChord}
                className="px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md border border-dashed border-primary-300 dark:border-primary-700"
              >
                + Add Chord
              </button>
            </>
          ) : (
            currentProgression?.numerals.map((numeral, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-secondary-50 dark:bg-secondary-800 rounded-md border border-secondary-200 dark:border-secondary-700"
              >
                {numeral}
              </div>
            ))
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 mt-8">
          {progressionChords.map((chord, index) => (
            <div
              key={index}
              className="w-16 h-16 flex items-center justify-center bg-primary-600 text-white rounded-lg text-xl font-semibold shadow-md"
            >
              {chord}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use This Progression</h3>
        <ul className="space-y-2 text-sm">
          <li>• Try playing each chord for equal duration initially (e.g., 4 beats each)</li>
          <li>• Experiment with different strumming patterns to create different feels</li>
          <li>• For more complex progressions, try adding 7ths to the chords</li>
          <li>• Record yourself playing the progression and try improvising over it</li>
          <li>• Try the same progression in different keys to find what works best for your voice</li>
        </ul>
      </div>
    </div>
  );
};

export default ChordProgressions; 