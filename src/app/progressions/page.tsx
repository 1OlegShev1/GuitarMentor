import ChordProgressions from '@/components/ChordProgressions';

export default function ProgressionsPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Chord Progressions</h1>
        
        <p className="text-lg mb-8">
          Learn common chord progressions, understand how they work, and create your
          own progressions using music theory principles.
        </p>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-4 md:p-6 mb-8">
          <ChordProgressions />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">What are Chord Progressions?</h2>
            <p className="mb-4 text-secondary-600 dark:text-secondary-300">
              Chord progressions are sequences of chords played in a specific order. They form the harmonic
              foundation of music and create a sense of movement and emotion.
            </p>
            <p className="text-secondary-600 dark:text-secondary-300">
              In Western music, chord progressions often follow patterns based on the relationships
              between chords in a key. Understanding these patterns helps you create music that sounds
              satisfying and coherent.
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reading Roman Numerals</h2>
            <p className="mb-4 text-secondary-600 dark:text-secondary-300">
              Chord progressions are often written with Roman numerals to show the relationship
              of chords to the key instead of specific chords.
            </p>
            <ul className="space-y-2 list-disc pl-5 text-secondary-600 dark:text-secondary-300">
              <li>Uppercase (I, IV, V) = major chord</li>
              <li>Lowercase (ii, iii, vi) = minor chord</li>
              <li>Lowercase with ° (vii°) = diminished chord</li>
              <li>Numbers refer to scale degrees (I = 1st, IV = 4th, etc.)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Common Chord Progressions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-primary-600 mb-2">I - IV - V - I</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                The foundation of countless songs in rock, blues, folk, and pop music.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in G major: G - C - D - G
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">I - V - vi - IV</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                Known as the &quot;pop-punk progression&quot; or &quot;Axis of Awesome&quot; progression, used in hundreds of pop songs.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in C major: C - G - Am - F
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">ii - V - I</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                The most common jazz progression, often expanded with additional chords.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in F major: Gm7 - C7 - Fmaj7
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">I - vi - IV - V</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                The classic &quot;doo-wop&quot; progression used in countless early rock and pop songs.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in A major: A - F#m - D - E
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">I - IV - vi - V</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                A versatile progression that works well in many genres.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in D major: D - G - Bm - A
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">vi - IV - I - V</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                The minor variant of the pop progression, with a darker feel.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Example in E major: C#m - A - E - B
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 