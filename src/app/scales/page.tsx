import ScaleExplorer from '@/components/ScaleExplorer';

export default function ScalesPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Scale Explorer</h1>
        
        <p className="text-lg mb-8">
          Explore different guitar scales, positions, and practice patterns to
          improve your soloing and musical knowledge.
        </p>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-4 md:p-6 mb-8">
          <ScaleExplorer />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Common Guitar Scales</h2>
            <ul className="space-y-4">
              <li>
                <h3 className="font-medium text-primary-600">Major Scale</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  The foundation of Western music. Pattern: W-W-H-W-W-W-H
                </p>
              </li>
              <li>
                <h3 className="font-medium text-primary-600">Natural Minor Scale</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Used extensively in rock, pop, and blues. Pattern: W-H-W-W-H-W-W
                </p>
              </li>
              <li>
                <h3 className="font-medium text-primary-600">Pentatonic Minor Scale</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  A five-note scale extremely common in blues, rock and pop music.
                </p>
              </li>
              <li>
                <h3 className="font-medium text-primary-600">Blues Scale</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Pentatonic minor with an added flat 5th (blue note).
                </p>
              </li>
              <li>
                <h3 className="font-medium text-primary-600">Harmonic Minor Scale</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Natural minor with a raised 7th degree. Common in classical and metal.
                </p>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Practice Tips</h2>
            <ul className="space-y-3 list-disc pl-5">
              <li>Start with pentatonic scales which are easier to learn and sound good quickly</li>
              <li>Practice scales with a metronome, starting slowly and gradually increasing speed</li>
              <li>Learn scales in multiple positions across the fretboard</li>
              <li>Practice connecting scale positions to cover the entire fretboard</li>
              <li>Try playing scales using different rhythmic patterns</li>
              <li>Apply scales to backing tracks to develop your ear and phrasing</li>
              <li>Learn to associate scale positions with the CAGED system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 