# Guitar Mentor

A comprehensive application for learning guitar, including scales, CAGED system, fretboard navigation, and chord progression assistance.

## Features

- **Fretboard Navigator**: Learn all the notes on the guitar fretboard through interactive exercises
- **Scale Explorer**: Visualize and practice guitar scales in different positions
- **CAGED System**: Master the CAGED system to understand chord shapes and positions
- **Chord Progressions**: Learn common chord progressions and create your own
- **Ear Training**: Improve your ear for recognizing chords and notes
- **Jam Assistant**: Get suggestions for extending your chord progressions and creating variations

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Tone.js (for audio processing)
- Pitchy (for pitch detection)
- Tonal.js (for music theory calculations)

## Key Architectural Patterns

*   **State Management:** Zustand is used for global state where necessary, while local component state (`useState`, `useReducer`) is preferred for component-specific data.
*   **Styling:** Tailwind CSS is used for utility-first styling.
* **Component Structure:** Components are organized by feature or shared utility within the `src/components` directory.
*   **Fretboard Rendering:** A specific pattern using a `NoteDisplayState` enum is employed for flexible and maintainable fretboard note rendering. See [docs/fretboard-rendering.md](docs/fretboard-rendering.md) for details.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Planned Features

- Audio recognition to identify what you're playing
- Suggestions for extending chord progressions
- Integration with backing tracks
- Progress tracking
- Custom practice routines 