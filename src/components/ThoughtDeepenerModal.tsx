import React, { useState } from 'react';
import { SemanticSegment, DeepenResponse } from '../types';
import { deepenThought } from '../services/aiService';
import { Sparkles, ArrowRight, Link2, Copy, Check, X, Compass, Feather } from 'lucide-react';

interface ThoughtDeepenerModalProps {
  segment: SemanticSegment | null;
  noteTitle: string;
  noteContent: string;
  onClose: () => void;
  onCreateLinkedNote: (newTitle: string, newContent: string) => void;
  onAppendToNote: (textToAppend: string) => void;
}

export const ThoughtDeepenerModal: React.FC<ThoughtDeepenerModalProps> = ({
  segment,
  noteTitle,
  noteContent,
  onClose,
  onCreateLinkedNote,
  onAppendToNote,
}) => {
  const [activeMode, setActiveMode] = useState<'deepen' | 'counterpoint' | 'metaphor' | 'actionable'>('deepen');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!segment) return null;

  const handleDeepen = async (mode: 'deepen' | 'counterpoint' | 'metaphor' | 'actionable') => {
    setActiveMode(mode);
    setLoading(true);
    setResult(null);
    try {
      const res = await deepenThought(segment.exactText, noteContent, mode);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`${result.title}\n\n${result.content}\n\n« ${result.keyTakeaway} »`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'Axiome Fondamental', color: 'text-amber-300 bg-amber-500/20 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]' };
      case 2:
        return { label: 'Pilier Structurant', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]' };
      case 3:
        return { label: 'Nuance & Tension', color: 'text-purple-300 bg-purple-500/20 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]' };
      case 4:
        return { label: 'Preuve & Contexte', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]' };
      case 5:
        return { label: 'Action & Levier', color: 'text-rose-300 bg-rose-500/20 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]' };
      default:
        return { label: 'Réflexion', color: 'text-white/80 bg-white/10 border-white/20' };
    }
  };

  const badge = getLevelBadge(segment.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#14121E]/95 border border-white/20 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top luminous glow gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color}`}>
                {badge.label}
              </span>
              <span>·</span>
              <span className="text-white/80 font-mono">Importance {segment.importance}/10</span>
              <span>·</span>
              <span className="text-amber-300">{segment.tag}</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>Analyse Sémantique & Éclat Cognitif</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Glowing Quote Block */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-serif italic text-[17px] text-white/95 relative pl-6 leading-relaxed shadow-[0_0_20px_rgba(255,255,255,0.03)]">
            <span className="absolute left-2.5 top-3 w-1 bottom-3 bg-gradient-to-b from-amber-400 to-rose-500 rounded-full shadow-[0_0_8px_#F59E0B]" />
            « {segment.exactText} »
          </div>

          {/* Rationale */}
          <div className="text-xs text-white/80 flex items-start gap-2.5 bg-black/40 border border-white/10 p-3.5 rounded-xl">
            <Compass size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Raison d'être sémantique : </span>
              {segment.rationale}
            </div>
          </div>

          {/* AI Expansion Modes */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={13} className="text-purple-400" />
              <span>Développer cette intuition avec l'IA</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleDeepen('deepen')}
                className={`p-3 rounded-xl text-left transition-all border ${
                  activeMode === 'deepen' && (result || loading)
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-amber-400/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-amber-400 font-bold text-xs">
                  <Sparkles size={13} />
                  <span>Profondeur</span>
                </div>
                <span className="text-[11px] text-white/50 block line-clamp-1">Vérité cachée</span>
              </button>

              <button
                onClick={() => handleDeepen('counterpoint')}
                className={`p-3 rounded-xl text-left transition-all border ${
                  activeMode === 'counterpoint' && (result || loading)
                    ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-purple-400/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-purple-400 font-bold text-xs">
                  <Feather size={13} />
                  <span>Contrepoint</span>
                </div>
                <span className="text-[11px] text-white/50 block line-clamp-1">Angle dialectique</span>
              </button>

              <button
                onClick={() => handleDeepen('metaphor')}
                className={`p-3 rounded-xl text-left transition-all border ${
                  activeMode === 'metaphor' && (result || loading)
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-cyan-400 font-bold text-xs">
                  <Sparkles size={13} />
                  <span>Métaphore</span>
                </div>
                <span className="text-[11px] text-white/50 block line-clamp-1">Image poétique</span>
              </button>

              <button
                onClick={() => handleDeepen('actionable')}
                className={`p-3 rounded-xl text-left transition-all border ${
                  activeMode === 'actionable' && (result || loading)
                    ? 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-rose-400/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-rose-400 font-bold text-xs">
                  <ArrowRight size={13} />
                  <span>Action</span>
                </div>
                <span className="text-[11px] text-white/50 block line-clamp-1">Principe opératoire</span>
              </button>
            </div>
          </div>

          {/* AI Result Card */}
          {loading && (
            <div className="py-8 text-center text-xs text-white/70 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_#F59E0B]" />
              <span className="animate-pulse">L'intelligence artificielle distille la pensée...</span>
            </div>
          )}

          {result && !loading && (
            <div className="p-5 rounded-2xl border border-white/20 bg-black/50 space-y-3.5 shadow-[0_0_30px_rgba(255,255,255,0.05)] animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-lg text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                  {result.title}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-white/60 hover:text-white transition-colors"
                  title="Copier"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
              </div>

              <p className="font-serif text-[16px] leading-relaxed text-white/90">
                {result.content}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-amber-300 font-medium italic">
                <span>« {result.keyTakeaway} »</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    onCreateLinkedNote(
                      result.title,
                      `${result.content}\n\n« ${result.keyTakeaway} »\n\n*(Né de la résonance avec : « ${segment.exactText.slice(0, 50)}... »)*`
                    );
                    onClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                >
                  <Link2 size={14} />
                  <span>Créer une note liée sur le canvas</span>
                </button>

                <button
                  onClick={() => {
                    onAppendToNote(`\n\n### ${result.title}\n${result.content}\n*« ${result.keyTakeaway} »*`);
                    onClose();
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <span>Ajouter à cette note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
