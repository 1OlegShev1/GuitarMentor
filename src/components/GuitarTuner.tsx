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
          <span>-10¢</span>
          <span className="font-semibold">0¢</span>
          <span>+10¢</span>
          <span>+50¢</span>
        </div>
        <div className="relative h-14 bg-gray-200 dark:bg-secondary-700 rounded-full overflow-hidden flex w-full">
          {/* Generate all segments */}
          {Array.from({ length: segments }).map((_, index) => {
            // Determine segment color and style
            let bgColor = "bg-gray-300 dark:bg-gray-600";
            
            // Calculate width based on distance from center (non-linear distribution)
            // Center segments get more width to emphasize precision area
            const distanceFromCenter = Math.abs(index - centerSegment);
            let widthPercent;
            
            if (distanceFromCenter === 0) {
              // Center segment
              widthPercent = 8;
            } else if (distanceFromCenter === 1) {
              // Segments at ±5¢ (the in-tune threshold)
              widthPercent = 7;
            } else if (distanceFromCenter === 2) {
              // Segments at ±10¢
              widthPercent = 6;
            } else if (distanceFromCenter <= 4) {
              // Medium-close segments (±15-20¢)
              widthPercent = 5;
            } else if (distanceFromCenter <= 6) {
              // Further segments
              widthPercent = 3;
            } else {
              // Outer segments
              widthPercent = 2;
            }
            
            // Center segment is green
            if (index === centerSegment) {
              bgColor = "bg-green-500 dark:bg-green-600";
            }
            // Near-center segments (±5 cents) are light green - this is the "in tune" range
            else if (distanceFromCenter === 1) {
              bgColor = "bg-green-300 dark:bg-green-700";
            }
            // Segments at ±10 cents are very light green
            else if (distanceFromCenter === 2) {
              bgColor = "bg-green-100 dark:bg-green-900";
            }
            
            // Highlight the active segment
            if (index === activeSegment) {
              bgColor = tuningStatus.isInTune 
                ? "bg-green-600" 
                : tuningStatus.isTooHigh 
                  ? "bg-red-600" 
                  : "bg-blue-600";
            }
            
            return (
              <div 
                key={index}
                className={`h-full ${bgColor} 
                           ${index === activeSegment ? 'border border-white dark:border-black' : ''} 
                           ${index === centerSegment ? 'border-t-2 border-b-2 border-green-700 dark:border-green-400' : ''}
                           ${distanceFromCenter === 1 ? 'border-t border-b border-green-600' : ''}`}
                style={{ 
                  width: `${widthPercent}%`,
                  transition: 'background-color 0.2s ease'
                }}
              />
            );
          })}
          
          {/* Critical points markers */}
          <div className="absolute top-0 w-full h-2">
            <div className="absolute left-0 h-full w-px bg-gray-500 dark:bg-gray-400"></div>
            <div className="absolute left-1/4 h-full w-px bg-gray-500 dark:bg-gray-400"></div>
            <div className="absolute left-1/2 h-full w-px bg-gray-500 dark:bg-gray-400"></div>
            <div className="absolute left-3/4 h-full w-px bg-gray-500 dark:bg-gray-400"></div>
            <div className="absolute right-0 h-full w-px bg-gray-500 dark:bg-gray-400"></div>
          </div>
          
          {/* Cents value display */}
          <div className="absolute inset-0 flex items-center justify-center text-base font-bold">
            {tuningStatus.centsDiff.toFixed(1)}¢
          </div>
        </div>
        
        <div className="mt-3 text-lg text-center font-medium w-full">
          {tuningStatus.isInTune 
            ? "Perfect! Your string is in tune (±5¢)." 
            : tuningStatus.isTooHigh 
              ? `Tune down by ${Math.abs(tuningStatus.centsDiff).toFixed(1)}¢ (${Math.abs(Math.ceil(tuningStatus.centsDiff/5))} segments)` 
              : `Tune up by ${Math.abs(tuningStatus.centsDiff).toFixed(1)}¢ (${Math.abs(Math.ceil(tuningStatus.centsDiff/5))} segments)`}
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
          <select
            id="tuning-select"
            value={selectedTuning}
            onChange={(e) => setSelectedTuning(e.target.value as TuningName)}
            className="w-full p-2 border border-gray-300 dark:border-secondary-600 rounded 
                     bg-white dark:bg-secondary-700 focus:ring-2 focus:ring-primary-500 text-base"
            disabled={isListening}
          >
            {Object.keys(TUNINGS).map((tuning) => (
              <option key={tuning} value={tuning}>
                {tuning}
              </option>
            ))}
          </select>
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