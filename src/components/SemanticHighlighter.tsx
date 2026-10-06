import React, { useMemo } from 'react';
import { SemanticSegment, DepthLevel, HighlightMode } from '../types';

interface SemanticHighlighterProps {
  content: string;
  segments?: SemanticSegment[];
  mode: HighlightMode;
  minImportance: number;
  activeLevels: Set<DepthLevel>;
  onInspectSegment?: (segment: SemanticSegment, event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
}

interface TextChunk {
  text: string;
  segment?: SemanticSegment;
}

export const SemanticHighlighter: React.FC<SemanticHighlighterProps> = ({
  content,
  segments = [],
  mode,
  minImportance,
  activeLevels,
  onInspectSegment,
  className = '',
}) => {
  const chunks = useMemo(() => {
    if (!segments || segments.length === 0 || mode === 'minimal') {
      return [{ text: content }];
    }

    interface Match {
      start: number;
      end: number;
      segment: SemanticSegment;
    }

    const matches: Match[] = [];

    segments.forEach((seg) => {
      if (!seg.exactText || seg.exactText.trim().length === 0) return;
      let startIdx = 0;
      while ((startIdx = content.indexOf(seg.exactText, startIdx)) !== -1) {
        matches.push({
          start: startIdx,
          end: startIdx + seg.exactText.length,
          segment: seg,
        });
        startIdx += seg.exactText.length;
      }
    });

    if (matches.length === 0) {
      return [{ text: content }];
    }

    // Sort matches
    matches.sort((a, b) => a.start - b.start);

    // Filter overlapping matches
    const validMatches: Match[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        validMatches.push(m);
        lastEnd = m.end;
      }
    }

    const result: TextChunk[] = [];
    let currentIndex = 0;

    validMatches.forEach((m) => {
      if (m.start > currentIndex) {
        result.push({ text: content.slice(currentIndex, m.start) });
      }
      result.push({
        text: content.slice(m.start, m.end),
        segment: m.segment,
      });
      currentIndex = m.end;
    });

    if (currentIndex < content.length) {
      result.push({ text: content.slice(currentIndex) });
    }

    return result;
  }, [content, segments, mode]);

  const getGlowClass = (level: DepthLevel) => {
    switch (level) {
      case 1:
        return 'glow-highlight-1';
      case 2:
        return 'glow-highlight-2';
      case 3:
        return 'glow-highlight-3';
      case 4:
        return 'glow-highlight-4';
      case 5:
        return 'glow-highlight-5';
      default:
        return 'glow-highlight-1';
    }
  };

  const isHighlighted = (segment: SemanticSegment) => {
    return activeLevels.has(segment.level) && segment.importance >= minImportance;
  };

  return (
    <div className={`whitespace-pre-wrap leading-relaxed select-text font-serif text-[16.5px] ${className}`}>
      {chunks.map((chunk, index) => {
        if (!chunk.segment) {
          return (
            <span
              key={index}
              className={`transition-all duration-300 ${
                mode === 'xray'
                  ? 'opacity-25 hover:opacity-85 text-stone-400 dark:text-stone-500'
                  : 'opacity-100 text-stone-800 dark:text-stone-200'
              }`}
            >
              {chunk.text}
            </span>
          );
        }

        const active = isHighlighted(chunk.segment);

        if (!active) {
          return (
            <span
              key={index}
              className={`transition-all duration-300 ${
                mode === 'xray'
                  ? 'opacity-25 hover:opacity-85 text-stone-400 dark:text-stone-500'
                  : 'opacity-100 text-stone-800 dark:text-stone-200'
              }`}
            >
              {chunk.text}
            </span>
          );
        }

        const glowClass = getGlowClass(chunk.segment.level);

        return (
          <mark
            key={index}
            onClick={(e) => onInspectSegment && onInspectSegment(chunk.segment!, e)}
            title={`Niveau ${chunk.segment.level}: ${chunk.segment.tag} · Importance ${chunk.segment.importance}/10 — Cliquez pour approfondir`}
            className={`cursor-pointer rounded-lg px-2 py-0.5 mx-0.5 inline-block transition-all duration-300 ${glowClass} ${
              mode === 'xray'
                ? 'scale-[1.03] ring-1 ring-white/40 shadow-2xl z-10'
                : 'hover:scale-[1.02] hover:brightness-125'
            } active:scale-[0.98] select-text`}
          >
            {chunk.text}
          </mark>
        );
      })}
    </div>
  );
};
