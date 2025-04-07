# Guitar Mentor Features Documentation

This document provides detailed information about each feature in the Guitar Mentor application, including usage instructions and technical implementation details.

## Navigation

The application includes a persistent navigation bar that allows users to move between different sections of the app. The navigation is responsive and adapts to different screen sizes.

**Technical implementation:**
- Located in `src/components/Navigation.tsx`
- Uses Next.js 15 `Link` component for client-side navigation
- Implemented with React 19 components
- Highlights the current page based on the current path
- Provides a mobile-friendly version with a hamburger menu
- Includes a theme toggle for switching between light and dark modes

## Theme Toggle

The application supports both light and dark themes to accommodate different user preferences and reduce eye strain in low-light environments.

### Features:

1. **Theme Switching**
   - Toggle between light and dark modes with a single click
   - System preference detection automatically applies your preferred theme
   - Persists theme choice between visits using local storage

2. **Visual Adaptation**
   - All UI components smoothly transition between themes
   - Careful color selection ensures proper contrast in both modes
   - Icons change to match the current theme

### Usage Instructions:

1. **Changing Themes:**
   - Click the sun/moon icon in the navigation bar to toggle between light and dark modes
   - Theme automatically applies across all pages
   - No page reload required when switching themes

**Technical implementation:**
- Uses `next-themes` library for theme management
- Located in `src/components/ThemeToggle.tsx`
- Implemented with a class-based dark mode approach in Tailwind CSS 4
- CSS variables in `globals.css` handle consistent theming across components

## Guitar Tools

The Guitar Tools section provides essential practice tools for guitarists, including a metronome and a microphone-based guitar tuner.

### Features:

1. **Tabbed Interface**
   - Easy navigation between different tools
   - Clean, focused UI for each tool
   - Smooth transitions between tools

2. **Responsive Design**
   - Works well on desktop and mobile devices
   - Optimized controls for touch interfaces

### Usage Instructions:

1. **Accessing Tools:**
   - Navigate to the Tools page from the main navigation
   - Switch between tools using the tab navigation at the top

**Technical implementation:**
- Located in `src/app/tools/page.tsx`
- Uses a tab-based interface for tool selection
- Includes helpful tips for each tool
- Smooth animation transitions between tools

## Metronome

The Metronome helps musicians maintain consistent timing and develop a stronger sense of rhythm.

### Features:

1. **Tempo Control**
   - Adjustable tempo from 40-240 BPM
   - Visual indication of the current tempo
   - Increment/decrement controls for precise adjustments

2. **Time Signature Selection**
   - Support for common time signatures (2/4, 3/4, 4/4, 6/8)
   - First-beat accent to emphasize the downbeat
   - Visual indication of the current time signature

3. **Volume Control**
   - Adjustable volume slider
   - Percentage display of current volume
   - Different sounds for accented and regular beats

### Usage Instructions:

1. **Setting Tempo:**
   - Use the + and - buttons to adjust the tempo in 5 BPM increments
   - Start with a slower tempo and gradually increase as you build accuracy

2. **Starting/Stopping:**
   - Press the play/pause button to start or stop the metronome
   - The button changes color to indicate the current state

3. **Adjusting Settings:**
   - Select time signature using the dropdown menu
   - Adjust volume using the slider at the bottom

**Technical implementation:**
- Located in `src/components/Metronome.tsx`
- Uses Tone.js for precise timing and audio synthesis
- Features React state management for metronome settings
- Implements useRef for managing audio resources
- Cleanup on component unmount to prevent memory leaks

## Guitar Tuner

The Guitar Tuner uses the device's microphone to detect the pitch of played notes and helps users tune their guitar to standard tuning.

### Features:

1. **Real-time Pitch Detection**
   - Microphone-based pitch detection
   - Visual indication of detected note
   - Frequency display in Hertz

2. **Multiple Tuning Options**
   - Standard (EADGBE)
   - Drop D (DADGBE)
   - Half Step Down (Eb Ab Db Gb Bb Eb)
   - Open G (DGDGBD)
   - DADGAD
   - Easy selection through dropdown menu

3. **Precision Tuning Guidance**
   - Visual cents-based tuning indicator with 21 segments
   - Range display of ±50 cents from perfect pitch
   - Color-coded feedback (green for in-tune, red for sharp, blue for flat)
   - Exact cents deviation measurement display (-50¢ to +50¢)
   - Clear text instructions with precise cents adjustment values

4. **Standard Tuning Reference**
   - Reference display for all six guitar strings
   - Highlights the closest string to the detected pitch
   - Shows standard frequencies for each string

### Usage Instructions:

1. **Starting the Tuner:**
   - Click the microphone button to activate the tuner
   - Grant microphone permissions when prompted
   - The button turns red when the tuner is active

2. **Selecting a Tuning:**
   - Choose your desired tuning from the dropdown menu before starting the tuner
   - The tuning selection is disabled while the tuner is active
   - The reference notes at the bottom will update to show the selected tuning

