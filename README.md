# Image Pair Annotation Viewer – Component Architecture

**Note: This documentation needs updating**

This document describes the structure and responsibilities of the Svelte components that make up the image pair annotation viewer. It is intended both as documentation of the current design and as a starting point for future development.

The **entry point** for the system is `ProjectView`.

---

## Overview

The application is a **viewer-centric, session-based annotation system** built around:

- A single shared **session object** that owns state and operations
- A viewer shell that composes the image viewer, overlays, and tools
- A side panel that manages annotation inspection and input
- Clear separation between **view state**, **annotation state**, and **UI**

The architecture is intentionally modular, allowing new tools, annotation types, or persistence mechanisms to be added with minimal disruption.

---

## Top-level Entry: `ProjectView`

**Role:**  
Application entry point and composition root.

**Responsibilities:**

- Creates the image pair session via `createImagePairSession`
- Owns the lifetime of the session
- Passes the session object to all child components
- Defines the high-level layout (viewer vs side panel)

**Design note:**  
`ProjectView` does not manage annotations or view state directly. All stateful behaviour is delegated to the session object, making this component a natural place to later add session loading, saving, or multi-document support.

---

## Shared State Layer: `imagePairSession.js`

**Role:**  
Central state container and API for the viewer session.

### Stores

- `annotations` – array of annotation objects
- `selectedId` – ID of the currently selected annotation
- `viewState` – zoom, pan, overlay opacity
- `meta` – session-level metadata (non-document data)

### Operations

- Add, update, and remove annotations
- Select an annotation
- Serialize the session state

**Design significance:**

- All mutation flows through a single API
- UI components remain thin and declarative
- Enables future features such as persistence, undo/redo, or collaboration

This module is the conceptual heart of the system.

---

## Viewer Composition: `ViewerShell.svelte`

**Role:**  
Structural container for the interactive viewer.

**Responsibilities:**

- Hosts the image viewer
- Hosts annotation overlay layers
- Hosts the toolbar
- Distributes the session object to its children

**Children:**

- `OpenSeaDragonViewer`
- `AnnotationLayer`
- `Toolbar`

The shell provides a stable frame so that tools and overlays can evolve independently of layout concerns.

---

## Image Viewing: `OpenSeaDragonViewer.svelte`

**Role:**  
Deep-zoom image rendering and navigation.

**Responsibilities:**

- Render one or more high-resolution images
- Handle pan and zoom interactions
- Synchronise view changes into `viewState`
- Apply overlay opacity

**Design note:**  
This component is annotation-agnostic. It is concerned only with image rendering and navigation, making it replaceable or reusable in other contexts.

---

## Annotation Rendering: `AnnotationLayer.svelte`

**Role:**  
Visual overlay for annotations.

**Responsibilities:**

- Subscribe to `annotations` and `selectedId`
- Render annotation markers or shapes
- Handle interaction (click, hover, selection)
- Dispatch annotation updates back to the session

This component bridges abstract annotation data with spatial representation over the image.

---

## Side Panel System

### `SidePanel.svelte`

**Role:**  
Docked container for annotation-related UI.

**Responsibilities:**

- Layout and positioning of side-panel tools
- Hosts annotation management and input components

---

### `AnnotationPanel.svelte`

**Role:**  
Annotation-focused control panel.

**Responsibilities:**

- Coordinate annotation-related UI
- Provide selection-aware controls
- Act as glue between the list, editor, and session API

---

### `AnnotationsList.svelte`

**Role:**  
List view of all annotations in the session.

**Responsibilities:**

- Render annotation summaries
- Reflect selection state
- Dispatch selection and removal actions

---

### `AnnotationItem.svelte`

**Role:**  
Single annotation list entry.

**Responsibilities:**

- Display annotation metadata
- Handle selection
- Provide inline actions (e.g. delete)

This component is intentionally small and reusable.

---

## Input Tooling: `SpeechToText.svelte`

**Role:**  
Alternative annotation input mechanism.

**Responsibilities:**

- Capture speech input
- Convert speech to text
- Create or update annotations via the session API

**Architectural note:**  
This demonstrates that annotations are input-agnostic. Additional input methods (AI-assisted suggestions, handwriting, imports) can be added without modifying the viewer or list components.

---

## Toolbar: `Toolbar.svelte`

**Role:**  
Viewer-level controls.

**Responsibilities:**

- Adjust zoom and pan
- Control overlay opacity
- Provide viewer-mode actions

**Design note:**  
The toolbar manipulates **view state**, not annotation or document state. This distinction supports future read-only modes or per-user view preferences.

---

## Data Flow Summary

```text
ProjectView
└─ createImagePairSession
├─ annotations
├─ selectedId
├─ viewState
└─ actions

ViewerShell
├─ OpenSeaDragonViewer ← viewState
├─ AnnotationLayer ← annotations + selectedId
└─ Toolbar ← viewState controls

SidePanel
├─ AnnotationPanel
│ ├─ AnnotationsList
│ │ └─ AnnotationItem
│ └─ SpeechToText
```

All state changes flow through the session API. Components never mutate shared state directly.

---

## Why This Structure Works Well

- Single source of truth for session state
- Low coupling between UI components
- Clear separation of concerns
- Well-defined extension points for future features

---

## Potential Future Extensions

- Persist session state locally or to a backend
- Undo/redo at the session level
- Multiple annotation layers or types
- Collaboration via shared session syncing
- Annotation schemas and validation

---

## TODOs

- Moving an annotation and then saving project does not update the file
- Additional points made to a polygon are not being saved
- Deleted annotations from the annotationslist are not reflected in the annotation view panel
- Add dirty-state tracking to SaveProjectButton (indicate when there are changes to be made)
- Add autosave (FS API only)
- Key toggle for Title field audio annotation if annotation item selected
- Key toggle for Decription field audio annotation if annotation item selected
- Make selected Annotation more obvious in the Viewer

## Known issues

- Trackpad users can use fade slider to adjust opacity (SHIFT down with trackpad does not work like a mouse wheel)
