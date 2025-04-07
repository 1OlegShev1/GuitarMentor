"use client";

import React, { useState, useMemo } from 'react';
import FretboardDisplay, { CagedShapeData } from './FretboardDisplay';

// Original Chord shapes data (using 1-based string index)
const CHORD_SHAPES_RAW = {
  C: {
    name: 'C Shape',
    positions: [
      { string: 5, fret: 3, finger: 3, noteType: 'Root' },
      { string: 4, fret: 2, finger: 2, noteType: '5th' },
      { string: 3, fret: 0, finger: 0, noteType: 'Root' },
      { string: 2, fret: 1, finger: 1, noteType: '3rd' },
      { string: 1, fret: 0, finger: 0, noteType: '5th' },
    ],
    barres: [],
    mutedStrings: [6],
  },
  A: {
    name: 'A Shape',
    positions: [
      { string: 5, fret: 0, finger: 0, noteType: 'Root' },
      { string: 4, fret: 2, finger: 2, noteType: '5th' },
      { string: 3, fret: 2, finger: 3, noteType: 'Root' },
      { string: 2, fret: 2, finger: 4, noteType: '3rd' },
      { string: 1, fret: 0, finger: 0, noteType: '5th' },
    ],
    barres: [],
    mutedStrings: [6],
  },
  G: {
    name: 'G Shape',
    positions: [
      { string: 6, fret: 3, finger: 3, noteType: 'Root' },
      { string: 5, fret: 2, finger: 2, noteType: '3rd' },
      { string: 4, fret: 0, finger: 0, noteType: '5th' },
      { string: 3, fret: 0, finger: 0, noteType: 'Root' },
      { string: 2, fret: 0, finger: 0, noteType: '3rd' },
      { string: 1, fret: 3, finger: 4, noteType: 'Root' },
    ],
    barres: [],
    mutedStrings: [],
  },
  E: {
    name: 'E Shape',
    positions: [
      { string: 6, fret: 0, finger: 0, noteType: 'Root' },
      { string: 5, fret: 2, finger: 2, noteType: '5th' },
      { string: 4, fret: 2, finger: 3, noteType: 'Root' },
      { string: 3, fret: 1, finger: 1, noteType: '3rd' },
      { string: 2, fret: 0, finger: 0, noteType: '5th' },
      { string: 1, fret: 0, finger: 0, noteType: 'Root' },
    ],
    barres: [],
    mutedStrings: [],
  },
  D: {
    name: 'D Shape',
    positions: [
      { string: 4, fret: 0, finger: 0, noteType: 'Root' },
      { string: 3, fret: 2, finger: 2, noteType: '5th' },
      { string: 2, fret: 3, finger: 3, noteType: 'Root' },
      { string: 1, fret: 2, finger: 1, noteType: '3rd' },
    ],
    barres: [],
    mutedStrings: [6, 5],
  },
};

const CHORD_KEYS = ['C', 'A', 'G', 'E', 'D'] as const;
type ChordKey = typeof CHORD_KEYS[number];

// Helper function to transform raw shape data to CagedShapeData format (0-based string index)
const transformShapeData = (rawData: typeof CHORD_SHAPES_RAW[ChordKey]): CagedShapeData => {
  return {
    positions: rawData.positions.map(pos => ({
      ...pos,
      string: 6 - pos.string, // Convert 1-based (high E = 1) to 0-based (high E = 5)
    })),
    barres: rawData.barres, // Assuming Barre data format is already correct
    mutedStrings: rawData.mutedStrings, // Assuming mutedStrings format is already correct
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CagedSystemDisplayProps {
  // Add props as needed
}

const CagedSystemDisplay: React.FC<CagedSystemDisplayProps> = () => {
  const [selectedShapeKey, setSelectedShapeKey] = useState<ChordKey>('C');

  const handleShapeChange = (shape: ChordKey) => {
    setSelectedShapeKey(shape);
  };

  // Memoize the transformed shape data
  const currentCagedShape = useMemo(() => {
    const rawData = CHORD_SHAPES_RAW[selectedShapeKey];
    return transformShapeData(rawData);
  }, [selectedShapeKey]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex space-x-2 bg-gray-100 dark:bg-secondary-800 p-1 rounded-lg">
          {CHORD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleShapeChange(key)}
              className={`px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                selectedShapeKey === key
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-700'
              }`}
            >
              {key} Shape
            </button>
          ))}
        </div>
      </div>

      {/* Fretboard Display */}
      <div className="w-full max-w-4xl mx-auto"> {/* Center and constrain width */}
        <FretboardDisplay
          displayMode="caged"
          cagedShape={currentCagedShape}
        />
      </div>
    </div>
  );
};

export default CagedSystemDisplay; 