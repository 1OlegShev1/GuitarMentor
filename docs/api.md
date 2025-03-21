# Guitar Mentor API Documentation

This document provides information about the core API functions, hooks, and utilities used throughout the Guitar Mentor application.

## Core Modules

### Music Theory Utilities

These utilities handle music theory concepts like notes, scales, chords, and progressions.

#### Note Functions

```typescript
/**
 * Converts a note name and fret position to a standard note
 * @param string Guitar string number (1-6, where 1 is high E)
 * @param fret Fret number (0-24)
 * @returns Standard note name (e.g., 'C', 'F#')
 */
function getFretNote(string: number, fret: number): string

/**
 * Gets all positions of a specific note on the fretboard
 * @param note Note name (e.g., 'C', 'F#')
 * @param fretCount Number of frets on the guitar
 * @returns Array of {string, fret} positions
 */
function getNotePositions(note: string, fretCount: number = 24): Position[]

/**
 * Determines if two notes are enharmonic equivalents
 * @param note1 First note name
 * @param note2 Second note name
 * @returns Boolean indicating if notes are enharmonic
 */
function areNotesEnharmonic(note1: string, note2: string): boolean
```

#### Scale Functions

```typescript
/**
 * Gets all notes in a scale
 * @param rootNote Root note of the scale
 * @param scaleType Type of scale (e.g., 'major', 'minor', 'pentatonic')
 * @returns Array of note names in the scale
 */
function getScaleNotes(rootNote: string, scaleType: string): string[]

/**
 * Gets all positions for notes in a scale on the fretboard
 * @param rootNote Root note of the scale
 * @param scaleType Type of scale
 * @param fretCount Number of frets
 * @returns Array of {string, fret, note} positions
 */
function getScalePositions(rootNote: string, scaleType: string, fretCount: number = 24): ScalePosition[]

/**
 * Gets predefined scale positions (CAGED system or pentatonic boxes)
 * @param rootNote Root note of the scale
 * @param scaleType Type of scale
 * @param positionNumber Position number (1-5 for CAGED/pentatonic)
 * @returns Array of {string, fret, note, finger} positions
 */
function getScalePosition(rootNote: string, scaleType: string, positionNumber: number): ScalePosition[]
```

#### Chord Functions

```typescript
/**
 * Gets notes in a chord
 * @param rootNote Root note of the chord
 * @param chordType Type of chord (e.g., 'major', 'minor', '7', 'maj7')
 * @returns Array of note names in the chord
 */
function getChordNotes(rootNote: string, chordType: string): string[]

/**
 * Gets standard chord voicings for a specific chord
 * @param rootNote Root note of the chord
 * @param chordType Type of chord
 * @param voicingType Type of voicing (e.g., 'open', 'barre', 'caged-C')
 * @returns Array of {string, fret, note, finger} positions
 */
function getChordVoicing(rootNote: string, chordType: string, voicingType: string): ChordPosition[]

/**
 * Determines if a chord can be played in a specific CAGED shape
 * @param rootNote Root note of the chord
 * @param chordType Type of chord
 * @param cagedShape CAGED shape ('C', 'A', 'G', 'E', or 'D')
 * @returns Boolean indicating if the chord can use the shape
 */
function canUseCAGEDShape(rootNote: string, chordType: string, cagedShape: string): boolean
```

#### Progression Functions

```typescript
/**
 * Gets common chord progressions for a given key
 * @param key Key for the progressions (e.g., 'C', 'A minor')
 * @returns Object mapping progression names to chord arrays
 */
function getCommonProgressions(key: string): Record<string, string[]>

/**
 * Analyzes a chord progression and suggests extensions
 * @param chords Array of chord names (e.g., ['C', 'G', 'Am', 'F'])
 * @returns Object with suggestions for bridges, variations, and extensions
 */
function analyzeProgression(chords: string[]): ProgressionAnalysis
```

### Audio Utilities

Utilities for audio processing and playback.

```typescript
/**
 * Plays a single note with the specified settings
 * @param note Note name to play
 * @param duration Duration in seconds
 * @param volume Volume level (0-1)
 * @returns Promise that resolves when playback completes
 */
function playNote(note: string, duration: number = 0.5, volume: number = 0.7): Promise<void>

/**
 * Plays a sequence of notes with timing
 * @param noteSequence Array of {note, duration, velocity} objects
 * @param tempo Tempo in BPM
 * @returns Promise that resolves when sequence completes
 */
function playNoteSequence(noteSequence: NoteSequence[], tempo: number = 120): Promise<void>

/**
 * Plays a chord with the specified settings
 * @param notes Array of notes in the chord
 * @param duration Duration in seconds
 * @param volume Volume level (0-1)
 * @returns Promise that resolves when playback completes
 */
function playChord(notes: string[], duration: number = 1, volume: number = 0.7): Promise<void>
```

## React Hooks

Custom hooks used throughout the application.

### Fretboard Hooks

```typescript
/**
 * Hook for managing fretboard state
 * @returns Object with fretboard state and methods
 */
function useFretboard(): {
  currentNotes: Position[];
  highlightedNotes: Position[];
  stringCount: number;
  fretCount: number;
  setHighlightedNotes: (notes: Position[]) => void;
  highlightScale: (rootNote: string, scaleType: string) => void;
  highlightChord: (rootNote: string, chordType: string) => void;
  clearHighlights: () => void;
}

/**
 * Hook for managing scale positions
 * @param initialRoot Initial root note
 * @param initialType Initial scale type
 * @returns Object with scale state and methods
 */
function useScalePositions(initialRoot: string, initialType: string): {
  rootNote: string;
  scaleType: string;
  positions: ScalePosition[][];
  currentPosition: number;
  setRootNote: (note: string) => void;
  setScaleType: (type: string) => void;
  nextPosition: () => void;
  previousPosition: () => void;
  setPosition: (position: number) => void;
}
```

