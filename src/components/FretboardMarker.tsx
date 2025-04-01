import React from 'react';

interface FretboardMarkerProps {
  fret: number;
}

export const FretboardMarker: React.FC<FretboardMarkerProps> = ({ fret }) => {
  // Single dots at traditional positions
  if ([3, 5, 7, 9, 15, 17, 19, 21].includes(fret)) {
    return (
      <div className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-secondary-600"></div>
    );
  }

  // Double dots at 12th and 24th frets
  if ([12, 24].includes(fret)) {
    return (
      <div className="flex gap-3">
        <div className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-600"></div>
        <div className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-600"></div>
      </div>
    );
  }

  return null;
}; 