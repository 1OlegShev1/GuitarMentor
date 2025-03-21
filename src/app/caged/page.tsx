import CagedSystemDisplay from '@/components/CagedSystemDisplay';

export default function CagedPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">CAGED System</h1>
        
        <p className="text-lg mb-8">
          The CAGED system is a powerful framework for understanding how chord shapes and 
          scale patterns connect across the entire fretboard.
        </p>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-4 md:p-6 mb-8">
          <CagedSystemDisplay />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">What is the CAGED System?</h2>
            <p className="mb-4">
              The CAGED system is named after the five basic open chord shapes: C, A, G, E, and D.
              These chord shapes can be moved up the fretboard using a barre or partial barre
              to play the same chord in different positions.
            </p>
            <p>
              For example, the open C chord shape can be moved up the neck with a barre to 
              play different chords. When barred at the 5th fret, the C shape becomes an F chord.
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Benefits of Learning CAGED</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Play any chord anywhere on the fretboard</li>
              <li>Understand how scales and chord shapes are related</li>
              <li>Easily find chord tones for soloing</li>
              <li>See the fretboard as connected patterns instead of isolated shapes</li>
              <li>Create more interesting chord voicings and extensions</li>
              <li>Improve your improvisation by knowing where chord tones are</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">How to Practice the CAGED System</h2>
            <ol className="space-y-4 list-decimal pl-5">
              <li>
                <strong>Learn the five basic shapes:</strong> Start by mastering the open C, A, G, E, and D chord shapes.
              </li>
              <li>
                <strong>Practice moving one shape:</strong> Take one shape (like C) and practice playing it as a barre chord up the neck.
              </li>
              <li>
                <strong>Connect adjacent shapes:</strong> Practice transitioning between shapes (e.g., from C shape to A shape).
              </li>
              <li>
                <strong>Add scales to each shape:</strong> Learn the major scale pattern that corresponds to each CAGED shape.
              </li>
              <li>
                <strong>Practice chord tone targeting:</strong> Highlight the root, third, and fifth of each chord shape.
              </li>
              <li>
                <strong>Apply to songs:</strong> Take a simple song and play it using different CAGED shapes across the fretboard.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 