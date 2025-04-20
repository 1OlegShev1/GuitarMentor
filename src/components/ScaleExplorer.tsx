"use client";

import React, { useState, useEffect } from 'react';
import FretboardDisplay from './FretboardDisplay';
import { NotePosition, ALL_NOTES, STANDARD_TUNING } from '@/hooks/useFretboard';

// Common scale types with their interval patterns
const SCALE_TYPES = {
  major: {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'The foundation of Western music, bright and happy sounding.',
  },
  minor: {
    name: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Used extensively in rock, pop, and blues. Sad or serious character.',
  },
  minorPentatonic: {
    name: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'A five-note scale extremely common in blues, rock and pop.',
  },
  majorPentatonic: {
    name: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: 'A five-note major scale with a bright, open sound.',
  },
  blues: {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Minor pentatonic with an added flat 5th (blue note).',
  },
  harmonicMinor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Natural minor with a raised 7th degree. Common in classical and metal.',
  },
  melodicMinor: {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Minor scale with raised 6th and 7th degrees ascending.',
  },
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'A minor scale with a raised 6th, common in jazz and rock.',
  },
  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Minor scale with a flat 2nd, has a Spanish/Middle Eastern sound.',
  },
  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Major scale with a raised 4th, sounds bright and spacey.',
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'A major scale with a flatted 7th, common in blues and rock.',
  },
  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'A diminished scale with a flat 2nd and flat 5th.',
  },
  wholeTone: {
    name: 'Whole Tone',
    intervals: [0, 2, 4, 6, 8, 10],
    description: 'A symmetrical scale comprised solely of whole steps.',
  },
  diminished: {
    name: 'Diminished (Half-Whole)',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    description: 'An 8-note symmetrical scale alternating half and whole steps.',
  },
};

type ScaleType = keyof typeof SCALE_TYPES;

// Scale positions - key patterns that highlight common fingering positions
interface ScalePositionDef {
  name: string;
  rootStringIndex: number;
  relativeFrets: number[][];
}

type ScalePositionsMap = {
  [key in ScaleType]?: ScalePositionDef[];
};

/**
 * Generate scale boxes dynamically: for each root on strings 6-2, find frets for scale intervals within a small window
 */
function generateScalePositions(scaleIntervals: number[], rootNote: string) {
  const rootMidi = ALL_NOTES.indexOf(rootNote);
  if (rootMidi === -1) return [];
  const positions = [];
  // For string 0 (low E) through 4 (B)
  for (let rootStringIndex = 0; rootStringIndex <= 4; rootStringIndex++) {
    // find root fret on this string
    const openMidi = ALL_NOTES.indexOf(STANDARD_TUNING[rootStringIndex]);
    let rootFret = -1;
    for (let fret = 0; fret <= 15; fret++) {
      if ((openMidi + fret) % 12 === rootMidi) { rootFret = fret; break; }
    }
    if (rootFret === -1) continue;
    // collect relative frets for window
    const relativeFrets: number[][] = Array.from({ length: 6 }, () => []);
    const span = 4;
    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      const stringOpen = ALL_NOTES.indexOf(STANDARD_TUNING[stringIdx]);
      for (const interval of scaleIntervals) {
        // try offsets in window
        for (let offset = -1; offset <= span; offset++) {
          const f = rootFret + offset;
          if (f < 0 || f > 24) continue;
          if ((stringOpen + f) % 12 === (rootMidi + interval) % 12) {
            relativeFrets[stringIdx].push(offset);
            break;
          }
        }
      }
      relativeFrets[stringIdx] = Array.from(new Set(relativeFrets[stringIdx])).sort((a,b) => a-b);
    }
    positions.push({ name: `Position ${positions.length+1}`, rootStringIndex, relativeFrets });
  }
  return positions;
}

// --- Helper to generate a basic pattern rooted on 6th string ---
// (Simplified: Returns a small box including notes from the scale intervals)
function generateRootOn6thPattern(scaleIntervals: number[], rootNote: string): ScalePositionDef | null {
  const rootNoteMidi = ALL_NOTES.indexOf(rootNote);
  if (rootNoteMidi === -1) return null;

  const scaleNoteIndices = new Set(scaleIntervals.map(interval => (rootNoteMidi + interval) % 12));

  let rootFret = -1;
  const openStringMidi = ALL_NOTES.indexOf(STANDARD_TUNING[0]); // Low E string
  for (let fret = 0; fret < 15; fret++) {
      if ((openStringMidi + fret) % 12 === rootNoteMidi) {
          rootFret = fret;
          break;
      }
  }
  if (rootFret === -1) return null; // Cannot find root on 6th string

  const relativeFrets: number[][] = [[], [], [], [], [], []];
  const fretSpan = 4; // Generate notes within this many frets from root

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const currentOpenStringMidi = ALL_NOTES.indexOf(STANDARD_TUNING[stringIdx]);
    for (let fretOffset = 0; fretOffset <= fretSpan; fretOffset++) {
      const absoluteFret = rootFret + fretOffset;
      const noteIndex = (currentOpenStringMidi + absoluteFret) % 12;
      if (scaleNoteIndices.has(noteIndex)) {
        // Calculate fret relative to rootFret on 6th string
        relativeFrets[stringIdx].push(absoluteFret - rootFret);
      }
      // Also check one fret below rootFret for completeness in some shapes
      if (fretOffset === 0 && rootFret > 0) { 
         const prevAbsoluteFret = rootFret - 1;
         const prevNoteIndex = (currentOpenStringMidi + prevAbsoluteFret) % 12;
          if (scaleNoteIndices.has(prevNoteIndex)) {
             relativeFrets[stringIdx].push(prevAbsoluteFret - rootFret);
          }
      }
    }
    // Sort and remove duplicates for cleanliness
    // Convert Set to Array before sorting for compatibility
    relativeFrets[stringIdx] = Array.from(new Set(relativeFrets[stringIdx])).sort((a, b) => a - b);
  }

  return {
    name: 'Root on 6th String (Auto)',
    rootStringIndex: 0,
    relativeFrets: relativeFrets
  };
}
// --- End Helper ---

