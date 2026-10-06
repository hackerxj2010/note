export type DepthLevel = 1 | 2 | 3 | 4 | 5;

export interface SemanticSegment {
  exactText: string;
  level: DepthLevel;
  importance: number; // 1 to 10
  rationale: string;
  tag: string;
}

export interface NoteAnalysis {
  coreEssence: string;
  depthDensity: number; // 1.0 to 5.0
  analyzedAt: number;
  segments: SemanticSegment[];
}

export type NoteColor = 'amber' | 'purple' | 'cyan' | 'rose' | 'emerald' | 'obsidian';

export interface Note {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  color: NoteColor;
  updatedAt: number;
  createdAt: number;
  analysis?: NoteAnalysis;
  isPinned?: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export type HighlightMode = 'aura' | 'xray' | 'neon' | 'minimal';

export type AppTheme = 'aurora' | 'sunset' | 'opaline';

export interface DeepenResponse {
  title: string;
  content: string;
  keyTakeaway: string;
}
