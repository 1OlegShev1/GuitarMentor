"use client";

import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { Fretboard } from './Fretboard';
import { FretboardNote, FretboardNoteProps, NoteDisplayState } from './FretboardNote';
import { FretboardMarker } from './FretboardMarker';
import { NotePosition, ALL_NOTES, STANDARD_TUNING } from '@/hooks/useFretboard';

// Base MIDI note numbers for standard tuning (E2=40)
// REMOVE const BASE_MIDI_NOTES = [40, 45, 50, 55, 59, 64]; 

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

// Simple placeholder component for empty/clickable cells
const ClickablePlaceholder: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div 
    onClick={onClick} 
    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
    aria-label="Empty fret position"
  />
);

const NonClickablePlaceholder: React.FC = () => (
  <div 
    className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent"
    aria-hidden="true" // Hide from assistive tech if truly non-interactive
  />
);

type FretboardMode = 'explore' | 'identify' | 'find' | 'octaves';

// Add a new type for display purposes, distinct from practice modes
export type FretboardDisplayMode = 'explore' | 'practice' | 'scale' | 'caged' | 'chord';

// Define types for CAGED display
export interface CagedNotePosition extends NotePosition {
  finger: number; // 0 for open string, 1-4 for fingers
  noteType?: 'Root' | '3rd' | '5th' | string; // Optional: Interval/note name
}

export interface Barre {
  fret: number;
  startString: number; // 1-indexed string number (e.g., 6 for low E)
  endString: number;   // 1-indexed string number (e.g., 1 for high E)
}

export interface CagedShapeData {
  positions: CagedNotePosition[];
  barres?: Barre[];
  mutedStrings?: number[]; // 1-indexed string numbers to mute
}

// Define types for Chord Voicing display (Export this too)
// Ensure this structure matches what getChordVoicing provides
export interface ChordVoicingPosition extends NotePosition {
  finger?: number; // Optional finger
  noteType?: 'Root' | '3rd' | '5th' | '7th' | string; // Optional interval/note name
}

export interface ChordVoicingData {
  positions: ChordVoicingPosition[]; 
  barres?: Barre[];
  mutedStrings?: number[]; // 1-based string numbers to mute
}

interface FretboardDisplayProps {
  displayMode?: FretboardDisplayMode;
  scaleNotes?: string[];
  rootNote?: string;
  highlightedPattern?: NotePosition[];
  intervalLabels?: Record<string, string>;
  cagedShape?: CagedShapeData;
  chordVoicing?: ChordVoicingData;
  chordRootNote?: string | null;
  ensureVisiblePositions?: NotePosition[];
  cagedShowIntervals?: boolean;
  fretCount?: number;
  visibleFretCount?: number;
}

