// Dynamic chord voicing generator using interval formulas
import { ChordVoicingData, ChordVoicingPosition, Barre } from '@/components/FretboardDisplay';
import { ALL_NOTES, STANDARD_TUNING } from '@/hooks/useFretboard';

// Map flat names to sharps for normalization
const FLAT_TO_SHARP: Record<string, string> = {
  'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#'
};

// Chord quality to semitone interval formulas (Still useful for validation/extensions)
// const CHORD_FORMULAS: Record<string, number[]> = {
//   '':    [0, 4, 7],       // Major triad
//   'm':   [0, 3, 7],       // Minor triad
// };

// Define relative chord shape patterns
interface RelativePosition {
  string: number; // 0-5 index
  relativeFret: number;
  noteType: 'Root' | '3rd' | '5th'; // Simplified for now
}

interface RelativeShape {
  name: string;
  rootStringIndex: 0 | 1; // 6th or 5th string
  positions: RelativePosition[];
  barres?: { relativeFret: number; startString: number; endString: number }[]; // Relative fret
  mutedStrings?: number[]; // 1-based string numbers
}

const RELATIVE_SHAPES: { [shapeName: string]: RelativeShape } = {
  'E_Major': {
    name: 'E-Shape Major (Root 6th Str)',
    rootStringIndex: 0,
    positions: [
      { string: 0, relativeFret: 0, noteType: 'Root' },
      { string: 1, relativeFret: 2, noteType: '5th' },
      { string: 2, relativeFret: 2, noteType: 'Root' },
      { string: 3, relativeFret: 1, noteType: '3rd' },
      // string 4 (B) and 5 (E) might be open or part of barre
    ],
    barres: [{ relativeFret: 0, startString: 6, endString: 1 }], // Barre across all strings at root fret
    mutedStrings: [],
  },
  'E_Minor': {
    name: 'E-Shape Minor (Root 6th Str)',
    rootStringIndex: 0,
    positions: [
      { string: 0, relativeFret: 0, noteType: 'Root' },
      { string: 1, relativeFret: 2, noteType: '5th' },
      { string: 2, relativeFret: 2, noteType: 'Root' },
      { string: 3, relativeFret: 0, noteType: '3rd' }, // Minor 3rd is at root fret
      // string 4 (B) and 5 (E) might be open or part of barre
    ],
    barres: [{ relativeFret: 0, startString: 6, endString: 1 }],
    mutedStrings: [],
  },
  'A_Major': {
    name: 'A-Shape Major (Root 5th Str)',
    rootStringIndex: 1,
    positions: [
      { string: 1, relativeFret: 0, noteType: 'Root' },
      { string: 2, relativeFret: 2, noteType: '5th' },
      { string: 3, relativeFret: 2, noteType: 'Root' },
      { string: 4, relativeFret: 2, noteType: '3rd' },
      { string: 5, relativeFret: 0, noteType: '5th' }, // High E string
    ],
    // Barre typically needed on fret relativeFret - 2 for root, but simpler to barre root fret
    barres: [{ relativeFret: 0, startString: 5, endString: 1 }], // Barre from 5th string down at root fret
    mutedStrings: [6], // Mute low E string
  },
  'A_Minor': {
    name: 'A-Shape Minor (Root 5th Str)',
    rootStringIndex: 1,
    positions: [
      { string: 1, relativeFret: 0, noteType: 'Root' },
      { string: 2, relativeFret: 2, noteType: '5th' },
      { string: 3, relativeFret: 2, noteType: 'Root' },
      { string: 4, relativeFret: 1, noteType: '3rd' }, // Minor 3rd relative fret 1
      { string: 5, relativeFret: 0, noteType: '5th' }, // High E string
    ],
    barres: [{ relativeFret: 0, startString: 5, endString: 1 }],
    mutedStrings: [6],
  },
};

