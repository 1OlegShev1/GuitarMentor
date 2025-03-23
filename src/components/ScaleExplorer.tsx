"use client";

import { useState } from 'react';

// All music notes
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'A minor scale with a raised 6th, common in jazz and rock.',
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'A major scale with a flatted 7th, common in blues and rock.',
  },
};

type ScaleType = keyof typeof SCALE_TYPES;

// Standard guitar tuning (from 6th string to 1st)
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// Note indices in the ALL_NOTES array for each open string
const OPEN_STRING_INDICES = [
  7, // E (index 7 in ALL_NOTES)
  0, // A (index 0 in ALL_NOTES)
  5, // D (index 5 in ALL_NOTES)
  10, // G (index 10 in ALL_NOTES)
  2, // B (index 2 in ALL_NOTES)
  7, // E (index 7 in ALL_NOTES)
];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ScaleExplorerProps {
  // Add props as needed
}

const ScaleExplorer: React.FC<ScaleExplorerProps> = () => {
  const [rootNote, setRootNote] = useState<string>('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minorPentatonic');
  const [/*position,*/ /*setPosition*/] = useState<number>(0);
  const [fretCount, /*setFretCount*/] = useState<number>(24);
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
    const openStringNoteIndex = OPEN_STRING_INDICES[stringIndex];
    const noteIndex = (openStringNoteIndex + fret) % 12;
    const note = ALL_NOTES[noteIndex];
    return scaleNotes.includes(note);
  };

  // Get the note at a given position
  const getNoteAtPosition = (stringIndex: number, fret: number): string => {
    const openStringNoteIndex = OPEN_STRING_INDICES[stringIndex];
    const noteIndex = (openStringNoteIndex + fret) % 12;
    return ALL_NOTES[noteIndex];
  };

  // Check if a note is the root note
  const isRootNote = (stringIndex: number, fret: number): boolean => {
    return getNoteAtPosition(stringIndex, fret) === rootNote;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-medium">Root Note:</label>
          <div className="relative inline-block">
            <select 
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
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
              onChange={(e) => setScaleType(e.target.value as ScaleType)}
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
        <div className="min-w-[700px]">
          {/* Fretboard visualization */}
          <div className="flex border-b border-secondary-300 dark:border-secondary-600">
            <div className="w-10 flex-shrink-0"></div>
            {Array.from({ length: fretCount + 1 }).map((_, fretNum) => {
              const currentFret = startFret + fretNum;
              if (currentFret > 24) return null;
              return (
                <div
                  key={`fret-${fretNum}`}
                  className={`flex-1 text-center py-2 font-medium ${
                    [0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(currentFret) ? 'text-primary-600' : ''
                  }`}
                >
                  {currentFret}
                </div>
              );
            })}
          </div>

          {/* String rows */}
          {STANDARD_TUNING.map((stringNote, stringIndex) => (
            <div
              key={`string-${stringIndex}`}
              className="flex border-b border-secondary-200 dark:border-secondary-700 last:border-b-0"
            >
              {/* String name */}
              <div className="w-10 flex-shrink-0 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-300">
                {stringNote}
              </div>

              {/* Frets for this string */}
              {Array.from({ length: fretCount + 1 }).map((_, fretNum) => {
                const currentFret = startFret + fretNum;
                if (currentFret > 24) return null;
                
                const inScale = isNoteInScale(stringIndex, currentFret);
                const isRoot = isRootNote(stringIndex, currentFret);
                const note = getNoteAtPosition(stringIndex, currentFret);
                
                return (
                  <div
                    key={`string-${stringIndex}-fret-${fretNum}`}
                    className={`flex-1 flex items-center justify-center min-h-[40px] ${
                      currentFret === 0 ? 'bg-secondary-100 dark:bg-secondary-700/50' : ''
                    }`}
                  >
                    {inScale && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                          ${
                            isRoot
                              ? 'bg-primary-600 text-white'
                              : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                          }
                        `}
                      >
                        {note}
                      </div>
                    )}
                    
                    {/* Fret markers at traditional positions */}
                    {stringIndex === 0 && [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(currentFret) && (
                      <div className="absolute -top-1 inset-x-0 flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          [12, 24].includes(currentFret) ? 'bg-primary-500' : 'bg-secondary-400'
                        }`}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
          <h3 className="font-semibold mb-2">Scale Formula</h3>
          <div className="flex flex-wrap gap-2">
            {SCALE_TYPES[scaleType].intervals.map((interval) => {
              let degreeName = '';
              switch (interval) {
                case 0: degreeName = '1 (Root)'; break;
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