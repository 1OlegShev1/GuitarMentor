"use client";

import { useState } from 'react';

// Chord shapes for each of the CAGED positions
const CHORD_SHAPES = {
  C: {
    name: 'C Shape',
    positions: [
      { string: 5, fret: 3, finger: 3, note: 'Root' },
      { string: 4, fret: 2, finger: 2, note: '5th' },
      { string: 3, fret: 0, finger: 0, note: 'Root' },
      { string: 2, fret: 1, finger: 1, note: '3rd' },
      { string: 1, fret: 0, finger: 0, note: '5th' },
    ],
    barres: [],
    muted: [6],
  },
  A: {
    name: 'A Shape',
    positions: [
      { string: 5, fret: 0, finger: 0, note: 'Root' },
      { string: 4, fret: 2, finger: 2, note: '5th' },
      { string: 3, fret: 2, finger: 3, note: 'Root' },
      { string: 2, fret: 2, finger: 4, note: '3rd' },
      { string: 1, fret: 0, finger: 0, note: '5th' },
    ],
    barres: [],
    muted: [6],
  },
  G: {
    name: 'G Shape',
    positions: [
      { string: 6, fret: 3, finger: 3, note: 'Root' },
      { string: 5, fret: 2, finger: 2, note: '3rd' },
      { string: 4, fret: 0, finger: 0, note: '5th' },
      { string: 3, fret: 0, finger: 0, note: 'Root' },
      { string: 2, fret: 0, finger: 0, note: '3rd' },
      { string: 1, fret: 3, finger: 4, note: 'Root' },
    ],
    barres: [],
    muted: [],
  },
  E: {
    name: 'E Shape',
    positions: [
      { string: 6, fret: 0, finger: 0, note: 'Root' },
      { string: 5, fret: 2, finger: 2, note: '5th' },
      { string: 4, fret: 2, finger: 3, note: 'Root' },
      { string: 3, fret: 1, finger: 1, note: '3rd' },
      { string: 2, fret: 0, finger: 0, note: '5th' },
      { string: 1, fret: 0, finger: 0, note: 'Root' },
    ],
    barres: [],
    muted: [],
  },
  D: {
    name: 'D Shape',
    positions: [
      { string: 4, fret: 0, finger: 0, note: 'Root' },
      { string: 3, fret: 2, finger: 2, note: '5th' },
      { string: 2, fret: 3, finger: 3, note: 'Root' },
      { string: 1, fret: 2, finger: 1, note: '3rd' },
    ],
    barres: [],
    muted: [6, 5],
  },
};

const CHORD_KEYS = ['C', 'A', 'G', 'E', 'D'] as const;
type ChordKey = typeof CHORD_KEYS[number];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CagedSystemDisplayProps {
  // Add props as needed
}

const CagedSystemDisplay: React.FC<CagedSystemDisplayProps> = () => {
  const [selectedShape, setSelectedShape] = useState<ChordKey>('C');
  const [showNotes, setShowNotes] = useState(true);
  const [startFret, setStartFret] = useState(0);

  const handleShapeChange = (shape: ChordKey) => {
    setSelectedShape(shape);
  };

  const moveUp = () => {
    if (startFret < 12) {
      setStartFret(startFret + 1);
    }
  };

  const moveDown = () => {
    if (startFret > 0) {
      setStartFret(startFret - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {CHORD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleShapeChange(key)}
              className={`px-4 py-2 rounded-md font-medium ${
                selectedShape === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1 rounded-md text-sm ${
              showNotes
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
            }`}
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={moveDown}
              disabled={startFret === 0}
              className={`px-3 py-1 rounded-md ${
                startFret === 0
                  ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 cursor-not-allowed'
                  : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300'
              }`}
            >
              ←
            </button>
            <span className="text-sm font-medium">Fret {startFret}</span>
            <button
              onClick={moveUp}
              disabled={startFret === 12}
              className={`px-3 py-1 rounded-md ${
                startFret === 12
                  ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 cursor-not-allowed'
                  : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300'
              }`}
            >
              →
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow-inner overflow-x-auto">
        <div className="relative min-w-[600px]">
          {/* Fretboard */}
          <div className="relative">
            {/* String lines */}
            {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
              <div 
                key={`string-${stringIndex}`}
                className="h-12 border-b border-secondary-300 dark:border-secondary-600 relative"
              >
                {/* String label */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center font-medium text-secondary-600 dark:text-secondary-400">
                  {6 - stringIndex}
                </div>
              </div>
            ))}
            
            {/* Fret markers */}
            <div className="absolute left-8 right-0 top-0 bottom-0 flex">
              {Array.from({ length: 5 }).map((_, fretIndex) => {
                const currentFret = startFret + fretIndex;
                return (
                  <div 
                    key={`fret-${fretIndex}`}
                    className="flex-1 border-r border-secondary-400 dark:border-secondary-500 relative"
                  >
                    {/* Fret number */}
                    <div className="absolute top-full text-center w-full text-xs font-medium pt-1">
                      {currentFret}
                    </div>
                    
                    {/* Fret markers (dots) */}
                    {[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(currentFret) && (
                      <div className="absolute top-full mt-5 inset-x-0 flex justify-center">
                        <div className={`w-2 h-2 rounded-full bg-primary-500 ${[12, 24].includes(currentFret) ? 'w-3 h-3' : ''}`}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Chord positions */}
            {CHORD_SHAPES[selectedShape].positions.map((position, index) => {
              // Skip if the position is out of the visible fret range
              const adjustedFret = position.fret + startFret;
              if (adjustedFret < startFret || adjustedFret > startFret + 4) return null;
              
              const stringIndex = 6 - position.string; // Convert to zero-indexed
              // const fretIndex = position.fret; // Relative to the startFret
              
              return (
                <div
                  key={`position-${index}`}
                  className="absolute w-10 h-10 flex items-center justify-center"
                  style={{
                    top: `${stringIndex * 3}rem`,
                    left: `${((position.fret - 0 + 0.5) * 20) + 2}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full bg-primary-600 text-white flex flex-col items-center justify-center text-xs relative"
                  >
                    <span>{position.finger > 0 ? position.finger : '-'}</span>
                    {showNotes && (
                      <span className="absolute -bottom-5 text-xs whitespace-nowrap font-medium text-secondary-700 dark:text-secondary-300">
                        {position.note}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Muted strings */}
            {CHORD_SHAPES[selectedShape].muted.map((string, index) => {
              const stringIndex = 6 - string; // Convert to zero-indexed
              
              return (
                <div
                  key={`muted-${index}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: `${stringIndex * 3}rem`,
                    left: `1rem`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="text-secondary-500 dark:text-secondary-400 text-xl font-bold">
                    ×
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
        <h3 className="font-semibold mb-2">{CHORD_SHAPES[selectedShape].name} Info</h3>
        <p className="text-sm text-secondary-600 dark:text-secondary-300">
          The {CHORD_SHAPES[selectedShape].name} is typically played as an open chord, but can be moved up the 
          neck using a barre. This shape emphasizes the {selectedShape === 'C' || selectedShape === 'G' ? 'middle strings' : 
          selectedShape === 'E' || selectedShape === 'A' ? 'bass strings' : 'treble strings'}.
        </p>
      </div>
    </div>
  );
};

export default CagedSystemDisplay; 