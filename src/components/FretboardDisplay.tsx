"use client";

import { useState, useEffect } from 'react';

// Standard guitar tuning notes (from 6th string to 1st)
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// Number of frets to display
const FRET_COUNT = 24;

// All music notes
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Note indices in the ALL_NOTES array for each open string
const OPEN_STRING_INDICES = [
  4,  // E (6th string) - index of E in ALL_NOTES
  9,  // A (5th string) - index of A
  2,  // D (4th string) - index of D
  7,  // G (3rd string) - index of G
  11, // B (2nd string) - index of B
  4   // E (1st string) - index of E
];

type FretboardMode = 'explore' | 'identify' | 'find' | 'octaves';

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
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [startFret, setStartFret] = useState(0);
  const [mode, setMode] = useState<FretboardMode>('explore');
  
  // Practice mode states
  const [quizNote, setQuizNote] = useState<string | null>(null);
  const [quizPosition, setQuizPosition] = useState<NotePosition | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<NotePosition | null>(null);

  // Track found positions in Find Notes mode
  const [foundPositions, setFoundPositions] = useState<NotePosition[]>([]);
  const [totalPositionsToFind, setTotalPositionsToFind] = useState<number>(0);

  // Track found octaves
  const [foundOctaves, setFoundOctaves] = useState<NotePosition[]>([]);

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
    } else if (mode === 'octaves') {
      setHighlightNote(null);
      setFoundOctaves([]);
      setShowAnswer(false);
    }
  }, [mode]);

  // Get note at a specific position
  const getNoteAtPosition = (stringIndex: number, fret: number): string => {
    // Convert visual index (0 = 6th string) to array index (0 = 1st string)
    const arrayStringIndex = 5 - stringIndex;
    const openStringIndex = OPEN_STRING_INDICES[arrayStringIndex];
    const noteIndex = (openStringIndex + fret) % 12;
    return ALL_NOTES[noteIndex];
  };

  // Check if a note is a natural note (no sharp or flat)
  const isNaturalNote = (note: string): boolean => {
    return note.length === 1;
  };

  // Check if a position is an octave of the target note
  const isOctavePosition = (note: string, targetNote: string | null): boolean => {
    if (!targetNote) return false;
    const noteIndex = ALL_NOTES.indexOf(note);
    const targetIndex = ALL_NOTES.indexOf(targetNote);
    return noteIndex === targetIndex;
  };

  // Generate a random position on the fretboard for "Identify Notes" mode
  const generateIdentifyQuestion = () => {
    const randomString = Math.floor(Math.random() * 6);
    
    // Generate random fret with bias towards 0-12
    let randomFret;
    if (Math.random() < 0.67) { // 2/3 chance for frets 0-12
      randomFret = Math.floor(Math.random() * 13);
    } else { // 1/3 chance for frets 13-24
      randomFret = Math.floor(Math.random() * 12) + 13;
    }
    
    const position = { string: randomString, fret: randomFret };
    setQuizPosition(position);
    setQuizNote(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);

    // Ensure the target fret is visible by adjusting startFret
    const targetStartFret = Math.max(0, Math.min(FRET_COUNT - 12, randomFret - 6));
    setStartFret(targetStartFret);
  };

  // Generate a note for the "Find Notes" mode
  const generateFindQuestion = () => {
    // Start with natural notes for better learning progression
    const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allNotes = showNaturalOnly ? naturalNotes : ALL_NOTES;
    
    const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
    setQuizNote(randomNote);
    setQuizPosition(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
    setFoundPositions([]);

    // Calculate total positions to find
    let count = 0;
    for (let string = 0; string < 6; string++) {
      for (let fret = startFret; fret <= endFret; fret++) {
        if (getNoteAtPosition(string, fret) === randomNote) {
          count++;
        }
      }
    }
    setTotalPositionsToFind(count);
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
        const newPosition = { string: stringIndex, fret };
        // Check if this position was already found
        if (!foundPositions.some(pos => pos.string === stringIndex && pos.fret === fret)) {
          const newFoundPositions = [...foundPositions, newPosition];
          setFoundPositions(newFoundPositions);
          
          // Check if all positions are found
          if (newFoundPositions.length === totalPositionsToFind) {
            setQuizResult('correct');
            setTimeout(() => {
              generateFindQuestion();
            }, 1500);
          }
        }
      } else {
        setQuizResult('incorrect');
        setTimeout(() => {
          setQuizResult(null);
        }, 1000);
      }
    } else if (mode === 'octaves') {
      if (!highlightNote) {
        // Set the initial note when none is selected
        setHighlightNote(note);
        setFoundOctaves([{ string: stringIndex, fret }]);
        return;
      }
      if (isOctavePosition(note, highlightNote)) {
        const newPosition = { string: stringIndex, fret };
        if (!foundOctaves.some(pos => pos.string === stringIndex && pos.fret === fret)) {
          setFoundOctaves([...foundOctaves, newPosition]);
        }
      } else {
        setQuizResult('incorrect');
        setTimeout(() => {
          setQuizResult(null);
        }, 1000);
      }
    }
  };

  // Should we show this note based on current filters
  const shouldShowNote = (note: string, stringIndex: number, fretNum: number): boolean => {
    if (mode === 'identify') {
      // Only show the note at the quiz position when showing answer
      if (quizPosition && stringIndex === quizPosition.string && fretNum === quizPosition.fret) {
        return showAnswer;
      }
      return false;
    } else if (mode === 'find') {
      // In find mode, show found positions and all positions when showing answer
      if (showAnswer && quizNote && note === quizNote) {
        return true;
      }
      return foundPositions.some(pos => pos.string === stringIndex && pos.fret === fretNum);
    } else if (mode === 'octaves') {
      if (foundOctaves.some(pos => pos.string === stringIndex && pos.fret === fretNum)) {
        return true;
      }
      return showAnswer && isOctavePosition(note, highlightNote);
    } else {
      // In explore mode, show notes based on filters and string selection
      if (selectedString !== null) {
        return stringIndex === selectedString;
      }
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
  const endFret = startFret + fretsToShow - 1;

  // Check if current quiz position is visible
  const isQuizPositionVisible = quizPosition ? 
    quizPosition.fret >= startFret && quizPosition.fret <= endFret : 
    true;

  // If quiz position becomes invisible, scroll to make it visible
  useEffect(() => {
    if (mode === 'identify' && quizPosition && !isQuizPositionVisible) {
      const targetStartFret = Math.max(0, Math.min(FRET_COUNT - 12, quizPosition.fret - 6));
      setStartFret(targetStartFret);
    }
  }, [mode, quizPosition, isQuizPositionVisible]);

  // Reset to explore mode
  const resetToExploreMode = () => {
    setMode('explore');
    setHighlightNote(null);
    setQuizNote(null);
    setQuizPosition(null);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
    setSelectedString(null);
    setFoundPositions([]);
    setFoundOctaves([]);
  };

  // Get quiz instruction text
  const getQuizInstructionText = () => {
    if (mode === 'identify') {
      return `What note is at the highlighted position? (String ${quizPosition ? quizPosition.string + 1 : ''}, Fret ${quizPosition ? quizPosition.fret : ''})`;
    } else if (mode === 'find') {
      return `Find all occurrences of the note ${quizNote} on the fretboard (Found ${foundPositions.length} of ${totalPositionsToFind})`;
    } else if (mode === 'octaves') {
      if (!highlightNote) {
        return 'Click any note to start finding its octaves';
      }
      return `Find all octaves of ${highlightNote}. Common patterns:\n- Same string: 12 frets up\n- Two strings up: 3 frets back`;
    }
    return '';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap space-x-2 gap-y-2 mb-4">
        {mode === 'explore' && (
          <>
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
            {selectedString !== null && (
              <button
                onClick={() => setSelectedString(null)}
                className="px-3 py-1 rounded-md text-sm bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
              >
                Show All Strings
              </button>
            )}
          </>
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
                } else if (mode === 'octaves') {
                  const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
                  setHighlightNote(randomNote);
                  setFoundOctaves([]);
                  setQuizResult(null);
                }
              }}
              className="px-3 py-1 rounded-md text-sm bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
            >
              {mode === 'octaves' ? 'Random Note' : 'New Question'}
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
        <div className="mt-4 mb-6 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-gray-200 dark:border-secondary-700 shadow-sm">
          <h2 className="text-lg font-bold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Practice Modes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => {
                setMode('identify');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Identify Notes</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">Name the note at a highlighted position</span>
            </button>
            
            <button 
              onClick={() => {
                setMode('find');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <span className="font-medium block mb-1">Find Notes</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-300">Locate a specific note across the fretboard</span>
            </button>
            
            <button 
              onClick={() => {
                setMode('octaves');
              }}
              className="p-3 text-left rounded-lg transition-colors border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white"
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
      
      {mode === 'find' && (
        <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg">
          <h3 className="font-medium mb-2">Found positions:</h3>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            {foundPositions.map((pos, index) => (
              <p key={`found-${index}`}>{`String ${pos.string + 1}, Fret ${pos.fret}`}</p>
            ))}
          </div>
        </div>
      )}
      
      {mode === 'octaves' && highlightNote && (
        <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg">
          <h3 className="font-medium mb-2">Octave Patterns Guide</h3>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            <p>• Same string: Move up 12 frets</p>
            <p>• Two strings up: Move back 3 frets</p>
            <p>• Two strings down: Move up 3 frets</p>
          </div>
          {quizResult === 'incorrect' && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
              <p className="text-sm text-red-600 dark:text-red-400">
                That's not an octave. Try following the patterns above!
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

          {/* Fretboard */}
          <div className="border-b border-secondary-300 dark:border-secondary-600">
            {/* String rows */}
            {[...STANDARD_TUNING].reverse().map((stringNote, reversedIndex) => {
              const stringIndex = reversedIndex;
              return (
                <div
                  key={`string-${stringIndex}`}
                  className="flex border-b border-secondary-300 dark:border-secondary-600 last:border-b-0"
                >
                  {/* String name */}
                  <div 
                    className={`w-10 flex-shrink-0 flex items-center justify-center font-semibold cursor-pointer
                      ${selectedString === stringIndex 
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                        : 'text-primary-700 dark:text-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/30'
                      }`}
                    onClick={() => mode === 'explore' && setSelectedString(selectedString === stringIndex ? null : stringIndex)}
                    title={mode === 'explore' ? 'Click to show/hide notes on this string' : undefined}
                  >
                    {mode === 'identify' && !showAnswer ? (stringIndex + 1) : stringNote}
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
              );
            })}
          </div>

          {/* Fret markers below the fretboard */}
          <div className="flex h-6 mt-1">
            <div className="w-10 flex-shrink-0"></div>
            {Array.from({ length: fretsToShow }).map((_, fretNumIndex) => {
              const fretNum = startFret + fretNumIndex;
              return (
                <div key={`marker-${fretNum}`} className="flex-1 relative flex items-center justify-center">
                  {/* Single dots */}
                  {[3, 5, 7, 9, 15, 17, 19, 21].includes(fretNum) && (
                    <div className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-secondary-600"></div>
                  )}
                  {/* Double dots */}
                  {[12, 24].includes(fretNum) && (
                    <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-600"></div>
                      <div className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-600"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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