### CAGED System Hooks

```typescript
/**
 * Hook for managing CAGED system visualization
 * @param initialRoot Initial root note
 * @param initialType Initial chord type
 * @returns Object with CAGED state and methods
 */
function useCAGEDSystem(initialRoot: string, initialType: string): {
  rootNote: string;
  chordType: string;
  availableShapes: string[];
  currentShape: string;
  positions: ChordPosition[];
  setRootNote: (note: string) => void;
  setChordType: (type: string) => void;
  setShape: (shape: string) => void;
  nextShape: () => void;
  previousShape: () => void;
}
```

### Chord Progression Hooks

```typescript
/**
 * Hook for managing chord progressions
 * @param initialKey Initial key
 * @returns Object with progression state and methods
 */
function useChordProgression(initialKey: string): {
  key: string;
  availableProgressions: Record<string, string[]>;
  customProgression: string[];
  currentProgression: string[];
  setKey: (newKey: string) => void;
  selectProgression: (progressionName: string) => void;
  setCustomProgression: (chords: string[]) => void;
  addChord: (chord: string) => void;
  removeChord: (index: number) => void;
  moveChord: (fromIndex: number, toIndex: number) => void;
}
```

### Jam Assistant Hooks

```typescript
/**
 * Hook for managing jam assistant functionality
 * @returns Object with jam assistant state and methods
 */
function useJamAssistant(): {
  selectedProgression: string[];
  customProgression: string[];
  suggestions: ProgressionSuggestions;
  songPart: string;
  setSelectedProgression: (progression: string[]) => void;
  setCustomProgression: (progression: string[]) => void;
  setSongPart: (part: string) => void;
  analyzeSongStructure: () => SongStructure;
}
```

## Type Definitions

Key type definitions used throughout the application.

```typescript
/** Position on the fretboard */
interface Position {
  string: number;
  fret: number;
}

/** Position on the fretboard with associated note */
interface NotePosition extends Position {
  note: string;
}

/** Position on the fretboard with associated note and finger */
interface ScalePosition extends NotePosition {
  finger?: number;
}

/** Position on the fretboard for chord shapes */
interface ChordPosition extends NotePosition {
  finger?: number;
  isRoot?: boolean;
}

/** Note in a sequence for playback */
interface NoteSequence {
  note: string;
  duration: number;
  velocity?: number;
}

/** Analysis of a chord progression */
interface ProgressionAnalysis {
  key: string;
  romanNumerals: string[];
  suggestions: ProgressionSuggestions;
}

/** Suggestions for a progression */
interface ProgressionSuggestions {
  bridges: string[][];
  variations: string[][];
  extensions: string[][];
}

/** Song structure with parts */
interface SongStructure {
  intro?: string[];
  verse: string[];
  chorus: string[];
  bridge?: string[];
  outro?: string[];
}
```

## Usage Examples

### Highlighting a Scale on the Fretboard

```tsx
import { useFretboard } from '../hooks/useFretboard';

const ScaleVisualizer: React.FC = () => {
  const { highlightScale, clearHighlights } = useFretboard();
  
  // Highlight C major scale
  const handleShowScale = () => {
    highlightScale('C', 'major');
  };
  
  return (
    <div>
      <button onClick={handleShowScale}>Show C Major Scale</button>
      <button onClick={clearHighlights}>Clear</button>
      <FretboardDisplay />
    </div>
  );
};
```

### Working with Chord Progressions

```tsx
import { useChordProgression } from '../hooks/useChordProgression';

const ProgressionBuilder: React.FC = () => {
  const {
    key,
    availableProgressions,
    currentProgression,
    setKey,
    selectProgression,
    addChord
  } = useChordProgression('C');
  
  return (
    <div>
      <select value={key} onChange={(e) => setKey(e.target.value)}>
        {/* Key options */}
      </select>
      
      <div>
        <h3>Common Progressions</h3>
        {Object.entries(availableProgressions).map(([name, chords]) => (
          <button key={name} onClick={() => selectProgression(name)}>
            {name}: {chords.join(' - ')}
          </button>
        ))}
      </div>
      
      <div>
        <h3>Current Progression</h3>
        {currentProgression.map((chord, index) => (
          <span key={index}>{chord} </span>
        ))}
      </div>
    </div>
  );
};
```

## Error Handling

Most functions will throw specific error types for invalid inputs:

```typescript
// Example of error handling
try {
  const scaleNotes = getScaleNotes('C#', 'major');
} catch (error) {
  if (error instanceof InvalidNoteError) {
    console.error('Invalid note provided');
  } else if (error instanceof InvalidScaleTypeError) {
    console.error('Invalid scale type provided');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Extended API Documentation

For more detailed documentation on specific modules or functions, refer to the inline JSDoc comments in the source code or the following specialized documentation pages:

- [Music Theory API](./music-theory-api.md) (planned)
- [Audio API](./audio-api.md) (planned)
- [Component Props](./component-props.md) (planned) 