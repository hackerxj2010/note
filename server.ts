import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Semantic Depth & Importance Analyzer API
app.post('/api/analyze-depth', async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const ai = getGenAI();

    // If Gemini is not configured, return high-quality heuristic depth analysis
    if (!ai) {
      return res.json(generateLocalDepthAnalysis(text, title));
    }

    const prompt = `Tu es un philosophe et analyste cognitif de haut niveau pour l'application AuraNote.
Ta mission est d'analyser le texte de cette note et de découper les passages les plus significatifs selon leur PROFONDEUR et leur IMPORTANCE.

Titre de la note: "${title || 'Sans titre'}"
Contenu:
"""
${text}
"""

Instructions précises:
1. Identifie entre 3 et 8 segments clés du texte (phrases complètes ou morceaux de phrases percutants).
2. Pour chaque segment, spécifie:
   - "exactText": la sous-chaîne EXACTE telle qu'elle apparaît dans le texte (respecte scrupuleusement la casse et ponctuation pour pouvoir la surligner).
   - "level": entier de 1 à 5:
       1 = Fondamental / Axiomatique (vérité première, principe fondateur, postulat ontologique)
       2 = Structurant / Clé (argument central, synthèse logique, pilier de réflexion)
       3 = Nuance & Profondeur (mécanisme sous-jacent, paradoxe, subtilité)
       4 = Preuve & Observation (exemple concret, contexte, fait historique ou empirique)
       5 = Action & Levier (application pratique, implication directe, prochaine étape)
   - "importance": entier de 1 à 10 (10 = cœur absolu de la note, 7 = argument fort, 5 = appui utile)
   - "rationale": explication concise et élégante en français (1 phrase max) du pourquoi de ce niveau.
   - "tag": court mot-clé (ex: "Axiome", "Tension", "Synthèse", "Vérité première", "Levier").
3. Fournis également:
   - "coreEssence": une phrase poétique et percutante résumant l'âme de cette note.
   - "depthDensity": estimation du niveau moyen de profondeur intellectuelle (1 à 5).

Réponds uniquement au format JSON valide respectant ce schéma.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreEssence: { type: Type.STRING },
            depthDensity: { type: Type.NUMBER },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  exactText: { type: Type.STRING },
                  level: { type: Type.INTEGER },
                  importance: { type: Type.INTEGER },
                  rationale: { type: Type.STRING },
                  tag: { type: Type.STRING }
                },
                required: ['exactText', 'level', 'importance', 'rationale', 'tag']
              }
            }
          },
          required: ['coreEssence', 'depthDensity', 'segments']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing depth with Gemini:', err);
    // Graceful fallback to heuristic analysis so the user flow never fails
    return res.json(generateLocalDepthAnalysis(req.body.text || '', req.body.title));
  }
});

// 2. Deepen Thought API: expand or challenge a specific idea
app.post('/api/deepen-thought', async (req, res) => {
  try {
    const { selectedText, noteContext, mode = 'deepen' } = req.body;
    if (!selectedText) {
      return res.status(400).json({ error: 'selectedText is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json(generateLocalDeepening(selectedText, mode));
    }

    const modePromptMap: Record<string, string> = {
      deepen: "Creuse cette idée en révélant une vérité cachée, une implication invisible ou un mécanisme sous-jacent. Sois incisif, poétique et dense.",
      counterpoint: "Formule une objection féconde ou un contrepoint dialectique qui enrichit la pensée sans la détruire.",
      metaphor: "Propose une métaphore organique, architecturale ou physique éclairante pour cristalliser cette intuition.",
      actionable: "Traduis cette pensée abstraite en un principe d'action immédiat et tangible."
    };

    const instruction = modePromptMap[mode] || modePromptMap.deepen;

    const prompt = `Dans le cadre d'un carnet de pensée minimaliste (AuraNote), l'auteur a sélectionné ce passage:
"${selectedText}"

Contexte de la note:
"${noteContext || ''}"

Mission: ${instruction}
Format de réponse:
Rédige 2 à 3 phrases maximales, d'une grande élégance d'écriture, en français.
Donne aussi un titre court (3 à 5 mots) qui pourrait servir de titre pour une note liée.
Réponds au format JSON:
{
  "title": "Titre évocateur",
  "content": "La réflexion approfondie...",
  "keyTakeaway": "Une maxime en une seule ligne"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error deepening thought:', err);
    return res.json(generateLocalDeepening(req.body.selectedText || '', req.body.mode));
  }
});

