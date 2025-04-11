"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';
import { ALL_NOTES } from '@/hooks/useFretboard';
import FretboardDisplay, { ChordVoicingData } from '@/components/FretboardDisplay';

// Define key-value pairs for available keys
const KEYS = [
  { value: 'C', label: 'C' },
  { value: 'G', label: 'G' },
  { value: 'D', label: 'D' },
  { value: 'A', label: 'A' },
  { value: 'E', label: 'E' },
  { value: 'B', label: 'B' },
  { value: 'F#', label: 'F#' },
  { value: 'F', label: 'F' },
  { value: 'Bb', label: 'Bb' },
  { value: 'Eb', label: 'Eb' },
  { value: 'Ab', label: 'Ab' },
  { value: 'Db', label: 'Db' },
];

// Define common chord progressions
const PROGRESSIONS = [
  {
    id: '1-4-5-1',
    name: 'I - IV - V - I',
    numerals: ['I', 'IV', 'V', 'I'],
    description: 'The foundation of countless songs in rock, blues, folk, and pop music.',
  },
  {
    id: '1-5-6-4',
    name: 'I - V - vi - IV',
    numerals: ['I', 'V', 'vi', 'IV'],
    description: 'Known as the "pop-punk progression" or "Axis of Awesome" progression, used in hundreds of pop songs.',
  },
  {
    id: '2-5-1',
    name: 'ii - V - I',
    numerals: ['ii', 'V', 'I'],
    description: 'The most common jazz progression, often expanded with additional chords.',
  },
  {
    id: '1-6-4-5',
    name: 'I - vi - IV - V',
    numerals: ['I', 'vi', 'IV', 'V'],
    description: 'The classic "doo-wop" progression used in countless early rock and pop songs.',
  },
  {
    id: '1-4-6-5',
    name: 'I - IV - vi - V',
    numerals: ['I', 'IV', 'vi', 'V'],
    description: 'A versatile progression that works well in many genres.',
  },
  {
    id: '6-4-1-5',
    name: 'vi - IV - I - V',
    numerals: ['vi', 'IV', 'I', 'V'],
    description: 'The minor variant of the pop progression, with a darker feel.',
  },
];

// Chords in each key (major)
const KEY_CHORDS: Record<string, string[]> = {
  'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
  'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
  'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
  'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
  'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
  'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
};

// Map numeral to index in the key chords array
const NUMERAL_TO_INDEX: Record<string, number> = {
  'I': 0,
  'ii': 1,
  'iii': 2,
  'IV': 3,
  'V': 4,
  'vi': 5,
  'vii°': 6,
};

// --- Normalization Helper ---
const FLATS_TO_SHARPS: Record<string, string> = {
  'Bb': 'A#',
  'Eb': 'D#',
  'Ab': 'G#',
  'Db': 'C#',
  'Gb': 'F#',
};

const normalizeNoteName = (note: string): string => {
  return FLATS_TO_SHARPS[note] ?? note; // Return sharp equivalent or original if not flat
};

// --- Helper to get full chord quality name ---
const getChordDisplayName = (chordName: string): string => {
  if (!chordName || chordName === '?') return '?';

  if (chordName.endsWith('dim')) {
    const root = chordName.substring(0, chordName.length - 3);
    return `${root} Diminished`;
  } else if (chordName.endsWith('m')) {
    const root = chordName.substring(0, chordName.length - 1);
    return `${root} minor`;
  } else {
    // Assume Major if no other suffix
    return `${chordName} Major`;
  }
};

