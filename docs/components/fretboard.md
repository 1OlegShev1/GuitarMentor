# Fretboard Components

The fretboard components provide a modular and reusable system for displaying guitar fretboards in various contexts. The system consists of three main components:

## Core Components

### Fretboard
The main container component that handles the layout and structure of the fretboard.

```typescript
interface FretboardProps {
  tuning: string[];              // Array of notes for each string (low to high)
  fretCount: number;            // Total number of frets to display
  startFret: number;           // Starting fret position to display
  visibleFretCount: number;    // Number of frets visible at once
  renderNote?: (note: string, position: NotePosition) => React.ReactNode;
  renderFretMarker?: (fret: number) => React.ReactNode;
  renderStringLabel?: (stringIndex: number, note: string) => React.ReactNode;
  className?: string;
}
```

### FretboardNote
A specialized component for rendering individual notes on the fretboard.

```typescript
interface FretboardNoteProps {
  note: string;                // The note to display
  position: NotePosition;      // The position on the fretboard
  isActive?: boolean;         // Whether this is the active/root note
  isNatural?: boolean;       // Whether this is a natural note (no sharp/flat)
  isQuizPosition?: boolean;  // Whether this is a quiz position
  showAnswer?: boolean;      // Whether to show the answer (for quiz mode)
  quizResult?: 'correct' | 'incorrect' | null;  // Quiz result state
  quizNote?: string | null;  // The note to find in quiz mode
  onClick?: () => void;      // Click handler
  className?: string;        // Additional CSS classes
}
```

### FretboardMarker
A component for rendering fret markers at traditional positions.

```typescript
interface FretboardMarkerProps {
  fret: number;  // The fret number to render marker for
}
```

## Usage Examples

### Basic Fretboard Display
```typescript
<Fretboard
  tuning={['E', 'A', 'D', 'G', 'B', 'E']}
  fretCount={24}
  startFret={0}
  visibleFretCount={13}
  renderNote={(note, position) => (
    <FretboardNote
      note={note}
      position={position}
      isNatural={note.length === 1}
    />
  )}
  renderFretMarker={(fret) => <FretboardMarker fret={fret} />}
/>
```

### Scale Explorer Implementation
```typescript
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
        className={inPattern ? 'border-[3px] border-orange-500' : ''}
      />
    );
  }}
  renderFretMarker={(fret) => <FretboardMarker fret={fret} />}
/>
```

## Styling

The components use Tailwind CSS for styling and support both light and dark modes. Key styling features:

- Notes are displayed as circular elements with consistent sizing
- Active/root notes are highlighted in primary color
- Natural notes have distinct styling from sharp/flat notes
- Fret markers follow traditional guitar patterns
- Dark mode support with appropriate color contrasts

## Best Practices

1. Always provide the required props for each component
2. Use the render props pattern for customizing note, marker, and label rendering
3. Handle note visibility logic in the parent component
4. Use the className prop for additional styling when needed
5. Maintain consistent styling across different implementations

## Future Improvements

1. Add support for different tunings
2. Implement touch interactions for mobile devices
3. Add animation support for note transitions
4. Improve accessibility with ARIA labels
5. Add support for alternative fretboard layouts 