/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Note,
  Connection,
  DepthLevel,
  HighlightMode,
  SemanticSegment,
  AppTheme,
  NoteColor,
} from './types';
import { INITIAL_NOTES, INITIAL_CONNECTIONS } from './data/initialNotes';
import { Canvas } from './components/Canvas';
import { HeaderNav } from './components/HeaderNav';
import { SemanticDepthToolbar } from './components/SemanticDepthToolbar';
import { ThoughtDeepenerModal } from './components/ThoughtDeepenerModal';
import { ZenEditor } from './components/ZenEditor';
import { analyzeNoteDepth } from './services/aiService';

const STORAGE_KEY_NOTES = 'auranote_notes_v1';
const STORAGE_KEY_CONNS = 'auranote_conns_v1';
const STORAGE_KEY_THEME = 'auranote_theme_v1';

export default function App() {
  // 1. Persistent State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        const parsed: Note[] = JSON.parse(saved);
        // Normalize any old colors to new glowing palette
        return parsed.map((n) => {
          let c = n.color;
          if ((c as any) === 'alabaster' || (c as any) === 'clay') c = 'amber';
          else if ((c as any) === 'sage') c = 'cyan';
          else if ((c as any) === 'lavender') c = 'purple';
          else if ((c as any) === 'noir') c = 'obsidian';
          return { ...n, color: c };
        });
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_NOTES;
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONNS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_CONNECTIONS;
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'aurora' || saved === 'sunset' || saved === 'opaline') return saved;
    } catch (e) {
      console.warn(e);
    }
    return 'aurora';
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONNS, JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // 2. Canvas & UI State
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [zenNote, setZenNote] = useState<Note | null>(null);

  // 3. Highlighting Engine State
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('aura');
  const [minImportance, setMinImportance] = useState<number>(1);
  const [activeLevels, setActiveLevels] = useState<Set<DepthLevel>>(
    new Set<DepthLevel>([1, 2, 3, 4, 5])
  );

  // 4. Inspection & AI Deepening State
  const [inspecting, setInspecting] = useState<{
    segment: SemanticSegment;
    note: Note;
  } | null>(null);

  const [analyzingNoteId, setAnalyzingNoteId] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle depth level filter
  const handleToggleLevel = (level: DepthLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  // Update note
  const handleUpdateNote = useCallback((id: string, updated: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updated, updatedAt: Date.now() } : n))
    );
    // Keep zen note in sync if currently open
    setZenNote((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
  }, []);

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.fromId !== id && c.toId !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
    if (zenNote?.id === id) setZenNote(null);
    showToast('Pensée retirée du canvas');
  };

  // Create new note
  const handleCreateNoteAt = (x: number, y: number, initialTitle = '', initialContent = '') => {
    const colors: NoteColor[] = ['amber', 'purple', 'cyan', 'rose', 'emerald'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: initialTitle || 'Nouvelle intuition',
      content: initialContent || '',
      x,
      y,
      width: 440,
      color: randomColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
    showToast('Nouvelle pensée créée');
    return newNote;
  };

  // Connect two notes
  const handleStartConnect = (sourceId: string) => {
    setConnectingSourceId(sourceId);
  };

  const handleCompleteConnect = (targetId: string) => {
    if (!connectingSourceId || connectingSourceId === targetId) return;

    // Check if connection already exists
    const exists = connections.some(
      (c) =>
        (c.fromId === connectingSourceId && c.toId === targetId) ||
        (c.fromId === targetId && c.toId === connectingSourceId)
    );

    if (!exists) {
      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        fromId: connectingSourceId,
        toId: targetId,
        label: 'Résonance d\'idées',
      };
      setConnections((prev) => [...prev, newConn]);
      showToast('Lien sémantique tissé');
    }

    setConnectingSourceId(null);
  };

  const handleCancelConnect = () => {
    setConnectingSourceId(null);
  };

  // Analyze single note with Gemini
  const handleAnalyzeNote = async (noteToAnalyze: Note) => {
    if (!noteToAnalyze.content || noteToAnalyze.content.trim().length === 0) {
      showToast('Écrivez d\'abord du texte dans cette note');
      return;
    }

    setAnalyzingNoteId(noteToAnalyze.id);
    try {
      const analysis = await analyzeNoteDepth(noteToAnalyze.content, noteToAnalyze.title);
      handleUpdateNote(noteToAnalyze.id, { analysis });
      showToast('Profondeur analysée et surlignée');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'analyse');
    } finally {
      setAnalyzingNoteId(null);
    }
  };

  // Analyze all notes
  const handleAnalyzeAll = async () => {
    setIsAnalyzingAll(true);
    showToast('Distillation de toutes les pensées...');
    try {
      for (const note of notes) {
        if (note.content && note.content.trim().length > 10) {
          const analysis = await analyzeNoteDepth(note.content, note.title);
          handleUpdateNote(note.id, { analysis });
        }
      }
      showToast('Carnet illuminé avec succès');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  // Inspect segment popover
  const handleInspectSegment = (
    segment: SemanticSegment,
    _event: React.MouseEvent<HTMLElement>,
    note: Note
  ) => {
    setInspecting({ segment, note });
  };

  // Create linked note from AI reflection
  const handleCreateLinkedNote = (title: string, content: string) => {
    if (!inspecting) return;
    const parentNote = inspecting.note;
    const newNote = handleCreateNoteAt(
      parentNote.x + (parentNote.width || 420) + 80,
      parentNote.y + 40,
      title,
      content
    );

    // Auto connect
    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      fromId: parentNote.id,
      toId: newNote.id,
      label: 'Dérivation d\'essence',
    };
    setConnections((prev) => [...prev, newConn]);
    showToast('Pensée dérivée liée au canvas');
  };

  // Append AI text to current note
  const handleAppendToNote = (textToAppend: string) => {
    if (!inspecting) return;
    const updatedContent = `${inspecting.note.content}\n${textToAppend}`;
    handleUpdateNote(inspecting.note.id, { content: updatedContent });
    showToast('Réflexion ajoutée à la note');
  };

  // Export all notes
  const handleExportAll = () => {
    const fullMarkdown = notes
      .map(
        (n) =>
          `# ${n.title}\n\n*Créé le ${new Date(n.createdAt).toLocaleDateString()} · Densité : ${
            n.analysis?.depthDensity ? `${n.analysis.depthDensity.toFixed(1)}/5` : 'N/A'
          }*\n\n${n.content}\n\n---\n`
      )
      .join('\n\n');

    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraNote_Export_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Carnet complet exporté en Markdown');
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Reset to initial sample notes
  const handleConfirmReset = () => {
    setNotes(INITIAL_NOTES);
    setConnections(INITIAL_CONNECTIONS);
    setShowResetConfirm(false);
    showToast('Carnet restauré avec les réflexions philosophiques');
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col font-sans bg-[#080911] text-white select-none">
      {/* Editorial Top Navigation */}
      <HeaderNav
        noteCount={notes.length}
        connectionCount={connections.length}
        theme={theme}
        onSetTheme={setTheme}
        onNewNote={() => handleCreateNoteAt(180, 180)}
        onExportAll={handleExportAll}
        onResetSamples={() => setShowResetConfirm(true)}
      />

      {/* Main Canvas Viewport */}
      <main className="relative flex-1 overflow-hidden">
        <Canvas
          notes={notes}
          connections={connections}
          selectedNoteId={selectedNoteId}
          connectingSourceId={connectingSourceId}
          highlightMode={highlightMode}
          minImportance={minImportance}
          activeLevels={activeLevels}
          analyzingNoteId={analyzingNoteId}
          onSelectNote={setSelectedNoteId}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onOpenZen={(n) => setZenNote(n)}
          onStartConnect={handleStartConnect}
          onCompleteConnect={handleCompleteConnect}
          onCancelConnect={handleCancelConnect}
          onAnalyzeNote={handleAnalyzeNote}
          onInspectSegment={handleInspectSegment}
          onCreateNoteAt={(x, y) => handleCreateNoteAt(x, y)}
          theme={theme}
        />

        {/* Master Floating Semantic Depth Controller (Top center / floating dock) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto">
          <SemanticDepthToolbar
            notes={notes}
            highlightMode={highlightMode}
            onSetHighlightMode={setHighlightMode}
            minImportance={minImportance}
            onSetMinImportance={setMinImportance}
            activeLevels={activeLevels}
            onToggleLevel={handleToggleLevel}
            onAnalyzeAll={handleAnalyzeAll}
            isAnalyzingAny={isAnalyzingAll}
          />
        </div>
      </main>

      {/* Thought Deepener Modal */}
      {inspecting && (
        <ThoughtDeepenerModal
          segment={inspecting.segment}
          noteTitle={inspecting.note.title}
          noteContent={inspecting.note.content}
          onClose={() => setInspecting(null)}
          onCreateLinkedNote={handleCreateLinkedNote}
          onAppendToNote={handleAppendToNote}
        />
      )}

      {/* Zen Fullscreen Editor */}
      {zenNote && (
        <ZenEditor
          note={zenNote}
          highlightMode={highlightMode}
          onSetHighlightMode={setHighlightMode}
          minImportance={minImportance}
          onSetMinImportance={setMinImportance}
          activeLevels={activeLevels}
          onClose={() => setZenNote(null)}
          onUpdate={(updated) => handleUpdateNote(zenNote.id, updated)}
          onAnalyze={() => handleAnalyzeNote(zenNote)}
          isAnalyzing={analyzingNoteId === zenNote.id}
          onInspectSegment={(seg, e) => handleInspectSegment(seg, e, zenNote)}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#12131F]/95 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-6 space-y-4 text-white">
            <h3 className="font-serif text-lg font-bold text-white drop-shadow-xs">
              Restaurer les réflexions exemples ?
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Cette action remplacera les notes actuelles par les 3 méditations illuminées originales.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
              >
                Restaurer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#141525]/90 border border-white/20 text-white text-xs font-semibold rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          ✦ {toastMessage}
        </div>
      )}
    </div>
  );
}