// --- Improved Chord Note Calculation ---
const getChordNotes = (chordName: string, octave = 4): string[] => {
  if (!chordName || chordName === '?') return [];
  
  let rootNote = chordName;
  let quality: 'major' | 'minor' | 'diminished' = 'major';

  if (chordName.endsWith('dim')) {
    quality = 'diminished';
    rootNote = chordName.substring(0, chordName.length - 3);
  } else if (chordName.endsWith('m')) {
    quality = 'minor';
    rootNote = chordName.substring(0, chordName.length - 1);
  }

  // Normalize the root note before finding index
  const normalizedRoot = normalizeNoteName(rootNote);
  const rootIndex = ALL_NOTES.indexOf(normalizedRoot);

  if (rootIndex === -1) {
    console.warn(`Could not find root note index for: ${rootNote} (normalized: ${normalizedRoot})`);
    // Return original chord name with octave if lookup fails
    return [`${rootNote}${octave}`]; 
  }

  let thirdInterval: number;
  let fifthInterval: number;

  switch (quality) {
    case 'minor':
      thirdInterval = 3;
      fifthInterval = 7;
      break;
    case 'diminished':
      thirdInterval = 3;
      fifthInterval = 6;
      break;
    case 'major':
    default:
      thirdInterval = 4;
      fifthInterval = 7;
      break;
  }

  const thirdIndex = (rootIndex + thirdInterval) % 12;
  const fifthIndex = (rootIndex + fifthInterval) % 12;

  const rootNoteName = ALL_NOTES[rootIndex];
  const thirdNoteName = ALL_NOTES[thirdIndex];
  const fifthNoteName = ALL_NOTES[fifthIndex];

  // Basic octave handling (can be refined later for better voicings)
  const thirdOctave = thirdIndex < rootIndex ? octave + 1 : octave;
  const fifthOctave = fifthIndex < rootIndex ? octave + 1 : octave;

  return [
    `${rootNoteName}${octave}`,
    `${thirdNoteName}${thirdOctave}`,
    `${fifthNoteName}${fifthOctave}`,
  ];
};

