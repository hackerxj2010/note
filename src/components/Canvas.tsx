import React, { useRef, useState, useCallback } from 'react';
import { Note, Connection, DepthLevel, HighlightMode, SemanticSegment, AppTheme } from '../types';
import { NoteCard } from './NoteCard';
import { Plus, Maximize, RotateCcw } from 'lucide-react';

interface CanvasProps {
  notes: Note[];
  connections: Connection[];
  selectedNoteId: string | null;
  connectingSourceId: string | null;
  highlightMode: HighlightMode;
  minImportance: number;
  activeLevels: Set<DepthLevel>;
  analyzingNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onUpdateNote: (id: string, updated: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onOpenZen: (note: Note) => void;
  onStartConnect: (noteId: string) => void;
  onCompleteConnect: (targetNoteId: string) => void;
  onCancelConnect: () => void;
  onAnalyzeNote: (note: Note) => void;
  onInspectSegment: (segment: SemanticSegment, event: React.MouseEvent<HTMLElement>, note: Note) => void;
  onCreateNoteAt: (x: number, y: number) => void;
  theme: AppTheme;
}

export const Canvas: React.FC<CanvasProps> = ({
  notes,
  connections,
  selectedNoteId,
  connectingSourceId,
  highlightMode,
  minImportance,
  activeLevels,
  analyzingNoteId,
  onSelectNote,
  onUpdateNote,
  onDeleteNote,
  onOpenZen,
  onStartConnect,
  onCompleteConnect,
  onCancelConnect,
  onAnalyzeNote,
  onInspectSegment,
  onCreateNoteAt,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 60, y: 60 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging single card
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-board') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNote(null);
      if (connectingSourceId) onCancelConnect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingCardId) {
      const activeNote = notes.find((n) => n.id === draggingCardId);
      if (!activeNote) return;

      const newX = (e.clientX - pan.x) / scale - cardDragOffset.x;
      const newY = (e.clientY - pan.y) / scale - cardDragOffset.y;

      onUpdateNote(draggingCardId, {
        x: Math.round(newX),
        y: Math.round(newY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCardId(null);
  };

  // Zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const clampedScale = Math.min(Math.max(newScale, 0.4), 1.8);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - pan.x) * (clampedScale / scale);
      const newPanY = mouseY - (mouseY - pan.y) * (clampedScale / scale);

      setScale(clampedScale);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  // Double click creates note
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-board') {
      const clickX = (e.clientX - pan.x) / scale;
      const clickY = (e.clientY - pan.y) / scale;
      onCreateNoteAt(Math.round(clickX - 220), Math.round(clickY - 60));
    }
  };

  // Card dragging
  const handleCardDragStart = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNote(note.id);

    const mouseCanvasX = (e.clientX - pan.x) / scale;
    const mouseCanvasY = (e.clientY - pan.y) / scale;

    setDraggingCardId(note.id);
    setCardDragOffset({
      x: mouseCanvasX - note.x,
      y: mouseCanvasY - note.y,
    });
  };

  const handleNoteSelect = (noteId: string) => {
    if (connectingSourceId) {
      if (connectingSourceId !== noteId) {
        onCompleteConnect(noteId);
      } else {
        onCancelConnect();
      }
      return;
    }
    onSelectNote(noteId);
  };

  const fitView = useCallback(() => {
    if (notes.length === 0) return;
    const minX = Math.min(...notes.map((n) => n.x));
    const maxX = Math.max(...notes.map((n) => n.x + (n.width || 440)));
    const minY = Math.min(...notes.map((n) => n.y));
    const maxY = Math.max(...notes.map((n) => n.y + 350));

    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const contentWidth = maxX - minX + 220;
      const contentHeight = maxY - minY + 220;

      const scaleX = width / contentWidth;
      const scaleY = height / contentHeight;
      const targetScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 1.1);

      setScale(targetScale);
      setPan({
        x: (width - (maxX + minX) * targetScale) / 2,
        y: (height - (maxY + minY) * targetScale) / 2,
      });
    }
  }, [notes]);

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 80, y: 80 });
  };

  // Glowing laser connections
  const renderConnections = () => {
    return connections.map((conn) => {
      const fromNote = notes.find((n) => n.id === conn.fromId);
      const toNote = notes.find((n) => n.id === conn.toId);

      if (!fromNote || !toNote) return null;

      const fromW = fromNote.width || 440;
      const toW = toNote.width || 440;

      const fromCenter = { x: fromNote.x + fromW / 2, y: fromNote.y + 130 };
      const toCenter = { x: toNote.x + toW / 2, y: toNote.y + 130 };

      let startX = fromCenter.x;
      let startY = fromCenter.y;
      let endX = toCenter.x;
      let endY = toCenter.y;

      if (fromNote.x + fromW < toNote.x) {
        startX = fromNote.x + fromW;
        endX = toNote.x;
      } else if (toNote.x + toW < fromNote.x) {
        startX = fromNote.x;
        endX = toNote.x + toW;
      } else {
        startY = fromNote.y + 180;
        endY = toNote.y;
      }

      const dx = Math.abs(endX - startX) * 0.5;
      const cp1x = startX + (endX > startX ? dx : -dx);
      const cp1y = startY;
      const cp2x = endX - (endX > startX ? dx : -dx);
      const cp2y = endY;

      const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      return (
        <g key={conn.id} className="transition-opacity duration-300">
          <defs>
            <linearGradient id={`laser-${conn.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${conn.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background glowing halo path */}
          <path
            d={pathData}
            fill="none"
            stroke={`url(#laser-${conn.id})`}
            strokeWidth="5"
            strokeOpacity="0.3"
            filter={`url(#glow-${conn.id})`}
          />

          {/* Crisp foreground laser line with pulsing dash */}
          <path
            d={pathData}
            fill="none"
            stroke={`url(#laser-${conn.id})`}
            strokeWidth="2"
            strokeDasharray="6 6"
            className="pulse-filament"
          />

          {/* Anchor glowing dots */}
          <circle cx={startX} cy={startY} r="4" fill="#F59E0B" filter={`url(#glow-${conn.id})`} />
          <circle cx={endX} cy={endY} r="4" fill="#06B6D4" filter={`url(#glow-${conn.id})`} />

          {/* Midpoint Label Badge */}
          {conn.label && (
            <g transform={`translate(${midX}, ${midY})`}>
              <rect
                x="-70"
                y="-13"
                width="140"
                height="22"
                rx="11"
                fill="#181324"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                filter={`url(#glow-${conn.id})`}
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                className="text-[11px] font-sans font-medium fill-white/90 select-none pointer-events-none drop-shadow-xs"
              >
                ✦ {conn.label}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  // Canvas Themes
  const getThemeBackground = () => {
    switch (theme) {
      case 'sunset':
        return 'bg-[#0E0712]';
      case 'opaline':
        return 'bg-[#101420]';
      case 'aurora':
      default:
        return 'bg-[#080911]';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full overflow-hidden select-none cursor-default ${getThemeBackground()} transition-colors duration-700`}
    >
      {/* Radiant Ambient Aurora Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === 'aurora' && (
          <>
            <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-cyan-600/20 blur-[140px] animate-aurora-1" />
            <div className="absolute top-[20%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-purple-600/25 blur-[150px] animate-aurora-2" />
            <div className="absolute -bottom-[15%] left-[25%] w-[60vw] h-[60vw] rounded-full bg-amber-500/18 blur-[160px] animate-aurora-3" />
          </>
        )}
        {theme === 'sunset' && (
          <>
            <div className="absolute -top-[10%] left-[10%] w-[55vw] h-[55vw] rounded-full bg-rose-600/22 blur-[140px] animate-aurora-1" />
            <div className="absolute top-[30%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-amber-500/22 blur-[150px] animate-aurora-2" />
            <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-700/25 blur-[160px] animate-aurora-3" />
          </>
        )}
        {theme === 'opaline' && (
          <>
            <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/18 blur-[140px] animate-aurora-1" />
            <div className="absolute top-[25%] right-[0%] w-[50vw] h-[50vw] rounded-full bg-sky-500/20 blur-[150px] animate-aurora-2" />
            <div className="absolute -bottom-[15%] left-[30%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/20 blur-[160px] animate-aurora-3" />
          </>
        )}

        {/* Delicate starlight shimmer pattern */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Infinite Canvas Container */}
      <div
        id="canvas-board"
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: '8000px',
          height: '8000px',
        }}
      >
        {/* SVG Glowing Bezier connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {renderConnections()}
        </svg>

        {/* Note Cards */}
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            isConnectingSource={connectingSourceId === note.id}
            highlightMode={highlightMode}
            minImportance={minImportance}
            activeLevels={activeLevels}
            onSelect={() => handleNoteSelect(note.id)}
            onUpdate={(updated) => onUpdateNote(note.id, updated)}
            onDelete={() => onDeleteNote(note.id)}
            onOpenZen={() => onOpenZen(note)}
            onStartConnect={() => onStartConnect(note.id)}
            onAnalyze={() => onAnalyzeNote(note)}
            isAnalyzing={analyzingNoteId === note.id}
            onInspectSegment={(seg, e) => onInspectSegment(seg, e, note)}
            onDragStart={(e) => handleCardDragStart(note, e)}
          />
        ))}
      </div>

      {/* Floating Canvas Dock (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 p-2 bg-[#121420]/80 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => onCreateNoteAt((-pan.x + 320) / scale, (-pan.y + 220) / scale)}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all"
          title="Ajouter une note au centre"
        >
          <Plus size={15} />
          <span>Nouvelle note</span>
        </button>

        <div className="w-[1px] h-5 bg-white/15 mx-1" />

        <button
          onClick={fitView}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Ajuster la vue à toutes les notes"
        >
          <Maximize size={15} />
        </button>

        <button
          onClick={resetZoom}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all font-mono text-xs"
          title="Réinitialiser l'échelle (100%)"
        >
          <RotateCcw size={14} />
        </button>

        <span className="text-[11px] font-mono font-medium text-white/60 px-1 select-none">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Connecting banner helper */}
      {connectingSourceId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-xs font-semibold shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-3 animate-pulse">
          <span>✦ Cliquez sur une autre note pour tisser un filament d'idées</span>
          <button
            onClick={onCancelConnect}
            className="underline ml-2 hover:opacity-80"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};
