import React, { useState, useRef, useEffect } from 'react';
import { Note, DepthLevel, HighlightMode, SemanticSegment } from '../types';
import { SemanticHighlighter } from './SemanticHighlighter';
import {
  ArrowLeft,
  Sparkles,
  Sun,
  Eye,
  Flame,
  Copy,
  Check,
  Download,
  BookOpen,
  Edit3,
} from 'lucide-react';

interface ZenEditorProps {
  note: Note;
  highlightMode: HighlightMode;
  onSetHighlightMode: (mode: HighlightMode) => void;
  minImportance: number;
  onSetMinImportance: (val: number) => void;
  activeLevels: Set<DepthLevel>;
  onClose: () => void;
  onUpdate: (updated: Partial<Note>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onInspectSegment: (segment: SemanticSegment, event: React.MouseEvent<HTMLElement>) => void;
}

export const ZenEditor: React.FC<ZenEditorProps> = ({
  note,
  highlightMode,
  onSetHighlightMode,
  minImportance,
  onSetMinImportance,
  activeLevels,
  onClose,
  onUpdate,
  onAnalyze,
  isAnalyzing,
  onInspectSegment,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [viewMode, setViewMode] = useState<'reading' | 'writing'>('reading');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.title, note.content]);

  useEffect(() => {
    if (viewMode === 'writing' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [viewMode]);

  const handleSave = () => {
    onUpdate({ title, content, updatedAt: Date.now() });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`# ${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const segments = note.analysis?.segments || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B14] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Background glowing aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/15 blur-[150px]" />
      </div>

      {/* Zen Header */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0E101D]/80 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="p-2 -ml-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Retour au canvas</span>
          </button>

          <span className="text-white/20">|</span>

          {/* Mode switch */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
            <button
              onClick={() => {
                handleSave();
                setViewMode('reading');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'reading'
                  ? 'bg-gradient-to-r from-amber-500/30 to-purple-600/30 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span>Lecture & Lueur</span>
            </button>
            <button
              onClick={() => setViewMode('writing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'writing'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Edit3 size={13} />
              <span>Édition</span>
            </button>
          </div>
        </div>

        {/* Center: Highlighter style controls */}
        {viewMode === 'reading' && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onSetHighlightMode('aura')}
              className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                highlightMode === 'aura'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Sun size={12} className="text-amber-400" />
              <span>Lueur Aura</span>
            </button>
            <button
              onClick={() => onSetHighlightMode('xray')}
              className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                highlightMode === 'xray'
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)] font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Eye size={12} className="text-purple-400" />
              <span>Rayon X Synthèse</span>
            </button>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Analyze button */}
          <button
            onClick={() => {
              handleSave();
              onAnalyze();
            }}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-110 shadow-[0_0_18px_rgba(244,63,94,0.4)] transition-all"
          >
            <Sparkles size={13} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analyse en cours...' : 'Illuminer avec l\'IA'}</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copier le markdown"
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownload}
            title="Télécharger (.md)"
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-6 py-12 flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                onUpdate({ title: e.target.value });
              }}
              placeholder="Titre de la méditation..."
              className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white focus:outline-hidden placeholder-white/30 drop-shadow-md"
            />

            {/* Glowing Core Essence Callout */}
            {note.analysis?.coreEssence && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-white font-serif italic text-base flex items-start gap-3.5 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <span className="text-amber-400 font-bold text-xl shrink-0 drop-shadow-[0_0_8px_#F59E0B]">✦</span>
                <div className="leading-relaxed">
                  <span className="text-xs uppercase tracking-wider font-sans font-bold text-amber-300 block not-italic mb-1">
                    Essence Sémantique
                  </span>
                  « {note.analysis.coreEssence} »
                </div>
              </div>
            )}

            {/* Body */}
            {viewMode === 'writing' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  onUpdate({ content: e.target.value, updatedAt: Date.now() });
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Laissez couler votre pensée sans filtre..."
                className="w-full bg-transparent font-serif text-lg leading-loose focus:outline-hidden resize-none min-h-[400px] text-white/95 placeholder-white/30"
              />
            ) : (
              <div
                className="pt-2"
                onDoubleClick={() => setViewMode('writing')}
                title="Double-cliquez pour éditer"
              >
                <SemanticHighlighter
                  content={content}
                  segments={note.analysis?.segments}
                  mode={highlightMode}
                  minImportance={minImportance}
                  activeLevels={activeLevels}
                  onInspectSegment={onInspectSegment}
                  className="text-lg leading-loose font-serif"
                />
              </div>
            )}

            <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <div className="flex items-center gap-2">
                <span>{wordCount} mots</span>
                <span>·</span>
                <span>{content.length} caractères</span>
              </div>
              {note.analysis?.depthDensity && (
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                  <Flame size={14} className="text-amber-400" />
                  <span>Densité intellectuelle : {note.analysis.depthDensity.toFixed(1)}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Semantic Margin Radar Drawer (Right) */}
        {segments.length > 0 && (
          <div className="w-80 border-l border-white/10 bg-[#0E101D]/70 backdrop-blur-2xl p-6 overflow-y-auto hidden lg:flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Éclats Détectés ({segments.length})
              </span>
            </div>

            <div className="space-y-3">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  onClick={(e) => onInspectSegment(seg, e)}
                  className="p-3.5 rounded-xl border border-white/15 bg-white/5 hover:border-amber-400/60 hover:bg-white/10 transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5">
                    <span className="font-semibold text-amber-200">
                      {seg.tag}
                    </span>
                    <span className="font-mono text-white/70">Niv. {seg.level}</span>
                  </div>

                  <p className="font-serif italic text-xs text-white/90 line-clamp-2 leading-relaxed">
                    « {seg.exactText} »
                  </p>

                  <div className="mt-2 text-[10px] text-white/50 line-clamp-1">
                    {seg.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