// --- Chord Voicings (Basic Open Chords - 0=LOW E, 5=HIGH E) ---
const getChordVoicing = (chordName: string): ChordVoicingData | null => {
  console.log(`Lookup voicing for: ${chordName}`);
  // Positions use 0-based string index (0=Low E, 5=High E)
  const voicings: Record<string, ChordVoicingData> = {
     'C': { // Open C Major
       positions: [
         // Fretted notes:
         { string: 1, fret: 3, noteType: 'Root' }, // A string, 3rd fret (C)
         { string: 2, fret: 2, noteType: '3rd' },  // D string, 2nd fret (E)
         { string: 4, fret: 1, noteType: 'Root' },  // B string, 1st fret (C)
         // Open strings G, High E are handled by renderNote logic
       ],
       mutedStrings: [1] // Mute Low E (index 0 -> string 1)
     },
     'G': { // Open G Major
       positions: [
         { string: 0, fret: 3, noteType: 'Root' }, // Low E string, 3rd fret (G)
         { string: 1, fret: 2, noteType: '3rd' }, // A string, 2nd fret (B)
         { string: 5, fret: 3, noteType: 'Root' }, // High E string, 3rd fret (G)
         // Open strings D, G, B handled by renderNote logic
       ]
     },
     'Am': { // Open A minor
       positions: [
         { string: 2, fret: 2, noteType: '5th' }, // D string, 2nd fret (E)
         { string: 3, fret: 2, noteType: 'Root' }, // G string, 2nd fret (A)
         { string: 4, fret: 1, noteType: 'minor 3rd' }, // B string, 1st fret (C)
         // Open strings A, High E handled by renderNote logic
       ],
       mutedStrings: [1] // Mute Low E
     },
     'F': { // F Major Barre Chord
       positions: [
         { string: 0, fret: 1, noteType: 'Root' }, // Low E (F)
         { string: 1, fret: 3, noteType: '5th' }, // A string (C)
         { string: 2, fret: 3, noteType: 'Root' }, // D string (F)
         { string: 3, fret: 2, noteType: '3rd' }, // G string (A)
         { string: 4, fret: 1, noteType: '5th' }, // B string (C)
         { string: 5, fret: 1, noteType: 'Root' }, // High E (F)
       ],
       // Barre definition still uses 1-based indexing for strings
       barres: [{ fret: 1, startString: 1, endString: 6 }] 
     },
     // Add Dm, Em, D, E etc. later
  };
  return voicings[chordName] || null;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ChordProgressionsProps {
  // Add props as needed
}

const ChordProgressions: React.FC<ChordProgressionsProps> = () => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedProgression, setSelectedProgression] = useState<string>('1-4-5-1');
  const [customProgression, setCustomProgression] = useState<string[]>(['I', 'IV', 'V', 'I']);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // --- Audio State ---
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(140);
  const [currentChordIndex, setCurrentChordIndex] = useState<number>(-1);
  const synth = useRef<Tone.PolySynth | null>(null);
  const sequence = useRef<Tone.Sequence | null>(null);
  const progressionChordsRef = useRef<string[]>([]);
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const isInitialMount = useRef(true);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [displayedChordName, setDisplayedChordName] = useState<string | null>(null);
  const [chordVoicing, setChordVoicing] = useState<ChordVoicingData | null>(null);
  const [displayedChordRootNote, setDisplayedChordRootNote] = useState<string | null>(null);

  // --- Function to update displayed chord diagram ---
  const showChordDiagram = (chordIdentifier: string) => {
    // chordIdentifier is like "A minor", "C Major", "B Diminished"
    let baseChordName = '';
    if (chordIdentifier.endsWith(' minor')) {
        baseChordName = chordIdentifier.split(' ')[0] + 'm'; // "A minor" -> "Am"
    } else if (chordIdentifier.endsWith(' Diminished')) {
        baseChordName = chordIdentifier.split(' ')[0] + 'dim'; // "B Diminished" -> "Bdim"
    } else if (chordIdentifier.endsWith(' Major')) {
        baseChordName = chordIdentifier.split(' ')[0]; // "C Major" -> "C"
    } else {
         baseChordName = chordIdentifier; // Fallback for simple names or potential errors
         console.warn("Could not reliably parse base chord name from:", chordIdentifier);
    }

    // const chordNameOnly = chordIdentifier.split(' ')[0]; // OLD INCORRECT LOGIC
    const rootNoteOnly = baseChordName.replace(/m$|dim$/, ''); // Use baseChordName for root extraction
    const voicing = getChordVoicing(baseChordName); // Use the reconstructed base name for lookup

    if (voicing) {
      setDisplayedChordName(chordIdentifier); 
      setChordVoicing(voicing);
      setDisplayedChordRootNote(rootNoteOnly); 
    } else {
      // Clear display if no voicing found for the requested chord
      setDisplayedChordName(null);
      setChordVoicing(null);
      setDisplayedChordRootNote(null); 
      console.warn(`No voicing found for ${baseChordName}`);
    }
  };

  // --- Stop Playback Function (for manual stop ONLY) ---
  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.current?.releaseAll();
    setIsPlaying(false);
    setCurrentChordIndex(-1);
    clearChordDisplay(); // Clear diagram when stopping
  };

  // --- Initialize Tone.js Synth (runs once) ---
  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).toDestination();
    isInitialMount.current = false; // Mark initial mount as complete

    return () => {
      // Cleanup on unmount
      Tone.Transport.stop();
      Tone.Transport.cancel();
      sequence.current?.dispose();
      synth.current?.dispose();
    };
  }, []);

  // Get the current progression details
  const currentProgressionDetails = useMemo(() => 
     PROGRESSIONS.find(prog => prog.id === selectedProgression)
  , [selectedProgression]);

  // Get chords for the selected progression in the selected key
  const progressionChords = useMemo((): string[] => {
    const numerals = isCustom ? customProgression : currentProgressionDetails?.numerals ?? [];
    const chords = numerals.map(numeral => {
      const index = NUMERAL_TO_INDEX[numeral];
      return (index !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][index] : '?';
    }).filter(chord => chord !== '?');
    
    progressionChordsRef.current = chords;
    return chords;
  }, [selectedKey, currentProgressionDetails, customProgression, isCustom]);

  // --- Function to Start/Restart Sequence ---
  const startOrRestartSequence = (chordsToPlay?: string[]) => {
      if (!synth.current) {
          console.error("Synth not initialized!");
          return;
      }
      // Use provided chords or fallback to ref (for direct play button)
      const chords = chordsToPlay ?? progressionChordsRef.current;
      
      if (!chords || chords.length === 0) {
          stopPlayback();
          return;
      }

      // --- 1. Stop Transport & Clean Up --- 
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Clear ALL scheduled events
      synth.current.releaseAll(); // Silence immediately
      setCurrentChordIndex(-1); // Reset visual index

      // --- 2. Dispose OLD Sequence --- 
      sequence.current?.dispose();
      sequence.current = null; // Explicitly nullify

      // --- 3. Configure Transport for NEW Sequence ---
      Tone.Transport.position = 0; // Reset position
      Tone.Transport.bpm.value = bpm; // Set BPM
      Tone.Transport.loop = true; // Enable loop
      Tone.Transport.loopEnd = `${chords.length}m`; // Set correct loop end based on NEW chords

      // --- 4. Create and Schedule NEW Sequence ---
      sequence.current = new Tone.Sequence((time, index) => {
          const chordName = chords[index];
          const notesToPlay = getChordNotes(chordName);
          // Ensure synth is still valid inside callback? (Should be okay)
          synth.current?.triggerAttackRelease(notesToPlay, "1n", time); 
          
          Tone.Draw.schedule(() => {
              setCurrentChordIndex(index);
          }, time); 

      }, Array.from({ length: chords.length }, (_, i) => i), "1m").start(0); // Start sequence at transport time 0
      
      // --- 5. Set Up Stop Handler for NEW Transport State ---
      Tone.Transport.off('stop'); 
      Tone.Transport.on('stop', () => {
         synth.current?.releaseAll(); 
         setCurrentChordIndex(-1);
      });

      // --- 6. Start Transport ---
      // Start slightly in the future to allow setup to complete
      Tone.Transport.start("+0.1");

      // --- 7. Update React State --- 
      setIsPlaying(true); 
      // No releaseAll here as it was done during cleanup
  };

  // --- Play/Stop Button Handler ---
  const togglePlayback = async () => {
    if (isPlaying) {
        // Handle Stop action first (simplest case)
        stopPlayback();
        return;
    }

    // Handle Play action
    try {
        if (Tone.context.state === 'suspended') {
            await Tone.start();
            console.log("Audio Context started by user gesture.");
            // Context just started. Schedule the sequence start slightly AFTER transport starts.
            if (!synth.current) { // Double check synth after await
                console.error("Synth not ready after Tone.start()");
                return;
            } 
            Tone.Transport.scheduleOnce((time) => {
                console.log("Scheduled sequence start executing at time:", time);
                startOrRestartSequence();
            }, "+0.1"); // Schedule slightly after transport start

            // Start the transport now, the sequence will begin shortly after via scheduleOnce
            Tone.Transport.start("+0.05"); 
            setIsPlaying(true); // Set state to playing, sequence starts soon

        } else {
            // Audio context already running, start sequence immediately
            startOrRestartSequence();
        }
    } catch (e) {
        console.error("Error during playback toggle:", e);
        // Ensure state is correct if something fails
        if (isPlaying) stopPlayback(); 
    }
  };

  const handleBpmChange = (newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(240, newBpm));
    setBpm(clampedBpm);
    if (Tone.Transport.state === 'started') {
        Tone.Transport.bpm.value = clampedBpm;
    }
  };

  // --- Event Handlers (Call startOrRestartSequence directly if playing) ---

  const handleKeyChange = (newKey: string) => {
    // Key change always stops playback, no restart needed
    if (isPlayingRef.current) {
      stopPlayback(); 
    }
    setSelectedKey(newKey);
  };

  const handleProgressionChange = (id: string) => {
    // Calculate NEW chords based on the selected ID
    const newProgressionDetails = PROGRESSIONS.find(prog => prog.id === id);
    const newNumerals = newProgressionDetails?.numerals ?? [];
    const newChords = newNumerals.map(numeral => {
       const index = NUMERAL_TO_INDEX[numeral];
       return (index !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][index] : '?';
    }).filter(chord => chord !== '?');
    
    // Set state AFTER calculating chords
    setSelectedProgression(id);
    setIsCustom(false);

    // If playing, restart with the NEW chords
    if (isPlayingRef.current) {
      startOrRestartSequence(newChords); // Pass NEW chords directly
    }
  };

  const startCustomProgression = () => {
    const defaultCustomChords = ['I', 'IV', 'V'].map(numeral => { // Use default
       const index = NUMERAL_TO_INDEX[numeral];
       return (index !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][index] : '?';
    }).filter(chord => chord !== '?');
    
    setCustomProgression(['I', 'IV', 'V']);
    setIsCustom(true);
    if (isPlayingRef.current) {
       startOrRestartSequence(defaultCustomChords);
    }
  };

  const updateCustomProgression = (index: number, numeral: string) => {
    const updatedProgressionNumerals = [...customProgression];
    updatedProgressionNumerals[index] = numeral;
    const newChords = updatedProgressionNumerals.map(num => { // Calculate new chords
       const idx = NUMERAL_TO_INDEX[num];
       return (idx !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][idx] : '?';
    }).filter(chord => chord !== '?');

    setCustomProgression(updatedProgressionNumerals);
    if (isPlayingRef.current) {
      startOrRestartSequence(newChords);
    }
  };

  const addChord = () => {
    const updatedProgressionNumerals = [...customProgression, 'I'];
    const newChords = updatedProgressionNumerals.map(num => { // Calculate new chords
       const idx = NUMERAL_TO_INDEX[num];
       return (idx !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][idx] : '?';
    }).filter(chord => chord !== '?');

    setCustomProgression(updatedProgressionNumerals);
    if (isPlayingRef.current) {
       startOrRestartSequence(newChords);
    }
  };

  const removeChord = (index: number) => {
    const updatedProgressionNumerals = customProgression.filter((_, i) => i !== index);
    const newChords = updatedProgressionNumerals.map(num => { // Calculate new chords
       const idx = NUMERAL_TO_INDEX[num];
       return (idx !== undefined && KEY_CHORDS[selectedKey]) ? KEY_CHORDS[selectedKey][idx] : '?';
    }).filter(chord => chord !== '?');

    setCustomProgression(updatedProgressionNumerals);
    if (isPlayingRef.current) {
       startOrRestartSequence(newChords);
    }
  };

  // --- Chord Click Handler ---
  const handleChordClick = (chordIdentifier: string) => {
    // If clicking the already displayed chord, clear it, otherwise show it.
    if (displayedChordName === chordIdentifier) {
        clearChordDisplay();
    } else {
        showChordDiagram(chordIdentifier); // Use the extracted function
    }
  };

  // Function to clear chord display
  const clearChordDisplay = () => {
      setDisplayedChordName(null);
      setChordVoicing(null);
      setDisplayedChordRootNote(null);
  };

  // --- Auto-update Chord Diagram during Playback ---
  useEffect(() => {
    // Only run if playing and index is valid
    if (isPlayingRef.current && currentChordIndex >= 0) {
      const chords = progressionChordsRef.current;
      if (chords && chords.length > currentChordIndex) {
         const currentChordName = chords[currentChordIndex];
         const currentChordDisplayName = getChordDisplayName(currentChordName);
         // Update the displayed diagram to match the playing chord
         showChordDiagram(currentChordDisplayName);
      }
    }
    // We don't need to clear here when index becomes -1, stopPlayback handles it.
  }, [currentChordIndex]); // Run when the playing chord index changes

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-medium">Key:</label>
          <div className="relative inline-block">
            <select 
              value={selectedKey}
              onChange={(e) => handleKeyChange(e.target.value)} // Updated onChange
              className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
              style={{ 
                WebkitAppearance: "none", 
                MozAppearance: "none", 
                appearance: "none",
                backgroundImage: "none"
              }}
            >
              {KEYS.map(key => (
                <option key={key.value} value={key.value}>{key.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a Progression:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {PROGRESSIONS.map(progression => (
            <button
              key={progression.id}
              onClick={() => handleProgressionChange(progression.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedProgression === progression.id && !isCustom
                  ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 border'
                  : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="font-medium">{progression.name}</div>
              <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                {progression.description.substring(0, 60)}...
              </div>
            </button>
          ))}
          
          <button
            onClick={startCustomProgression}
            className={`p-3 rounded-lg text-left transition-colors ${
              isCustom
                ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 border'
                : 'bg-white dark:bg-secondary-800 border border-dashed border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            <div className="font-medium">Custom Progression</div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
              Create your own chord progression...
            </div>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow-inner mb-6">
        <h2 className="font-semibold mb-4">
          {isCustom ? 'Custom Progression' : currentProgressionDetails?.name}
          <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-2">
            in {selectedKey} Major
          </span>
        </h2>
        
        <div className="flex items-center gap-4 mt-6 mb-4 p-3 bg-secondary-100 dark:bg-secondary-700 rounded">
          <button
            onClick={togglePlayback}
            className={`px-4 py-2 rounded font-medium ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="bpmSlider" className="text-sm font-medium">BPM:</label>
            <input 
              type="range" 
              id="bpmSlider"
              min="40" 
              max="240" 
              value={bpm} 
              onChange={(e) => handleBpmChange(Number(e.target.value))} 
              className="w-32 cursor-pointer"
            />
            <span className="text-sm font-semibold w-10 text-right">{bpm}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          {(isCustom ? customProgression : currentProgressionDetails?.numerals ?? []).map((numeral, index) => {
            const chordName = progressionChords[index] ?? '';
            const chordDisplayName = getChordDisplayName(chordName);
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="px-3 py-1 text-sm rounded border border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700">
                  {numeral}
                </div>
                <button 
                   onClick={() => handleChordClick(chordDisplayName)}
                   disabled={!chordName || chordName === '?'}
                   className={`px-4 py-2 rounded text-white text-sm font-medium transition-colors duration-150 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentChordIndex === index 
                      ? 'border-4 border-yellow-400'
                      : 'border-4 border-transparent'
                   }`}
                >
                   {chordDisplayName}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* --- Chord Diagram Display Area --- */}
      {chordVoicing && (
          <div className="mt-8 p-4 bg-white dark:bg-secondary-800 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                      {displayedChordName}
                  </h3>
                  <button 
                    onClick={clearChordDisplay} 
                    className="text-sm text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    title="Clear Diagram"
                  >
                      Clear
                  </button>
              </div>
              <div className="w-full max-w-xl mx-auto"> 
                 <FretboardDisplay 
                     displayMode="chord" 
                     chordVoicing={chordVoicing}
                     chordRootNote={displayedChordRootNote}
                 /> 
              </div>
          </div>
      )}
      
      <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use This Progression</h3>
        <ul className="space-y-2 text-sm">
          <li>• Try playing each chord for equal duration initially (e.g., 4 beats each)</li>
          <li>• Experiment with different strumming patterns to create different feels</li>
          <li>• For more complex progressions, try adding 7ths to the chords</li>
          <li>• Record yourself playing the progression and try improvising over it</li>
          <li>• Try the same progression in different keys to find what works best for your voice</li>
        </ul>
      </div>
    </div>
  );
};

export default ChordProgressions; 