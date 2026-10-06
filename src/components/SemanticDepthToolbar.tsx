import React from 'react';
import { DepthLevel, HighlightMode, Note } from '../types';
import { Sparkles, Sun, Eye, Sliders, Layers } from 'lucide-react';

interface SemanticDepthToolbarProps {
  notes: Note[];
  highlightMode: HighlightMode;
  onSetHighlightMode: (mode: HighlightMode) => void;
  minImportance: number;
  onSetMinImportance: (val: number) => void;
  activeLevels: Set<DepthLevel>;
  onToggleLevel: (level: DepthLevel) => void;
  onAnalyzeAll: () => void;
  isAnalyzingAny: boolean;
}

const LEVEL_DEFINITIONS: Array<{
  level: DepthLevel;
  label: string;
  shortLabel: string;
  dotColor: string;
  activeBadge: string;
}> = [
  {
    level: 1,
    label: 'Axiomes Fondamentaux',
    shortLabel: 'Axiomes (Or)',
    dotColor: 'bg-amber-400 shadow-[0_0_10px_#FBBF24]',
    activeBadge: 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
  },
  {
    level: 2,
    label: 'Piliers Structurants',
    shortLabel: 'Piliers (Émeraude)',
    dotColor: 'bg-emerald-400 shadow-[0_0_10px_#34D399]',
    activeBadge: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
  },
  {
    level: 3,
    label: 'Nuances & Tensions',
    shortLabel: 'Nuances (Iris)',
    dotColor: 'bg-purple-400 shadow-[0_0_10px_#C084FC]',
    activeBadge: 'bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
  },
  {
    level: 4,
    label: 'Preuves & Contexte',
    shortLabel: 'Preuves (Cyan)',
    dotColor: 'bg-cyan-400 shadow-[0_0_10px_#38BDF8]',
    activeBadge: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.35)]',
  },
  {
    level: 5,
    label: 'Actions & Leviers',
    shortLabel: 'Actions (Rose)',
    dotColor: 'bg-rose-400 shadow-[0_0_10px_#FB7185]',
    activeBadge: 'bg-rose-500/25 text-rose-200 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
  },
];

export const SemanticDepthToolbar: React.FC<SemanticDepthToolbarProps> = ({
  notes,
  highlightMode,
  onSetHighlightMode,
  minImportance,
  onSetMinImportance,
  activeLevels,
  onToggleLevel,
  onAnalyzeAll,
  isAnalyzingAny,
}) => {
  const countsByLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalSegments = 0;

  notes.forEach((n) => {
    n.analysis?.segments?.forEach((seg) => {
      countsByLevel[seg.level] = (countsByLevel[seg.level] || 0) + 1;
      totalSegments++;
    });
  });

  return (
    <div className="flex flex-col gap-2.5 p-3 bg-[#111322]/85 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all text-white">
      {/* Top row: Mode selector + Global Analyze button */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
            <Layers size={13} className="text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Lueur Sémantique IA
          </span>
        </div>

        {/* Highlight Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            onClick={() => onSetHighlightMode('aura')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              highlightMode === 'aura'
                ? 'bg-gradient-to-r from-amber-500/40 to-amber-600/30 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Lueur sémantique lumineuse"
          >
            <Sun size={13} className="text-amber-400" />
            <span>Aura</span>
          </button>

          <button
            onClick={() => onSetHighlightMode('xray')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              highlightMode === 'xray'
                ? 'bg-gradient-to-r from-purple-500/40 to-indigo-600/30 text-purple-200 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Atténue le texte secondaire pour faire briller l'essentiel"
          >
            <Eye size={13} className="text-purple-400" />
            <span>Rayon X</span>
          </button>

          <button
            onClick={() => onSetHighlightMode('minimal')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              highlightMode === 'minimal'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-white/50 hover:text-white'
            }`}
            title="Texte brut sans lueur"
          >
            <span>Épuré</span>
          </button>
        </div>

        {/* Master Analyze Button */}
        <button
          onClick={onAnalyzeAll}
          disabled={isAnalyzingAny}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)]"
          title="Illuminer toutes les notes avec l'IA"
        >
          <Sparkles size={13} className={isAnalyzingAny ? 'animate-spin' : ''} />
          <span>{isAnalyzingAny ? 'Distillation...' : 'Illuminer le carnet'}</span>
        </button>
      </div>

      {/* Middle row: Level badges with glowing neon dots */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
        {LEVEL_DEFINITIONS.map((def) => {
          const isActive = activeLevels.has(def.level);
          const count = countsByLevel[def.level] || 0;

          return (
            <button
              key={def.level}
              onClick={() => onToggleLevel(def.level)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-2 ${
                isActive
                  ? def.activeBadge
                  : 'bg-white/5 border-transparent text-white/40 hover:text-white/70'
              }`}
              title={`${def.label} (${count} passages)`}
            >
              <span className={`w-2 h-2 rounded-full ${def.dotColor} ${isActive ? 'opacity-100' : 'opacity-30'}`} />
              <span className="font-medium text-[11.5px]">{def.shortLabel}</span>
              {count > 0 && (
                <span className="text-[10px] font-mono px-1 rounded-sm bg-black/30 text-white/80">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom row: Importance Slider & Glowing Spectrum bar */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 text-xs text-white/70">
        <div className="flex items-center gap-2.5 flex-1">
          <Sliders size={13} className="text-white/40" />
          <span className="text-[11px] text-white/80 shrink-0">
            Filtre d'importance : <span className="font-bold text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]">{minImportance}/10</span>
          </span>
          <input
            type="range"
            min="1"
            max="10"
            value={minImportance}
            onChange={(e) => onSetMinImportance(parseInt(e.target.value, 10))}
            className="w-28 sm:w-36 accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        {/* Glowing cognitive spectrum gauge */}
        {totalSegments > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="text-[10px] uppercase font-semibold tracking-wider mr-1">Spectre :</span>
            <div className="w-32 h-2.5 rounded-full overflow-hidden flex bg-black/40 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.08)]">
              <div
                style={{ width: `${(countsByLevel[1] / totalSegments) * 100}%` }}
                className="bg-amber-400 h-full shadow-[0_0_8px_#FBBF24]"
                title={`Axiomes: ${countsByLevel[1]}`}
              />
              <div
                style={{ width: `${(countsByLevel[2] / totalSegments) * 100}%` }}
                className="bg-emerald-400 h-full shadow-[0_0_8px_#34D399]"
                title={`Piliers: ${countsByLevel[2]}`}
              />
              <div
                style={{ width: `${(countsByLevel[3] / totalSegments) * 100}%` }}
                className="bg-purple-400 h-full shadow-[0_0_8px_#C084FC]"
                title={`Nuances: ${countsByLevel[3]}`}
              />
              <div
                style={{ width: `${(countsByLevel[4] / totalSegments) * 100}%` }}
                className="bg-cyan-400 h-full shadow-[0_0_8px_#38BDF8]"
                title={`Preuves: ${countsByLevel[4]}`}
              />
              <div
                style={{ width: `${(countsByLevel[5] / totalSegments) * 100}%` }}
                className="bg-rose-400 h-full shadow-[0_0_8px_#FB7185]"
                title={`Actions: ${countsByLevel[5]}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
