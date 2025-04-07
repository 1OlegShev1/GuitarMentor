import React from 'react';
import { NotePosition } from '@/hooks/useFretboard';

interface FretboardProps {
  tuning: string[];
  startFret: number;
  visibleFretCount: number;
  renderNote: (stringIndex: number, fretNum: number) => React.ReactNode;
  renderStringLabel?: (stringIndex: number, note: string) => React.ReactNode;
  className?: string;
}

export const Fretboard: React.FC<FretboardProps> = ({
  tuning,
  startFret,
  visibleFretCount,
  renderNote,
  renderStringLabel,
  className = '',
}) => {
  const visibleFrets = Array.from(
    { length: visibleFretCount },
    (_, i) => startFret + i
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="relative border-t border-b border-gray-300 dark:border-gray-600">
        {[...tuning].reverse().map((stringNote, reversedIndex) => {
          const stringIndex = tuning.length - 1 - reversedIndex;

          return (
            <div
              key={`string-${stringIndex}`}
              className="flex border-b border-gray-300 dark:border-gray-600 last:border-b-0"
              style={{ minHeight: '3rem' }}
            >
              {renderStringLabel && (
                 <div className="w-10 flex-shrink-0 flex items-center justify-center border-r border-gray-300 dark:border-gray-600">
                   {renderStringLabel(stringIndex, stringNote)}
                 </div>
              )}

              <div className="flex flex-1">
                {visibleFrets.map((fretNum) => {
                  return (
                    <div
                      key={`string-${stringIndex}-fret-${fretNum}`}
                      className={`flex-1 relative flex items-center justify-center border-r border-gray-300 dark:border-gray-600 last:border-r-0`}
                    >
                      <div className="z-10">
                        {renderNote(stringIndex, fretNum)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 