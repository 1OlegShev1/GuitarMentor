"use client";

import { useState, useEffect } from 'react';

// Standard guitar tuning notes (from 6th string to 1st)
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// Number of frets to display
const FRET_COUNT = 24;

// All music notes
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Note indices in the ALL_NOTES array for each open string
const OPEN_STRING_INDICES = [
  7, // E (index 7 in ALL_NOTES)
  0, // A (index 0 in ALL_NOTES)
  5, // D (index 5 in ALL_NOTES)
  10, // G (index 10 in ALL_NOTES)
  2, // B (index 2 in ALL_NOTES)
  7, // E (index 7 in ALL_NOTES)
];

type FretboardMode = 'explore' | 'identify' | 'find' | 'byString' | 'octaves';

type NotePosition = {
  string: number;
  fret: number;
};

type FretboardProps = {
  showPractice?: boolean;
};

const FretboardDisplay: React.FC<FretboardProps> = ({ showPractice = false }) => {
  const [showNaturalOnly, setShowNaturalOnly] = useState(false);
  const [highlightNote, setHighlightNote] = useState<string | null>(null);
  const [startFret, setStartFret] = useState(0);
  const [mode, setMode] = useState<FretboardMode>('explore');
  
  // Practice mode states
  const [quizNote, setQuizNote] = useState<string | null>(null);
  const [quizPosition, setQuizPosition] = useState<NotePosition | null>(null);
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<NotePosition | null>(null);

  // Effect to handle the showPractice prop
  useEffect(() => {
    if (showPractice && mode === 'explore') {
      // Only activate a specific practice mode if triggered externally
      // but leave the UI in place
    }
  }, [showPractice, mode]);

  // Initialize practice modes
  useEffect(() => {
    if (mode === 'identify') {
      generateIdentifyQuestion();
    } else if (mode === 'find') {
      generateFindQuestion();
    } else if (mode === 'byString') {
      setSelectedString(Math.floor(Math.random() * 6));
    } else if (mode === 'octaves') {
      const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
      setHighlightNote(randomNote);
    }
  }, [mode]);

  // Calculate note at a given string and fret
  const getNoteAtPosition = (stringIndex: number, fret: number): string => {
    const openStringNoteIndex = OPEN_STRING_INDICES[stringIndex];
    const noteIndex = (openStringNoteIndex + fret) % 12;
    return ALL_NOTES[noteIndex];
  };

  // Check if a note is a natural note (no sharp or flat)
  const isNaturalNote = (note: string): boolean => {
    return note.length === 1;
  };

  // Generate a random position on the fretboard for "Identify Notes" mode
  const generateIdentifyQuestion = () => {
    const randomString = Math.floor(Math.random() * 6);
    const randomFret = Math.floor(Math.random() * (FRET_COUNT + 1));
    const position = { string: randomString, fret: randomFret };
    setQuizPosition(position);
    setQuizNote(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
  };

  // Generate a note for the "Find Notes" mode
  const generateFindQuestion = () => {
    const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
    setQuizNote(randomNote);
    setQuizPosition(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
  };

  // Handle user clicking on a note for practice modes
  const handleNoteClick = (stringIndex: number, fret: number, note: string) => {
    if (mode === 'explore') {
      setHighlightNote(highlightNote === note ? null : note);
    } else if (mode === 'identify' && quizPosition) {
      if (stringIndex === quizPosition.string && fret === quizPosition.fret) {
        setUserAnswer(note);
        setQuizResult('correct');
        setTimeout(() => {
          generateIdentifyQuestion();
        }, 1500);
      } else {
        setUserAnswer(note);
        setQuizResult('incorrect');
      }
    } else if (mode === 'find' && quizNote) {
      if (note === quizNote) {
        setQuizResult('correct');
        setTimeout(() => {
          generateFindQuestion();
        }, 1500);
      } else {
        setQuizResult('incorrect');
      }
    } else if (mode === 'byString') {
      setHighlightNote(note);
    } else if (mode === 'octaves') {
      // This mode just uses the highlight functionality which is handled by default
      setHighlightNote(note);
    }
  };

  // Should we show this note based on current filters
  const shouldShowNote = (note: string, stringIndex: number, fretNum: number): boolean => {
    // In quiz modes, we show notes differently
    if (mode === 'identify') {
      // Only show the note at the quiz position when showing answer
      if (quizPosition && stringIndex === quizPosition.string && fretNum === quizPosition.fret) {
        return showAnswer;
      }
      return false;
    } else if (mode === 'find') {
      // In find mode, we show all instances of the quiz note when showing answer
      if (showAnswer && quizNote && note === quizNote) {
        return true;
      }
      // Otherwise hide all notes unless clicked
      return quizResult === 'correct' && note === quizNote;
    } else if (mode === 'byString') {
      // In string mode, only show notes on the selected string
      return selectedString === stringIndex;
    } else {
      // Normal explore mode - show based on natural/all toggle
      if (showNaturalOnly) {
        return isNaturalNote(note) || (highlightNote !== null && note === highlightNote);
      }
      return true;
    }
  };
  
  // Change start fret position if we're viewing a subset of the neck
  const moveStartFret = (direction: 'left' | 'right') => {
    if (direction === 'left' && startFret > 0) {
      setStartFret(startFret - 1);
    } else if (direction === 'right' && startFret < FRET_COUNT - 12) {
      setStartFret(startFret + 1);
    }
  };
  
  // Determine visible fret range - always show 13 frets (12 + nut)
  const visibleFretCount = 13;
  const fretsToShow = Math.min(visibleFretCount, FRET_COUNT + 1 - startFret);

  // Reset to explore mode
  const resetToExploreMode = () => {
    setMode('explore');
    setHighlightNote(null);
    setQuizNote(null);
    setQuizPosition(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
  };

  // Get quiz instruction text
  const getQuizInstructionText = () => {
    if (mode === 'identify') {
      return `What note is at the highlighted position? (String ${quizPosition ? quizPosition.string + 1 : ''}, Fret ${quizPosition ? quizPosition.fret : ''})`;
    } else if (mode === 'find') {
      return `Find all occurrences of the note ${quizNote} on the fretboard`;
    } else if (mode === 'byString') {
      return `Notes on string ${selectedString !== null ? selectedString + 1 : ''} (${selectedString !== null ? STANDARD_TUNING[selectedString] : ''})`;
    } else if (mode === 'octaves') {
      return `Find all octaves of ${highlightNote || 'the selected note'} on the fretboard`;
    }
    return '';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap space-x-2 gap-y-2 mb-4">
        {mode === 'explore' && (
          <button
            onClick={() => setShowNaturalOnly(!showNaturalOnly)}
            className={`px-3 py-1 rounded-md text-sm ${
              showNaturalOnly
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
            }`}
          >
            {showNaturalOnly ? 'Natural Notes Only' : 'Show All Notes'}
          </button>
        )}
        
        {mode !== 'explore' && (
          <>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`px-3 py-1 rounded-md text-sm ${
                showAnswer
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
              }`}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            
            <button
              onClick={() => {
                if (mode === 'identify') {
                  generateIdentifyQuestion();
                } else if (mode === 'find') {
                  generateFindQuestion();
                } else if (mode === 'byString') {
                  setSelectedString((selectedString === null ? 0 : (selectedString + 1) % 6));
                } else if (mode === 'octaves') {
                  const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
                  setHighlightNote(randomNote);
                }
              }}
              className="px-3 py-1 rounded-md text-sm bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
            >
              New Question
            </button>
            
            <button
              onClick={resetToExploreMode}
              className="px-3 py-1 rounded-md text-sm bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
            >
              Exit Practice
            </button>
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => moveStartFret('left')}
            disabled={startFret === 0}
            className={`px-2 py-1 rounded-md ${
              startFret === 0
                ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 cursor-not-allowed'
                : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300'
            }`}
          >
            ←
          </button>
          <span className="text-sm">Fret {startFret}</span>
          <button
            onClick={() => moveStartFret('right')}
            disabled={startFret >= FRET_COUNT - 12}
            className={`px-2 py-1 rounded-md ${
              startFret >= FRET_COUNT - 12
                ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 cursor-not-allowed'
                : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300'
            }`}
          >
            →
          </button>
        </div>
      </div>

      {mode === 'explore' && (
        <div className="mt-4 mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-secondary-700 shadow-sm">
          <h2 className="text-lg font-bold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Practice Modes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => {
                setMode('identify');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Identify Notes</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">Name the note at a highlighted position</span>
            </button>
            
            <button 
              onClick={() => {
                setMode('find');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Find Notes</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">Locate a specific note across the fretboard</span>
            </button>
            
            <button 
              onClick={() => {
                setMode('byString');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Notes by String</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">See all notes on one string at a time</span>
            </button>
            
            <button 
              onClick={() => {
                setMode('octaves');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Octave Shapes</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">Learn the pattern of octaves on the fretboard</span>
            </button>
          </div>
        </div>
      )}

      {mode !== 'explore' && (
        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <h3 className="font-medium mb-1">{getQuizInstructionText()}</h3>
        </div>
      )}
      
      {mode === 'identify' && (
        <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg">
          <h3 className="font-medium mb-2">Select your answer:</h3>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-2">
            {ALL_NOTES.map((note) => (
              <button
                key={note}
                onClick={() => {
                  if (!quizPosition) return;
                  const correctNote = getNoteAtPosition(quizPosition.string, quizPosition.fret);
                  setUserAnswer(note);
                  if (note === correctNote) {
                    setQuizResult('correct');
                    setTimeout(() => {
                      generateIdentifyQuestion();
                    }, 1500);
                  } else {
                    setQuizResult('incorrect');
                  }
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    userAnswer === note
                      ? userAnswer === getNoteAtPosition(quizPosition?.string || 0, quizPosition?.fret || 0)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : isNaturalNote(note)
                      ? 'bg-secondary-800 dark:bg-secondary-200 text-white dark:text-secondary-800'
                      : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                  }
                  hover:scale-110 transition-transform
                `}
              >
                {note}
              </button>
            ))}
          </div>
          {quizResult && (
            <div className={`p-2 rounded ${quizResult === 'correct' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-sm font-medium ${quizResult === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {quizResult === 'correct' 
                  ? 'Correct! Moving to next question...' 
                  : `Incorrect. Try again or click "Show Answer" to reveal the correct note.`}
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Fret numbers */}
          <div className="flex border-b-2 border-secondary-400 dark:border-secondary-500 mb-2">
            <div className="w-10 flex-shrink-0"></div>
            {Array.from({ length: fretsToShow }).map((_, fretNumIndex) => {
              const fretNum = startFret + fretNumIndex;
              return (
                <div
                  key={`fret-${fretNum}`}
                  className={`flex-1 text-center py-2 font-medium ${
                    fretNum === 0 ? 'text-secondary-500 font-bold' : ''
                  } ${[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fretNum) ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}`}
                >
                  {fretNum}
                </div>
              );
            })}
          </div>

          {/* String rows */}
          {STANDARD_TUNING.map((stringNote, stringIndex) => (
            <div
              key={`string-${stringIndex}`}
              className="flex border-b border-secondary-300 dark:border-secondary-600 last:border-b-0"
            >
              {/* String name */}
              <div 
                className={`w-10 flex-shrink-0 flex items-center justify-center font-semibold ${
                  selectedString === stringIndex 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-primary-700 dark:text-primary-300'
                }`}
                onClick={() => mode === 'byString' && setSelectedString(stringIndex)}
              >
                {stringNote}
              </div>

              {/* Frets for this string */}
              {Array.from({ length: fretsToShow }).map((_, fretNumIndex) => {
                const fretNum = startFret + fretNumIndex;
                const note = getNoteAtPosition(stringIndex, fretNum);
                const isNatural = isNaturalNote(note);
                const showNote = shouldShowNote(note, stringIndex, fretNum);
                const isActive = highlightNote === note;
                const isQuizPosition = quizPosition && stringIndex === quizPosition.string && fretNum === quizPosition.fret;
                const isHovering = hoverPosition && hoverPosition.string === stringIndex && hoverPosition.fret === fretNum;

                return (
                  <div
                    key={`string-${stringIndex}-fret-${fretNum}`}
                    className={`flex-1 relative flex items-center justify-center ${
                      fretNum === 0 ? 'bg-secondary-100 dark:bg-secondary-700/50' : ''
                    } min-h-[44px] ${fretNum > 0 ? 'border-l border-secondary-400 dark:border-secondary-600' : ''}
                      ${isQuizPosition ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}
                    onMouseEnter={() => mode !== 'explore' && setHoverPosition({ string: stringIndex, fret: fretNum })}
                    onMouseLeave={() => setHoverPosition(null)}
                    onClick={() => isQuizPosition || handleNoteClick(stringIndex, fretNum, note)}
                  >
                    {/* Fret markers */}
                    {stringIndex === 0 && [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fretNum) && (
                      <div className="absolute -top-2 inset-x-0 flex justify-center">
                        <div className={`w-3 h-3 rounded-full ${[12, 24].includes(fretNum) ? 'bg-primary-500' : 'bg-secondary-400'}`}></div>
                      </div>
                    )}

                    {/* Rendered note */}
                    {(showNote || (mode === 'identify' && isQuizPosition)) && (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer
                          ${
                            isActive || (quizResult === 'correct' && note === quizNote)
                              ? 'bg-primary-600 text-white'
                              : isQuizPosition && !showAnswer
                              ? 'bg-yellow-400 dark:bg-yellow-600 text-white'
                              : isNatural
                              ? 'bg-secondary-800 dark:bg-secondary-200 text-white dark:text-secondary-800'
                              : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                          }
                          hover:scale-110 transition-transform
                        `}
                      >
                        {isQuizPosition && !showAnswer ? '?' : note}
                      </div>
                    )}

                    {/* Show empty circle on hover in practice modes */}
                    {mode !== 'explore' && 
                     !showNote && 
                     !(mode === 'identify' && isQuizPosition) && 
                     isHovering && (
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-secondary-400 dark:border-secondary-500 flex items-center justify-center">
                        {/* Empty circle for hovering */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {highlightNote && mode === 'explore' && (
        <div className="mt-4 p-3 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg">
          <h3 className="font-medium mb-1">Highlighted Note: {highlightNote}</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Click on notes to highlight them across the fretboard. Click again to clear.
          </p>
        </div>
      )}
    </div>
  );
};

export default FretboardDisplay; 