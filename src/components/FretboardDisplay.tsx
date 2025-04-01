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

// All music notes
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

interface FretboardDisplayProps {
  showPractice?: boolean;
}

const FretboardDisplay: React.FC<FretboardDisplayProps> = ({ showPractice = false }) => {
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
  const [totalOctaves, setTotalOctaves] = useState<number>(0);

  // Add a state for the initial octave position
  const [initialOctavePosition, setInitialOctavePosition] = useState<NotePosition | null>(null);

  // Calculate total octaves for the current note
  const calculateTotalOctaves = (note: string) => {
    let count = 0;
    for (let string = 0; string < 6; string++) {
      for (let fret = startFret; fret <= startFret + VISIBLE_FRET_COUNT - 1; fret++) {
        const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
        const noteIndex = (openStringNoteIndex + fret) % 12;
        if (ALL_NOTES[noteIndex] === note) {
          count++;
        }
      }
    }
    return count;
  };

  // Generate a new quiz question
  const generateQuizQuestion = () => {
    if (mode === 'identify') {
      const string = Math.floor(Math.random() * 6);
      const fret = Math.floor(Math.random() * VISIBLE_FRET_COUNT);
      const position = { string, fret };
      
      const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
      const noteIndex = (openStringNoteIndex + fret) % 12;
      const note = ALL_NOTES[noteIndex];
      
      setQuizPosition(position);
      setQuizNote(note);
      setShowAnswer(false);
      setQuizResult(null);
      setUserAnswer(null);
    } else if (mode === 'find') {
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
        for (let fret = startFret; fret <= startFret + VISIBLE_FRET_COUNT - 1; fret++) {
          const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
          const noteIndex = (openStringNoteIndex + fret) % 12;
          if (ALL_NOTES[noteIndex] === randomNote) {
            count++;
          }
        }
      }
      setTotalPositionsToFind(count);
    } else if (mode === 'octaves') {
      const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
      setHighlightNote(randomNote);
      setFoundOctaves([]);
      setQuizResult(null);
      setShowAnswer(false);
      
      // Find all possible positions for this note
      const positions: NotePosition[] = [];
      for (let string = 0; string < 6; string++) {
        for (let fret = startFret; fret <= startFret + VISIBLE_FRET_COUNT - 1; fret++) {
          const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
          const noteIndex = (openStringNoteIndex + fret) % 12;
          if (ALL_NOTES[noteIndex] === randomNote) {
            positions.push({ string, fret });
          }
        }
      }
      
      // Randomly select one position as the initial position
      const initialPosition = positions[Math.floor(Math.random() * positions.length)];
      setInitialOctavePosition(initialPosition);
      setTotalOctaves(calculateTotalOctaves(randomNote) - 1); // Subtract 1 because we show one position
    }
  };

  // Add a helper function to check if a position is a valid octave
  const isValidOctave = (fromPos: NotePosition, toPos: NotePosition): boolean => {
    const stringDiff = toPos.string - fromPos.string;
    const fretDiff = toPos.fret - fromPos.fret;

    // Same string, 12 frets up
    if (stringDiff === 0 && Math.abs(fretDiff) === 12) {
      return true;
    }
    
    // Two strings up, 3 frets back
    if (Math.abs(stringDiff) === 2) {
      // If going up strings (negative stringDiff), should go back 3 frets
      if (stringDiff < 0 && fretDiff === -3) {
        return true;
      }
      // If going down strings (positive stringDiff), should go forward 3 frets
      if (stringDiff > 0 && fretDiff === 3) {
        return true;
      }
    }

    return false;
  };

  // Update the handleNoteClick for octaves mode
  const handleNoteClick = (stringIndex: number, fret: number, note: string) => {
    if (mode === 'identify') {
      // In identify mode, clicking the note position does nothing
      // Answers should only come from the note selection buttons
      return;
    } else if (mode === 'find') {
      const position = { string: stringIndex, fret };
      if (note === quizNote && !foundPositions.some(p => p.string === stringIndex && p.fret === fret)) {
        // Correct note found
        setFoundPositions(prev => [...prev, position]);
        setQuizResult('correct');
        
        // Check if all positions are found
        if (foundPositions.length + 1 === totalPositionsToFind) {
          setTimeout(() => {
            generateQuizQuestion();
          }, 2000); // Increased from 1500ms to 2000ms for final success
        } else {
          // Clear the correct feedback after a longer delay if there are more to find
          setTimeout(() => {
            setQuizResult(null);
          }, 1500); // Increased from 800ms to 1500ms for individual finds
        }
      } else if (note !== quizNote) {
        // Incorrect attempt
        setQuizResult('incorrect');
        setTimeout(() => {
          setQuizResult(null);
        }, 1500); // Increased from 800ms to 1500ms for incorrect attempts
      }
    } else if (mode === 'octaves') {
      const position = { string: stringIndex, fret };
      
      // Don't count clicking on the initial position
      if (initialOctavePosition && 
          stringIndex === initialOctavePosition.string && 
          fret === initialOctavePosition.fret) {
        return;
      }

      // Get the actual note at the clicked position
      const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[stringIndex]);
      const noteIndex = (openStringNoteIndex + fret) % 12;
      const clickedNote = ALL_NOTES[noteIndex];

      // First, check if the note matches (must be the same note name)
      if (clickedNote !== highlightNote) {
        setQuizResult('incorrect');
        setTimeout(() => {
          setQuizResult(null);
        }, 1500);
        return;
      }

      // Check if this position is already found
      const isAlreadyFound = foundOctaves.some(p => p.string === stringIndex && p.fret === fret);
      if (isAlreadyFound) {
        return; // Already found this position
      }

      // Check if this is a valid octave relationship
      // Must be connected to either the initial position or a found octave
      let isValidOctaveRelationship = false;
      
      // Check against initial position
      if (initialOctavePosition) {
        isValidOctaveRelationship = isValidOctave(initialOctavePosition, position);
      }
      
      // If not valid from initial, check against found octaves
      if (!isValidOctaveRelationship && foundOctaves.length > 0) {
        isValidOctaveRelationship = foundOctaves.some(foundPos => isValidOctave(foundPos, position));
      }

      if (isValidOctaveRelationship) {
        // Found a valid octave
        setFoundOctaves(prev => [...prev, position]);
        setQuizResult('correct');
        
        if (foundOctaves.length + 1 === totalOctaves) {
          setTimeout(() => {
            generateQuizQuestion();
          }, 2000);
        } else {
          setTimeout(() => {
            setQuizResult(null);
          }, 1500);
        }
      } else {
        // Not a valid octave relationship
        setQuizResult('incorrect');
        setTimeout(() => {
          setQuizResult(null);
        }, 1500);
      }
    } else {
      setHighlightNote(highlightNote === note ? null : note);
    }
  };

  // Check if a note is natural (no sharp or flat)
  const isNaturalNote = (note: string): boolean => {
    return note.length === 1;
  };

  // Check if a position is an octave of the highlighted note
  const isOctavePosition = (note: string, targetNote: string | null): boolean => {
    if (!targetNote) return false;
    return note === targetNote;
  };

  // Should we show this note based on current filters
  const shouldShowNote = (note: string, stringIndex: number, fretNum: number): boolean => {
    switch (mode) {
      case 'identify':
        // In identify mode, only show the quiz position
        return quizPosition?.string === stringIndex && quizPosition?.fret === fretNum;

      case 'find':
      case 'octaves':
        // In find and octaves modes, show ALL positions
        return true;

      case 'explore':
        // In explore mode, apply filters
        if (selectedString !== null && stringIndex !== selectedString) {
          return false;
        }
        if (showNaturalOnly && !isNaturalNote(note) && note !== highlightNote) {
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Change start fret position
  const moveStartFret = (direction: 'left' | 'right') => {
    if (direction === 'left' && startFret > 0) {
      setStartFret(startFret - 1);
    } else if (direction === 'right' && startFret < FRET_COUNT - VISIBLE_FRET_COUNT + 1) {
      setStartFret(startFret + 1);
    }
  };

  // Effect to handle practice modes
  useEffect(() => {
    if (mode !== 'explore') {
      generateQuizQuestion();
    } else {
      // Reset states when exiting practice mode
      setQuizNote(null);
      setQuizPosition(null);
      setShowAnswer(false);
      setQuizResult(null);
      setUserAnswer(null);
      setFoundPositions([]);
      setFoundOctaves([]);
      setHighlightNote(null);
    }
  }, [mode]); // Only depend on mode changes

  // Handle mode change
  const handleModeChange = (newMode: FretboardMode) => {
    setMode(newMode);
    setShowAnswer(false);
    setQuizResult(null);
    setUserAnswer(null);
    setFoundPositions([]);
    setFoundOctaves([]);
    if (newMode === 'explore') {
      setHighlightNote(null);
    }
  };

  // Update the renderNote function for octaves mode
  const renderNote = (note: string, position: NotePosition) => {
    if (!shouldShowNote(note, position.string, position.fret)) {
      return null;
    }

    let displayNote = note;
    let shouldHighlight = false;

    switch (mode) {
      case 'identify':
        displayNote = showAnswer ? note : '?';
        shouldHighlight = quizPosition?.string === position.string && 
                         quizPosition?.fret === position.fret;
        break;

      case 'find':
        const isFound = foundPositions.some(
          p => p.string === position.string && p.fret === position.fret
        );
        if (isFound) {
          displayNote = note;
          shouldHighlight = true;
        } else if (showAnswer && note === quizNote) {
          displayNote = note;
          shouldHighlight = true;
        } else {
          displayNote = '•';
        }
        break;

      case 'octaves':
        const isInitialPosition = initialOctavePosition && 
          position.string === initialOctavePosition.string && 
          position.fret === initialOctavePosition.fret;
        
        const isFoundOctave = foundOctaves.some(
          p => p.string === position.string && p.fret === position.fret
        );

        if (isInitialPosition) {
          // Show and highlight initial position
          displayNote = note;
          shouldHighlight = true;
        } else if (isFoundOctave) {
          // Show and highlight found octaves
          displayNote = note;
          shouldHighlight = true;
        } else if (showAnswer && note === highlightNote) {
          // Show and highlight all valid octaves when showing answer
          displayNote = note;
          shouldHighlight = true;
        } else if (hoverPosition?.string === position.string && 
                   hoverPosition?.fret === position.fret) {
          // Show hover state
          displayNote = '○';  // Empty circle for hover state
        } else {
          // Show nothing for other positions but keep them clickable
          displayNote = '';
        }
        break;

      case 'explore':
        shouldHighlight = highlightNote === note;
        break;
    }

    return (
      <FretboardNote
        note={displayNote}
        position={position}
        isActive={shouldHighlight}
        isNatural={isNaturalNote(note)}
        isQuizPosition={mode === 'identify' && quizPosition?.string === position.string && quizPosition?.fret === position.fret}
        showAnswer={showAnswer}
        quizResult={quizResult}
        quizNote={quizNote}
        onClick={() => handleNoteClick(position.string, position.fret, note)}
        onMouseEnter={() => mode === 'octaves' && setHoverPosition(position)}
        onMouseLeave={() => mode === 'octaves' && setHoverPosition(null)}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          {/* Exploration Mode Controls */}
          {mode === 'explore' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNaturalOnly(!showNaturalOnly)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
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
                  className="px-4 py-2 rounded-md text-sm font-medium bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
                >
                  Show All Strings
                </button>
              )}
              
              {/* Practice Mode Entry */}
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => handleModeChange('identify')}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                >
                  Start Practice
                </button>
              </div>
            </div>
          )}

          {/* Practice Mode Controls */}
          {mode !== 'explore' && (
            <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Practice Mode</h3>
                  <button
                    onClick={() => handleModeChange('explore')}
                    className="px-3 py-1 rounded-md text-sm bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300"
                  >
                    Exit Practice
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleModeChange('identify')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                      mode === 'identify'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                    }`}
                  >
                    <span className="mr-2">1</span>
                    Identify Notes
                  </button>
                  <button
                    onClick={() => handleModeChange('find')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                      mode === 'find'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                    }`}
                  >
                    <span className="mr-2">2</span>
                    Find Notes
                  </button>
                  <button
                    onClick={() => handleModeChange('octaves')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                      mode === 'octaves'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                    }`}
                  >
                    <span className="mr-2">3</span>
                    Find Octaves
                  </button>
                </div>

                {(mode === 'identify' || mode === 'find' || mode === 'octaves') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 flex-1"
                    >
                      Show Answer
                    </button>
                    <button
                      onClick={generateQuizQuestion}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 flex-1"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow-inner overflow-x-auto">
        <Fretboard
          tuning={STANDARD_TUNING}
          fretCount={FRET_COUNT}
          startFret={startFret}
          visibleFretCount={VISIBLE_FRET_COUNT}
          renderNote={renderNote}
          renderFretMarker={(fret) => <FretboardMarker fret={fret} />}
          renderStringLabel={(stringIndex, note) => (
            <div className="w-10 flex-shrink-0 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-300">
              {mode === 'explore' ? note : `${6 - stringIndex}`}
            </div>
          )}
        />
      </div>

      {/* Practice Mode Instructions and Feedback */}
      {mode !== 'explore' && (
        <div className="mt-4 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 p-3">
            <h3 className="font-semibold">
              {mode === 'identify' && 'Identify Notes Practice'}
              {mode === 'find' && 'Find Notes Practice'}
              {mode === 'octaves' && 'Find Octaves Practice'}
            </h3>
          </div>
          
          <div className="p-4">
            {mode === 'identify' && (
              <>
                <p className="text-sm mb-4">Click on the highlighted position and select the correct note.</p>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                  {ALL_NOTES.map((note) => (
                    <button
                      key={note}
                      onClick={() => {
                        if (!quizPosition) return;
                        const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[quizPosition.string]);
                        const noteIndex = (openStringNoteIndex + quizPosition.fret) % 12;
                        const correctNote = ALL_NOTES[noteIndex];
                        setUserAnswer(note);
                        if (note === correctNote) {
                          setQuizResult('correct');
                          setTimeout(() => {
                            generateQuizQuestion();
                          }, 2000); // Increased from 1500ms to 2000ms for consistency
                        } else {
                          setQuizResult('incorrect');
                        }
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                        ${
                          userAnswer === note
                            ? userAnswer === quizNote
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
              </>
            )}

            {mode === 'find' && (
              <>
                <p className="text-sm mb-2">Find all occurrences of note: <span className="font-semibold">{quizNote}</span></p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Found {foundPositions.length} of {totalPositionsToFind} positions
                </p>
                {foundPositions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {foundPositions.map((pos, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-700 rounded">
                        String {pos.string + 1}, Fret {pos.fret}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {mode === 'octaves' && (
              <>
                <p className="text-sm mb-2">Find octaves of <span className="font-semibold">{highlightNote}</span> starting from string {initialOctavePosition ? initialOctavePosition.string + 1 : ''}, fret {initialOctavePosition ? initialOctavePosition.fret : ''}</p>
                <div className="text-sm space-y-2">
                  <p className="font-medium mb-2">Rules for finding octaves:</p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Same string: Move up 12 frets
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Two strings up: Move back 3 frets
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Two strings down: Move up 3 frets
                  </p>
                  <div className="mt-4 p-3 bg-secondary-100 dark:bg-secondary-800 rounded">
                    <p className="font-medium">Progress:</p>
                    <p>Found {foundOctaves.length} of {totalOctaves} octaves</p>
                    {foundOctaves.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {foundOctaves.map((pos, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-secondary-200 dark:bg-secondary-700 rounded">
                            String {pos.string + 1}, Fret {pos.fret}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {quizResult && (
              <div className={`mt-4 p-3 rounded ${
                quizResult === 'correct' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {quizResult === 'correct' 
                  ? (mode === 'find' && foundPositions.length < totalPositionsToFind)
                    ? 'Correct! Keep going, find more positions...'
                    : 'Correct! Moving to next question...'
                  : 'Incorrect. Try again or use "Show Answer" for help.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exploration Mode Info */}
      {mode === 'explore' && highlightNote && (
        <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg">
          <h3 className="font-medium mb-2">Highlighted Note: {highlightNote}</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Click on notes to highlight them across the fretboard. Click again to clear.
          </p>
        </div>
      )}
    </div>
  );
};

export default FretboardDisplay; 