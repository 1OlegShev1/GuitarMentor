"use client";

import { useState, useEffect, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

// Standard tuning notes for guitar
type GuitarString = { name: string; frequency: number };
type TuningName = 'Standard' | 'Drop D' | 'Half Step Down' | 'Open G' | 'DADGAD';
type Tuning = GuitarString[];
type TuningMap = {
  [key in TuningName]: Tuning;
};

const STANDARD_TUNING: Tuning = [
  { name: 'E2', frequency: 82.41 },
  { name: 'A2', frequency: 110.00 },
  { name: 'D3', frequency: 146.83 },
  { name: 'G3', frequency: 196.00 },
  { name: 'B3', frequency: 246.94 },
  { name: 'E4', frequency: 329.63 }
];

// Drop D tuning
const DROP_D_TUNING: Tuning = [
  { name: 'D2', frequency: 73.42 },
  { name: 'A2', frequency: 110.00 },
  { name: 'D3', frequency: 146.83 },
  { name: 'G3', frequency: 196.00 },
  { name: 'B3', frequency: 246.94 },
  { name: 'E4', frequency: 329.63 }
];

// Half Step Down tuning (Eb Standard)
const HALF_STEP_DOWN_TUNING: Tuning = [
  { name: 'Eb2', frequency: 77.78 },
  { name: 'Ab2', frequency: 103.83 },
  { name: 'Db3', frequency: 138.59 },
  { name: 'Gb3', frequency: 185.00 },
  { name: 'Bb3', frequency: 233.08 },
  { name: 'Eb4', frequency: 311.13 }
];

// Open G tuning
const OPEN_G_TUNING: Tuning = [
  { name: 'D2', frequency: 73.42 },
  { name: 'G2', frequency: 98.00 },
  { name: 'D3', frequency: 146.83 },
  { name: 'G3', frequency: 196.00 },
  { name: 'B3', frequency: 246.94 },
  { name: 'D4', frequency: 293.66 }
];

// DADGAD tuning
const DADGAD_TUNING: Tuning = [
  { name: 'D2', frequency: 73.42 },
  { name: 'A2', frequency: 110.00 },
  { name: 'D3', frequency: 146.83 },
  { name: 'G3', frequency: 196.00 },
  { name: 'A3', frequency: 220.00 },
  { name: 'D4', frequency: 293.66 }
];

// All available tunings
const TUNINGS: TuningMap = {
  'Standard': STANDARD_TUNING,
  'Drop D': DROP_D_TUNING,
  'Half Step Down': HALF_STEP_DOWN_TUNING,
  'Open G': OPEN_G_TUNING,
  'DADGAD': DADGAD_TUNING
};

// Helper function to find closest guitar string
const findClosestString = (frequency: number, guitarStrings: Tuning): GuitarString => {
  return guitarStrings.reduce((prev, curr) => {
    return (Math.abs(curr.frequency - frequency) < Math.abs(prev.frequency - frequency)) 
      ? curr 
      : prev;
  });
};

// Calculate note accuracy
const calculateTuningAccuracy = (detectedFreq: number, targetFreq: number) => {
  const percentageDiff = ((detectedFreq - targetFreq) / targetFreq) * 100;
  const centsDiff = 1200 * Math.log2(detectedFreq / targetFreq);
  
  return {
    percentageDiff,
    centsDiff,
    isTooHigh: centsDiff > 5,    // More than 5 cents higher
    isTooLow: centsDiff < -5,    // More than 5 cents lower
    isInTune: Math.abs(centsDiff) <= 5  // Within 5 cents of target
  };
};

const GuitarTuner: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [closestString, setClosestString] = useState(STANDARD_TUNING[0]);
  const [selectedTuning, setSelectedTuning] = useState<TuningName>('Standard');
  const [tuningStatus, setTuningStatus] = useState<{
    percentageDiff: number;
    centsDiff: number;
    isTooHigh: boolean;
    isTooLow: boolean;
    isInTune: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Start/stop microphone access
  const toggleMicrophone = async () => {
    try {
      if (isListening) {
        stopListening();
      } else {
        await startListening();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error accessing microphone');
      console.error('Microphone access error:', error);
    }
  };
  
  // Initialize microphone stream
  const startListening = async () => {
    try {
      setErrorMessage(null);
      
      // Request microphone access
      microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });
      
      // Create audio context
      audioContextRef.current = new AudioContext();
      
      // Create analyzer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      // Connect microphone stream to analyzer
      const microphone = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
      microphone.connect(analyserRef.current);
      
      // Start pitch detection
      updatePitch();
      setIsListening(true);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to access microphone');
      console.error('Error starting microphone:', error);
      stopListening();
    }
  };
  
  // Clean up resources
  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsListening(false);
    setDetectedNote(null);
    setDetectedFrequency(null);
    setTuningStatus(null);
  };
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);
  
  // Process audio data and detect pitch
  const updatePitch = () => {
    if (!analyserRef.current || !audioContextRef.current) {
      animationFrameRef.current = requestAnimationFrame(updatePitch);
      return;
    }
    
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    // Use pitchy for pitch detection
    const detector = PitchDetector.forFloat32Array(bufferLength);
    const [pitch, clarity] = detector.findPitch(buffer, audioContextRef.current.sampleRate);
    
    // Only use result if clarity is high enough (reduce noise)
    if (clarity > 0.8 && pitch > 60 && pitch < 1000) {
      setDetectedFrequency(pitch);
      
      // Find closest guitar string in the selected tuning
      const currentTuning = TUNINGS[selectedTuning];
      const closest = findClosestString(pitch, currentTuning);
      setClosestString(closest);
      
      // Calculate tuning accuracy
      const accuracy = calculateTuningAccuracy(pitch, closest.frequency);
      setTuningStatus(accuracy);
      
      // Set note name
      setDetectedNote(closest.name);
    }
    
    // Continue updating
    animationFrameRef.current = requestAnimationFrame(updatePitch);
  };
  
  // Visual display for tuning - cents-based indicator
  const renderCentsTuningIndicator = () => {
    if (!tuningStatus || !detectedFrequency) return null;
    
    // Create a cents-based display with segments (-50 cents to +50 cents)
    const segments = 21; // 10 segments on each side + center
    
    // Clamp cents difference to displayable range (±50 cents)
    const clampedCents = Math.min(Math.max(tuningStatus.centsDiff, -50), 50);
    
    // Calculate which segment the needle should be in
    const centerSegment = Math.floor(segments / 2);
    const activeSegment = centerSegment + Math.round(clampedCents / 5);
    
    return (
      <div className="mt-8 w-full px-0">
        <div className="flex justify-between text-base mb-2 w-full">
          <span>-50¢</span>
          <span>-5¢</span>
          <span className="font-semibold">0¢</span>
          <span>+5¢</span>
          <span>+50¢</span>
        </div>
        <div className="relative h-14 bg-gray-200 dark:bg-secondary-700 rounded-full overflow-hidden flex w-full">
          {/* Generate all segments with equal width */}
          {Array.from({ length: segments }).map((_, index) => {
            // Determine segment color and style
            let bgColor = "bg-gray-300 dark:bg-gray-600";
            const widthPercent = 100 / segments; // Equal width for all segments
            
            // Calculate distance from center for coloring purposes
            const distanceFromCenter = Math.abs(index - centerSegment);
            
            // Apply colors based on tuning precision
            if (index === centerSegment) {
              // Center segment (0¢)
              bgColor = "bg-green-600 dark:bg-green-600";
            }
            else if (distanceFromCenter === 1) {
              // Segments at ±5¢ (the in-tune threshold)
              bgColor = "bg-green-400 dark:bg-green-700";
            }
            
            // Highlight the active segment with a clear border
            if (index === activeSegment) {
              const baseColor = distanceFromCenter <= 1 
                ? "bg-green-600" 
                : tuningStatus.isTooHigh 
                  ? "bg-red-600" 
                  : "bg-blue-600";
              
              bgColor = baseColor;
            }
            
            return (
              <div 
                key={index}
                className={`h-full ${bgColor} ${index === activeSegment ? 'border-2 border-white dark:border-black' : ''}`}
                style={{ 
                  width: `${widthPercent}%`,
                  transition: 'background-color 0.2s ease'
                }}
              />
            );
          })}
          
          {/* Critical tuning threshold markers */}
          <div className="absolute top-0 w-full h-2">
            {/* Critical range: -3¢ */}
            <div className="absolute left-[42.9%] h-full w-0.5 bg-black dark:bg-white opacity-30"></div>
            {/* -5¢ mark - exactly 1 segment left of center */}
            <div className="absolute left-[45.2%] h-full w-0.5 bg-black dark:bg-white opacity-50"></div>
            {/* -2¢ critical precision */}
            <div className="absolute left-[47.6%] h-full w-0.5 bg-green-700 dark:bg-green-400 opacity-70"></div>
            {/* 0¢ mark - exactly at center */}
            <div className="absolute left-[50%] h-full w-1 bg-green-700 dark:bg-green-400 opacity-90 transform -translate-x-1/2"></div>
            {/* +2¢ critical precision */}
            <div className="absolute left-[52.4%] h-full w-0.5 bg-green-700 dark:bg-green-400 opacity-70"></div>
            {/* +5¢ mark - exactly 1 segment right of center */}
            <div className="absolute left-[54.8%] h-full w-0.5 bg-black dark:bg-white opacity-50"></div>
            {/* Critical range: +3¢ */}
            <div className="absolute left-[57.1%] h-full w-0.5 bg-black dark:bg-white opacity-30"></div>
          </div>
          
          {/* Cents value display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold px-3 py-1 bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 rounded-full">
              {tuningStatus.centsDiff.toFixed(1)}¢
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-lg text-center font-medium w-full">
          {Math.abs(tuningStatus.centsDiff) <= 2
            ? "Perfect! Your string is in perfect tune (±2¢)."
            : Math.abs(tuningStatus.centsDiff) <= 3
              ? "Very good! Your string is in critical range (±3¢)."
              : Math.abs(tuningStatus.centsDiff) <= 5
                ? "Good! Your string is in acceptable range (±5¢)."
                : tuningStatus.isTooHigh 
                  ? `Tune down by ${Math.abs(tuningStatus.centsDiff).toFixed(1)}¢` 
                  : `Tune up by ${Math.abs(tuningStatus.centsDiff).toFixed(1)}¢`}
        </div>
      </div>
    );
  };
  
  return (
    <div className="card p-6 bg-white dark:bg-secondary-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Guitar Tuner</h2>
      
      {errorMessage && (
        <div className="p-2 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center">
        <button 
          onClick={toggleMicrophone}
          className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-primary-500 hover:bg-primary-600'
          } text-white transition-colors`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
        </button>
        
        <div className="text-center">
          {isListening ? (
            <>
              <h3 className="text-4xl font-bold mb-2">
                {detectedNote || "-"}
              </h3>
              {detectedFrequency && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {detectedFrequency.toFixed(2)} Hz
                </p>
              )}
              {renderCentsTuningIndicator()}
            </>
          ) : (
            <p className="text-lg">Tap the microphone to start tuning</p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <div className="mb-4 w-full">
          <label htmlFor="tuning-select" className="block mb-2 font-medium text-lg">Select Tuning:</label>
          <div className="relative">
            <select
              id="tuning-select"
              value={selectedTuning}
              onChange={(e) => setSelectedTuning(e.target.value as TuningName)}
              className="appearance-none w-full p-2 border border-gray-300 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 focus:ring-2 focus:ring-primary-500 text-base pr-10"
              style={{ 
                WebkitAppearance: "none", 
                MozAppearance: "none", 
                appearance: "none",
                backgroundImage: "none"
              }}
              disabled={isListening}
            >
              {Object.keys(TUNINGS).map((tuning) => (
                <option key={tuning} value={tuning}>
                  {tuning}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mb-3 text-lg w-full">{selectedTuning} Tuning:</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 w-full">
          {TUNINGS[selectedTuning].map((string, index) => (
            <div 
              key={index} 
              className={`text-center p-3 rounded ${
                isListening && closestString.name === string.name 
                  ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' 
                  : 'bg-gray-100 dark:bg-secondary-700'
              }`}
            >
              <div className="font-bold text-lg">{string.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{string.frequency.toFixed(1)} Hz</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuitarTuner; 