import { Note, Connection } from '../types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Traité de la Clarté Réflexive',
    content: `La véritable profondeur ne s'obtient jamais par l'accumulation de concepts, mais par l'élagage radical du superflu. Un axiome premier commande toute clarté : la complexité non maîtrisée est une défaite de l'esprit.

Cependant, il existe un paradoxe fécond : simplifier trop tôt mutile la nuance, tandis que différer indéfiniment la synthèse conduit à l'inertie. Le rôle d'un carnet de pensée n'est pas d'archiver la mémoire, mais de catalyser l'intuition.

Pour cultiver cette lucidité, il faut instaurer un rituel quotidien d'isolation cognitive et refuser l'immédiateté des notifications. La pensée profonde exige un sanctuaire de silence.`,
    x: 80,
    y: 100,
    width: 440,
    color: 'amber',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 2,
    analysis: {
      coreEssence: "La clarté naît de la soustraction impitoyable et d'un sanctuaire préservé du vacarme.",
      depthDensity: 4.2,
      analyzedAt: Date.now() - 3600000 * 2,
      segments: [
        {
          exactText: "La véritable profondeur ne s'obtient jamais par l'accumulation de concepts, mais par l'élagage radical du superflu.",
          level: 1,
          importance: 10,
          rationale: "Postulat ontologique fondamental qui fonde toute la thèse de l'auteur.",
          tag: "Axiome Fondateur"
        },
        {
          exactText: "la complexité non maîtrisée est une défaite de l'esprit.",
          level: 2,
          importance: 9,
          rationale: "Sentence de synthèse logique définissant le danger critique.",
          tag: "Pilier Structurant"
        },
        {
          exactText: "simplifier trop tôt mutile la nuance, tandis que différer indéfiniment la synthèse conduit à l'inertie.",
          level: 3,
          importance: 8,
          rationale: "Élucidation d'une tension dialectique et d'un équilibre instable.",
          tag: "Nuance Subtile"
        },
        {
          exactText: "Le rôle d'un carnet de pensée n'est pas d'archiver la mémoire, mais de catalyser l'intuition.",
          level: 2,
          importance: 9,
          rationale: "Re-définition téléologique de l'instrument de réflexion.",
          tag: "Principe Pivot"
        },
        {
          exactText: "instaurer un rituel quotidien d'isolation cognitive et refuser l'immédiateté des notifications.",
          level: 5,
          importance: 7,
          rationale: "Prescription concrète et mise en pratique pragmatique.",
          tag: "Levier d'Action"
        }
      ]
    }
  },
  {
    id: 'note-2',
    title: 'L\'Harmonie des Systèmes Invisibles',
    content: `Le design le plus admirable est celui qui ne réclame pas d'attention. Lorsqu'un outil atteint son état de grâce, il disparaît pour laisser place entière au flux créateur de l'artisan.

Dans l'architecture japonaise du Ma (l'espace négatif), c'est le vide entre les colonnes qui crée la résonance du temple, non le bois lui-même. De même, un carnet spatial doit respirer.

Toute surcharge visuelle ou artificielle rompt le sortilège. Nous devons sculpter des interfaces aussi légères qu'un souffle d'encre sur papier de riz.`,
    x: 580,
    y: 120,
    width: 440,
    color: 'cyan',
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 3,
    analysis: {
      coreEssence: "L'outil parfait s'efface dans l'espace négatif pour libérer le génie de l'esprit.",
      depthDensity: 3.9,
      analyzedAt: Date.now() - 3600000 * 3,
      segments: [
        {
          exactText: "Le design le plus admirable est celui qui ne réclame pas d'attention.",
          level: 1,
          importance: 10,
          rationale: "Définition axiomatique de l'excellence esthétique fonctionnelle.",
          tag: "Vérité Première"
        },
        {
          exactText: "Lorsqu'un outil atteint son état de grâce, il disparaît pour laisser place entière au flux créateur de l'artisan.",
          level: 2,
          importance: 8,
          rationale: "Description du mécanisme de symbiose entre l'humain et l'outil.",
          tag: "Pilier Structurant"
        },
        {
          exactText: "Dans l'architecture japonaise du Ma (l'espace négatif), c'est le vide entre les colonnes qui crée la résonance du temple, non le bois lui-même.",
          level: 4,
          importance: 7,
          rationale: "Analogie empirique et culturelle venant illustrer le principe.",
          tag: "Observation Éclairante"
        },
        {
          exactText: "Toute surcharge visuelle ou artificielle rompt le sortilège.",
          level: 3,
          importance: 8,
          rationale: "Nuance d'alerte sur la vulnérabilité du design épuré.",
          tag: "Tension Esthétique"
        },
        {
          exactText: "sculpter des interfaces aussi légères qu'un souffle d'encre sur papier de riz.",
          level: 5,
          importance: 7,
          rationale: "Directive poétique pour le travail d'ingénierie et de design.",
          tag: "Vœu Créateur"
        }
      ]
    }
  },
  {
    id: 'note-3',
    title: "De l'Axiome à l'Impact Réel",
    content: `Une idée pure qui ne s'incarne pas demeure une hallucination stérile. Le pont entre la pensée abstraite et l'œuvre tangible est forgé par la discipline de l'exécution.

Observer la nature : l'arbre ne disserte pas sur la croissance, il pousse silencieusement ses racines dans le substrat rocheux. 

Règle pratique : chaque réflexion profonde notée dans ce carnet doit susciter un geste vérifiable dans le monde avant le coucher du soleil.`,
    x: 320,
    y: 530,
    width: 420,
    color: 'purple',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 1,
    analysis: {
      coreEssence: "L'esprit contemplatif trouve son parachèvement dans l'acte mesurable.",
      depthDensity: 3.6,
      analyzedAt: Date.now() - 3600000 * 1,
      segments: [
        {
          exactText: "Une idée pure qui ne s'incarne pas demeure une hallucination stérile.",
          level: 1,
          importance: 9,
          rationale: "Avertissement ontologique sur la vanité de la spéculation désincarnée.",
          tag: "Axiome Sévère"
        },
        {
          exactText: "Le pont entre la pensée abstraite et l'œuvre tangible est forgé par la discipline de l'exécution.",
          level: 2,
          importance: 9,
          rationale: "Formulation du principe d'incarnation et d'effort.",
          tag: "Axe Logique"
        },
        {
          exactText: "l'arbre ne disserte pas sur la croissance, il pousse silencieusement ses racines dans le substrat rocheux.",
          level: 4,
          importance: 6,
          rationale: "Métaphore naturelle servant de preuve vivante.",
          tag: "Analogie Vivante"
        },
        {
          exactText: "chaque réflexion profonde notée dans ce carnet doit susciter un geste vérifiable dans le monde avant le coucher du soleil.",
          level: 5,
          importance: 10,
          rationale: "Contrat d'action impératif transformant la note en décision.",
          tag: "Impératif d'Action"
        }
      ]
    }
  }
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-1',
    fromId: 'note-1',
    toId: 'note-2',
    label: 'Élégance par soustraction'
  },
  {
    id: 'conn-2',
    fromId: 'note-1',
    toId: 'note-3',
    label: 'Incarnation du principe'
  }
];
