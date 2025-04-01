import React from 'react';
import { NotePosition } from '@/hooks/useFretboard';

interface FretboardNoteProps {
  note: string;
  position: NotePosition;
  isActive?: boolean;
  isNatural?: boolean;
  isQuizPosition?: boolean;
  showAnswer?: boolean;
  quizResult?: 'correct' | 'incorrect' | null;
  quizNote?: string | null;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export const FretboardNote: React.FC<FretboardNoteProps> = ({
  note,
  position,
  isActive = false,
  isNatural = false,
  isQuizPosition = false,
  showAnswer = false,
  quizResult = null,
  quizNote = null,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
}) => {
  return (
    <div
      className={`
        w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer
        transition-all duration-150
        ${isActive ? 'bg-primary-500 text-white scale-110' : 'bg-secondary-200 dark:bg-secondary-700'}
        ${isQuizPosition && quizResult === 'correct' ? 'bg-green-500 text-white scale-110' : ''}
        ${isQuizPosition && quizResult === 'incorrect' ? 'bg-red-500 text-white scale-110' : ''}
        hover:scale-110
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {note}
    </div>
  );
}; 