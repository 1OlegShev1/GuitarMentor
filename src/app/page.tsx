import Link from 'next/link';

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="group">
              <div className="card h-full p-8 transition-all duration-300 hover:shadow-xl group-hover:translate-y-[-4px]">
                <h2 className="text-2xl font-semibold mb-3 text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
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

const features = [
  {
    title: 'Fretboard Navigator',
    description: 'Learn all the notes on the guitar fretboard through interactive exercises',
    href: '/fretboard',
  },
  {
    title: 'Scale Explorer',
    description: 'Visualize and practice guitar scales in different positions',
    href: '/scales',
  },
  {
    title: 'CAGED System',
    description: 'Master the CAGED system to understand chord shapes and positions',
    href: '/caged',
  },
  {
    title: 'Chord Progressions',
    description: 'Learn common chord progressions and create your own',
    href: '/progressions',
  },
  {
    title: 'Ear Training',
    description: 'Improve your ear for recognizing chords and notes',
    href: '/ear-training',
  },
  {
    title: 'Jam Assistant',
    description: 'Get suggestions for extending your chord progressions',
    href: '/jam-assistant',
  },
]; 