import React from 'react';
import { AppTheme } from '../types';
import {
  Feather,
  Plus,
  Download,
  Compass,
} from 'lucide-react';

interface HeaderNavProps {
  noteCount: number;
  connectionCount: number;
  theme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
  onNewNote: () => void;
  onExportAll: () => void;
  onResetSamples: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  noteCount,
  connectionCount,
  theme,
  onSetTheme,
  onNewNote,
  onExportAll,
  onResetSamples,
}) => {
  return (
    <header className="h-16 px-6 border-b border-white/10 bg-[#080911]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 z-40 transition-colors">
      {/* Brand & Editorial Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_18px_rgba(244,63,94,0.5)]">
          <Feather size={17} className="drop-shadow-xs" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              AuraNote
            </h1>
            <span className="text-white/30">·</span>
            <span className="text-xs font-serif italic text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              Carnet Luminescent
            </span>
          </div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span>{noteCount} pensées</span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span>{connectionCount} filaments d'idées</span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span className="text-amber-300 font-medium drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              ✦ Surlignage Lueur IA
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Glow Theme Switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
          <button
            onClick={() => onSetTheme('aurora')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              theme === 'aurora'
                ? 'bg-gradient-to-r from-cyan-500/30 to-purple-600/30 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Aurore Boréale (Cyan & Violet Profond)"
          >
            <span>🌌 Aurore</span>
          </button>

          <button
            onClick={() => onSetTheme('sunset')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              theme === 'sunset'
                ? 'bg-gradient-to-r from-rose-500/30 to-amber-600/30 text-rose-200 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Crépuscule Néo-Rose (Rose & Ambre)"
          >
            <span>🌅 Crépuscule</span>
          </button>

          <button
            onClick={() => onSetTheme('opaline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              theme === 'opaline'
                ? 'bg-gradient-to-r from-emerald-500/30 to-sky-600/30 text-emerald-200 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Opaline Céleste (Menthe & Azur)"
          >
            <span>💎 Opaline</span>
          </button>
        </div>

        {/* Export notes */}
        <button
          onClick={onExportAll}
          className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Exporter le carnet en Markdown"
        >
          <Download size={16} />
        </button>

        {/* Reset / Sample thoughts */}
        <button
          onClick={onResetSamples}
          className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Restaurer les réflexions exemples"
        >
          <Compass size={16} />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Primary CTA */}
        <button
          onClick={onNewNote}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(244,63,94,0.45)]"
        >
          <Plus size={15} />
          <span>Écrire une pensée</span>
        </button>
      </div>
    </header>
  );
};
