"use client";

import React, { useState, useEffect } from 'react';
import { Fretboard } from './Fretboard';
import { FretboardNote } from './FretboardNote';
import { FretboardMarker } from './FretboardMarker';
import { NotePosition, ALL_NOTES } from '@/hooks/useFretboard';

// Standard guitar tuning notes (from 6th string to 1st)
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// Number of frets to display
const FRET_COUNT = 24;

// Number of visible frets at a time
const VISIBLE_FRET_COUNT = 13;

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
interface ScalePosition {
  name: string;
  startFret: number;
  patternFrets: number[][];
}

type ScalePositions = {
  [key in ScaleType]?: ScalePosition[];
};

const SCALE_POSITIONS: ScalePositions = {
  minorPentatonic: [
    { // Position 1 (E shape)
      name: 'Position 1 (E shape)',
      startFret: 0,
      patternFrets: [
        [0, 3], // E string (6th)
        [0, 3], // A string (5th)
        [0, 2], // D string (4th)
        [0, 2], // G string (3rd)
        [0, 3], // B string (2nd)
        [0, 3], // E string (1st)
      ]
    },
    { // Position 2 (A shape)
      name: 'Position 2 (A shape)',
      startFret: 3,
      patternFrets: [
        [3, 5], // E string
        [3, 5], // A string
        [2, 5], // D string
        [2, 5], // G string
        [3, 5], // B string
        [3, 5], // E string
      ]
    },
    { // Position 3 (C shape)
      name: 'Position 3 (C shape)',
      startFret: 5,
      patternFrets: [
        [5, 8], // E string
        [5, 8], // A string
        [5, 7], // D string
        [5, 7], // G string
        [5, 8], // B string
        [5, 8], // E string
      ]
    },
    { // Position 4 (D shape)
      name: 'Position 4 (D shape)',
      startFret: 7,
      patternFrets: [
        [8, 10], // E string
        [7, 10], // A string
        [7, 10], // D string
        [7, 9], // G string
        [8, 10], // B string
        [8, 10], // E string
      ]
    },
    { // Position 5 (G shape)
      name: 'Position 5 (G shape)',
      startFret: 10,
      patternFrets: [
        [10, 12], // E string
        [10, 12], // A string
        [10, 12], // D string
        [9, 12], // G string
        [10, 12], // B string
        [10, 12], // E string
      ]
    },
  ],
  major: [
    { // Major Position 1
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 2, 3], // E string
        [0, 2, 3], // A string
        [0, 2], // D string
        [0, 2], // G string
        [0, 2, 3], // B string
        [0, 2, 3], // E string
      ]
    },
    { // Major Position 2
      name: 'Position 2',
      startFret: 2,
      patternFrets: [
        [3, 5], // E string
        [3, 5], // A string
        [2, 4, 5], // D string
        [2, 4], // G string
        [3, 5], // B string
        [3, 5], // E string
      ]
    },
  ],
  minor: [
    { // Minor Position 1
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 3], // E string
        [0, 2, 3], // A string
        [0, 2], // D string
        [0, 2], // G string
        [0, 3], // B string
        [0, 3], // E string
      ]
    },
  ],
  blues: [
    { // Blues Position 1
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 3], // E string
        [0, 3], // A string
        [0, 2], // D string
        [0, 1, 2], // G string (added blue note)
        [0, 3], // B string
        [0, 3], // E string
      ]
    },
  ],
  majorPentatonic: [
    { // Major Pentatonic Position 1
      name: 'Position 1',
      startFret: 0,
      patternFrets: [
        [0, 2], // E string
        [0, 2], // A string
        [0, 2], // D string
        [0, 2], // G string
        [0, 2], // B string
        [0, 2], // E string
      ]
    },
  ],
};

