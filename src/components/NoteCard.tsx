import React, { useState, useRef, useEffect } from 'react';
import { Note, DepthLevel, HighlightMode, SemanticSegment, NoteColor } from '../types';
import { SemanticHighlighter } from './SemanticHighlighter';
import {
  Sparkles,
  Maximize2,
  Trash2,
  Link2,
  Edit3,
  Check,
  Palette,
  GripHorizontal,
  Flame,
  Clock,
} from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  isConnectingSource: boolean;
  highlightMode: HighlightMode;
  minImportance: number;
  activeLevels: Set<DepthLevel>;
  onSelect: () => void;
  onUpdate: (updated: Partial<Note>) => void;
  onDelete: () => void;
  onOpenZen: () => void;
  onStartConnect: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onInspectSegment: (segment: SemanticSegment, event: React.MouseEvent<HTMLElement>) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

const COLOR_GLOW_THEMES: Record<
  NoteColor,
  {
    bg: string;
    border: string;
    glow: string;
    headerGrad: string;
    accentBadge: string;
    dotColor: string;
  }
> = {
  amber: {
    bg: 'bg-[#181512]/85 dark:bg-[#14110E]/90',
    border: 'border-amber-500/35 hover:border-amber-400/60',
    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.22)]',
    headerGrad: 'from-amber-500/20 via-amber-500/5 to-transparent',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    dotColor: 'bg-amber-400',
  },
  purple: {
    bg: 'bg-[#181324]/85 dark:bg-[#140F20]/90',
    border: 'border-purple-500/35 hover:border-purple-400/60',
    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.22)]',
    headerGrad: 'from-purple-500/20 via-purple-500/5 to-transparent',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    dotColor: 'bg-purple-400',
  },
  cyan: {
    bg: 'bg-[#101924]/85 dark:bg-[#0C1520]/90',
    border: 'border-cyan-500/35 hover:border-cyan-400/60',
    glow: 'shadow-[0_0_35px_rgba(6,182,212,0.22)]',
    headerGrad: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    dotColor: 'bg-cyan-400',
  },
  rose: {
    bg: 'bg-[#221319]/85 dark:bg-[#1C0D14]/90',
    border: 'border-rose-500/35 hover:border-rose-400/60',
    glow: 'shadow-[0_0_35px_rgba(244,63,94,0.22)]',
    headerGrad: 'from-rose-500/20 via-rose-500/5 to-transparent',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    dotColor: 'bg-rose-400',
  },
  emerald: {
    bg: 'bg-[#111F18]/85 dark:bg-[#0D1812]/90',
    border: 'border-emerald-500/35 hover:border-emerald-400/60',
    glow: 'shadow-[0_0_35px_rgba(16,185,129,0.22)]',
    headerGrad: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    dotColor: 'bg-emerald-400',
  },
  obsidian: {
    bg: 'bg-[#14151C]/90 dark:bg-[#0E0F14]/95',
    border: 'border-indigo-500/30 hover:border-indigo-400/50',
    glow: 'shadow-[0_0_35px_rgba(99,102,241,0.2)]',
    headerGrad: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    accentBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.25)]',
    dotColor: 'bg-indigo-400',
  },
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  isConnectingSource,
  highlightMode,
  minImportance,
  activeLevels,
  onSelect,
  onUpdate,
  onDelete,
  onOpenZen,
  onStartConnect,
  onAnalyze,
  isAnalyzing,
  onInspectSegment,
  onDragStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.title, note.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({ title, content, updatedAt: Date.now() });
    setIsEditing(false);
  };

  const themeConfig = COLOR_GLOW_THEMES[note.color] || COLOR_GLOW_THEMES.amber;
  const segmentCount = note.analysis?.segments?.length || 0;
  const depthDensity = note.analysis?.depthDensity ? note.analysis.depthDensity.toFixed(1) : null;

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute select-none rounded-2xl backdrop-blur-2xl border transition-all duration-300 ${
        themeConfig.bg
      } ${themeConfig.border} ${themeConfig.glow} ${
        isSelected
          ? 'ring-2 ring-white/60 shadow-[0_0_50px_rgba(255,255,255,0.25)] scale-[1.01]'
          : 'hover:scale-[1.008] hover:shadow-[0_0_45px_rgba(255,255,255,0.12)]'
      } ${isConnectingSource ? 'ring-2 ring-amber-400 animate-pulse shadow-[0_0_40px_rgba(251,191,36,0.6)]' : ''}`}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
        width: note.width || 440,
        zIndex: isSelected ? 30 : 10,
      }}
    >
      {/* Top subtle chromatic glow gradient bar */}
      <div className={`h-1.5 w-full bg-linear-to-r ${themeConfig.headerGrad} rounded-t-2xl`} />

      {/* Header bar / drag handle */}
      <div
        onMouseDown={onDragStart}
        className="px-5 py-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/10"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
          <GripHorizontal size={14} className="text-white/40 shrink-0 hover:text-white/80 transition-colors" />
          <span className={`w-2 h-2 rounded-full ${themeConfig.dotColor} shadow-[0_0_8px_currentColor] shrink-0`} />
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la pensée..."
              className="w-full bg-transparent font-serif text-base font-bold focus:outline-hidden text-white drop-shadow-xs"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className="font-serif text-[17px] font-semibold truncate tracking-tight text-white/95 drop-shadow-xs cursor-text"
              title="Double-cliquez pour renommer"
            >
              {note.title || 'Sans titre'}
            </h3>
          )}
        </div>

        {/* Action icons with glowing hover */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Analyze AI Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            title="Analyser la profondeur avec l'IA"
            className="p-1.5 text-amber-300 hover:text-amber-200 rounded-lg hover:bg-amber-500/20 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            <Sparkles size={14} className={isAnalyzing ? 'animate-spin text-amber-300' : 'text-amber-400'} />
          </button>

          {/* Connect button */}
          <button
            onClick={onStartConnect}
            title="Tisser un lien vers une autre note"
            className={`p-1.5 rounded-lg transition-all ${
              isConnectingSource
                ? 'bg-amber-400 text-stone-900 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Link2 size={14} />
          </button>

          {/* Edit / Save toggle */}
          {isEditing ? (
            <button
              onClick={handleSave}
              title="Valider les modifications"
              className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            >
              <Check size={14} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              title="Modifier le texte"
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit3 size={14} />
            </button>
          )}

          {/* Zen View */}
          <button
            onClick={onOpenZen}
            title="Ouvrir en Studio Zen immersif"
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Maximize2 size={14} />
          </button>

          {/* Color dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Changer l'aura lumineuse"
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Palette size={14} />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 p-2 bg-stone-900/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl flex gap-1.5 z-50">
                {(['amber', 'purple', 'cyan', 'rose', 'emerald', 'obsidian'] as NoteColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate({ color: c });
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border border-white/30 ${
                      COLOR_GLOW_THEMES[c].dotColor
                    } hover:scale-125 transition-transform shadow-[0_0_12px_currentColor]`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Effacer cette note"
            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div className="p-5 space-y-4">
        {/* Core Essence Quote if analyzed */}
        {note.analysis?.coreEssence && !isEditing && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs italic font-serif text-white/90 flex items-start gap-2 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
            <span className="text-amber-400 font-bold text-sm shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
              ✦
            </span>
            <span className="leading-relaxed">{note.analysis.coreEssence}</span>
          </div>
        )}

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Écrivez vos pensées ici..."
            className="w-full bg-transparent font-serif text-[16.5px] leading-relaxed focus:outline-hidden resize-none min-h-[130px] text-white/95 placeholder-white/30"
            onClick={(e) => e.stopPropagation()}
            onBlur={handleSave}
          />
        ) : (
          <div onDoubleClick={() => setIsEditing(true)}>
            <SemanticHighlighter
              content={note.content}
              segments={note.analysis?.segments}
              mode={highlightMode}
              minImportance={minImportance}
              activeLevels={activeLevels}
              onInspectSegment={onInspectSegment}
            />
          </div>
        )}
      </div>

      {/* Card footer: depth indicator & metadata */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 bg-black/20 rounded-b-2xl">
        <div className="flex items-center gap-2">
          {depthDensity ? (
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium flex items-center gap-1.5 ${themeConfig.accentBadge}`}>
              <Flame size={12} className="text-current" />
              <span>Densité {depthDensity}/5</span>
            </span>
          ) : (
            <span className="italic text-[11px] text-white/40">Non analysée</span>
          )}

          {segmentCount > 0 && (
            <>
              <span className="text-white/30">·</span>
              <span className="text-white/70 text-[11px] font-medium">{segmentCount} éclats de lumière</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
          <Clock size={11} />
          <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};
