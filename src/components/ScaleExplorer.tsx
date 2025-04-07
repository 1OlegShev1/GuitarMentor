"use client";

import React, { useState, useEffect } from 'react';
import FretboardDisplay from './FretboardDisplay';
import { NotePosition, ALL_NOTES } from '@/hooks/useFretboard';

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
  startFret: number;
  patternFrets: number[][];
}

type ScalePositionsMap = {
  [key in ScaleType]?: ScalePositionDef[];
};

const SCALE_POSITIONS: ScalePositionsMap = {
  minorPentatonic: [
    {
      name: 'Position 1',
      startFret: 0,
      patternFrets: [[0, 3], [0, 3], [0, 2], [0, 2], [0, 3], [0, 3]]
    },
    {
      name: 'Position 2',
      startFret: 3,
      patternFrets: [[3, 5], [3, 5], [2, 5], [2, 5], [3, 5], [3, 5]]
    },
    {
      name: 'Position 3',
      startFret: 5,
      patternFrets: [[5, 8], [5, 8], [5, 7], [5, 7], [5, 8], [5, 8]]
    },
    {
      name: 'Position 4',
      startFret: 7,
      patternFrets: [[8, 10], [7, 10], [7, 10], [7, 9], [8, 10], [8, 10]]
    },
    {
      name: 'Position 5',
      startFret: 10,
      patternFrets: [[10, 12], [10, 12], [10, 12], [9, 12], [10, 12], [10, 12]]
    },
  ],
  major: [
    {
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 2, 3],
        [0, 2, 3],
        [0, 2],
        [0, 2],
        [0, 2, 3],
        [0, 2, 3],
      ]
    },
    {
      name: 'Position 2',
      startFret: 2,
      patternFrets: [
        [3, 5],
        [3, 5],
        [2, 4, 5],
        [2, 4],
        [3, 5],
        [3, 5],
      ]
    },
  ],
  minor: [
    {
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 3],
        [0, 2, 3],
        [0, 2],
        [0, 2],
        [0, 3],
        [0, 3],
      ]
    },
  ],
  blues: [
    {
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 3],
        [0, 3],
        [0, 2],
        [0, 1, 2],
        [0, 3],
        [0, 3],
      ]
    },
  ],
  majorPentatonic: [
    {
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 2],
        [0, 2],
        [0, 2],
        [0, 2],
        [0, 2],
        [0, 2],
      ]
    },
  ],
};

const ScaleExplorer: React.FC = () => {
  const [rootNote, setRootNote] = useState<string>('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minorPentatonic');
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number>(0);

  // Calculate the notes in the selected scale
  const currentScaleNotes = React.useMemo(() => {
    const rootNoteIndex = ALL_NOTES.indexOf(rootNote);
    if (rootNoteIndex === -1) return [];
    return SCALE_TYPES[scaleType].intervals.map(interval => {
      const noteIndex = (rootNoteIndex + interval) % 12;
      return ALL_NOTES[noteIndex];
    });
  }, [rootNote, scaleType]);

  // Get available positions for the current scale type
  const availablePositions = React.useMemo(() => {
    return SCALE_POSITIONS[scaleType] || [];
  }, [scaleType]);

  // Calculate the NotePosition[] for the highlighted pattern
  const highlightedPattern = React.useMemo((): NotePosition[] => {
    if (selectedPositionIndex === 0 || availablePositions.length === 0) {
      return [];
    }
    const positionDef = availablePositions[selectedPositionIndex - 1];
    if (!positionDef) return [];

    const patternNotes: NotePosition[] = [];
    positionDef.patternFrets.forEach((fretsOnString, stringIndex) => {
      fretsOnString.forEach(fret => {
        patternNotes.push({ string: stringIndex, fret: fret });
      });
    });
    return patternNotes;
  }, [selectedPositionIndex, availablePositions]);

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
              <option value={0}>Show All Notes</option>
              {availablePositions.map((pos, index) => (
                <option key={index + 1} value={index + 1}>{pos.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="md:w-3/4">
        <FretboardDisplay
          displayMode="scale"
          scaleNotes={currentScaleNotes}
          rootNote={rootNote}
          highlightedPattern={highlightedPattern}
        />
      </div>
    </div>
  );
};

export default ScaleExplorer; 