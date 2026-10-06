import { NoteAnalysis, DeepenResponse, SemanticSegment } from '../types';

export async function analyzeNoteDepth(text: string, title?: string): Promise<NoteAnalysis> {
  try {
    const res = await fetch('/api/analyze-depth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      coreEssence: data.coreEssence || 'Synthèse sémantique générée.',
      depthDensity: typeof data.depthDensity === 'number' ? data.depthDensity : 3.5,
      analyzedAt: Date.now(),
      segments: Array.isArray(data.segments) ? data.segments : [],
    };
  } catch (err) {
    console.warn('Backend call failed, using client fallback heuristic:', err);
    return fallbackAnalyzeNote(text, title);
  }
}

export async function deepenThought(
  selectedText: string,
  noteContext: string,
  mode: 'deepen' | 'counterpoint' | 'metaphor' | 'actionable' = 'deepen'
): Promise<DeepenResponse> {
  try {
    const res = await fetch('/api/deepen-thought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedText, noteContext, mode }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend deepen call failed, using client fallback:', err);
    return fallbackDeepen(selectedText, mode);
  }
}

function fallbackAnalyzeNote(text: string, title?: string): NoteAnalysis {
  const sentences = text
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const segments: SemanticSegment[] = sentences.slice(0, 5).map((sentence, idx) => {
    let level: 1 | 2 | 3 | 4 | 5 = 2;
    let importance = 8;
    let tag = 'Pilier';
    let rationale = 'Argument articulant la structure réflexive.';

    if (idx === 0 || sentence.includes('toujours') || sentence.includes('absolu') || sentence.includes('fondement')) {
      level = 1;
      importance = 10;
      tag = 'Axiome';
      rationale = 'Postulat premier définissant le socle philosophique.';
    } else if (sentence.includes('mais') || sentence.includes('cependant') || sentence.includes('paradoxe')) {
      level = 3;
      importance = 8;
      tag = 'Nuance';
      rationale = 'Révèle une tension interne ou une polarité féconde.';
    } else if (sentence.includes('agir') || sentence.includes('faire') || sentence.includes('pratique')) {
      level = 5;
      importance = 7;
      tag = 'Action';
      rationale = 'Déduction pragmatique transformant la pensée en acte.';
    } else if (sentence.includes('comme') || sentence.includes('exemple') || sentence.includes('arbre')) {
      level = 4;
      importance = 6;
      tag = 'Illustration';
      rationale = 'Ancrage imagé ou empirique.';
    }

    return {
      exactText: sentence,
      level,
      importance,
      rationale,
      tag,
    };
  });

  return {
    coreEssence: title
      ? `Élucidation des résonances profondes autour de « ${title} ».`
      : 'Méditation sur les architectures de pensée et la réduction du bruit mental.',
    depthDensity: 3.8,
    analyzedAt: Date.now(),
    segments,
  };
}

function fallbackDeepen(selectedText: string, mode: string): DeepenResponse {
  if (mode === 'counterpoint') {
    return {
      title: 'Le Revers Fécond',
      content: `Pousser à l'extrême « ${selectedText.slice(0, 45)}... » fait naître son antipode nécessaire : la sur-optimisation stérilise l'imprévu qui nourrit toute vraie découverte.`,
      keyTakeaway: 'Toute clarté excessive projette une ombre féconde.',
    };
  }
  if (mode === 'metaphor') {
    return {
      title: 'L\'Épigraphie dans le Granit',
      content: `Comme une inscription gravée dans la pierre antique qui résiste aux intempéries alors que les parchemins s'effritent, cette pensée ne survit que par sa densité minérale.`,
      keyTakeaway: 'La concision est la longévité de l\'idée.',
    };
  }
  if (mode === 'actionable') {
    return {
      title: 'Geste d\'Incarnation',
      content: `Prendre 15 minutes aujourd'hui pour supprimer un processus superflu ou reformuler un projet en trois mots maximum inspirés de cette intuition.`,
      keyTakeaway: 'Moins, mais avec une intensité décuplée.',
    };
  }
  return {
    title: 'L\'Harmonique Sous-Jacente',
    content: `Sous cette affirmation se dessine une loi de résonance : ce qui résonne en nous n'est pas le verbe lu, mais la reconnaissance d'une vérité que nous possédions déjà sans mot pour la nommer.`,
    keyTakeaway: 'Comprendre, c\'est se ressouvenir.',
  };
}