const ScaleExplorer: React.FC = () => {
  const [rootNote, setRootNote] = useState<string>('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minorPentatonic');
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number>(0);
  // Toggle between showing note names (default) and interval labels
  const [showIntervals, setShowIntervals] = useState<boolean>(false);

  // Calculate the notes in the selected scale
  const currentScaleNotes = React.useMemo(() => {
    const rootNoteIndex = ALL_NOTES.indexOf(rootNote);
    if (rootNoteIndex === -1) return [];
    return SCALE_TYPES[scaleType].intervals.map(interval => {
      const noteIndex = (rootNoteIndex + interval) % 12;
      return ALL_NOTES[noteIndex];
    });
  }, [rootNote, scaleType]);

  // Generate dynamic box positions for the current root and scale
  const availablePositions = React.useMemo(() => {
    return generateScalePositions(SCALE_TYPES[scaleType].intervals, rootNote);
  }, [scaleType, rootNote]);

  // Calculate the highlighted pattern for the selected box
  const highlightedPattern = React.useMemo((): NotePosition[] => {
    const defs = availablePositions;
    const def = defs[selectedPositionIndex - 1];
    if (!def) return [];
    // find root fret again
    const openMidi = ALL_NOTES.indexOf(STANDARD_TUNING[def.rootStringIndex]);
    const rootMidi = ALL_NOTES.indexOf(rootNote);
    let rootFret = -1;
    for (let f = 0; f <= 15; f++) {
      if ((openMidi + f) % 12 === rootMidi) { rootFret = f; break; }
    }
    if (rootFret === -1) return [];
    // map relative offsets to absolute NotePositions
    return def.relativeFrets.flatMap((fretsOnString, stringIdx) => 
      fretsOnString.map(offset => ({ string: stringIdx, fret: rootFret + offset }))
    );
  }, [availablePositions, selectedPositionIndex, rootNote]);

  // Compute interval labels (1, b2, 2, b3, 3, 4, b5, 5, b6, 6, b7, 7)
  const intervalLabels = React.useMemo(() => {
    const labels: Record<string, string> = {};
    const intervals = SCALE_TYPES[scaleType].intervals;
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const note = currentScaleNotes[i];
      let label = '';
      switch (interval) {
        case 0: label = '1'; break;
        case 1: label = 'b2'; break;
        case 2: label = '2'; break;
        case 3: label = 'b3'; break;
        case 4: label = '3'; break;
        case 5: label = '4'; break;
        case 6: label = 'b5'; break;
        case 7: label = '5'; break;
        case 8: label = 'b6'; break;
        case 9: label = '6'; break;
        case 10: label = 'b7'; break;
        case 11: label = '7'; break;
        default: label = interval.toString();
      }
      labels[note] = label;
    }
    return labels;
  }, [scaleType, currentScaleNotes]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      <div className="md:w-1/4 flex flex-col space-y-6">
        <div>
          <label htmlFor="rootNoteSelect" className="block text-sm font-medium mb-1">Root Note</label>
          <select
            id="rootNoteSelect"
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            className="w-full p-2 rounded border bg-white dark:bg-secondary-800 dark:border-secondary-700"
          >
            {ALL_NOTES.map(note => <option key={note} value={note}>{note}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="scaleTypeSelect" className="block text-sm font-medium mb-1">Scale Type</label>
          <select
            id="scaleTypeSelect"
            value={scaleType}
            onChange={(e) => {
              setScaleType(e.target.value as ScaleType);
              setSelectedPositionIndex(0);
            }}
            className="w-full p-2 rounded border bg-white dark:bg-secondary-800 dark:border-secondary-700"
          >
            {Object.entries(SCALE_TYPES).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {SCALE_TYPES[scaleType].description}
          </p>
        </div>

        {availablePositions.length > 0 && (
          <div>
            <label htmlFor="positionSelect" className="block text-sm font-medium mb-1">Position</label>
            <select
              id="positionSelect"
              value={selectedPositionIndex}
              onChange={(e) => setSelectedPositionIndex(parseInt(e.target.value, 10))}
              className="w-full p-2 rounded border bg-white dark:bg-secondary-800 dark:border-secondary-700"
            >
              <option value="0">All Positions</option>
              {availablePositions.map((pos, index) => (
                <option key={index + 1} value={index + 1}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Toggle for note vs interval view */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="showIntervals"
            checked={showIntervals}
            onChange={(e) => setShowIntervals(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="showIntervals" className="text-sm text-gray-700 dark:text-gray-300">
            Show interval labels
          </label>
        </div>

        <div className="text-sm">
          <p className="font-semibold">{SCALE_TYPES[scaleType].name} Scale</p>
          <p>Notes: {currentScaleNotes.join(', ')}</p>
          <p className="mt-2 italic text-gray-600 dark:text-gray-400">{SCALE_TYPES[scaleType].description}</p>
        </div>

      </div>

      <div className="flex-1">
        <FretboardDisplay
          displayMode="scale"
          rootNote={rootNote}
          scaleNotes={currentScaleNotes}
          highlightedPattern={highlightedPattern}
          intervalLabels={showIntervals ? intervalLabels : {}}
        />
      </div>
    </div>
  );
};

export default ScaleExplorer;