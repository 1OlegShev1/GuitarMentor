"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';

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

// Helper to get basic triad notes (adjust octave/complexity later)
const getChordNotes = (chordName: string): string[] => {
  // Very basic implementation - needs refinement for quality, root, octave
  // Example: C Major -> C4, E4, G4
  // Example: Am -> A4, C5, E5 
  // This needs proper music theory logic later!
  const root = chordName.replace(/m$|dim$/, ''); // Basic root extraction
  const isMinor = chordName.endsWith('m');
  // Placeholder notes - replace with actual calculation
  if (root === 'C' && !isMinor) return ['C4', 'E4', 'G4'];
  if (root === 'F' && !isMinor) return ['F4', 'A4', 'C5'];
  if (root === 'G' && !isMinor) return ['G4', 'B4', 'D5'];
  if (root === 'A' && isMinor) return ['A4', 'C5', 'E5'];
  // Add more basic cases or implement a proper theory function
  return [`${root}4`]; // Fallback to just root note
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

  // --- Stop Playback Function (for manual stop ONLY) ---
  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.current?.releaseAll();
    setIsPlaying(false);
    setCurrentChordIndex(-1);
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
  const startOrRestartSequence = () => {
      if (!synth.current) return;
      const chords = progressionChordsRef.current;
      if (!chords || chords.length === 0) {
          stopPlayback(); // Stop if no chords (calls setIsPlaying(false))
          return;
      }

      // Stop current transport & clear events before restart
      Tone.Transport.stop();
      Tone.Transport.cancel();
      synth.current.releaseAll(); 
      setCurrentChordIndex(-1); 

      // Dispose old sequence before creating new one
      sequence.current?.dispose();

      // Configure Transport BPM
      Tone.Transport.bpm.value = bpm;

      // Create the new sequence
      sequence.current = new Tone.Sequence((time, index) => {
          const chordName = chords[index];
          const notesToPlay = getChordNotes(chordName);
          synth.current?.triggerAttackRelease(notesToPlay, "1n", time); // Play for 1 measure
          
          Tone.Draw.schedule(() => {
              setCurrentChordIndex(index);
          }, time); // Schedule UI update

      }, Array.from({ length: chords.length }, (_, i) => i), "1m").start(0);
      
      // Configure loop
      Tone.Transport.loop = true;
      Tone.Transport.loopEnd = `${chords.length}m`;

      // Ensure stop handler is attached
      Tone.Transport.off('stop'); 
      Tone.Transport.on('stop', () => {
         // ONLY cleanup and visual reset. DO NOT set isPlaying state here.
         synth.current?.releaseAll(); 
         setCurrentChordIndex(-1);
      });

      // Set playing state BEFORE starting transport
      setIsPlaying(true); // Directly set state here
      Tone.Transport.start("+0.1");
  };

  // --- Play/Stop Button Handler ---
  const togglePlayback = async () => {
    await Tone.start();
    if (isPlaying) {
      stopPlayback();
    } else {
      startOrRestartSequence();
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
    // Explicitly STOP playback when key changes, instead of restarting
    if (isPlayingRef.current) {
      stopPlayback(); 
    }
    setSelectedKey(newKey);
    // if (isPlayingRef.current) { 
    //   startOrRestartSequence(); // OLD: Restarted playback
    // }
  };

  const handleProgressionChange = (id: string) => {
    setSelectedProgression(id);
    setIsCustom(false);
    if (isPlayingRef.current) {
      startOrRestartSequence(); // Direct call, no timeout
    }
  };

  const startCustomProgression = () => {
    setCustomProgression(['I', 'IV', 'V']);
    setIsCustom(true);
    if (isPlayingRef.current) {
       startOrRestartSequence(); // Direct call, no timeout
    }
  };

  const updateCustomProgression = (index: number, numeral: string) => {
    const newProgression = [...customProgression];
    newProgression[index] = numeral;
    setCustomProgression(newProgression);
    if (isPlayingRef.current) {
      startOrRestartSequence(); // Direct call, no timeout
    }
  };

  const addChord = () => {
    setCustomProgression([...customProgression, 'I']);
    if (isPlayingRef.current) {
       startOrRestartSequence(); // Direct call, no timeout
    }
  };

  const removeChord = (index: number) => {
    setCustomProgression(customProgression.filter((_, i) => i !== index));
    if (isPlayingRef.current) {
       startOrRestartSequence(); // Direct call, no timeout
    }
  };

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
          {(isCustom ? customProgression : currentProgressionDetails?.numerals ?? []).map((numeral, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="px-3 py-1 text-sm rounded border border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700">
                {numeral}
              </div>
              <button 
                 className={`px-4 py-2 rounded text-white font-medium transition-colors duration-150 ${
                    currentChordIndex === index ? 'bg-accent-500 scale-105' : 'bg-primary-500 hover:bg-primary-600'
                 }`}
              >
                {progressionChords[index] ?? ''}
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4 mt-8">
          {progressionChords.map((chord, index) => (
            <div
              key={index}
              className="w-16 h-16 flex items-center justify-center bg-primary-600 text-white rounded-lg text-xl font-semibold shadow-md"
            >
              {chord}
            </div>
          ))}
        </div>
      </div>
      
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