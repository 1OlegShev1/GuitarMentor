"use client";

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaPause, FaMinus, FaPlus } from 'react-icons/fa';

interface MetronomeProps {
  initialTempo?: number;
}

const Metronome: React.FC<MetronomeProps> = ({ initialTempo = 120 }) => {
  const [tempo, setTempo] = useState(initialTempo);
  const [tempoBpmInput, setTempoBpmInput] = useState(initialTempo.toString());
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickVolume, setTickVolume] = useState(0.5);
  const [timeSignature, setTimeSignature] = useState(4);
  
  const metronomeRef = useRef<any>(null);
  const tickSoundRef = useRef<any>(null);
  const accentSoundRef = useRef<any>(null);

  // Initialize Tone.js metronome
  useEffect(() => {
    // Create synth sounds for metronome
    tickSoundRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    
    accentSoundRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    
    // Clean up on unmount
    return () => {
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
      }
      tickSoundRef.current.dispose();
      accentSoundRef.current.dispose();
    };
  }, []);

  // Update metronome when tempo changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
    // Update the input field when tempo changes from buttons
    setTempoBpmInput(tempo.toString());
  }, [tempo, timeSignature, isPlaying]);

  // Update volume when tickVolume changes
  useEffect(() => {
    if (tickSoundRef.current) {
      tickSoundRef.current.volume.value = Tone.gainToDb(tickVolume);
    }
    if (accentSoundRef.current) {
      accentSoundRef.current.volume.value = Tone.gainToDb(tickVolume);
    }
  }, [tickVolume]);

  const startMetronome = async () => {
    // Make sure Tone.js is started (needed for browsers)
    await Tone.start();
    
    // Clear any existing metronome
    if (metronomeRef.current) {
      metronomeRef.current.dispose();
    }
    
    // Create a new repeating event
    let count = 0;
    metronomeRef.current = new Tone.Loop((time) => {
      // Play accent on first beat, regular tick on others
      if (count % timeSignature === 0) {
        accentSoundRef.current.triggerAttackRelease('C5', '32n', time, 0.9);
      } else {
        tickSoundRef.current.triggerAttackRelease('G4', '32n', time, 0.7);
      }
      count++;
    }, `${60 / tempo}n`).start(0);
    
    // Start the Transport
    Tone.Transport.start();
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

  const decreaseTempo = () => handleTempoChange(tempo - 5);
  const increaseTempo = () => handleTempoChange(tempo + 5);
  const decreaseTempoSmall = () => handleTempoChange(tempo - 1);
  const increaseTempoSmall = () => handleTempoChange(tempo + 1);

  return (
    <div className="p-6 bg-white dark:bg-secondary-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">Metronome</h2>
      
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
      
      <div className="flex items-center justify-center">
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