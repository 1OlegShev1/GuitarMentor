import React from 'react';
import { NotePosition } from '@/hooks/useFretboard';
import { FretboardDisplayMode } from './FretboardDisplay';

// Define and Export the Explicit Note States
export type NoteDisplayState =
  | 'default'           // Standard note display
  | 'hidden'            // Completely hidden (render null in parent)
  | 'placeholder_clickable' // Placeholder for interaction (e.g., find note target)
  | 'placeholder_non_clickable' // Visual placeholder, no interaction
  | 'highlighted'       // General highlight (e.g., cross-highlight)
  | 'root'              // Root note highlight (scale/chord/octave start)
  | 'pattern_member'    // Part of a displayed pattern (e.g., scale)
  | 'quiz_question'     // Identify mode '?' state
  | 'quiz_reveal'       // Identify mode revealed answer state (yellow highlight)
  | 'quiz_correct'      // Identify mode correct answer state (green)
  // | 'quiz_incorrect' // Maybe just use 'quiz_reveal' visually?
  | 'target_found'      // Find mode found note state (green)
  | 'quiz_incorrect_click' // NEW: Find mode temporary incorrect click feedback
  | 'pattern_highlight' // NEW: Scale explorer specific position highlight
  | 'caged_finger'      // CAGED finger number display
  | 'caged_root'        // CAGED root note display (might overlap with 'root')
  // | 'open_string';      // REMOVED

// Update Props to use the state enum
export interface FretboardNoteProps {
  note: string;           // The actual note name (e.g., 'A#') OR finger number for CAGED
  state: NoteDisplayState; // The calculated visual state
  position: NotePosition;   // Still needed for keys potentially
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string; // Keep className for potential overrides
  // Removed many props previously needed for internal state calculation
}

// Refactor the component logic later based on the 'state' prop
export const FretboardNote: React.FC<FretboardNoteProps> = React.memo(({
  note,              // Actual note (A#) or finger (1, 2, O)
  state,             // The driving visual state
  position,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
}) => {

  let displayContent: React.ReactNode = note;
  let baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-150';
  let backgroundClasses = '';
  let textClasses = '';
  let borderClasses = '';
  let scaleClasses = 'hover:scale-110';
  let cursorClasses = 'cursor-pointer';

  // Determine styling and content based on the state prop
  switch (state) {
    case 'quiz_question':
      displayContent = '?';
      backgroundClasses = 'bg-yellow-400 dark:bg-yellow-500';
      textClasses = 'text-yellow-900 dark:text-yellow-100 font-bold';
      borderClasses = 'border-2 border-yellow-600 dark:border-yellow-700';
      scaleClasses = 'scale-110 ring-2 ring-yellow-600 dark:ring-yellow-700';
      cursorClasses = 'cursor-default'; // Already found
      break;
    case 'quiz_reveal':
      displayContent = note; // Show the actual note
      backgroundClasses = 'bg-yellow-400 dark:bg-yellow-500';
      textClasses = 'text-yellow-900 dark:text-yellow-100 font-bold';
      borderClasses = 'border-2 border-yellow-600 dark:border-yellow-700';
      scaleClasses = 'scale-110 ring-2 ring-yellow-600 dark:ring-yellow-700';
      cursorClasses = 'cursor-default'; // No more clicking after reveal?
      break;
    case 'quiz_correct':
      displayContent = note;
      backgroundClasses = 'bg-green-500 dark:bg-green-600';
      textClasses = 'text-white';
      scaleClasses = 'scale-110';
      cursorClasses = 'cursor-default';
      break;
    case 'target_found':
      displayContent = note;
      backgroundClasses = 'bg-green-500 dark:bg-green-600';
      textClasses = 'text-white';
      scaleClasses = 'scale-105'; // Slightly less emphasis than quiz correct?
      cursorClasses = 'cursor-default'; // Already found
      break;
    case 'quiz_incorrect_click': // NEW state styling
      displayContent = 'X'; // Show an 'X' for incorrect
      backgroundClasses = 'bg-red-500 dark:bg-red-700';
      textClasses = 'text-white font-bold';
      scaleClasses = 'scale-110'; // Briefly emphasize
      cursorClasses = 'cursor-default'; // Prevent immediate re-click during feedback
      break;
    case 'root':
    case 'caged_root':
      displayContent = note; // Note name for root, finger for caged_root handled by parent override
      backgroundClasses = 'bg-red-500 dark:bg-red-600';
      textClasses = 'text-white';
      borderClasses = '';
      break;
    case 'highlighted':
      displayContent = note;
      backgroundClasses = 'bg-indigo-500 dark:bg-indigo-700';
      textClasses = 'text-white';
      scaleClasses = 'scale-110 hover:scale-110'; // Already scaled?
      break;
    case 'pattern_member': // Example for scales (less emphasis)
      displayContent = note;
      backgroundClasses = 'bg-teal-100 dark:bg-teal-900';
      textClasses = 'text-teal-800 dark:text-teal-200';
      break;
    case 'pattern_highlight': // NEW: Highlighted pattern note (more emphasis)
      displayContent = note;
      backgroundClasses = 'bg-teal-400 dark:bg-teal-600'; // Brighter teal
      textClasses = 'text-teal-900 dark:text-teal-100 font-medium';
      borderClasses = 'border border-teal-600 dark:border-teal-400'; // Add border
      scaleClasses = 'scale-105'; // Slight scale up
      break;
    case 'caged_finger': // Use note prop directly (parent sends finger number)
      displayContent = note;
      backgroundClasses = 'bg-blue-500 dark:bg-blue-600';
      textClasses = 'text-white';
      borderClasses = 'border-blue-700 dark:border-blue-500';
      break;
    case 'default':
    default:
      displayContent = note;
      backgroundClasses = 'bg-gray-200 dark:bg-gray-700';
      textClasses = 'text-gray-800 dark:text-gray-200';
      scaleClasses = 'hover:scale-110 hover:ring-2 hover:ring-primary-400 dark:hover:ring-primary-600'; // Default hover
      break;
  }

  // State 'hidden', 'placeholder_clickable', 'placeholder_non_clickable' are handled by the parent returning null or specific components.
  
  return (
    <div
      title={note}
      className={`
        ${baseClasses}
        ${backgroundClasses}
        ${textClasses}
        ${borderClasses}
        ${scaleClasses}
        ${cursorClasses}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {displayContent}
    </div>
  );
}); 