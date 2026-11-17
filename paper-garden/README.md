# Paper Garden 🌼

A soothing, local-first research paper library built with React, Vite, Tailwind CSS, Dexie (IndexedDB), Tiptap, and React Flow.

## Getting started

You need **Node.js 20.19+ or 22.12+** and npm.

```bash
npm install
npm run dev
```

Open the local URL displayed in your terminal (usually http://localhost:5173).

To make a production build:

```bash
npm run build
npm run preview
```

## What works in this starter

- Searchable paper library, grid and list views, filtering by tags and reading status
- Add/edit/delete paper metadata, add manual keywords/tags and attach a PDF
- Browser-native PDF preview
- Rich text notes with headings, bold/italic, lists, and blockquotes
- Five built-in active-recall questions per paper
- Gentle 1-day / 3-day review scheduling and review nook
- Interactive draggable knowledge graph: paper and concept nodes, connect nodes by dragging between handles
- Automatic storage in IndexedDB (Dexie), including PDF blobs
- Portable JSON backup / restore including PDF attachments
- Responsive mobile layout and a low-distraction, pastel theme
- Two **removable demo papers** appear only on the first launch

## Important notes

- This is a **frontend-only starter**. There is no account, cloud sync, authentication, AI integration, DOI metadata lookup, or automatic keyword extraction yet.
- Everything is saved in **this browser for this app origin**. Clearing site data can remove your library. Use the sidebar's **Download backup** regularly.
- Importing a backup merges records by ID. If IDs already exist, matching entries are overwritten. Make a backup first.
- A backup **includes PDF files** encoded in JSON, so backups with many PDFs may become large.
- Graph connections are user-created. Drag from a node's edge handle to the handle on a second node to connect them.
- The built-in sample entries are real named research papers but have no PDF attachments. Their abstract descriptions are short orientation summaries, not supplied source PDFs.

## Folder structure

```
src/
  App.jsx                    # Main layout, library, paper and review pages
  components/
    AddPaperModal.jsx        # Paper import/metadata form
    RichNotes.jsx            # Tiptap editor
    Recall.jsx               # Five questions and review scheduling
    KnowledgeGraph.jsx      # React Flow graph
    Modal.jsx                # Reusable overlay
    Decor.jsx                # Handmade decorative flowers
  lib/
    db.js                    # Dexie database and backup helpers
  styles.css                 # Tailwind + visual design
```

## Roadmap ideas

1. DOI/arXiv metadata import and suggested tags (review before accepting)
2. Link a note paragraph to a figure or page of its attached PDF
3. Add visual reconstruction canvases and connections with explicit relationships
4. Add spaced-repetition presets with reviews tailored to personal capacity
5. Optional sync with a private database or Drive account
6. Optional AI discussion mode with source-grounded questions

**Design intent:** reward understanding, not activity streaks. Quiet progress counts.