// Fallback heuristic analyzer when API key is not present or offline
function generateLocalDepthAnalysis(text: string, title?: string) {
  const sentences = text
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const segments = sentences.slice(0, 6).map((sentence, index) => {
    // Determine level deterministically based on content cues
    let level = 2;
    let importance = 7;
    let tag = 'Pilier';
    let rationale = 'Argument structurant la progression logique.';

    const lower = sentence.toLowerCase();
    if (
      lower.includes('toujours') ||
      lower.includes('fondement') ||
      lower.includes('absolu') ||
      lower.includes('vérité') ||
      lower.includes('essence') ||
      lower.includes('principe') ||
      index === 0
    ) {
      level = 1;
      importance = 9;
      tag = 'Axiome';
      rationale = 'Postulat premier définissant le socle de la réflexion.';
    } else if (
      lower.includes('cependant') ||
      lower.includes('mais') ||
      lower.includes('paradoxe') ||
      lower.includes('nuance') ||
      lower.includes('tension') ||
      lower.includes('invisible')
    ) {
      level = 3;
      importance = 8;
      tag = 'Nuance';
      rationale = 'Explore une tension sous-jacente ou une dialectique subtile.';
    } else if (
      lower.includes('faire') ||
      lower.includes('créer') ||
      lower.includes('agir') ||
      lower.includes('construire') ||
      lower.includes('appliquer')
    ) {
      level = 5;
      importance = 7;
      tag = 'Action';
      rationale = 'Déduction pragmatique et levier d\'impact concret.';
    } else if (
      lower.includes('par exemple') ||
      lower.includes('comme') ||
      lower.includes('donnée') ||
      lower.includes('preuve')
    ) {
      level = 4;
      importance = 6;
      tag = 'Évidence';
      rationale = 'Point d\'ancrage factuel illustrant le propos.';
    }

    return {
      exactText: sentence,
      level,
      importance,
      rationale,
      tag
    };
  });

  return {
    coreEssence: title ? `Une exploration de « ${title} » à travers ses dynamiques fondamentales.` : 'Une méditation sur les équilibres invisibles et la clarté conceptuelle.',
    depthDensity: 3.8,
    segments
  };
}

function generateLocalDeepening(selectedText: string, mode: string = 'deepen') {
  if (mode === 'counterpoint') {
    return {
      title: 'La Contre-tension Nécessaire',
      content: `Pousser « ${selectedText.slice(0, 40)}... » à son comble révèle son envers : toute règle absolue porte en germe son angle mort créatif.`,
      keyTakeaway: 'Le contrepoids est la condition de la stabilité.'
    };
  }
  if (mode === 'metaphor') {
    return {
      title: 'L\'Écho Cristallin',
      content: `À la manière d'une voûte gothique où chaque pierre ne tient que par la poussée de l'autre, cette idée tire sa force de sa propre contrainte.`,
      keyTakeaway: 'La structure émerge de la compression harmonieuse.'
    };
  }
  if (mode === 'actionable') {
    return {
      title: 'Principe Opératoire',
      content: `Appliquer immédiatement ceci : éliminer tout détail qui ne renforce pas directement ce centre de gravité dans vos prochaines décisions.`,
      keyTakeaway: 'La précision naît de la soustraction.'
    };
  }
  return {
    title: 'Au-delà du Visible',
    content: `Ce postulat touche à une vérité plus vaste : lorsque la forme s'efface au profit de la résonance, la pensée trouve sa trajectoire la plus pure.`,
    keyTakeaway: 'L\'essentiel n\'exige aucun artifice pour subsister.'
  };
}

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AuraNote] Server active on http://0.0.0.0:${PORT}`);
  });
}

start();