// Parse chordName into its root and quality suffix
export function parseChordName(chordName: string): { root: string; quality: string } {
  const match = chordName.match(/^([A-G][b#]?)(m|maj7|m7|7|dim|sus2|sus4)?$/);
  return match ? { root: match[1], quality: match[2] || '' } : { root: chordName, quality: '' };
}

/**
 * Get a playable chord voicing using transposable relative shapes.
 * Prioritizes E-shape (root 6th str) then A-shape (root 5th str).
 */
export function getChordVoicing(chordName: string): ChordVoicingData | null {
  const { root, quality } = parseChordName(chordName);
  const normalizedRoot = FLAT_TO_SHARP[root] ?? root;
  const rootMidi = ALL_NOTES.indexOf(normalizedRoot);
  if (rootMidi === -1) return null;

  const isMinor = quality === 'm';
  let chosenShape: RelativeShape | null = null;
  let rootFret = -1;

  // 1. Try finding root on 6th string for E-shape
  const open6Midi = ALL_NOTES.indexOf(STANDARD_TUNING[0]);
  for (let fret = 0; fret <= 12; fret++) { // Look up to 12th fret
    if ((open6Midi + fret) % 12 === rootMidi) {
      rootFret = fret;
      chosenShape = isMinor ? RELATIVE_SHAPES['E_Minor'] : RELATIVE_SHAPES['E_Major'];
      break;
    }
  }

  // 2. If not found or shape invalid, try finding root on 5th string for A-shape
  if (!chosenShape) {
    const open5Midi = ALL_NOTES.indexOf(STANDARD_TUNING[1]);
    for (let fret = 0; fret <= 12; fret++) {
      if ((open5Midi + fret) % 12 === rootMidi) {
        // Check if this root fret allows the shape (e.g., A-shape needs space below)
        // For simplicity, we'll just use it if found for now.
        rootFret = fret;
        chosenShape = isMinor ? RELATIVE_SHAPES['A_Minor'] : RELATIVE_SHAPES['A_Major'];
        break;
      }
    }
  }

  // 3. If a shape and root fret were determined, transpose the pattern
  if (chosenShape && rootFret !== -1) {
    const absolutePositions: ChordVoicingPosition[] = chosenShape.positions.map(pos => ({
      ...pos,
      fret: rootFret + pos.relativeFret,
    })).filter(p => p.fret >= 0 && p.fret <= 24); // Ensure frets are valid

    // Add open strings IF they match a required interval and aren't muted
    const requiredIntervals = new Set(isMinor ? [0, 3, 7] : [0, 4, 7]);
    for (let stringIdx = 0; stringIdx < STANDARD_TUNING.length; stringIdx++) {
        // Check if string is explicitly fretted or muted
        const isFretted = absolutePositions.some(p => p.string === stringIdx);
        const isMuted = chosenShape.mutedStrings?.includes(stringIdx + 1);
        
        if (!isFretted && !isMuted) {
            const openStringNote = STANDARD_TUNING[stringIdx];
            const openStringMidi = ALL_NOTES.indexOf(openStringNote);
            const interval = (openStringMidi - rootMidi + 12) % 12;
            
            if (requiredIntervals.has(interval)) {
                let noteType: 'Root' | '3rd' | '5th' | undefined = undefined;
                if (interval === 0) noteType = 'Root';
                else if (interval === (isMinor ? 3 : 4)) noteType = '3rd';
                else if (interval === 7) noteType = '5th';
                
                // Add open string note if it matches a required interval
                absolutePositions.push({ string: stringIdx, fret: 0, noteType });
            }
        }
    }

    const absoluteBarres: Barre[] = (chosenShape.barres || []).map(barre => ({
      ...barre,
      fret: rootFret + barre.relativeFret,
    })).filter(b => b.fret >= 0 && b.fret <= 24);

    return {
      positions: absolutePositions,
      barres: absoluteBarres,
      mutedStrings: chosenShape.mutedStrings,
    };
  }

  return null; // No suitable voicing found
}


// --- Previous dynamic generator - keep for reference or future use? ---
/*
export function getChordVoicing_Dynamic(chordName: string): ChordVoicingData | null {
  // ... previous implementation ...
}
*/ 