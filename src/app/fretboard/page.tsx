"use client";

import { useState, useRef } from 'react';
import FretboardDisplay from '@/components/FretboardDisplay';

export default function FretboardPage() {
  const [activePracticeMode, setActivePracticeMode] = useState<boolean>(false);
  const fretboardRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-white dark:bg-secondary-900">
      <h1 className="text-4xl font-bold mb-4 text-center">
        <span className="text-primary">Fret</span>board Navigator
      </h1>
      <p className="text-lg mb-8 text-center max-w-3xl">
        Master the fretboard by learning note positions, practicing identification exercises,
        and applying visualization techniques to improve your guitar playing.
      </p>

      <div ref={fretboardRef} className="w-full max-w-5xl mb-12">
        <FretboardDisplay showPractice={activePracticeMode} />
      </div>

      <div className="w-full max-w-5xl mb-12">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 p-2 rounded-t-lg border-b border-primary/30">
          <h2 className="text-2xl font-bold text-primary">Tips for Learning</h2>
        </div>
        <div className="bg-gray-50 dark:bg-secondary-800 p-6 rounded-b-lg shadow-md">
          <ol className="space-y-4">
            <li>
              <h3 className="font-bold text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                Start with the Natural Notes
              </h3>
              <p className="ml-8 text-gray-700 dark:text-gray-300">Focus on learning A, B, C, D, E, F, G on each string before adding sharps and flats.</p>
            </li>
            <li>
              <h3 className="font-bold text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                Learn Notes by String
              </h3>
              <p className="ml-8 text-gray-700 dark:text-gray-300">Master one string at a time. The 6th and 5th strings are good starting points.</p>
            </li>
            <li>
              <h3 className="font-bold text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                Use Reference Points
              </h3>
              <p className="ml-8 text-gray-700 dark:text-gray-300">Memorize notes at the 3rd, 5th, 7th, and 12th frets as landmarks to navigate from.</p>
            </li>
            <li>
              <h3 className="font-bold text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                Practice Daily
              </h3>
              <p className="ml-8 text-gray-700 dark:text-gray-300">Spend 5-10 minutes a day on fretboard memorization for consistent improvement.</p>
            </li>
            <li>
              <h3 className="font-bold text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                Connect with Scales
              </h3>
              <p className="ml-8 text-gray-700 dark:text-gray-300">As you learn scales, relate them to the notes on the fretboard to reinforce your knowledge.</p>
            </li>
          </ol>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="bg-gray-700 dark:bg-secondary-800 p-2 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">Additional Resources</h2>
        </div>
        <div className="bg-gray-50 dark:bg-secondary-800 p-6 rounded-b-lg shadow-md">
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
            Video Tutorials
          </h3>
          <ul className="list-disc ml-10 mb-4 text-gray-700 dark:text-gray-300">
            <li>Complete Fretboard Memorization in 3 Days</li>
            <li>The Circle of Fifths and Fretboard Navigation</li>
            <li>Fretboard Visualization for Improvisation</li>
          </ul>

          <h3 className="font-bold text-lg mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Further Practice Ideas
          </h3>
          <ul className="list-disc ml-10 text-gray-700 dark:text-gray-300">
            <li>Practice finding intervals (3rds, 5ths, etc.) across the fretboard</li>
            <li>Learn to play the same melody in multiple positions</li>
            <li>Combine scale patterns with fretboard navigation exercises</li>
            <li>Practice with a metronome, increasing speed as you improve</li>
          </ul>
        </div>
      </div>
    </main>
  );
} 