# Guitar Mentor Development Guide

This document provides information for developers working on the Guitar Mentor application, including setup instructions, coding conventions, and development roadmap.

## Development Setup

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/1OlegShev1/GuitarMentor.git
   cd GuitarMentor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

5. For network access (to test on other devices):
   ```bash
   npm run dev:network
   ```
   This will show your local IP addresses and start the server with network access.

## Project Structure

```
/
├── docs/                  # Documentation
├── public/                # Static assets
├── scripts/               # Utility scripts
│   └── find-local-ip.js   # Network IP finder
├── src/                   # Source code
│   ├── app/               # Next.js app directory
│   │   ├── fretboard/     # Fretboard page
│   │   ├── scales/        # Scales page
│   │   ├── caged/         # CAGED System page
│   │   ├── progressions/  # Chord Progressions page
│   │   ├── jam-assistant/ # Jam Assistant page
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # Reusable components
│   │   ├── FretboardDisplay.tsx
│   │   ├── ScaleExplorer.tsx
│   │   ├── CagedSystemDisplay.tsx
│   │   ├── ChordProgressions.tsx
│   │   ├── JamAssistant.tsx
│   │   ├── Navigation.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Network Access

The application can be accessed from other devices on the local network, which is useful for testing on mobile devices, tablets, or other computers without deploying to a server.

### Configuration

The network access configuration is set up in the `package.json` scripts:

```json
"scripts": {
  "dev": "next dev -H 0.0.0.0 -p 3000",
  "start": "next start -H 0.0.0.0 -p 3000",
  "find-ip": "node scripts/find-local-ip.js",
  "dev:network": "node scripts/find-local-ip.js && next dev -H 0.0.0.0 -p 3000"
}
```

### Usage

1. To find your local IP addresses:
   ```bash
   npm run find-ip
   ```

2. To start the development server with network access:
   ```bash
   npm run dev:network
   ```

3. Access the application from other devices using:
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   Where `YOUR_LOCAL_IP` is the IP address displayed when running the command.

### How It Works

The `-H 0.0.0.0` flag tells Next.js to listen on all network interfaces instead of just localhost. The `find-local-ip.js` script displays your device's local IP addresses to make it easier to connect from other devices.

## Technologies

Guitar Mentor uses the following key technologies:

- **Next.js 15+**: React framework for server-side rendering and static site generation
- **React 19**: UI component library
- **TypeScript 5+**: Typed JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **Tonal**: Music theory library
- **Tone.js**: Web Audio framework
- **Pitchy**: Pitch detection library
- **Next-themes**: Dark mode implementation

## Coding Conventions

### TypeScript

- Use TypeScript for all new code
- Define interfaces for component props
- Use descriptive variable names
- Add type annotations for all functions

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  // ...
};
```

### Components

- One component per file
- Use function components with React hooks
- Include "use client" directive for client components
- Follow file naming convention: PascalCase.tsx

Example:
```typescript
"use client";

import { useState } from 'react';

const ComponentName: React.FC<Props> = () => {
  const [state, setState] = useState(initialState);
  // ...
};

export default ComponentName;
```

### CSS/Styling

- Use Tailwind CSS for styling
- Custom styles should be added to the appropriate CSS files in `/src/styles`
- For complex components, consider using CSS modules
- Follow the dark mode pattern for all UI components:
  ```jsx
  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    {/* Component content */}
  </div>
  ```

### State Management

- Use React hooks for local state management
- Consider React Context for shared state that doesn't need to be global
- Document state structure in component comments

## Theming

Guitar Mentor uses a dark/light theme system based on Tailwind CSS 4 and next-themes.

### Implementation Details

1. **Tailwind Configuration**
   - Dark mode is configured in `tailwind.config.js` using the `class` strategy
   - All components use conditional dark mode classes: `dark:bg-gray-800`

2. **Theme Provider**
   - The `ThemeProvider` from next-themes is configured in `src/app/layout.tsx`
   - Options include system theme detection and theme persistence

3. **Theme Toggle**
   - The theme toggle component is located at `src/components/ThemeToggle.tsx`
   - Uses React hooks to manage theme state and handle hydration

4. **CSS Variables**
   - Global theme variables are defined in `src/styles/globals.css`
   - Provides consistent color theming across components

### Adding Theme Support to New Components

When creating new components, follow these guidelines:

1. Use Tailwind's dark mode classes for all themed elements:
   ```jsx
   <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
   ```

2. For custom CSS, use CSS variables defined in globals.css:
   ```css
   .custom-element {
     background-color: rgb(var(--card-background-rgb));
     color: rgb(var(--foreground-rgb));
   }
   ```

3. Test components in both light and dark modes before committing

## Building New Features

When adding a new feature to Guitar Mentor, follow these steps:

1. **Planning**
   - Define the feature requirements
   - Create sketches or wireframes
   - Identify necessary components and data structures

2. **Implementation**
   - Create new components in `/src/components`
   - Add new pages in `/src/app` if needed
   - Implement the feature with appropriate tests

3. **Documentation**
   - Update relevant documentation in `/docs`
   - Add comments to explain complex logic
   - Update this guide if new patterns are introduced

## Testing

- Add unit tests for utility functions
- Add component tests for complex components
- Run tests before submitting pull requests:
  ```bash
  npm test
  ```

## Deployment

The application is deployed using Vercel, which is automatically triggered when changes are pushed to the main branch.

For manual deployment:
```bash
npm run build
npm start
```

## Development Roadmap

### Phase 1: Core Features (Completed)
- ✅ Fretboard Navigator
- ✅ Scale Explorer
- ✅ CAGED System
- ✅ Chord Progressions
- ✅ Jam Assistant
- ✅ Navigation

### Phase 2: Enhanced Functionality (In Progress)
- ⬜ Audio playback for scales and progressions
- ⬜ User accounts and progress tracking
- ⬜ Mobile optimizations
- ⬜ Expanded chord and scale library

### Phase 3: Advanced Features (Planned)
- ⬜ Audio input recognition
- ⬜ Custom practice routines
- ⬜ Community sharing of progressions
- ⬜ AI-powered suggestions and feedback

## Troubleshooting Common Issues

### Type Errors

If you encounter TypeScript errors related to missing types:
1. Check that you've imported the correct types
2. Ensure proper type declarations in the `/src/types` directory
3. Run `npm install --save-dev @types/package-name` if third-party types are missing

### Styling Issues

For styling problems:
1. Check Tailwind class names for typos
2. Ensure the appropriate CSS is imported
3. Check browser compatibility for certain CSS features

### Component Rendering Issues

If components are not rendering as expected:
1. Check that the component is properly exported and imported
2. Verify state management and data flow
3. Add console logs to debug the component lifecycle

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to your fork: `git push origin feature-name`
5. Create a pull request

Please follow the coding conventions and include appropriate documentation with your changes. 