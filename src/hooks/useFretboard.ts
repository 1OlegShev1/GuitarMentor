import { useState, useMemo } from 'react';

// All music notes
export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface NotePosition {
  string: number;
  fret: number;
}

export interface FretboardConfig {
  tuning: string[];
  fretCount: number;
  startFret: number;
  visibleFretCount: number;
}

export interface FretboardState {
  notes: string[][];
  positions: NotePosition[];
  highlightedNotes: string[];
  selectedString: number | null;
  showNaturalOnly: boolean;
  startFret: number;
  endFret: number;
}

export function useFretboard(config: FretboardConfig) {
  const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [showNaturalOnly, setShowNaturalOnly] = useState(false);
  const [startFret, setStartFret] = useState(config.startFret);

  // Calculate end fret based on visible fret count
  const endFret = useMemo(() => {
    return Math.min(startFret + config.visibleFretCount - 1, config.fretCount);
  }, [startFret, config.visibleFretCount, config.fretCount]);

  // Calculate note indices for open strings
  const openStringIndices = useMemo(() => {
    return config.tuning.map(note => ALL_NOTES.indexOf(note));
  }, [config.tuning]);

  // Calculate all notes on the fretboard
  const notes = useMemo(() => {
    return Array.from({ length: config.tuning.length }, (_, stringIndex) => {
      return Array.from({ length: config.fretCount + 1 }, (_, fret) => {
        const openStringIndex = openStringIndices[stringIndex];
        const noteIndex = (openStringIndex + fret) % 12;
        return ALL_NOTES[noteIndex];
      });
    });
  }, [config.tuning.length, config.fretCount, openStringIndices]);

  // Get note at a specific position
  const getNoteAtPosition = (stringIndex: number, fret: number): string => {
    return notes[stringIndex][fret];
  };

  // Check if a note is natural (no sharp or flat)
  const isNaturalNote = (note: string): boolean => {
    return note.length === 1;
  };

  // Get all positions of a specific note
  const getNotePositions = (note: string): NotePosition[] => {
    const positions: NotePosition[] = [];
    for (let string = 0; string < config.tuning.length; string++) {
      for (let fret = startFret; fret <= endFret; fret++) {
        if (getNoteAtPosition(string, fret) === note) {
          positions.push({ string, fret });
        }
      }
    }
    return positions;
  };

  // Move the visible fret range
  const moveStartFret = (direction: 'left' | 'right') => {
    if (direction === 'left' && startFret > 0) {
      setStartFret(startFret - 1);
    } else if (direction === 'right' && startFret < config.fretCount - config.visibleFretCount + 1) {
      setStartFret(startFret + 1);
    }
  };

  // Toggle note highlighting
  const toggleNoteHighlight = (note: string) => {
    setHighlightedNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };

  // Toggle string selection
  const toggleStringSelection = (stringIndex: number) => {
    setSelectedString(prev => prev === stringIndex ? null : stringIndex);
  };

  return {
    // State
    notes,
    highlightedNotes,
    selectedString,
    showNaturalOnly,
    startFret,
    endFret,
    
    // Actions
    setShowNaturalOnly,
    moveStartFret,
    toggleNoteHighlight,
    toggleStringSelection,
    
    // Utilities
    getNoteAtPosition,
    isNaturalNote,
    getNotePositions,
  };
} 