"use client";

import React, { useState, useMemo } from 'react';
import FretboardDisplay, { CagedShapeData } from './FretboardDisplay';
import { ALL_NOTES, STANDARD_TUNING } from '@/hooks/useFretboard';

// Define relative CAGED shapes
interface RelativeCagedPosition {
  string: number; // Still 1-based for easier definition?
  relativeFret: number; 
  finger: number;
  noteType?: 'Root' | '3rd' | '5th' | string; 
}

interface RelativeCagedShape {
  name: string;
  rootStringIndex: number; // 0-5 index relative to STANDARD_TUNING
  positions: RelativeCagedPosition[];
  // Barre definition might also need to be relative
  barres?: { relativeFret: number; startString: number; endString: number }[]; 
  mutedStrings?: number[]; // 1-based string numbers
}

const CAGED_SHAPES_RELATIVE: { [key in ChordKey]: RelativeCagedShape } = {
  C: {
    name: 'C Shape (Root 5th Str)',
    rootStringIndex: 1, // A string anchor
    positions: [
      // Fret relative to A string, fret 3 (if root is C)
      { string: 5, relativeFret: 0, finger: 3, noteType: 'Root' },     // A string = root
      { string: 4, relativeFret: -1, finger: 2, noteType: '5th' },    // D string
      { string: 3, relativeFret: -3, finger: 0, noteType: 'Root' },     // G string (open)
      { string: 2, relativeFret: -2, finger: 1, noteType: '3rd' },    // B string
      { string: 1, relativeFret: -3, finger: 0, noteType: '5th' },    // E string (open)
    ],
    barres: [],
    mutedStrings: [6],
  },
  A: {
    name: 'A Shape (Root 5th Str)',
    rootStringIndex: 1, // A string anchor
    positions: [
      // Frets relative to A string, fret 0 (if root is A)
      { string: 5, relativeFret: 0, finger: 0, noteType: 'Root' },     // A string = root
      { string: 4, relativeFret: 2, finger: 2, noteType: '5th' },    // D string
      { string: 3, relativeFret: 2, finger: 3, noteType: 'Root' },     // G string
      { string: 2, relativeFret: 2, finger: 4, noteType: '3rd' },    // B string
      { string: 1, relativeFret: 0, finger: 0, noteType: '5th' },    // E string (open)
    ],
    // Example Barre for A shape when played higher (e.g. as B chord)
    barres: [{ relativeFret: 2, startString: 4, endString: 2 }], 
    mutedStrings: [6],
  },
  G: {
    name: 'G Shape (Root 6th Str)',
    rootStringIndex: 0, // E string anchor
    positions: [
      // Frets relative to E string, fret 3 (if root is G)
      { string: 6, relativeFret: 0, finger: 3, noteType: 'Root' },     // E string = root
      { string: 5, relativeFret: -1, finger: 2, noteType: '3rd' },    // A string
      { string: 4, relativeFret: -3, finger: 0, noteType: '5th' },    // D string (open)
      { string: 3, relativeFret: -3, finger: 0, noteType: 'Root' },     // G string (open)
      { string: 2, relativeFret: -3, finger: 0, noteType: '3rd' },    // B string (open)
      { string: 1, relativeFret: 0, finger: 4, noteType: 'Root' },     // E string (high)
    ],
    barres: [],
    mutedStrings: [],
  },
  E: {
    name: 'E Shape (Root 6th Str)',
    rootStringIndex: 0, // E string anchor
    positions: [
      // Frets relative to E string, fret 0 (if root is E)
      { string: 6, relativeFret: 0, finger: 0, noteType: 'Root' },     // E string = root
      { string: 5, relativeFret: 2, finger: 2, noteType: '5th' },    // A string
      { string: 4, relativeFret: 2, finger: 3, noteType: 'Root' },     // D string
      { string: 3, relativeFret: 1, finger: 1, noteType: '3rd' },    // G string
      { string: 2, relativeFret: 0, finger: 0, noteType: '5th' },    // B string (open)
      { string: 1, relativeFret: 0, finger: 0, noteType: 'Root' },     // E string (high, open)
    ],
    // Example Barre for E shape when played higher (e.g. as F chord)
    barres: [{ relativeFret: 0, startString: 6, endString: 1 }], 
    mutedStrings: [],
  },
  D: {
    name: 'D Shape (Root 4th Str)',
    rootStringIndex: 2, // D string anchor
    positions: [
      // Frets relative to D string, fret 0 (if root is D)
      { string: 4, relativeFret: 0, finger: 0, noteType: 'Root' },     // D string = root
      { string: 3, relativeFret: 2, finger: 2, noteType: '5th' },    // G string
      { string: 2, relativeFret: 3, finger: 3, noteType: 'Root' },     // B string
      { string: 1, relativeFret: 2, finger: 1, noteType: '3rd' },    // E string
    ],
    barres: [],
    mutedStrings: [6, 5],
  },
};

