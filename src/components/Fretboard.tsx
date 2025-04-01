import React from 'react';
import { useFretboard, NotePosition, FretboardConfig } from '@/hooks/useFretboard';

interface FretboardProps extends FretboardConfig {
  // Customization props
  renderNote?: (note: string, position: NotePosition) => React.ReactNode;
  renderFretMarker?: (fret: number) => React.ReactNode;
  renderStringLabel?: (stringIndex: number, note: string) => React.ReactNode;
  className?: string;
}

const defaultRenderNote = (note: string, position: NotePosition) => (
  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm">
    {note}
  </div>
);

const defaultRenderFretMarker = (fret: number) => (
  <div className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-secondary-600"></div>
);

const defaultRenderStringLabel = (stringIndex: number, note: string) => (
  <div className="w-10 flex-shrink-0 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-300">
    {note}
  </div>
);

export const Fretboard: React.FC<FretboardProps> = ({
  tuning,
  fretCount,
  startFret: initialStartFret,
  visibleFretCount,
  renderNote = defaultRenderNote,
  renderFretMarker = defaultRenderFretMarker,
  renderStringLabel = defaultRenderStringLabel,
  className = '',
}) => {
  const {
    notes,
    highlightedNotes,
    selectedString,
    showNaturalOnly,
    startFret,
    endFret,
    moveStartFret,
    toggleNoteHighlight,
    toggleStringSelection,
    getNoteAtPosition,
    isNaturalNote,
  } = useFretboard({
    tuning,
    fretCount,
    startFret: initialStartFret,
    visibleFretCount,
  });

  const visibleFrets = Array.from(
    { length: endFret - startFret + 1 },
    (_, i) => startFret + i
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Fret numbers */}
      <div className="flex border-b-2 border-secondary-400 dark:border-secondary-500 mb-2">
        <div className="w-10 flex-shrink-0"></div>
        {visibleFrets.map((fretNum) => (
          <div
            key={`fret-${fretNum}`}
            className={`flex-1 text-center py-2 font-medium ${
              fretNum === 0 ? 'text-secondary-500 font-bold' : ''
            } ${[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fretNum) ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}`}
          >
            {fretNum}
          </div>
        ))}
      </div>

      {/* Fretboard */}
      <div className="border-b border-secondary-300 dark:border-secondary-600">
        {[...tuning].reverse().map((stringNote, reversedIndex) => {
          const stringIndex = tuning.length - 1 - reversedIndex;
          const isSelected = selectedString === stringIndex;

          return (
            <div
              key={`string-${stringIndex}`}
              className="flex border-b border-secondary-300 dark:border-secondary-600 last:border-b-0"
            >
              {/* String label */}
              <div
                className={`w-10 flex-shrink-0 flex items-center justify-center cursor-pointer
                  ${isSelected 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-primary-700 dark:text-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/30'
                  }`}
                onClick={() => toggleStringSelection(stringIndex)}
              >
                {renderStringLabel(stringIndex, stringNote)}
              </div>

              {/* Frets */}
              {visibleFrets.map((fretNum) => {
                const note = getNoteAtPosition(stringIndex, fretNum);
                const position = { string: stringIndex, fret: fretNum };
                const shouldShowNote = showNaturalOnly ? isNaturalNote(note) : true;

                return (
                  <div
                    key={`string-${stringIndex}-fret-${fretNum}`}
                    className={`flex-1 relative flex items-center justify-center ${
                      fretNum === 0 ? 'bg-secondary-100 dark:bg-secondary-700/50' : ''
                    } min-h-[44px] ${fretNum > 0 ? 'border-l border-secondary-400 dark:border-secondary-600' : ''}`}
                    onClick={() => shouldShowNote && toggleNoteHighlight(note)}
                  >
                    {shouldShowNote && renderNote(note, position)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Fret markers */}
      <div className="flex h-6 mt-1">
        <div className="w-10 flex-shrink-0"></div>
        {visibleFrets.map((fretNum) => (
          <div key={`marker-${fretNum}`} className="flex-1 relative flex items-center justify-center">
            {renderFretMarker(fretNum)}
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-end space-x-2 mt-4">
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
          disabled={startFret >= fretCount - visibleFretCount + 1}
          className={`px-2 py-1 rounded-md ${
            startFret >= fretCount - visibleFretCount + 1
              ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 cursor-not-allowed'
              : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300'
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
}; 