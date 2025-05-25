"use client";

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

// Guitar strings with their standard frequencies
const GUITAR_TUNINGS = {
  'Standard': [
    { string: '6th string (E)', note: 'E2', frequency: 82.41 },
    { string: '5th string (A)', note: 'A2', frequency: 110.00 },
    { string: '4th string (D)', note: 'D3', frequency: 146.83 },
    { string: '3rd string (G)', note: 'G3', frequency: 196.00 },
    { string: '2nd string (B)', note: 'B3', frequency: 246.94 },
    { string: '1st string (E)', note: 'E4', frequency: 329.63 }
  ],
  'Drop D': [
    { string: '6th string (D)', note: 'D2', frequency: 73.42 },
    { string: '5th string (A)', note: 'A2', frequency: 110.00 },
    { string: '4th string (D)', note: 'D3', frequency: 146.83 },
    { string: '3rd string (G)', note: 'G3', frequency: 196.00 },
    { string: '2nd string (B)', note: 'B3', frequency: 246.94 },
    { string: '1st string (E)', note: 'E4', frequency: 329.63 }
  ],
  'Half Step Down': [
    { string: '6th string (Eb)', note: 'Eb2', frequency: 77.78 },
    { string: '5th string (Ab)', note: 'Ab2', frequency: 103.83 },
    { string: '4th string (Db)', note: 'Db3', frequency: 138.59 },
    { string: '3rd string (Gb)', note: 'Gb3', frequency: 185.00 },
    { string: '2nd string (Bb)', note: 'Bb3', frequency: 233.08 },
    { string: '1st string (Eb)', note: 'Eb4', frequency: 311.13 }
  ],
  'Open G': [
    { string: '6th string (D)', note: 'D2', frequency: 73.42 },
    { string: '5th string (G)', note: 'G2', frequency: 98.00 },
    { string: '4th string (D)', note: 'D3', frequency: 146.83 },
    { string: '3rd string (G)', note: 'G3', frequency: 196.00 },
    { string: '2nd string (B)', note: 'B3', frequency: 246.94 },
    { string: '1st string (D)', note: 'D4', frequency: 293.66 }
  ],
  'DADGAD': [
    { string: '6th string (D)', note: 'D2', frequency: 73.42 },
    { string: '5th string (A)', note: 'A2', frequency: 110.00 },
    { string: '4th string (D)', note: 'D3', frequency: 146.83 },
    { string: '3rd string (G)', note: 'G3', frequency: 196.00 },
    { string: '2nd string (A)', note: 'A3', frequency: 220.00 },
    { string: '1st string (D)', note: 'D4', frequency: 293.66 }
  ]
};

type TuningName = keyof typeof GUITAR_TUNINGS;
type GuitarString = typeof GUITAR_TUNINGS['Standard'][0];

