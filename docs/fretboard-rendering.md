# Fretboard Rendering Logic (NoteDisplayState Pattern)

This document outlines the pattern used for rendering notes and placeholders on the fretboard within the GuitarMentor application. Adhering to this pattern ensures flexibility, maintainability, and clear separation of concerns.

**Core Principle:** The visual appearance of any given fret position is determined by a single, explicit state (`NoteDisplayState`) calculated in the parent component (`FretboardDisplay`) and passed down to the presentation component (`FretboardNote`).

## Key Components

1.  **`FretboardDisplay.tsx`**: 
    *   Manages overall fretboard state (e.g., `displayMode`, `practiceMode`, `quizNote`, `foundPositions`, `scaleNotes`, `cagedShape`, etc.).
    *   Contains the `renderNote` function, which is passed to the `Fretboard` component.
    *   **Responsibility:** The `renderNote` function is the **single source of truth** for calculating the appropriate `NoteDisplayState` for each `position` based on the current application context.
    *   It also decides whether to render a `FretboardNote`, a placeholder (`ClickablePlaceholder`, `NonClickablePlaceholder`), or nothing (`null`).

2.  **`FretboardNote.tsx`**: 
    *   Defines the `NoteDisplayState` enum/type, listing all possible visual states.
    *   Defines the `FretboardNoteProps`, which primarily accept the `note` (string) and `state` (`NoteDisplayState`).
    *   **Responsibility:** Acts as a "dumb" presentation component. Its appearance (background, text color, border, displayed content like '?', note name, finger number) is determined **solely** by the `state` prop it receives.
    *   It uses a `switch` statement on the `state` prop to apply the correct CSS classes and determine the `displayContent`.

3.  **`NoteDisplayState` (Type in `FretboardNote.tsx`)**: 
    *   An exported TypeScript union type (`type NoteDisplayState = ...`).
    *   Acts as the contract between the state calculation logic (`FretboardDisplay`) and the rendering logic (`FretboardNote`).
    *   **Current States (Examples):** `default`, `hidden`, `placeholder_clickable`, `placeholder_non_clickable`, `highlighted`, `root`, `pattern_member`, `quiz_question`, `quiz_reveal`, `quiz_correct`, `target_found`, `caged_finger`, `caged_root`.

4.  **Placeholders (`ClickablePlaceholder`, `NonClickablePlaceholder` in `FretboardDisplay.tsx`)**: 
    *   Simple components returned by `renderNote` when a position should be visually represented but not as a standard note (e.g., empty cells in "Find Note" mode).

## Workflow for Rendering a Position

1.  `FretboardDisplay`'s `renderNote` function is called for a specific `position`.
2.  It calculates the `note` corresponding to that `position`.
3.  It determines the correct `NoteDisplayState` based on `displayMode`, `practiceMode`, and other relevant state variables (`quizNote`, `foundPositions`, `showAnswer`, `quizResult`, `scaleNotes`, `cagedShape`, etc.).
4.  It also determines if a `noteTextOverride` is needed (e.g., for CAGED finger numbers).
5.  Based on the calculated `state`, `renderNote` returns one of:
    *   `null` (if `state` is `hidden`).
    *   `<ClickablePlaceholder />` (if `state` is `placeholder_clickable`).
    *   `<NonClickablePlaceholder />` (if `state` is `placeholder_non_clickable`).
    *   `<FretboardNote note={noteOrOverride} state={state} ... />` for all other relevant states.
6.  If `<FretboardNote />` is rendered, it uses its `state` prop in its internal `switch` statement to apply the correct styling and set the `displayContent`.

## Guidelines for Future Development (Especially for AI Assistants)

*   **Stick to the Pattern:** 
    *   **DO NOT** add complex conditional logic *inside* `FretboardNote.tsx` based on multiple individual props (like `isQuizPosition`, `showAnswer`, `quizResult` combined). All such logic belongs in `FretboardDisplay.tsx`'s `renderNote` function for calculating the single `NoteDisplayState`.
    *   `FretboardNote.tsx` should **ONLY** use the `state` prop (and the `note` prop for text content) to determine its appearance.
*   **Adding New Visual States:**
    1.  Add the new state string literal to the `NoteDisplayState` type definition in `FretboardNote.tsx`.
    2.  Add a corresponding `case` to the `switch` statement within the `FretboardNote` component to define its visual appearance (styles, `displayContent`).
    3.  Modify the logic within the `renderNote` function in `FretboardDisplay.tsx` to correctly calculate and assign this new `NoteDisplayState` when the relevant conditions are met.
*   **Modifying Existing Modes:**
    1.  Identify the section within `FretboardDisplay.tsx`'s `renderNote` function responsible for the relevant `displayMode` or `practiceMode`.
    2.  Adjust the logic there to calculate the desired `NoteDisplayState` based on the required conditions.
    3.  If the visual appearance of an existing state needs changing, modify the corresponding `case` in the `switch` statement within `FretboardNote.tsx`. 