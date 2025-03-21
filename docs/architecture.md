# Guitar Mentor Application Architecture

This document outlines the architecture of the Guitar Mentor application.

## Tech Stack

- **Next.js 14**: React framework with server-side rendering
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Tone.js**: Audio processing and playback
- **Pitchy**: Audio analysis for pitch detection
- **Tonal.js**: Music theory calculations and functions

## Project Structure

```
/src
  /app                 # Next.js app router structure
    /(routes)          # Individual page routes
    /layout.tsx        # Root layout
  /components          # Reusable React components
  /lib                 # Utility functions and shared logic
  /styles              # Global styles
  /types               # TypeScript type definitions
/public                # Static assets
/docs                  # Documentation
```

## Core Features and Components

### Fretboard Navigator

Located in `/app/fretboard` and using the `FretboardDisplay` component, this feature helps users learn the notes on the guitar fretboard through visualization and interactive exercises.

**Key functionality:**
- Interactive fretboard display
- Note highlighting and identification
- Practice modes for note memorization

### Scale Explorer

Located in `/app/scales` and using the `ScaleExplorer` component, this feature allows users to explore different guitar scales, positions, and patterns.

**Key functionality:**
- Scale visualization on the fretboard
- Scale selection (major, minor, pentatonic, etc.)
- Scale theory information

### CAGED System

Located in `/app/caged` and using the `CagedSystemDisplay` component, this feature teaches the CAGED system for understanding chord shapes and positions.

**Key functionality:**
- Visualization of the five CAGED positions
- Interactive chord shape display
- Connection between chord shapes and scale patterns

### Chord Progressions

Located in `/app/progressions` and using the `ChordProgressions` component, this feature helps users learn and create chord progressions.

**Key functionality:**
- Common chord progression library
- Chord progression visualization
- Customizable progressions in various keys

### Jam Assistant

Located in `/app/jam-assistant` and using the `JamAssistant` component, this feature provides suggestions for extending chord progressions and creating song structures.

**Key functionality:**
- Progression variation suggestions
- Bridge and chorus ideas based on existing progressions
- Song structure recommendations

## Planned Features

### Audio Recognition

Future implementation will use the Pitchy library for pitch detection to identify notes and chords played by the user.

### Audio Playback

Future implementation will use Tone.js to play scales, chord progressions, and backing tracks.

## State Management

The application primarily uses React's built-in state management (useState, useEffect) for component-level state. As the application grows, we may consider implementing a more robust state management solution.

## Styling

We use Tailwind CSS for styling, with a custom color scheme defined in `tailwind.config.js`. The application supports both light and dark modes.

## Design Patterns

- **Component Composition**: Building complex UI from simpler components
- **Custom Hooks**: For reusable logic
- **Server Components**: For improved performance with Next.js 