3. **Reading the Tuning Indicator:**
   - The center of the indicator represents perfect tuning (0¢)
   - Segments to the right indicate the note is sharp (positive cents)
   - Segments to the left indicate the note is flat (negative cents)
   - The active segment shows exactly how far from in-tune your string is
   - The numerical cents value shows the precise deviation

4. **Tuning a String:**
   - Pluck one string at a time
   - Observe the cents indicator and follow the instruction text
   - Adjust the tuning peg until the indicator centers in the green zone (±5¢)
   - The display shows "Perfect!" when your string is properly tuned

5. **Reference Guide:**
   - The bottom of the tuner shows all six strings in the selected tuning
   - The current string being tuned is highlighted
   - Use the reference frequencies for precise tuning

**Technical implementation:**
- Located in `src/components/GuitarTuner.tsx`
- Uses the Pitchy library for accurate pitch detection
- Implements Web Audio API for microphone input processing
- Converts frequency deviations to cents using the formula: 1200 * log2(frequency ratio)
- Features a multi-segment visual display for precise tuning guidance
- Handles browser permissions for microphone access
- Includes cleanup of audio resources on component unmount

## Fretboard Navigator

The Fretboard Navigator helps users learn and memorize the notes on the guitar fretboard through visualization and interactive exercises.

### Features:

1. **Interactive Fretboard Display**
   - Visual representation of a guitar fretboard
   - Shows all notes across six strings
   - Option to toggle between 12-fret and 24-fret display
   - Frets can be navigated using arrow buttons in 24-fret mode

2. **Note Highlighting**
   - Click on any note to highlight all occurrences of that note across the fretboard
   - Option to show only natural notes (non-sharp/flat)
   - Option to show/hide all notes

3. **Practice Modes**
   - **Identify Notes**: Quiz mode where a position is highlighted and you must identify the note
   - **Find Notes**: Asks you to find all occurrences of a specific note on the fretboard
   - **Notes by String**: Focus on learning one string at a time
   - **Octave Shapes**: Learn to find octaves of notes across the fretboard

### Usage Instructions:

1. **Basic Navigation:**
   - Use the "12 Frets" toggle to switch between 12 and 24 frets
   - In 24-fret mode, use the arrow buttons to navigate along the neck
   - Click any note to highlight all occurrences of that note

2. **Practice Modes:**
   - Click "Practice Modes" to show the available practice options
   - Select a practice mode to begin
   - Use "Show Answer" to reveal correct answers
   - "New Question" generates a new challenge
   - "Exit Practice" returns to explore mode

3. **Identify Notes Mode:**
   - A position is highlighted with a "?" symbol
   - Select the correct note from the note buttons below
   - Feedback shows if your answer is correct or incorrect

**Technical implementation:**
- Located in `src/app/fretboard/page.tsx`, which renders the `FretboardDisplay` component.
- Uses `<FretboardDisplay displayMode="practice" />`.
- Practice modes (Identify, Find, Octaves) and explore sub-mode are managed internally within `FretboardDisplay` using the `practiceMode` state.
- Cross-note highlighting is handled by the `crossHighlightNote` state within `FretboardDisplay`.
- Note visibility and styling logic resides within `FretboardDisplay` and `FretboardNote`, varying based on `displayMode` and `practiceMode`.
- Note position calculation: `(openStringNoteIndex + fret) % 12`.

## Scale Explorer

The Scale Explorer allows users to visualize and learn different scales on the guitar fretboard.

### Features:

1. **Scale Selection**
   - Choose from various scale types: Major, Minor, Pentatonic, Blues, Modes, etc.
   - Select any root note
   - View the scale notes and formula

2. **Position Selection**
   - View scales in different positions along the neck
   - CAGED system position indicators
   - Option to view all positions simultaneously

3. **Playback Visualization**
   - Highlight ascending/descending patterns
   - Finger placement recommendations

**Technical implementation:**
- Located in `src/components/ScaleExplorer.tsx`.
- Renders the central `<FretboardDisplay displayMode="scale" ... />` component.
- Passes `scaleNotes`, `rootNote`, and `highlightedPattern` props to `FretboardDisplay`.
- `ScaleExplorer` manages state for selected `rootNote`, `scaleType`, and `selectedPositionIndex`.
- Calculates `scaleNotes` and `highlightedPattern` based on selected scale/position and passes them down.
- Fretboard rendering and note styling logic is handled by `FretboardDisplay` and `FretboardNote`.

## CAGED System

The CAGED System page helps users understand the five basic chord shapes (C, A, G, E, D) and how they connect across the fretboard.

### Features:

1. **Shape Visualization**
   - Interactive display of the five CAGED shapes
   - Root note highlighting
   - Connection points between shapes

2. **Chord Variations**
   - Major, minor, 7th, and other chord variations for each shape
   - Fingering suggestions
   - Optional note labels

3. **Scale Integration**
   - Shows how scale patterns relate to CAGED shapes
   - Highlights chord tones within scales

