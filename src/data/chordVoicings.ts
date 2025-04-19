// Dynamic chord voicing generator using interval formulas
import { ChordVoicingData, ChordVoicingPosition } from '@/components/FretboardDisplay';
import { ALL_NOTES, STANDARD_TUNING } from '@/hooks/useFretboard';

// Map flat names to sharps for normalization
const FLAT_TO_SHARP: Record<string, string> = {
  'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#'
};

// Chord quality to semitone interval formulas
const CHORD_FORMULAS: Record<string, number[]> = {
  '':    [0, 4, 7],       // Major triad
  'm':   [0, 3, 7],       // Minor triad
  'dim': [0, 3, 6],       // Diminished triad
  '7':   [0, 4, 7, 10],   // Dominant 7th
  'maj7':[0, 4, 7, 11],   // Major 7th
  'm7':  [0, 3, 7, 10],   // Minor 7th
  'sus2':[0, 2, 7],       // Suspended 2nd
  'sus4':[0, 5, 7],       // Suspended 4th
};

// Parse chordName into its root and quality suffix
export function parseChordName(chordName: string): { root: string; quality: string } {
  const match = chordName.match(/^([A-G][b#]?)(.*)$/);
  return match ? { root: match[1], quality: match[2] } : { root: chordName, quality: '' };
}

/**
 * Generate a chord voicing based on interval formulas.
 * This roots the chord on the 6th string and finds frets within a small span.
 */
export function getChordVoicing(chordName: string): ChordVoicingData | null {
  const { root, quality } = parseChordName(chordName);
  const normalizedRoot = FLAT_TO_SHARP[root] ?? root;
  const rootMidi = ALL_NOTES.indexOf(normalizedRoot);
  if (rootMidi === -1) return null;

  // Find root fret on 6th (low E) string
  const open6Midi = ALL_NOTES.indexOf(STANDARD_TUNING[0]);
  let rootFret = -1;
  for (let fret = 0; fret <= 15; fret++) {
    if ((open6Midi + fret) % 12 === rootMidi) {
      rootFret = fret;
      break;
    }
  }
  if (rootFret === -1) return null;

  // Pick interval formula or default to major triad
  const intervals = CHORD_FORMULAS[quality] ?? CHORD_FORMULAS[''];

  const positions: ChordVoicingPosition[] = [];
  const minOffset = -1;
  const maxOffset = 4;

  // For each string, search within the offset range to match chord tones
  for (let stringIdx = 0; stringIdx < STANDARD_TUNING.length; stringIdx++) {
    const openMidi = ALL_NOTES.indexOf(STANDARD_TUNING[stringIdx]);
    intervals.forEach(interval => {
      const targetMidi = (rootMidi + interval) % 12;
      for (let offset = minOffset; offset <= maxOffset; offset++) {
        const fret = rootFret + offset;
        if (fret < 0 || fret > 24) continue;
        if ((openMidi + fret) % 12 === targetMidi) {
          const noteType = interval === 0 ? 'Root' : undefined;
          positions.push({ string: stringIdx, fret, noteType });
          break;
        }
      }
    });
  }

  return { positions, mutedStrings: [] };
} 