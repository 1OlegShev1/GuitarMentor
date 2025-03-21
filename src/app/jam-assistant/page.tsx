import JamAssistant from '@/components/JamAssistant';

export default function JamAssistantPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Jam Assistant</h1>
        
        <p className="text-lg mb-8">
          Get suggestions for extending your chord progressions, creating variations,
          and building complete song structures based on your ideas.
        </p>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-4 md:p-6 mb-8">
          <JamAssistant />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Building a Song Structure</h2>
            <p className="mb-4 text-secondary-600 dark:text-secondary-300">
              Creating a well-structured song involves arranging sections that provide both
              familiarity and contrast. Most popular songs follow patterns that include 
              some of these elements:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-secondary-600 dark:text-secondary-300">
              <li><span className="font-medium">Intro:</span> Sets the mood and introduces key elements</li>
              <li><span className="font-medium">Verse:</span> Tells the story and builds context</li>
              <li><span className="font-medium">Pre-Chorus:</span> Builds tension leading to the chorus</li>
              <li><span className="font-medium">Chorus:</span> The hook and most memorable part</li>
              <li><span className="font-medium">Bridge:</span> Provides contrast and new perspective</li>
              <li><span className="font-medium">Outro:</span> Brings the song to a satisfying close</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Extending Progressions</h2>
            <p className="mb-4 text-secondary-600 dark:text-secondary-300">
              To extend or modify your chord progressions for different sections:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-secondary-600 dark:text-secondary-300">
              <li>Change the last chord to create tension or resolution</li>
              <li>Add passing chords between existing chords</li>
              <li>Borrow chords from parallel keys (major/minor)</li>
              <li>Use secondary dominants to add direction</li>
              <li>Try inversions of the same chords for subtle variations</li>
              <li>Create contrast with different rhythmic patterns</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Common Song Structures</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-primary-600 mb-2">Basic Verse-Chorus</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                Intro - Verse - Chorus - Verse - Chorus - Outro
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                A simple structure that works well for many styles. Easy to learn and remember.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">Verse-Chorus with Bridge</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                Intro - Verse - Chorus - Verse - Chorus - Bridge - Chorus - Outro
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Adds a bridge to provide contrast before the final chorus. Popular in rock and pop.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">Verse-Pre-Chorus-Chorus</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                Intro - Verse - Pre-Chorus - Chorus - Verse - Pre-Chorus - Chorus - Bridge - Chorus - Outro
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Uses a pre-chorus to build tension before the chorus. Common in modern pop music.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-600 mb-2">AABA Form</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                A Section - A Section - B Section - A Section
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                A classic form used in jazz standards and early rock and roll.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 