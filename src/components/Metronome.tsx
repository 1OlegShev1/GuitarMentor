"use client";

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaPause, FaMinus, FaPlus } from 'react-icons/fa';

interface MetronomeProps {
  initialTempo?: number;
}

const Metronome: React.FC<MetronomeProps> = ({ initialTempo = 120 }) => {
  const [tempo, setTempo] = useState(initialTempo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickVolume, setTickVolume] = useState(0.5);
  const [timeSignature, setTimeSignature] = useState(4);
  const [countIn, setCountIn] = useState(false);
  
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

  const handleTimeSignatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeSignature(parseInt(event.target.value, 10));
  };

  const decreaseTempo = () => handleTempoChange(tempo - 5);
  const increaseTempo = () => handleTempoChange(tempo + 5);

  return (
    <div className="card p-6 bg-white dark:bg-secondary-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Metronome</h2>
      
      <div className="flex items-center justify-center mb-6">
        <button 
          onClick={decreaseTempo} 
          className="h-10 w-10 bg-gray-100 dark:bg-secondary-700 rounded-l-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary-600"
          aria-label="Decrease tempo"
        >
          <FaMinus />
        </button>
        
        <div className="h-10 px-4 flex items-center justify-center bg-gray-50 dark:bg-secondary-800 border-x border-gray-200 dark:border-secondary-600">
          <span className="text-xl font-medium">{tempo}</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">BPM</span>
        </div>
        
        <button 
          onClick={increaseTempo} 
          className="h-10 w-10 bg-gray-100 dark:bg-secondary-700 rounded-r-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-secondary-600"
          aria-label="Increase tempo"
        >
          <FaPlus />
        </button>
      </div>
      
      <div className="flex items-center mb-6">
        <label htmlFor="time-signature" className="mr-2">Time Signature:</label>
        <select 
          id="time-signature"
          value={timeSignature}
          onChange={handleTimeSignatureChange}
          className="bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded px-3 py-1"
        >
          <option value="2">2/4</option>
          <option value="3">3/4</option>
          <option value="4">4/4</option>
          <option value="6">6/8</option>
        </select>
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
        <label htmlFor="volume-slider" className="block mb-2">Volume: {Math.round(tickVolume * 100)}%</label>
        <input 
          type="range" 
          id="volume-slider"
          min="0" 
          max="1" 
          step="0.01" 
          value={tickVolume} 
          onChange={(e) => setTickVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Metronome; 