const CHORD_KEYS = ['C', 'A', 'G', 'E', 'D'] as const;
type ChordKey = typeof CHORD_KEYS[number];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CagedSystemDisplayProps {
  // Add props as needed
}

const CagedSystemDisplay: React.FC<CagedSystemDisplayProps> = () => {
  const [selectedShapeKey, setSelectedShapeKey] = useState<ChordKey>('C');
  const [selectedRootNote, setSelectedRootNote] = useState<string>('C');

  const handleShapeChange = (shape: ChordKey) => {
    setSelectedShapeKey(shape);
  };

  // Update useMemo hook to use relative data and perform transposition
  const currentCagedShape = useMemo((): CagedShapeData | null => {
    const shapeKey = selectedShapeKey;
    const rootNote = selectedRootNote;
    const relativeShape = CAGED_SHAPES_RELATIVE[shapeKey];
    if (!relativeShape) return null;

    const { rootStringIndex, positions: relativePositions, barres: relativeBarres, mutedStrings } = relativeShape;
    const rootNoteMidi = ALL_NOTES.indexOf(rootNote);
    if (rootNoteMidi === -1) return null; // Invalid root note selected

    // Find the lowest fret for the selected root note on the shape's anchor string
    let rootFret = -1;
    const openStringMidi = ALL_NOTES.indexOf(STANDARD_TUNING[rootStringIndex]);
    if (openStringMidi === -1) return null; // Invalid tuning/string index

    for (let fret = 0; fret < 15; fret++) { // Search up to fret 15
      if ((openStringMidi + fret) % 12 === rootNoteMidi) {
        rootFret = fret;
        break;
      }
    }

    if (rootFret === -1) {
      console.warn(`Cannot form ${rootNote} chord using ${shapeKey} shape: Root not found on string ${rootStringIndex}`);
      return null; // Root note not found on anchor string in reasonable range
    }

    // Transpose positions
    const absolutePositions = relativePositions.map(pos => ({
      ...pos,
      fret: rootFret + pos.relativeFret,
      string: 6 - pos.string // Convert 1-based definition to 0-based display
    })).filter(pos => pos.fret >= 0 && pos.fret <= 24); // Filter out negative/too high frets

    // Transpose barres (handle potential non-existence)
    const absoluteBarres = (relativeBarres || []).map(barre => ({
        fret: rootFret + barre.relativeFret,
        startString: barre.startString,
        endString: barre.endString
    })).filter(barre => barre.fret >= 0 && barre.fret <= 24);

    return {
      positions: absolutePositions,
      barres: absoluteBarres,
      mutedStrings: mutedStrings
    };

  }, [selectedShapeKey, selectedRootNote]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        {/* Root Note Selector */}
        <div>
          <label htmlFor="cagedRootNoteSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Root Note</label>
          <select
            id="cagedRootNoteSelect"
            value={selectedRootNote}
            onChange={(e) => setSelectedRootNote(e.target.value)}
            className="w-full p-2 rounded border bg-white dark:bg-secondary-800 dark:border-secondary-700"
          >
            {ALL_NOTES.map(note => <option key={note} value={note}>{note}</option>)}
          </select>
        </div>
        
        {/* Shape Selector */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-secondary-800 p-1 rounded-lg">
          {CHORD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleShapeChange(key)}
              className={`px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                selectedShapeKey === key
                  ? 'bg-primary text-gray-900 dark:text-white shadow' 
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
          cagedShape={currentCagedShape ?? undefined}
        />
      </div>
    </div>
  );
};

export default CagedSystemDisplay; 