const FretboardDisplay: React.FC<FretboardDisplayProps> = ({
  displayMode = 'explore',
  scaleNotes = [],
  rootNote = null,
  highlightedPattern = [],
  intervalLabels = {},
  cagedShape = null,
  chordVoicing = null,
  chordRootNote = null,
  ensureVisiblePositions,
  cagedShowIntervals = false,
  fretCount = 24,
  visibleFretCount = 13,
}) => {
  const [showNaturalOnly, setShowNaturalOnly] = useState(false);
  const [crossHighlightNote, setCrossHighlightNote] = useState<string | null>(null);
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [startFret, setStartFret] = useState(0);
  // Internal practice mode state, only relevant when displayMode === 'practice'
  const [practiceMode, setPracticeMode] = useState<FretboardMode>('explore');
  
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

  // --- NEW: State for temporary incorrect click feedback in Find mode ---
  const [incorrectClickPos, setIncorrectClickPos] = useState<NotePosition | null>(null);

  // Memoize calculateTotalOctaves
  const calculateTotalOctaves = useCallback((note: string) => {
    let count = 0;
    for (let string = 0; string < 6; string++) {
      for (let fret = startFret; fret <= startFret + visibleFretCount - 1; fret++) {
        const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
        const noteIndex = (openStringNoteIndex + fret) % 12;
        if (ALL_NOTES[noteIndex] === note) {
          count++;
        }
      }
    }
    return count;
  }, [startFret, visibleFretCount]);

  // Memoize shouldShowNote
  const shouldShowNote = useCallback((note: string, stringIndex: number, fretNum: number): boolean => {
    if (displayMode === 'practice') {
      switch (practiceMode) {
        case 'identify':
          return quizPosition?.string === stringIndex && quizPosition?.fret === fretNum;
        case 'find':
        case 'octaves':
          return true;
        case 'explore':
          if (selectedString !== null && stringIndex !== selectedString) return false;
          if (showNaturalOnly && !isNaturalNote(note) && note !== crossHighlightNote) return false;
          return true;
        default:
          return true;
      }
    } else if (displayMode === 'scale') {
      return scaleNotes.includes(note);
    } else if (displayMode === 'explore') {
      if (selectedString !== null && stringIndex !== selectedString) return false;
      if (showNaturalOnly && !isNaturalNote(note) && note !== crossHighlightNote) return false;
      return true;
    } else if (displayMode === 'caged') {
      if (!cagedShape) return false;
      return cagedShape.positions.some(p => p.string === stringIndex && p.fret === fretNum);
    } else if (displayMode === 'chord' && chordVoicing) {
      const voicingPosition = chordVoicing.positions.find(p => 
        p.string === stringIndex && p.fret === fretNum
      );
      const isMuted = chordVoicing.mutedStrings?.includes(stringIndex + 1);
      const hasFrettedNoteOnString = chordVoicing.positions.some(p => p.string === stringIndex && p.fret > 0);
      const isOpenStringInVoicing = fretNum === 0 && !isMuted && !hasFrettedNoteOnString;
      return !!voicingPosition || isOpenStringInVoicing;
    }
    return true;
  }, [displayMode, practiceMode, quizPosition, selectedString, showNaturalOnly, crossHighlightNote, scaleNotes, cagedShape, chordVoicing]);

  // Memoize isNaturalNote
  const isNaturalNote = useCallback((note: string): boolean => {
    return note.length === 1;
  }, []);

  // Memoize handleNoteClick
  const handleNoteClick = useCallback((position: NotePosition) => {
    const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[position.string]);
    const noteIndex = (openStringNoteIndex + position.fret) % 12;
    const clickedNote = ALL_NOTES[noteIndex];

    if (displayMode !== 'practice') {
      setCrossHighlightNote(clickedNote === crossHighlightNote ? null : clickedNote);
      setSelectedString(null);
      return;
    }

    switch (practiceMode) {
      case 'identify':
        break;
      case 'find':
        if (clickedNote === quizNote && !foundPositions.some(p => p.string === position.string && p.fret === position.fret)) {
          const newFoundPositions = [...foundPositions, position];
          setFoundPositions(newFoundPositions);
          if (newFoundPositions.length === totalPositionsToFind) {
            setTimeout(() => generateQuizQuestion(), 1000);
          }
        } else if (clickedNote !== quizNote) {
          setIncorrectClickPos(position);
          setTimeout(() => setIncorrectClickPos(null), 500);
        }
        break;
      case 'octaves':
        if (!initialOctavePosition) {
          if (clickedNote === crossHighlightNote) {
            setInitialOctavePosition(position);
            const total = calculateTotalOctaves(clickedNote);
            setTotalOctaves(total - 1);
            setFoundOctaves([position]);
          }
        } else {
          const isCorrectNote = (clickedNote === crossHighlightNote);
          const isAlreadyFound = foundOctaves.some(p => p.string === position.string && p.fret === position.fret);
          const isInitialPosition = initialOctavePosition.string === position.string && initialOctavePosition.fret === position.fret;

          console.log('[handleNoteClick Octaves] Name Check:', {
            initial: initialOctavePosition,
            clicked: position,
            clickedNote,
            targetNote: crossHighlightNote,
            isCorrectNote,
            isInitialPosition,
            isAlreadyFound
          });

          if (isCorrectNote && !isInitialPosition && !isAlreadyFound) {
            console.log('[handleNoteClick Octaves] CORRECT octave found (note name match).');
            const newFoundOctaves = [...foundOctaves, position];
            setFoundOctaves(newFoundOctaves);
            if (newFoundOctaves.length >= totalOctaves + 1) {
              setTimeout(() => generateQuizQuestion(), 1000);
            }
          } else if (!isAlreadyFound && !isInitialPosition) {
            console.log('[handleNoteClick Octaves] INCORRECT click detected (wrong note name or duplicate).');
            setIncorrectClickPos(position);
            setTimeout(() => setIncorrectClickPos(null), 500);
          }
        }
        break;
      case 'explore':
      default:
        setCrossHighlightNote(clickedNote === crossHighlightNote ? null : clickedNote);
        setSelectedString(null);
        break;
    }
  }, [displayMode, practiceMode, crossHighlightNote, quizNote, foundPositions, totalPositionsToFind, initialOctavePosition, foundOctaves, totalOctaves, calculateTotalOctaves]);

  // Memoize generateQuizQuestion
  const generateQuizQuestion = useCallback(() => {
    if (practiceMode === 'identify') {
      const string = Math.floor(Math.random() * 6);
      const fret = Math.floor(Math.random() * visibleFretCount);
      const position = { string, fret };
      const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
      const noteIndex = (openStringNoteIndex + fret) % 12;
      const note = ALL_NOTES[noteIndex];
      setQuizPosition(position);
      setQuizNote(note);
      setShowAnswer(false);
      setQuizResult(null);
      setUserAnswer(null);
    } else if (practiceMode === 'find') {
      const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const allNotes = showNaturalOnly ? naturalNotes : ALL_NOTES;
      const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
      setQuizNote(randomNote);
      setQuizPosition(null);
      setShowAnswer(false);
      setQuizResult(null);
      setUserAnswer(null);
      setFoundPositions([]);

      let count = 0;
      for (let string = 0; string < 6; string++) {
        for (let fret = startFret; fret <= startFret + visibleFretCount - 1; fret++) {
          const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
          const noteIndex = (openStringNoteIndex + fret) % 12;
          if (ALL_NOTES[noteIndex] === randomNote) {
            count++;
          }
        }
      }
      setTotalPositionsToFind(count);
    } else if (practiceMode === 'octaves') {
      let randomNote = null;
      let positions: NotePosition[] = [];
      let initialPosition: NotePosition | null = null;

      while (positions.length === 0) {
        const availableNotes = showNaturalOnly ? ALL_NOTES.filter(n => !n.includes('#')) : ALL_NOTES;
        if (availableNotes.length === 0) {
          console.error("No available notes for Octave quiz generation?");
          break;
        }
        randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        positions = [];
        for (let string = 0; string < 6; string++) {
          for (let fret = startFret; fret <= startFret + visibleFretCount - 1; fret++) {
            const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[string]);
            const noteIndex = (openStringNoteIndex + fret) % 12;
            if (ALL_NOTES[noteIndex] === randomNote) {
              positions.push({ string, fret });
            }
          }
        }
      }
      setCrossHighlightNote(randomNote);
      setFoundOctaves([]);
      setQuizResult(null);
      setShowAnswer(false);
      initialPosition = positions[Math.floor(Math.random() * positions.length)];
      setInitialOctavePosition(initialPosition);
      setTotalOctaves(positions.length - 1);
    }
  }, [practiceMode, showNaturalOnly, startFret, visibleFretCount]);

  // Memoize renderNote
  const renderNote = useCallback((stringIndex: number, fretNum: number) => {
    const position: NotePosition = { string: stringIndex, fret: fretNum };
    const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[position.string]);
    const noteIndex = (openStringNoteIndex + position.fret) % 12;
    const note = ALL_NOTES[noteIndex];

    if (!shouldShowNote(note, stringIndex, fretNum)) {
      return <NonClickablePlaceholder />;
    }

    let state: NoteDisplayState = 'default';
    let noteTextOverride: string | null = null;

    if (practiceMode !== 'find' && practiceMode !== 'octaves' && practiceMode !== 'identify') {
      if (showNaturalOnly && note.includes('#')) {
        state = 'hidden';
      }
      if (selectedString !== null && position.string !== selectedString) {
        state = 'hidden';
      }
    }

    if (state !== 'hidden') {
      if (displayMode === 'scale') {
        const isInScale = scaleNotes.includes(note);
        if (!isInScale) {
          state = 'hidden';
        } else if (highlightedPattern.some(p => p.string === position.string && p.fret === position.fret)) {
          state = 'pattern_highlight';
        } else if (rootNote === note) {
          state = 'root';
        } else {
          state = 'pattern_member';
        }
        if (state !== 'hidden') {
          noteTextOverride = intervalLabels[note] ?? note;
        }
      } else if (displayMode === 'caged' && cagedShape) {
        const cagedPosition = cagedShape.positions.find(p => p.string === position.string && p.fret === position.fret);
        if (!cagedPosition) {
          state = 'hidden';
        } else {
          if (cagedShowIntervals) {
            const rootNoteIndex = rootNote ? ALL_NOTES.indexOf(rootNote) : -1;
            if (rootNoteIndex !== -1) {
              const interval = (noteIndex - rootNoteIndex + 12) % 12;
              switch (interval) {
                case 0: noteTextOverride = 'R'; break;
                case 4: noteTextOverride = '3'; break;
                case 7: noteTextOverride = '5'; break;
                default: noteTextOverride = note;
              }
            } else {
              noteTextOverride = note;
            }
          } else {
            noteTextOverride = note;
          }
          state = note === rootNote ? 'caged_root' : 'caged_finger';
        }
      } else if (displayMode === 'chord' && chordVoicing) {
        const voicingPosition = chordVoicing.positions.find(p => p.string === stringIndex && p.fret === fretNum);
        if (voicingPosition) {
          state = (voicingPosition.noteType === 'Root' || note === chordRootNote) ? 'root' : 'pattern_member';
        } else {
          state = note === chordRootNote ? 'root' : 'pattern_member';
        }
      } else if (displayMode === 'practice') {
        switch (practiceMode) {
          case 'identify':
            const isQuizPos = quizPosition?.string === position.string && quizPosition?.fret === position.fret;
            if (isQuizPos) {
              if (quizResult === 'correct') {
                state = 'quiz_correct';
              } else if (quizResult === 'incorrect' || showAnswer) {
                state = 'quiz_reveal';
              } else {
                state = 'quiz_question';
              }
            } else {
              state = 'hidden';
            }
            break;
          case 'find':
            const isFound = foundPositions.some(p => p.string === position.string && p.fret === position.fret);
            const isIncorrect = incorrectClickPos?.string === position.string && incorrectClickPos?.fret === position.fret;
            if (isIncorrect) {
              state = 'quiz_incorrect_click';
            } else if (isFound) {
              state = 'target_found';
            } else {
              state = 'placeholder_clickable';
            }
            break;
          case 'octaves':
            const isInitial = initialOctavePosition?.string === position.string && initialOctavePosition?.fret === position.fret;
            const isFoundOctave = foundOctaves.some(p => p.string === position.string && p.fret === position.fret);
            const isIncorrectOctaveClick = incorrectClickPos?.string === position.string && incorrectClickPos?.fret === position.fret;
            if (isInitial) {
              state = 'root';
            } else if (isIncorrectOctaveClick) {
              state = 'quiz_incorrect_click';
            } else if (isFoundOctave) {
              state = 'target_found';
            } else {
              state = 'placeholder_clickable';
            }
            break;
          case 'explore':
          default:
            state = crossHighlightNote === note ? 'highlighted' : 'default';
            if (state === 'default') {
              if (showNaturalOnly && note.includes('#')) { state = 'hidden'; }
              if (selectedString !== null && position.string !== selectedString) { state = 'hidden'; }
            }
            break;
        }
      } else {
        state = crossHighlightNote === note ? 'highlighted' : 'default';
        if (state === 'default') {
          if (showNaturalOnly && note.includes('#')) { state = 'hidden'; }
          if (selectedString !== null && position.string !== selectedString) { state = 'hidden'; }
        }
      }
    }

    const commonProps = {
      position: position,
      onClick: () => handleNoteClick(position),
      onMouseEnter: () => setHoverPosition(position),
      onMouseLeave: () => setHoverPosition(null),
    };

    switch (state) {
      case 'hidden':
        return null;
      case 'placeholder_clickable':
        return <ClickablePlaceholder onClick={() => handleNoteClick(position)} />;
      case 'caged_finger':
      case 'caged_root':
        return <FretboardNote {...commonProps} note={noteTextOverride ?? note} state={state} />;
      default:
        return <FretboardNote {...commonProps} note={noteTextOverride ?? note} state={state} />;
    }
  }, [displayMode, practiceMode, scaleNotes, rootNote, highlightedPattern, intervalLabels, cagedShape, cagedShowIntervals, chordVoicing, chordRootNote, showNaturalOnly, selectedString, crossHighlightNote, quizPosition, quizResult, showAnswer, foundPositions, incorrectClickPos, initialOctavePosition, foundOctaves, handleNoteClick, shouldShowNote]);

  // Function to handle fretboard scrolling
  const moveStartFret = (direction: number) => {
    setStartFret(prev => {
      const nextFret = prev + direction;
      // Clamp the value between 0 and max possible start fret
      return Math.max(0, Math.min(nextFret, FRET_COUNT - VISIBLE_FRET_COUNT));
    });
  };

  // Adjust useEffect to depend on internal practiceMode
  useEffect(() => {
    if (displayMode === 'practice' && practiceMode !== 'explore') {
      // Generate question for identify, find, octaves
      generateQuizQuestion();
    } else {
      // Reset states when exiting practice mode or changing display mode
      setQuizNote(null);
      setQuizPosition(null);
      setCrossHighlightNote(null); // Move reset here
      // ... other potential resets when not in active practice ...
      if (displayMode !== 'practice') {
        setPracticeMode('explore'); // Reset internal practice mode if display mode changes
      }
    }
    // setCrossHighlightNote(null); // REMOVE from here: Called too late, cleared Octaves state
    
    // Reset practice states when exiting or changing display mode, or entering explore mode
    if (displayMode !== 'practice' || (displayMode === 'practice' && practiceMode === 'explore')) {
      setShowAnswer(false);
      setQuizResult(null);
      setUserAnswer(null);
      setFoundPositions([]);
      setFoundOctaves([]);
      // Keep quizNote/quizPosition reset in the else block above
      // setQuizNote(null);
      // setQuizPosition(null);
      setInitialOctavePosition(null);
      // Also ensure crossHighlightNote is cleared when explicitly going to explore
      if (practiceMode === 'explore') {
        setCrossHighlightNote(null);
      }
    }
  }, [displayMode, practiceMode]); // Re-run if displayMode or practiceMode changes

  // Adjust handleModeChange to update internal practiceMode
  const handleModeChange = (newMode: FretboardMode) => {
    setPracticeMode(newMode); // Update internal state
    // REMOVE Redundant Resets: useEffect handles resetting these correctly
    // setCrossHighlightNote(null); 
    // setInitialOctavePosition(null);

    // Keep other resets specific to changing modes if needed
    setShowAnswer(false); 
    setQuizResult(null);
    setUserAnswer(null);
    setFoundPositions([]);
    setFoundOctaves([]);
    setQuizNote(null); 
    setQuizPosition(null);
  };

  // When parent requests certain positions be fully visible, adjust the scroll
  React.useEffect(() => {
    if (ensureVisiblePositions && ensureVisiblePositions.length > 0) {
      const frets = ensureVisiblePositions.map(p => p.fret);
      const minFret = Math.min(...frets);
      const maxFret = Math.max(...frets);
      // Adjust startFret to include full range
      const minStart = Math.max(0, Math.min(startFret, minFret));
      let newStart = startFret;
      if (minFret < startFret) newStart = minFret;
      else if (maxFret > startFret + VISIBLE_FRET_COUNT - 1) newStart = maxFret - (VISIBLE_FRET_COUNT - 1);
      if (newStart !== startFret) {
        setStartFret(newStart);
      }
    }
  }, [ensureVisiblePositions, startFret]);

  // Memoize handleIdentifyAnswer
  const handleIdentifyAnswer = useCallback((selectedNote: string) => {
    if (!quizNote || quizResult !== null) return;
    setUserAnswer(selectedNote);
    if (selectedNote === quizNote) {
      setQuizResult('correct');
      setTimeout(() => {
        generateQuizQuestion();
      }, 1500);
    } else {
      setQuizResult('incorrect');
      setShowAnswer(true);
    }
  }, [quizNote, quizResult, generateQuizQuestion]);

  return (
    <div className="relative p-4 pb-16 bg-white dark:bg-gray-800 rounded-lg shadow">

      {/* Practice Controls Area (Rendered conditionally) */}
      {displayMode === 'practice' && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Mode Selection Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setPracticeMode('explore')}
                className={`px-3 py-1 rounded ${practiceMode === 'explore' ? 'bg-primary text-gray-900 dark:text-white shadow' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                Explore
              </button>
              <button
                onClick={() => { setPracticeMode('identify'); /* generateQuizQuestion(); Let useEffect handle */ }}
                className={`px-3 py-1 rounded ${practiceMode === 'identify' ? 'bg-primary text-gray-900 dark:text-white shadow' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                Identify Note
              </button>
              <button
                onClick={() => { setPracticeMode('find'); /* generateQuizQuestion(); */ }}
                className={`px-3 py-1 rounded ${practiceMode === 'find' ? 'bg-primary text-gray-900 dark:text-white shadow' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                Find Notes
              </button>
              <button
                onClick={() => { setPracticeMode('octaves'); /* generateQuizQuestion(); */ }}
                className={`px-3 py-1 rounded ${practiceMode === 'octaves' ? 'bg-primary text-gray-900 dark:text-white shadow' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                Octaves
              </button>
            </div>

            {/* Natural Notes Only Toggle (visible in find/explore/octaves) */}
            {(practiceMode === 'explore' || practiceMode === 'find' || practiceMode === 'octaves') && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNaturalOnly}
                  onChange={(e) => setShowNaturalOnly(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Natural Notes Only</span>
              </label>
            )}

             {/* Regenerate Button (visible in identify/find/octaves) */}
             {(practiceMode === 'identify' || practiceMode === 'find' || practiceMode === 'octaves') && (
                 <button
                     onClick={generateQuizQuestion}
                     className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                 >
                     New Question
                 </button>
             )}
          </div>

          {/* Dynamic Instructions/Status Area */}
           <div className="mt-4 text-center text-lg text-gray-800 dark:text-gray-200 min-h-[3rem]">
              {practiceMode === 'identify' && quizNote && (
                  // Instruction Text
                  <p className="mb-4">Identify the highlighted note!</p>
              )}
              {practiceMode === 'find' && quizNote && (
                  `Find all ${quizNote} notes (${foundPositions.length}/${totalPositionsToFind} found)`
              )}
              {practiceMode === 'octaves' && crossHighlightNote && initialOctavePosition && (
                  `Find all octaves of ${crossHighlightNote} starting from string ${6 - initialOctavePosition.string}, fret ${initialOctavePosition.fret} (${foundOctaves.length}/${totalOctaves} found)`
              )}
              {practiceMode === 'explore' && (
                  `Explore the fretboard.`
              )}
          </div>

          {/* --- Identify Mode Specific Controls --- */}
          {practiceMode === 'identify' && (
            <div className="mt-4 text-center">
              {/* Answer Buttons (A, A#, B, ...) */}    
              {quizResult === null && !showAnswer && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {ALL_NOTES.map((noteOption) => (
                          <button
                              key={noteOption}
                              onClick={() => handleIdentifyAnswer(noteOption)}
                              className="px-3 py-1 rounded border-2 text-sm font-medium transition-colors duration-150 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                              {noteOption}
                          </button>
                      ))}
                  </div>
              )}

              {/* Show Answer / Result Display */}    
              <div className="min-h-[3rem]"> { /* Reserve space to prevent layout shifts */}
                 {quizResult === null && !showAnswer && quizNote && (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                        Show Answer
                    </button>
                 )}
                 {(showAnswer || quizResult !== null) && quizNote && (
                    <p className={`text-xl font-semibold ${quizResult === 'correct' ? 'text-green-600 dark:text-green-400' : quizResult === 'incorrect' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {quizResult === 'correct' ? `Correct! It was ${quizNote}` :
                         quizResult === 'incorrect' ? `Incorrect! You clicked ${userAnswer || '-'}, the note was ${quizNote}` :
                         `The note is: ${quizNote}`}
                    </p>
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Fretboard Area */}
      <div className="flex">
        {/* String Labels (Numbers 1-6) */}
        <div className="flex flex-col justify-between items-center w-10 flex-shrink-0 mr-2">
          {[...STANDARD_TUNING].reverse().map((_, index) => {
            // Correct string number: High E (index 0 of reversed) is 1, Low E (index 5) is 6
            const stringNumber = index + 1;
            // Map visual index back to original tuning index for state checking
            const originalStringIndex = 5 - index;

            // Determine if the string should be highlighted
            let isHighlighted = false;
            if (practiceMode === 'identify' && quizPosition) {
              isHighlighted = quizPosition.string === originalStringIndex;
            } else if (selectedString !== null) {
              isHighlighted = selectedString === originalStringIndex;
            }

            return (
              <span
                key={stringNumber}
                className={`flex items-center justify-center h-10 text-lg font-medium ${
                  isHighlighted ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {stringNumber}
              </span>
            );
          })}
        </div>

        {/* Fretboard Grid */}
        <div className="flex-1 overflow-x-hidden">
          <Fretboard
            startFret={startFret}
            visibleFretCount={VISIBLE_FRET_COUNT}
            tuning={STANDARD_TUNING}
            renderNote={(stringIndex, fretNum) => {
              // Create position object here
              const position: NotePosition = { string: stringIndex, fret: fretNum };

              // --- Calculate Note --- 
              const openStringNoteIndex = ALL_NOTES.indexOf(STANDARD_TUNING[position.string]);
              const noteIndex = (openStringNoteIndex + position.fret) % 12;
              const note = ALL_NOTES[noteIndex];
              
              // --- Check visibility FIRST --- 
              if (!shouldShowNote(note, stringIndex, fretNum)) {
                // If the note shouldn't be shown for the current displayMode, render nothing
                return <NonClickablePlaceholder />; // Or return null if preferred
              }

              // --- Note IS visible, now determine state/rendering --- 
              let state: NoteDisplayState = 'default'; 
              let noteTextOverride: string | null = null; 

              // Apply filters first - ONLY for non-practice or explore sub-mode?
              // Let's apply general filters here, then override in practice cases if needed
              // This might need refinement
              if (practiceMode !== 'find' && practiceMode !== 'octaves' && practiceMode !== 'identify') {
                if (showNaturalOnly && note.includes('#')) {
                   state = 'hidden';
                }
                if (selectedString !== null && position.string !== selectedString) {
                   state = 'hidden';
                }
              }

              // Determine state based on displayMode and practiceMode (only if not already hidden)
              if (state !== 'hidden') { 
                 if (displayMode === 'scale') {
                   const isInScale = scaleNotes.includes(note);
                   if (!isInScale) {
                     state = 'hidden';
                   } else if (highlightedPattern.some(p => p.string === position.string && p.fret === position.fret)) {
                     state = 'pattern_highlight';
                   } else if (rootNote === note) {
                     state = 'root';
                   } else {
                     state = 'pattern_member';
                   }
                   // For any visible scale note (root, pattern_member, pattern_highlight), show interval label
                   if (state !== 'hidden') {
                     noteTextOverride = intervalLabels[note] ?? note;
                   }
                 } else if (displayMode === 'caged' && cagedShape) {
                   const cagedPosition = cagedShape.positions.find(p => p.string === position.string && p.fret === position.fret);
                   if (!cagedPosition) {
                     state = 'hidden';
                   } else {
                     if (cagedShowIntervals) {
                       // Calculate interval relative to the ACTUAL rootNote prop
                       const rootNoteIndex = rootNote ? ALL_NOTES.indexOf(rootNote) : -1;
                       if (rootNoteIndex !== -1) {
                         const interval = (noteIndex - rootNoteIndex + 12) % 12;
                         switch (interval) {
                           case 0: noteTextOverride = 'R'; break; // Root
                           case 4: noteTextOverride = '3'; break; // Major 3rd
                           case 7: noteTextOverride = '5'; break; // Perfect 5th
                           // Add cases for other intervals if needed for other CAGED contexts?
                           default: noteTextOverride = note; // Fallback for other intervals
                         }
                       } else {
                         noteTextOverride = note; // Fallback if rootNote is invalid
                       }
                     } else {
                       // Show actual note names
                       noteTextOverride = note;
                     }
                     // Color based on the ACTUAL note vs the selected rootNote prop
                     state = note === rootNote ? 'caged_root' : 'caged_finger';
                   }
                 } else if (displayMode === 'chord' && chordVoicing) {
                     const voicingPosition = chordVoicing.positions.find(p => 
                         p.string === stringIndex && p.fret === fretNum
                     );
                     
                     if (voicingPosition) {
                         // Note is explicitly fretted or an open string defined in the voicing data
                         state = (voicingPosition.noteType === 'Root' || note === chordRootNote) ? 'root' : 'pattern_member';
                     } else {
                         // If it got here, it must be a valid open string not explicitly in positions
                         // (because shouldShowNote would have hidden others)
                         state = note === chordRootNote ? 'root' : 'pattern_member';
                         // Potentially add logic here if interval display is needed for chords?
                     }
                 } else if (displayMode === 'practice') {
                   switch (practiceMode) {
                     case 'identify':
                       const isQuizPos = quizPosition?.string === position.string && quizPosition?.fret === position.fret;
                       if (isQuizPos) {
                         if (quizResult === 'correct') {
                           state = 'quiz_correct';
                         } else if (quizResult === 'incorrect' || showAnswer) {
                           state = 'quiz_reveal';
                         } else {
                           state = 'quiz_question';
                         }
                       } else {
                         state = 'hidden'; // Hide non-quiz notes
                       }
                       break;
                     case 'find':
                       const isFound = foundPositions.some(p => p.string === position.string && p.fret === position.fret);
                       const isIncorrect = incorrectClickPos?.string === position.string && incorrectClickPos?.fret === position.fret;
                       if (isIncorrect) {
                         state = 'quiz_incorrect_click';
                       } else if (isFound) {
                         state = 'target_found';
                       } else {
                         state = 'placeholder_clickable';
                       }
                       break;
                     case 'octaves': 
                       const isInitial = initialOctavePosition?.string === position.string && initialOctavePosition?.fret === position.fret;
                       const isFoundOctave = foundOctaves.some(p => p.string === position.string && p.fret === position.fret);
                       const isIncorrectOctaveClick = incorrectClickPos?.string === position.string && incorrectClickPos?.fret === position.fret;
                       if (isInitial) {
                         state = 'root';
                       } else if (isIncorrectOctaveClick) {
                         state = 'quiz_incorrect_click';
                       } else if (isFoundOctave) {
                         state = 'target_found';
                       } else {
                         state = 'placeholder_clickable';
                       }
                       break;
                     case 'explore': // Apply filters specifically in explore sub-mode
                     default:
                       state = crossHighlightNote === note ? 'highlighted' : 'default'; 
                       if (state === 'default') {
                          if (showNaturalOnly && note.includes('#')) { state = 'hidden'; }
                          if (selectedString !== null && position.string !== selectedString) { state = 'hidden'; }
                       }
                       break;
                   }
                 } else { // Default 'explore' mode outside practice
                   state = crossHighlightNote === note ? 'highlighted' : 'default';
                    if (state === 'default') {
                       if (showNaturalOnly && note.includes('#')) { state = 'hidden'; }
                       if (selectedString !== null && position.string !== selectedString) { state = 'hidden'; }
                    }
                 }
              }

              // --- Render Component Based on State --- 
              const commonProps = {
                 position: position,
                 onClick: () => handleNoteClick(position),
                 onMouseEnter: () => setHoverPosition(position),
                 onMouseLeave: () => setHoverPosition(null),
              };

              switch (state) {
                 case 'hidden':
                   return null;
                 case 'placeholder_clickable':
                   return <ClickablePlaceholder onClick={() => handleNoteClick(position)} />;
                 case 'caged_finger':
                 case 'caged_root':
                   return <FretboardNote {...commonProps} note={noteTextOverride ?? note} state={state} />;
                 default:
                   return <FretboardNote {...commonProps} note={noteTextOverride ?? note} state={state} />;
              }
            }}
          />
        </div>
      </div>

      {/* Row for Fret Numbers/Markers */}
      <div className="flex items-center mt-2">
        {/* Spacer div to align with string labels - match width and margin */}
        <div className="w-10 flex-shrink-0 mr-2"></div>
        {/* Fret Numbers and Markers (Aligned with fretboard grid) */}
        <div className="flex flex-1"> {/* Remove pr-[10px] if it was causing issues */}
          {Array.from({ length: VISIBLE_FRET_COUNT }).map((_, i) => {
            const fretNumber = startFret + i;
            return (
              <div key={fretNumber} className="flex-1 flex flex-col items-center pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                 {fretNumber > 0 ? fretNumber : '0'}
                </span>
                <div className="h-4 mt-1 flex items-center justify-center">
                  <FretboardMarker fret={fretNumber} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Buttons (Absolutely Positioned) */}
      <div className="absolute bottom-4 right-4 flex">
          <button
            onClick={() => moveStartFret(-1)}
            disabled={startFret === 0}
            className="px-3 py-1 rounded-l-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => moveStartFret(1)}
            disabled={startFret >= FRET_COUNT - VISIBLE_FRET_COUNT + 1}
            className="px-3 py-1 rounded-r-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            →
          </button>
        </div>
    </div> // End of relative wrapper
  );
};

export default FretboardDisplay; 