const ScaleExplorer: React.FC = () => {
  const [rootNote, setRootNote] = useState<string>('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minorPentatonic');
  const [position, setPosition] = useState<number>(0); // 0 means no specific position
  const [startFret, setStartFret] = useState<number>(0);

  // Calculate the notes in the selected scale
  const getScaleNotes = (): string[] => {
    const rootNoteIndex = ALL_NOTES.indexOf(rootNote);
    return SCALE_TYPES[scaleType].intervals.map(interval => {
      const noteIndex = (rootNoteIndex + interval) % 12;
      return ALL_NOTES[noteIndex];
    });
  };

  // Calculate if a note at a given position is in the scale
  const isNoteInScale = (stringIndex: number, fret: number): boolean => {
    const scaleNotes = getScaleNotes();
    const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[stringIndex]);
    const noteIndex = (openStringNoteIndex + fret) % 12;
    const note = ALL_NOTES[noteIndex];
    return scaleNotes.includes(note);
  };

  // Check if a note is the root note
  const isRootNote = (stringIndex: number, fret: number): boolean => {
    const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[stringIndex]);
    const noteIndex = (openStringNoteIndex + fret) % 12;
    return ALL_NOTES[noteIndex] === rootNote;
  };

  // Check if a note is part of the currently highlighted position pattern
  const isInHighlightedPattern = (stringIndex: number, fret: number): boolean => {
    if (position === 0 || !SCALE_POSITIONS[scaleType]) {
      return false;
    }
    
    const patternPositions = SCALE_POSITIONS[scaleType];
    if (!patternPositions || !patternPositions[position - 1]) {
      return false;
    }
    
    const currentPattern = patternPositions[position - 1];
    const rootIndex = ALL_NOTES.indexOf(rootNote);
    
    // A is at index 9 in the ALL_NOTES array, which is the reference for patterns
    const patternShift = rootIndex - 9; 
    
    // Relative position for this pattern
    // We calculate where the pattern should be for this root note
    const positionStartFret = Math.max(0, currentPattern.startFret + patternShift);
    
    // Now let's check if this fret is part of the pattern
    // We use actual fret numbers that are relative to the current root note
    for (let i = 0; i < currentPattern.patternFrets[stringIndex]?.length || 0; i++) {
      const patternFret = currentPattern.patternFrets[stringIndex][i];
      const actualFret = positionStartFret + (patternFret - currentPattern.startFret);
      
      if (fret === actualFret) {
        return true;
      }
    }
    
    return false;
  };

  // Get available positions for the current scale type
  const getAvailablePositions = () => {
    if (SCALE_POSITIONS[scaleType]) {
      return SCALE_POSITIONS[scaleType]!.map((pos, idx) => ({ id: idx + 1, name: pos.name }));
    }
    return [];
  };

  const availablePositions = getAvailablePositions();
  const hasPositions = availablePositions.length > 0;

  useEffect(() => {
    // Reset position when scale type changes
    setPosition(0);
  }, [scaleType]);

  useEffect(() => {
    // If position is selected, ensure it's valid for the current scale type
    if (position > 0) {
      const positions = SCALE_POSITIONS[scaleType];
      if (!positions || position > positions.length) {
        setPosition(0); // Reset to all positions if current position is invalid
      }
    }
  }, [scaleType, position]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-medium">Root Note:</label>
          <div className="relative inline-block">
            <select 
              value={rootNote}
              onChange={(e) => {
                setRootNote(e.target.value);
                // When root changes, we may need to adjust the fretboard view
                if (position > 0) {
                  const posPattern = SCALE_POSITIONS[scaleType]?.[position - 1];
                  if (posPattern) {
                    const rootIndex = ALL_NOTES.indexOf(e.target.value);
                    const patternShift = rootIndex - 9; // A is reference at index 9
                    // Set fret range to make pattern visible
                    const adjustedStartFret = Math.max(0, posPattern.startFret + patternShift);
                    setStartFret(Math.min(12, adjustedStartFret));
                  }
                }
              }}
              className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
              style={{ 
                WebkitAppearance: "none", 
                MozAppearance: "none", 
                appearance: "none",
                backgroundImage: "none"
              }}
            >
              {ALL_NOTES.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <label className="text-sm font-medium ml-4">Scale:</label>
          <div className="relative inline-block">
            <select 
              value={scaleType}
              onChange={(e) => {
                setScaleType(e.target.value as ScaleType);
                setPosition(0); // Reset position when scale changes
              }}
              className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
              style={{ 
                WebkitAppearance: "none", 
                MozAppearance: "none", 
                appearance: "none",
                backgroundImage: "none"
              }}
            >
              {Object.entries(SCALE_TYPES).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {hasPositions && (
            <>
              <label className="text-sm font-medium ml-4">Position:</label>
              <div className="relative inline-block">
                <select
                  value={position}
                  onChange={(e) => {
                    const newPosition = parseInt(e.target.value, 10);
                    setPosition(newPosition);
                    
                    // Automatically adjust fretboard view to show the selected position
                    if (newPosition > 0 && SCALE_POSITIONS[scaleType] && SCALE_POSITIONS[scaleType]![newPosition - 1]) {
                      const posPattern = SCALE_POSITIONS[scaleType]![newPosition - 1];
                      const rootIndex = ALL_NOTES.indexOf(rootNote);
                      const patternShift = rootIndex - 9; // Adjust for root note
                      
                      // Adjust for the root note
                      const adjustedStartFret = Math.max(0, posPattern.startFret + patternShift);
                      // Ensure we don't go past maximum fret position
                      setStartFret(Math.min(12, adjustedStartFret));
                    }
                  }}
                  className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
                  style={{ 
                    WebkitAppearance: "none", 
                    MozAppearance: "none", 
                    appearance: "none",
                    backgroundImage: "none"
                  }}
                >
                  <option value="0">All Positions</option>
                  {availablePositions.map((pos: {id: number, name: string}) => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startFret > 0 && setStartFret(startFret - 1)}
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
            onClick={() => startFret < 12 && setStartFret(startFret + 1)}
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
      
      <div className="p-2 bg-secondary-50 dark:bg-secondary-900 mb-6 rounded-lg text-sm text-secondary-600 dark:text-secondary-300">
        {SCALE_TYPES[scaleType].description}
      </div>
      
      <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow-inner overflow-x-auto">
        <Fretboard
          tuning={STANDARD_TUNING}
          fretCount={FRET_COUNT}
          startFret={startFret}
          visibleFretCount={VISIBLE_FRET_COUNT}
          renderNote={(note, position) => {
            const inScale = isNoteInScale(position.string, position.fret);
            const isRoot = isRootNote(position.string, position.fret);
            const inPattern = isInHighlightedPattern(position.string, position.fret);

            if (!inScale) return null;

            return (
              <FretboardNote
                note={note}
                position={position}
                isActive={isRoot}
                isNatural={note.length === 1}
                className={inPattern ? 'border-[3px] border-orange-500 dark:border-yellow-300' : ''}
              />
            );
          }}
          renderFretMarker={(fret) => <FretboardMarker fret={fret} />}
        />
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
          <h3 className="font-semibold mb-2">Scale Formula</h3>
          <div className="flex flex-wrap gap-2">
            {SCALE_TYPES[scaleType].intervals.map((interval) => {
              let degreeName = '';
              switch (interval) {
                case 0: degreeName = '1 (Root)'; break;
                case 1: degreeName = 'b2 (Minor 2nd)'; break;
                case 2: degreeName = '2 (Major 2nd)'; break;
                case 3: degreeName = 'b3 (Minor 3rd)'; break;
                case 4: degreeName = '3 (Major 3rd)'; break;
                case 5: degreeName = '4 (Perfect 4th)'; break;
                case 6: degreeName = 'b5 (Diminished 5th)'; break;
                case 7: degreeName = '5 (Perfect 5th)'; break;
                case 8: degreeName = 'b6 (Minor 6th)'; break;
                case 9: degreeName = '6 (Major 6th)'; break;
                case 10: degreeName = 'b7 (Minor 7th)'; break;
                case 11: degreeName = '7 (Major 7th)'; break;
                default: degreeName = '?';
              }
              
              return (
                <div key={interval} className="px-3 py-1 bg-white dark:bg-secondary-700 rounded-md text-sm">
                  {degreeName}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
          <h3 className="font-semibold mb-2">Notes in {rootNote} {SCALE_TYPES[scaleType].name}</h3>
          <div className="flex flex-wrap gap-2">
            {getScaleNotes().map(note => (
              <div 
                key={note} 
                className={`px-3 py-1 rounded-md text-sm ${
                  note === rootNote 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white dark:bg-secondary-800'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleExplorer; 