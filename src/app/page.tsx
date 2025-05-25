"use client";

import Link from 'next/link';
import Metronome from '@/components/Metronome';
import GuitarTuner from '@/components/GuitarTuner';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl w-full space-y-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-secondary-900 dark:text-white">Guitar</span>
            <span className="text-primary-600 dark:text-primary-400">Mentor</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary-700 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed">
            Your personal assistant for learning guitar scales, CAGED system, 
            fretboard navigation, and creating better chord progressions.
          </p>
        </div>
        
        {/* Essential Tools Section */}
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-semibold text-center mb-8 text-secondary-800 dark:text-secondary-200">Essential Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
              <div className="card p-6 md:p-8 h-full">
                <h3 className="text-2xl font-semibold text-center mb-6 text-secondary-800 dark:text-secondary-200">Metronome</h3>
                <Metronome />
              </div>
              <div className="card p-6 md:p-8 h-full">
                <h3 className="text-2xl font-semibold text-center mb-6 text-secondary-800 dark:text-secondary-200">Guitar Tuner</h3>
                <GuitarTuner />
              </div>
            </div>
          </div>
          
          {/* Learning Section */}
          <div>
            <h2 className="text-3xl font-semibold text-center mb-8 text-secondary-800 dark:text-secondary-200">Learning Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Fretboard Card */}
              <Link href="/fretboard" className="group block">
                <div className="card h-full p-8 transition-all duration-300 hover:shadow-xl group-hover:translate-y-[-4px]">
                  <h3 className="text-2xl font-semibold mb-3 text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Fretboard Navigator
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                    Learn all the notes on the guitar fretboard interactively.
                  </p>
                </div>
              </Link>
              {/* Scales Card */}
              <Link href="/scales" className="group block">
                <div className="card h-full p-8 transition-all duration-300 hover:shadow-xl group-hover:translate-y-[-4px]">
                  <h3 className="text-2xl font-semibold mb-3 text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Scale Explorer
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                    Visualize and practice guitar scales in different positions.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8">
          <p className="text-secondary-600 dark:text-secondary-400 italic">
            Start your journey to guitar mastery today
          </p>
        </div>
      </div>
    </main>
  );
} 