// Simple Guitar Tuner component
const GuitarTuner: React.FC = () => {
  // State variables
  const [isListening, setIsListening] = useState(false);
  const [selectedTuning, setSelectedTuning] = useState<TuningName>('Standard');
  const [detectedPitch, setDetectedPitch] = useState<number | null>(null);
  const [closestString, setClosestString] = useState<GuitarString | null>(null);
  const [centsDifference, setCentsDifference] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // Add state for audio level meter
  
  // References for audio objects
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Buffer for stability
  const pitchHistoryRef = useRef<number[]>([]);
  
  // Calculate cents difference between two frequencies
  const calculateCents = (detected: number, target: number): number => {
    return 1200 * Math.log2(detected / target);
  };
  
  // Find the closest string in the current tuning
  const findClosestString = (frequency: number): GuitarString => {
    const currentTuning = GUITAR_TUNINGS[selectedTuning];
    
    let closestString = currentTuning[0];
    let smallestCentsDiff = Math.abs(calculateCents(frequency, currentTuning[0].frequency));
    
    for (const guitarString of currentTuning) {
      const centsDiff = Math.abs(calculateCents(frequency, guitarString.frequency));
      if (centsDiff < smallestCentsDiff) {
        smallestCentsDiff = centsDiff;
        closestString = guitarString;
      }
    }
    
    return closestString;
  };
  
  // Start/stop tuner
  const toggleTuner = async () => {
    if (isListening) {
      stopTuner();
    } else {
      await startTuner();
    }
  };
  
  // Autocorrelation-based pitch detection algorithm
  // This is a standard algorithm for pitch detection that works well in browsers
  const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
    // Simplified ACF algorithm for better performance
    const bufferSize = buffer.length;
    
    // Check for signal level
    let rms = 0;
    for (let i = 0; i < bufferSize; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / bufferSize);
    
    // Increased threshold for noise rejection - require a stronger signal
    if (rms < 0.01) { // Increased from 0.005 to reject more background noise
      return -1;
    }
    
    // Find ACF (autocorrelation function)
    const acf = new Float32Array(bufferSize / 2);
    for (let lag = 0; lag < bufferSize / 2; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferSize / 2; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      acf[lag] = sum;
    }
    
    // Find peaks
    let maxACF = -Infinity;
    let maxLag = -1;
    
    // Start searching from lag 23 (corresponds to ~2000 Hz) to avoid detecting harmonics
    // and go up to lag 1000 (corresponds to ~48 Hz)
    const minLag = Math.floor(sampleRate / 2000);
    const maxSearchLag = Math.min(bufferSize / 2, Math.floor(sampleRate / 45));
    
    for (let lag = minLag; lag < maxSearchLag; lag++) {
      if (acf[lag] > maxACF) {
        maxACF = acf[lag];
        maxLag = lag;
      }
    }
    
    // No clear peak found
    if (maxLag === -1) {
      return -1;
    }
    
    // Require a stronger peak correlation compared to the zero lag
    // This helps filter out noise and non-pitched sounds
    if (maxACF < acf[0] * 0.5) { // Require peak to be at least 50% of zero lag
      return -1;
    }
    
    // Refine peak with quadratic interpolation
    const y1 = acf[maxLag - 1];
    const y2 = acf[maxLag];
    const y3 = acf[maxLag + 1];
    
    const refineOffset = (y3 - y1) / (2 * (2 * y2 - y1 - y3));
    const refinedLag = maxLag + refineOffset;
    
    // Convert lag to frequency
    const frequency = sampleRate / refinedLag;
    
    // Check if frequency is in guitar range (E1 to B4)
    if (frequency < 75 || frequency > 500) { // Narrower range to eliminate non-guitar sounds
      return -1;
    }
    
    return frequency;
  };
  
  // The pitch detection loop
  const detectPitch = () => {
    if (!analyserRef.current || !audioContextRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPitch);
      return;
    }
    
    const analyser = analyserRef.current;
    const sampleRate = audioContextRef.current.sampleRate;
    
    // Get audio data
    const bufferLength = analyser.fftSize;
    const audioData = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(audioData);
    
    // Check if we have audio signal
    const signalSum = audioData.reduce((sum, value) => sum + Math.abs(value), 0);
    const avgSignal = signalSum / bufferLength;
    
    // Update audio level meter with reasonable amplification
    const meterLevel = Math.min(100, Math.max(0, avgSignal * 1000)); // Reduced for less sensitivity
    setAudioLevel(meterLevel);
    
    // Apply a moderate software gain to boost the signal before processing
    const gainedAudioData = new Float32Array(bufferLength);
    const gain = 3.0; // Reduced for less sensitivity
    for (let i = 0; i < bufferLength; i++) {
      gainedAudioData[i] = Math.max(-1, Math.min(1, audioData[i] * gain)); // Clamp to valid range
    }
    
    // Detect pitch using autocorrelation with the boosted signal
    const frequency = autoCorrelate(gainedAudioData, sampleRate);
    
    // Only use reliable pitch readings (frequency > 0 means valid detection)
    if (frequency > 0) {
      // Add to history for stability (keep last 5 readings)
      pitchHistoryRef.current.push(frequency);
      if (pitchHistoryRef.current.length > 5) {
        pitchHistoryRef.current.shift();
      }
      
      // Only update if we have enough readings and frequencies are close to each other
      // This prevents jumping around with sporadic detections
      if (pitchHistoryRef.current.length >= 3) { // Increased for more stability
        // Calculate median frequency (more stable than mean)
        const sortedPitches = [...pitchHistoryRef.current].sort((a, b) => a - b);
        const medianPitch = sortedPitches[Math.floor(sortedPitches.length / 2)];
        
        // Check if the recent readings are consistent (within 5% of median)
        const isStable = pitchHistoryRef.current.every(p => 
          Math.abs(p - medianPitch) / medianPitch < 0.05
        );
        
        if (isStable) {
          // Find closest string
          const closest = findClosestString(medianPitch);
          
          // Calculate cents difference
          const cents = calculateCents(medianPitch, closest.frequency);
          
          // Update state
          setDetectedPitch(medianPitch);
          setClosestString(closest);
          setCentsDifference(cents);
        }
      }
    }
    
    // Continue loop
    animationFrameRef.current = requestAnimationFrame(detectPitch);
  };
  
  // Initialize pitch detector and start listening
  const startTuner = async () => {
    try {
      setErrorMessage(null);
      
      // Check for secure context (needed for microphone)
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires HTTPS. Please use a secure connection.');
      }
      
      // Check if the browser supports audio input
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser doesn\'t support audio input. Please use Chrome, Firefox, or Edge.');
      }
      
      // First close any existing resources to avoid duplicates
      if (isListening) {
        await stopTuner();
      }
      
      // Get microphone access with balanced settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Disable echo cancellation for cleaner signal
          autoGainControl: true,   // Enable auto gain for better sensitivity
          noiseSuppression: true,  // Enable noise suppression to filter ambient noise
          channelCount: 1
        }
      });
      microphoneStreamRef.current = stream;
      
      // Create audio context
      const AudioContext = window.AudioContext || ((window as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext);
      if (!AudioContext) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Resume context (needed in some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create analyzer node with balanced settings for guitar
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Must be a power of 2
      analyser.smoothingTimeConstant = 0.2; // Middle ground between responsiveness and stability
      analyserRef.current = analyser;
      
      // Create a gain node with moderate amplification
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.5; // More conservative gain (reduced from 2.0)
      
      // Connect microphone -> gain -> analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      // Start detection loop
      pitchHistoryRef.current = [];
      setIsListening(true);
      detectPitch();
      
    } catch (error: unknown) {
      let message = 'Error accessing microphone';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          message = 'Microphone access was denied. Please allow microphone permissions in your browser.';
        } else if (error.name === 'NotFoundError') {
          message = 'No microphone found. Please connect a microphone.';
        } else if (error.message) {
          message = error.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
      }
      
      setErrorMessage(message);
      console.error('Tuner error:', error);
      stopTuner();
    }
  };
  
  // Clean up resources
  const stopTuner = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop microphone
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Clear refs and state
    analyserRef.current = null;
    pitchHistoryRef.current = [];
    setDetectedPitch(null);
    setClosestString(null);
    setCentsDifference(null);
    setIsListening(false);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTuner();
    };
  }, []);
  
  // Render tuning display
  const renderTuningDisplay = () => {
    if (!detectedPitch || !closestString || centsDifference === null) {
      return (
        <div style={{ minHeight: '350px' }}> {/* Fixed height container to prevent jumping */}
          <p className="text-lg mb-4">Listening for notes...</p>
          
          {/* Audio level meter with fixed height */}
          <div className="mb-4">
            <div className="text-sm mb-1">Microphone Input Level:</div>
            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <div className="text-xs mt-2 text-gray-500" style={{ height: '80px' }}> {/* Fixed height for tips */}
              <p>Play a single string clearly and wait for detection:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Hold your guitar close to the microphone</li>
                <li>Play one string at a time with medium strength</li>
                <li>Let the note ring clearly without background noise</li>
              </ul>
            </div>
          </div>
          
          {/* Tuner information with fixed height */}
          <div className="mt-6 p-3 border rounded border-gray-300 dark:border-gray-600" style={{ height: '100px' }}>
            <div className="text-sm font-medium mb-2">Tuner Information:</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Frequency range: 75Hz - 500Hz (guitar strings)<br/>
              Signal processing: Noise filtering + median analysis<br/>
              Requires 3 consistent readings for stable display
            </p>
          </div>
        </div>
      );
    }
    
    // Clamp cents for display (max ±50 cents)
    const clampedCents = Math.max(-50, Math.min(50, centsDifference));
    
    // Calculate meter position (0-100%)
    const meterPosition = ((clampedCents + 50) / 100) * 100;
    
    // Determine tuning status and instruction
    let tuningInstruction;
    let statusClass = "";
    
    if (Math.abs(centsDifference) <= 5) {
      tuningInstruction = "In tune!";
      statusClass = "text-green-600 dark:text-green-400 font-bold";
    } else if (Math.abs(centsDifference) <= 15) {
      // Close but needs adjustment
      if (centsDifference < 0) {
        tuningInstruction = `Tune up slightly (${Math.abs(centsDifference).toFixed(1)}¢)`;
        statusClass = "text-yellow-600 dark:text-yellow-400";
      } else {
        tuningInstruction = `Tune down slightly (${centsDifference.toFixed(1)}¢)`;
        statusClass = "text-yellow-600 dark:text-yellow-400";
      }
    } else {
      // Needs significant adjustment
      if (centsDifference < 0) {
        tuningInstruction = `Tune up by ${Math.abs(centsDifference).toFixed(1)}¢`;
        statusClass = "text-red-600 dark:text-red-400";
      } else {
        tuningInstruction = `Tune down by ${centsDifference.toFixed(1)}¢`;
        statusClass = "text-red-600 dark:text-red-400";
      }
    }
    
    return (
      <div className="mt-4 w-full" style={{ minHeight: '350px' }}> {/* Fixed height to prevent jumping */}
        {/* Fixed height container for the note display */}
        <div className="h-32 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold mb-1">{closestString.note}</div>
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-1">{closestString.string}</div>
          {/* Fixed height for frequency display to avoid jumping */}
          <div className="text-sm text-gray-500 dark:text-gray-400 h-6 flex items-center justify-center">
            <span className="inline-block min-w-[80px] text-center">{detectedPitch.toFixed(1)} Hz</span>
          </div>
        </div>
        
        {/* Audio level meter with fixed height */}
        <div className="mb-4 h-6">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <div 
              className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-100"
              style={{ width: `${audioLevel}%` }}
            ></div>
          </div>
        </div>
        
        {/* Cents display with fixed width and height */}
        <div className="text-center mb-2 h-10 flex items-center justify-center">
          <div className="inline-block min-w-[100px]">
            <span className="text-xl font-bold px-4 py-1 bg-white dark:bg-gray-800 rounded-full">
              {centsDifference.toFixed(1)}¢
            </span>
          </div>
        </div>
        
        {/* Improved tuning meter - much clearer and larger */}
        <div className="my-4">
          {/* Labels with fixed spacing and width */}
          <div className="flex justify-between text-xs mb-1 px-1">
            <span className="w-8 text-center">-50¢</span>
            <span className="w-8 text-center">-10¢</span>
            <span className="w-8 text-center">-5¢</span>
            <span className="w-8 text-center">-2¢</span>
            <span className="w-8 text-center">0¢</span>
            <span className="w-8 text-center">+2¢</span>
            <span className="w-8 text-center">+5¢</span>
            <span className="w-8 text-center">+10¢</span>
            <span className="w-8 text-center">+50¢</span>
          </div>
          
          {/* Meter - wider and taller */}
          <div className="h-16 relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ width: '100%' }}>
            {/* Color zones - gray with green center */}
            <div className="absolute inset-0 flex h-full">
              {/* Each segment is exactly proportioned to the scale width */}
              <div className="bg-gray-300 dark:bg-gray-600 h-full" style={{ width: '45%' }}></div>
              <div className="bg-green-200 dark:bg-green-900 h-full" style={{ width: '5%' }}></div>
              <div className="bg-green-500 dark:bg-green-600 h-full" style={{ width: '0%' }}></div>
              <div className="bg-green-200 dark:bg-green-900 h-full" style={{ width: '5%' }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 h-full" style={{ width: '45%' }}></div>
            </div>
            
            {/* Center marker (0¢) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full w-1 bg-white dark:bg-gray-200 absolute left-1/2 transform -translate-x-1/2"></div>
            </div>
            
            {/* ±2 cent markers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% - 2%)' }}></div>
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% + 2%)' }}></div>
            </div>
            
            {/* ±5 cent markers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% - 5%)' }}></div>
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% + 5%)' }}></div>
            </div>
            
            {/* ±10 cent markers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% - 10%)' }}></div>
              <div className="h-full w-0.5 bg-white dark:bg-gray-300 bg-opacity-70 absolute" 
                   style={{ left: 'calc(50% + 10%)' }}></div>
            </div>
            
            {/* Needle - thicker and more visible */}
            <div 
              className="absolute top-0 bottom-0 w-2 bg-white shadow-md z-10"
              style={{ 
                left: `${meterPosition}%`, 
                transform: 'translateX(-50%)',
                transition: 'left 0.1s ease-out'
              }}
            ></div>
          </div>
          
          {/* Instruction with fixed height and width */}
          <div className="text-center mt-4 h-8">
            <div className="inline-block min-w-[200px] min-h-[32px]">
              <span className={`text-lg font-medium ${statusClass}`}>{tuningInstruction}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {/* Removed inner card wrapper and title to avoid double styling */}
      
      {/* Error message */}
      {errorMessage && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {errorMessage}
        </div>
      )}
      
      {/* Main tuner area */}
      <div className="flex flex-col items-center">
        {/* Toggle button */}
        <button 
          onClick={toggleTuner}
          className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
              : 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
          } text-white transition-colors`}
          aria-label={isListening ? "Stop tuner" : "Start tuner"}
        >
          {isListening ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
        </button>
        
        {/* Pitch display area */}
        <div className="text-center mb-6" style={{ minHeight: '240px' }}>
          {isListening ? renderTuningDisplay() : (
            <p className="text-lg">Tap the microphone to start tuning</p>
          )}
        </div>
      </div>
      
      {/* Tuning selection */}
      <div className="mt-6">
        <div className="mb-4">
          <label htmlFor="tuning-select" className="block mb-2 font-medium">Tuning:</label>
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
              {Object.keys(GUITAR_TUNINGS).map((tuning) => (
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
        
        {/* Tuning strings display */}
        <h3 className="font-medium mb-3">String Reference:</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {GUITAR_TUNINGS[selectedTuning].map((string, index) => (
            <div 
              key={index} 
              className={`text-center p-3 rounded ${
                closestString && closestString.note === string.note
                  ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500 dark:border-primary-400' 
                  : 'bg-gray-100 dark:bg-secondary-700'
              }`}
            >
              <div className="font-bold text-lg">{string.note}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{string.frequency.toFixed(1)} Hz</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuitarTuner; 