**Technical implementation:**
- Located in `src/components/CagedSystemDisplay.tsx`.
- Renders the central `<FretboardDisplay displayMode="caged" ... />` component.
- Manages state for the selected CAGED shape key (`selectedShapeKey`).
- Transforms raw shape data (using 1-based string index) into the `CagedShapeData` format (0-based index) using `transformShapeData` helper.
- Passes the transformed `cagedShape` data prop to `FretboardDisplay`.
- `FretboardDisplay` handles the rendering of notes (showing finger numbers), barre lines, and muted strings based on the `cagedShape` prop and `displayMode="caged"`.

## Chord Progressions

The Chord Progressions feature helps users learn common chord progressions and create their own.

### Features:

1. **Progression Library**
   - Common progressions in different keys
   - Roman numeral and chord name notation
   - Genre categorization

2. **Custom Progressions**
   - Build custom progressions
   - Transpose to any key
   - Save and recall favorites

3. **Fretboard Visualization**
   - See how progressions map to the fretboard
   - Efficient fingering suggestions
   - Highlight common tones between chords

**Technical implementation:**
- Located in `src/components/ChordProgressions.tsx`
- Uses music theory algorithms for chord calculations
- Progressions are stored as patterns that can be applied to any key

## Jam Assistant

The Jam Assistant helps users extend chord progressions and build complete song structures.

### Features:

1. **Progression Extensions**
   - Suggestions for variations on current progression
   - Bridge and chorus ideas
   - Extensions based on music theory rules

2. **Song Structure Builder**
   - Create verse, chorus, bridge sections
   - Automatic suggestions for complementary sections
   - Complete song structure visualization

3. **Progression Database**
   - Common progression patterns by genre
   - Analysis of progression function
   - Custom progression input

**Technical implementation:**
- Located in `src/components/JamAssistant.tsx`
- Uses a database of progression patterns and relationships
- Progression suggestions are based on music theory and common practices

## Future Features

### Audio Recognition
- Note and chord detection from microphone input
- Real-time feedback on played notes
- Practice mode with accuracy scoring

### Audio Playback
- Play scales and progressions
- Adjustable tempo and rhythm patterns
- Backing tracks for practice

### Custom Practice Routines
- Create personalized practice schedules
- Track progress over time
- Difficulty adjustment based on performance

## Technical Notes

### State Management

The application uses React's useState and useEffect hooks for state management. Each component manages its own state, including:

- Current display mode
- Selected notes, scales, or chords
- Practice mode state
- User interaction history
- Audio state (metronome, tuner)
- Device permissions (microphone access)

### Data Structures

Several key data structures power the application:

1. **Note Mapping**
   ```typescript
   const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
   ```

2. **String Tuning**
   ```typescript
   const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
   ```

3. **Fretboard Position**
   ```typescript
   type NotePosition = {
     string: number;
     fret: number;
   };
   ```

4. **Chord Progressions**
   ```typescript
   const PROGRESSION_SUGGESTIONS: ProgressionSuggestions = {
     'I-IV-V-I': {
       bridge: [...],
       variations: [...],
       extensions: [...]
     },
     // other progressions
   };
   ```

5. **Guitar String Tunings**
   ```typescript
   // Guitar string with note name and frequency
   type GuitarString = { name: string; frequency: number };
   
   // Available tuning names
   type TuningName = 'Standard' | 'Drop D' | 'Half Step Down' | 'Open G' | 'DADGAD';
   
   // A complete guitar tuning (array of 6 strings)
   type Tuning = GuitarString[];
   
   // Map of all available tunings
   type TuningMap = {
     [key in TuningName]: Tuning;
   };
   
   // Example tuning definition
   const STANDARD_TUNING: Tuning = [
     { name: 'E2', frequency: 82.41 },
     { name: 'A2', frequency: 110.00 },
     { name: 'D3', frequency: 146.83 },
     { name: 'G3', frequency: 196.00 },
     { name: 'B3', frequency: 246.94 },
     { name: 'E4', frequency: 329.63 }
   ];
   ```

6. **Tuning Status Interface**
   ```typescript
   interface TuningStatus {
     percentageDiff: number;
     centsDiff: number;      // Deviation in cents (1/100th of a semitone)
     isTooHigh: boolean;
     isTooLow: boolean;
     isInTune: boolean;
   }
   ```

### Audio Processing

The application uses several audio technologies:

1. **Tone.js**
   - Used in the Metronome component for precise timing
   - Provides synthesized sounds for beats and accents
   - Implements scheduling and timing control

2. **Web Audio API**
   - Core browser API used for audio processing
   - Utilized for microphone access and input processing
   - Powers real-time audio analysis in the tuner

3. **Pitchy**
   - Library for pitch detection in the guitar tuner
   - Analyzes audio data to determine fundamental frequency
   - Provides clarity measurement for accuracy

### Third-Party Libraries

The application leverages several libraries:

- **Next.js 15**: React framework for server-side rendering and routing
- **React 19**: UI component library
- **TailwindCSS**: Utility-first CSS framework
- **Tone.js**: Audio framework for timing and synthesis
- **Pitchy**: Pitch detection library
- **Tonal.js**: Music theory calculations and reference
- **React-Icons**: Icon library for UI elements
- **Next-themes**: Dark mode implementation 