"use client";

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaPause, FaMinus, FaPlus, FaHandPointer, FaSave } from 'react-icons/fa';

interface MetronomeProps {
  initialTempo?: number;
}

// Define sound type
type SoundType = 'classic' | 'digital' | 'wooden' | 'drums';

// Define settings interface for saved preferences
interface MetronomeSettings {
  tempo: number;
  timeSignature: number;
  volume: number;
  soundType: SoundType;
}

const STORAGE_KEY = 'guitar-mentor-metronome-settings';

const Metronome: React.FC<MetronomeProps> = ({ initialTempo = 120 }) => {
  // Load saved settings or use defaults
  const loadSavedSettings = (): MetronomeSettings => {
    if (typeof window === 'undefined') {
      return {
        tempo: initialTempo,
        timeSignature: 4,
        volume: 0.5,
        soundType: 'classic'
      };
    }

    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved settings', e);
      }
    }
    
    return {
      tempo: initialTempo,
      timeSignature: 4,
      volume: 0.5,
      soundType: 'classic'
    };
  };

  const savedSettings = loadSavedSettings();
  
  const [tempo, setTempo] = useState(savedSettings.tempo);
  const [tempoBpmInput, setTempoBpmInput] = useState(savedSettings.tempo.toString());
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickVolume, setTickVolume] = useState(savedSettings.volume);
  const [timeSignature, setTimeSignature] = useState(savedSettings.timeSignature);
  const [soundType, setSoundType] = useState<SoundType>(savedSettings.soundType || 'classic');
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [saveMessage, setSaveMessage] = useState('');
  
  const metronomeRef = useRef<any>(null);
  const tickSoundRef = useRef<any>(null);
  const accentSoundRef = useRef<any>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound configuration based on selected sound type
  const getSoundConfig = () => {
    switch(soundType) {
      case 'digital':
        return {
          regular: { type: 'square', note: 'A4' },
          accent: { type: 'square', note: 'E5' }
        };
      case 'wooden':
        return {
          regular: { type: 'sine', note: 'D4' },
          accent: { type: 'sine', note: 'A4' }
        };
      case 'drums':
        return {
          regular: { type: 'white', note: null },
          accent: { type: 'white', note: null }
        };
      case 'classic':
      default:
        return {
          regular: { type: 'triangle', note: 'G4' },
          accent: { type: 'triangle', note: 'C5' }
        };
    }
  };

  // Initialize Tone.js metronome
  useEffect(() => {
    const config = getSoundConfig();
    
    // Create synth sounds for metronome
    if (soundType === 'drums') {
      // Use noise synth for drum sounds
      tickSoundRef.current = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
      }).toDestination();
      
      accentSoundRef.current = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
    } else {
      // Use regular synth for other sound types
      tickSoundRef.current = new Tone.Synth({
        oscillator: { type: config.regular.type as any },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
      
      accentSoundRef.current = new Tone.Synth({
        oscillator: { type: config.accent.type as any },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
    }
    
    // Apply volume setting
    if (tickSoundRef.current) {
      tickSoundRef.current.volume.value = Tone.gainToDb(tickVolume);
    }
    if (accentSoundRef.current) {
      accentSoundRef.current.volume.value = Tone.gainToDb(tickVolume);
    }
    
    // Clean up on unmount
    return () => {
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
      }
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (saveMessageTimeoutRef.current) {
        clearTimeout(saveMessageTimeoutRef.current);
      }
      if (tickSoundRef.current) {
        tickSoundRef.current.dispose();
      }
      if (accentSoundRef.current) {
        accentSoundRef.current.dispose();
      }
    };
  }, [soundType, tickVolume]);

  // Update metronome when tempo changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
    // Update the input field when tempo changes from buttons
    setTempoBpmInput(tempo.toString());
  }, [tempo, timeSignature, isPlaying]);

  // Reset currentBeat when metronome stops
  useEffect(() => {
    if (!isPlaying) {
      setCurrentBeat(-1);
    }
  }, [isPlaying]);

  const startMetronome = async () => {
    try {
      // Make sure Tone.js is started (needed for browsers)
      await Tone.start();
      
      // Clear any existing metronome
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
      }
      
      // Reset the beat counter before starting
      setCurrentBeat(-1);
      
      const config = getSoundConfig();
      
      // Create a new repeating event
      let count = 0;
      metronomeRef.current = new Tone.Loop((time) => {
        // Play sound on the current beat
        const beatIndex = count % timeSignature;
        
        // Schedule updates for visual and audio together
        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIndex);
        }, time);
        
        // Play appropriate sound based on beat position
        if (beatIndex === 0) {
          if (soundType === 'drums') {
            // For drums, just trigger without note
            accentSoundRef.current.triggerAttackRelease('16n', time, 1);
          } else {
            accentSoundRef.current.triggerAttackRelease(config.accent.note, '32n', time, 0.9);
          }
        } else {
          if (soundType === 'drums') {
            // For drums, just trigger without note
            tickSoundRef.current.triggerAttackRelease('32n', time, 0.7);
          } else {
            tickSoundRef.current.triggerAttackRelease(config.regular.note, '32n', time, 0.7);
          }
        }
        
        count++;
      }, `${60 / tempo}n`).start(0);
      
      // Start the Transport
      Tone.Transport.start();
    } catch (error) {
      console.error("Error starting metronome:", error);
    }
  };

  const stopMetronome = () => {
    Tone.Transport.stop();
    if (metronomeRef.current) {
      metronomeRef.current.dispose();
      metronomeRef.current = null;
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTempoChange = (newTempo: number) => {
    // Keep tempo within reasonable limits
    if (newTempo >= 40 && newTempo <= 240) {
      setTempo(newTempo);
    }
  };

  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Always update the input field
    setTempoBpmInput(e.target.value);
    
    // If it's a valid number, update the actual tempo
    const newTempo = parseInt(e.target.value, 10);
    if (!isNaN(newTempo) && newTempo >= 40 && newTempo <= 240) {
      setTempo(newTempo);
    }
  };
  
  const handleBpmInputBlur = () => {
    // When leaving the field, ensure we have a valid value
    const newTempo = parseInt(tempoBpmInput, 10);
    if (isNaN(newTempo) || newTempo < 40) {
      setTempo(40);
      setTempoBpmInput("40");
    } else if (newTempo > 240) {
      setTempo(240);
      setTempoBpmInput("240");
    } else {
      setTempo(newTempo);
      setTempoBpmInput(newTempo.toString());
    }
  };

  const handleTimeSignatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeSignature(parseInt(event.target.value, 10));
  };

  const handleTap = () => {
    const now = performance.now();
    
    // Reset tap state after 2 seconds of inactivity
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      setIsTapping(false);
      setTapTimes([]);
      tapTimeoutRef.current = null;
    }, 2000);
    
    // Start a new sequence if we weren't tapping
    if (!isTapping) {
      setIsTapping(true);
      setTapTimes([now]);
      return;
    }
    
    // Add new tap time
    const newTapTimes = [...tapTimes, now];
    setTapTimes(newTapTimes);
    
    // Calculate tempo after at least 4 taps for accuracy
    if (newTapTimes.length >= 4) {
      // Calculate tempo based on the average time between taps
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      
      // Use the average of intervals for a more stable tempo calculation
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedTempo = Math.round(60000 / averageInterval);
      
      // Adjust tempo within valid range
      const newTempo = Math.min(Math.max(calculatedTempo, 40), 240);
      setTempo(newTempo);
      
      // Reset tap sequence if we have enough data
      if (newTapTimes.length >= 8) {
        setTapTimes([now]);
      }
    }
  };

  // Sound type change handler
  const handleSoundTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSoundType(event.target.value as SoundType);
  };

  const saveSettings = () => {
    const settings: MetronomeSettings = {
      tempo,
      timeSignature,
      volume: tickVolume,
      soundType
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaveMessage('Settings saved!');
      
      // Clear the message after 2 seconds
      if (saveMessageTimeoutRef.current) {
        clearTimeout(saveMessageTimeoutRef.current);
      }
      
      saveMessageTimeoutRef.current = setTimeout(() => {
        setSaveMessage('');
        saveMessageTimeoutRef.current = null;
      }, 2000);
      
    } catch (e) {
      console.error('Error saving settings', e);
      setSaveMessage('Error saving settings');
    }
  };

  const decreaseTempo = () => handleTempoChange(tempo - 5);
  const increaseTempo = () => handleTempoChange(tempo + 5);
  const decreaseTempoSmall = () => handleTempoChange(tempo - 1);
  const increaseTempoSmall = () => handleTempoChange(tempo + 1);

  // Render visual metronome indicator
  const renderBeatIndicator = () => {
    const beats = Array.from({ length: timeSignature }, (_, i) => i);
    
    return (
      <div className="flex justify-center items-center gap-2 my-4">
        {beats.map((beat) => (
          <div
            key={beat}
            className={`h-4 w-4 rounded-full transition-all duration-100 ${
              currentBeat === beat 
                ? beat === 0
                  ? 'bg-red-500 scale-125' 
                  : 'bg-primary-500 scale-110'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={beat === 0 ? "First beat (accented)" : `Beat ${beat + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-secondary-800 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Metronome</h2>
        <div className="flex items-center">
          <button
            onClick={saveSettings}
            className="flex items-center gap-1 py-1 px-3 bg-gray-100 dark:bg-secondary-700 hover:bg-gray-200 dark:hover:bg-secondary-600 rounded-md text-sm"
            aria-label="Save settings"
          >
            <FaSave size={14} />
            <span>Save</span>
          </button>
          {saveMessage && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400 animate-fadeIn">
              {saveMessage}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <button 
          onClick={decreaseTempo} 
          className="h-10 w-10 bg-gray-100 dark:bg-secondary-700 text-secondary-900 dark:text-white rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary-600 mr-2"
          aria-label="Decrease tempo by 5"
        >
          <FaMinus />
        </button>
        
        <div className="relative w-36">
          <input
            type="text"
            value={tempoBpmInput}
            onChange={handleBpmInputChange}
            onBlur={handleBpmInputBlur}
            className="h-10 w-full bg-gray-50 dark:bg-secondary-700 text-secondary-900 dark:text-white text-xl font-medium text-center pr-12 rounded-lg border border-gray-200 dark:border-secondary-600 focus:outline-none focus:border-primary-500"
          />
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">BPM</span>
          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center">
            <button
              onClick={increaseTempoSmall}
              className="h-4 text-gray-500 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white flex items-center justify-center text-[10px]"
              aria-label="Increase tempo by 1"
            >
              ▲
            </button>
            <button
              onClick={decreaseTempoSmall}
              className="h-4 text-gray-500 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white flex items-center justify-center text-[10px]"
              aria-label="Decrease tempo by 1"
            >
              ▼
            </button>
          </div>
        </div>
        
        <button 
          onClick={increaseTempo} 
          className="h-10 w-10 bg-gray-100 dark:bg-secondary-700 text-secondary-900 dark:text-white rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary-600 ml-2"
          aria-label="Increase tempo by 5"
        >
          <FaPlus />
        </button>
      </div>
      
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="timeSignature" className="text-sm font-medium">
          Time Signature:
        </label>
        <div className="relative inline-block">
          <select
            id="timeSignature"
            value={timeSignature}
            onChange={handleTimeSignatureChange}
            className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
            style={{ 
              WebkitAppearance: "none", 
              MozAppearance: "none", 
              appearance: "none",
              backgroundImage: "none"
            }}
          >
            <option value="4">4/4</option>
            <option value="3">3/4</option>
            <option value="2">2/4</option>
            <option value="6">6/8</option>
            <option value="12">12/8</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Sound Type Selection */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="soundType" className="text-sm font-medium">
          Sound Type:
        </label>
        <div className="relative inline-block">
          <select
            id="soundType"
            value={soundType}
            onChange={handleSoundTypeChange}
            className="block w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 pr-8 py-1 focus:outline-none"
            style={{ 
              WebkitAppearance: "none", 
              MozAppearance: "none", 
              appearance: "none",
              backgroundImage: "none"
            }}
          >
            <option value="classic">Classic</option>
            <option value="digital">Digital</option>
            <option value="wooden">Wooden</option>
            <option value="drums">Drums</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
      
      {renderBeatIndicator()}
      
      <div className="flex items-center justify-center mb-6">
        <button 
          onClick={togglePlayPause}
          className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          aria-label={isPlaying ? "Stop metronome" : "Start metronome"}
        >
          {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} />}
        </button>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handleTap}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            isTapping
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-900 dark:text-white'
          }`}
          aria-label="Tap tempo"
        >
          <FaHandPointer size={16} />
          <span>Tap Tempo {tapTimes.length > 0 ? `(${tapTimes.length})` : ''}</span>
        </button>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-secondary-900 dark:text-white">Volume:</span>
          <span className="text-secondary-900 dark:text-white">{Math.round(tickVolume * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={tickVolume} 
          onChange={(e) => setTickVolume(parseFloat(e.target.value))}
          className="w-full accent-primary-500"
        />
      </div>
    </div>
  );
};

export default Metronome; 