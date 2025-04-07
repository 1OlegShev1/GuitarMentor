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

const SCALE_POSITIONS: ScalePositionsMap = {
  minorPentatonic: [
    {
      name: 'Position 1 (Root 6th Str)',
      rootStringIndex: 0,
      relativeFrets: [[0, 3], [0, 2], [0, 2], [0, 2], [0, 3], [0, 3]],
    },
    {
      name: 'Position 2 (Root 4th Str)',
      rootStringIndex: 2,
      relativeFrets: [[0, 2], [0, 2], [-1, 2], [-1, 2], [0, 3], [0, 2]],
    },
    {
      name: 'Position 3 (Root 5th Str)',
      rootStringIndex: 1,
      relativeFrets: [[0, 2], [0, 2], [-1, 2], [-1, 2], [0, 2], [0, 2]],
    },
    {
      name: 'Position 4 (Root 3rd Str)',
      rootStringIndex: 3,
      relativeFrets: [[0, 3], [0, 2], [0, 2], [-1, 2], [0, 3], [0, 3]],
    },
    {
      name: 'Position 5 (Root 2nd Str)',
      rootStringIndex: 4,
      relativeFrets: [[0, 2], [0, 3], [0, 2], [0, 2], [-1, 2], [0, 2]],
    },
  ],
  major: [
    {
      name: 'Position 1 (E Shape)',
      rootStringIndex: 0, 
      relativeFrets: [[0, 2, 4], [0, 2, 4], [1, 2, 4], [1, 2, 4], [2, 4, 5], [2, 4, 5]]
    },
    {
      name: 'Position 2 (D Shape)',
      rootStringIndex: 2,
      relativeFrets: [[-2, 0, 2], [-2, 0, 2], [0, 2, 3], [0, 2, 4], [0, 2, 3], [-2, 0, 2]]
    },
    {
      name: 'Position 3 (C Shape)',
      rootStringIndex: 4,
      relativeFrets: [[-1, 0, 2], [-1, 0, 2], [-1, 0, 2], [-1, 0, 2], [0, 2, 3], [0, 2, 3]]
    },
    {
      name: 'Position 4 (A Shape)',
      rootStringIndex: 1,
      relativeFrets: [[0, 2, 3], [0, 2, 4], [0, 2, 4], [1, 2, 4], [1, 3, 4], [1, 3, 4]]
    },
    {
      name: 'Position 5 (G Shape)',
      rootStringIndex: 3,
      relativeFrets: [[0, 2, 4], [1, 2, 4], [1, 2, 4], [1, 3, 4], [2, 4, 5], [2, 4]]
    }
  ],
  minor: [
    {
      name: 'Position 1 (Em Shape)',
      rootStringIndex: 0,
      relativeFrets: [[0, 2, 3], [0, 2, 3], [0, 2, 4], [0, 2, 4], [1, 2, 4], [1, 3, 4]]
    },
    {
      name: 'Position 2 (Dm Shape)',
      rootStringIndex: 2,
      relativeFrets: [[0, 1, 3], [0, 1, 3], [0, 2, 3], [0, 2, 4], [0, 2], [1, 3]]
    },
    {
      name: 'Position 3 (Cm Shape)',
      rootStringIndex: 4,
      relativeFrets: [[-2, 0, 1], [-2, 0, 1], [-2, 0, 2], [-1, 0, 2], [-1, 0, 2], [-2, 0]]
    },
    {
      name: 'Position 4 (Am Shape)',
      rootStringIndex: 1,
      relativeFrets: [[0, 2, 3], [0, 2, 3], [0, 2, 4], [0, 2], [1, 3], [0, 2]]
    },
    {
      name: 'Position 5 (Gm Shape)',
      rootStringIndex: 3,
      relativeFrets: [[0, 1, 3], [0, 2, 3], [0, 2, 3], [0, 2], [1, 3], [0, 1]]
    }
  ],
  blues: [
    {
      name: 'Position 1',
      rootStringIndex: 0, 
      relativeFrets: [[0, 3], [0, 2], [0, 2], [0, 1, 2], [0, 3], [0, 3]] 
    },
    {
      name: 'Position 2',
      rootStringIndex: 2, 
      relativeFrets: [[0, 2], [0, 2], [-1, 2], [-1, 0, 2], [0, 3], [0, 2]]
    },
    {
      name: 'Position 3',
      rootStringIndex: 1,
      relativeFrets: [[0, 2], [0, 2], [-1, 1, 2], [-1, 2], [0, 2], [0, 2]]
    },
    {
      name: 'Position 4',
      rootStringIndex: 3, 
      relativeFrets: [[0, 3], [0, 2], [0, 2], [-1, 2], [-1, 1, 2], [0, 3]]
    },
    {
      name: 'Position 5',
      rootStringIndex: 4,
      relativeFrets: [[0, 2], [0, 3], [0, 2], [0, 2], [-1, 2], [0, 1, 2]]
    }
  ],
  majorPentatonic: [
    {
      name: 'Position 1',
      rootStringIndex: 0,
      relativeFrets: [[0, 2], [0, 2], [-1, 1], [-1, 1], [0, 2], [0, 2]]
    },
    {
      name: 'Position 2',
      rootStringIndex: 1,
      relativeFrets: [[-3, -1], [0, 2], [-1, 1], [-1, 1], [0, 2], [0, 2]]
    },
    {
      name: 'Position 3',
      rootStringIndex: 2,
      relativeFrets: [[-2, 0], [-3, -1], [0, 2], [-1, 1], [0, 2], [-3, -1]]
    },
    {
      name: 'Position 4',
      rootStringIndex: 3,
      relativeFrets: [[-2, 0], [-1, 1], [-1, 1], [-2, 0], [0, 2], [-2, 0]]
    },
    {
      name: 'Position 5',
      rootStringIndex: 4,
      relativeFrets: [[-2, 0], [-1, 1], [-1, 1], [-2, 0], [-2, 0], [-1, 1]]
    }
  ],
};

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

  // Calculate the notes in the selected scale
  const currentScaleNotes = React.useMemo(() => {
    const rootNoteIndex = ALL_NOTES.indexOf(rootNote);
    if (rootNoteIndex === -1) return [];
    return SCALE_TYPES[scaleType].intervals.map(interval => {
      const noteIndex = (rootNoteIndex + interval) % 12;
      return ALL_NOTES[noteIndex];
    });
  }, [rootNote, scaleType]);

  // Get available positions for the current scale type (ONLY explicitly defined ones)
  const availablePositions = React.useMemo(() => {
    // Return only positions defined in the constant
    return SCALE_POSITIONS[scaleType]?.filter(p => p.relativeFrets) || []; 
  }, [scaleType]);

  // Calculate the NotePosition[] for the highlighted pattern
  const highlightedPattern = React.useMemo((): NotePosition[] => {
    const explicitPositions = SCALE_POSITIONS[scaleType]?.filter(p => p.relativeFrets) || [];

    // Case 1: Explicit positions exist AND a specific one is selected
    if (explicitPositions.length > 0 && selectedPositionIndex > 0) {
      const positionDef = explicitPositions[selectedPositionIndex - 1];
      if (!positionDef) return []; // Safety check

      const { rootStringIndex, relativeFrets } = positionDef;
      const rootNoteMidi = ALL_NOTES.indexOf(rootNote);
      if (rootNoteMidi === -1) return [];

      let rootFret = -1;
      const openStringMidi = ALL_NOTES.indexOf(STANDARD_TUNING[rootStringIndex]);
      for (let fret = 0; fret < 15; fret++) {
          if ((openStringMidi + fret) % 12 === rootNoteMidi) {
              rootFret = fret;
              break;
          }
      }
      if (rootFret === -1) {
          console.warn(`Could not find root note ${rootNote} on string ${rootStringIndex} for position ${positionDef.name}`);
          return [];
      }

      const patternNotes: NotePosition[] = [];
      relativeFrets.forEach((fretsOnString, stringIdx) => {
        fretsOnString.forEach(relativeFret => {
          const absoluteFret = rootFret + relativeFret;
          if (absoluteFret >= 0 && absoluteFret <= 24) { 
              patternNotes.push({ string: stringIdx, fret: absoluteFret });
          }
        });
      });
      return patternNotes;
    } 
    // Case 2: NO explicit positions defined for this scale type
    else if (explicitPositions.length === 0 && scaleType !== 'wholeTone') {
       // Automatically generate and return the Root on 6th fallback pattern
       const fallbackPatternDef = generateRootOn6thPattern(SCALE_TYPES[scaleType].intervals, rootNote);
       if (!fallbackPatternDef) return []; // Could not generate fallback

       // Need to calculate absolute frets for the fallback
       const { rootStringIndex, relativeFrets } = fallbackPatternDef;
       const rootNoteMidi = ALL_NOTES.indexOf(rootNote);
       if (rootNoteMidi === -1) return [];
       let rootFret = -1;
       const openStringMidi = ALL_NOTES.indexOf(STANDARD_TUNING[rootStringIndex]);
       for (let fret = 0; fret < 15; fret++) {
           if ((openStringMidi + fret) % 12 === rootNoteMidi) {
               rootFret = fret;
               break;
           }
       }
       if (rootFret === -1) return [];
       
       const patternNotes: NotePosition[] = [];
       relativeFrets.forEach((fretsOnString, stringIdx) => {
          fretsOnString.forEach(relativeFret => {
            const absoluteFret = rootFret + relativeFret;
            if (absoluteFret >= 0 && absoluteFret <= 24) { 
                patternNotes.push({ string: stringIdx, fret: absoluteFret });
            }
          });
       });
       return patternNotes;
    }
    
    // Case 3: "All Positions" selected or other cases
    return []; // Return empty array to show all scale notes without specific highlighting

  }, [rootNote, scaleType, selectedPositionIndex, availablePositions]); // Include scaleType here

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
        />
      </div>
    </div>
  );
};

export default ScaleExplorer;