import { Game, GameSession } from '../types';
import { getGameSessionsRemote, createGameSessionRemote } from './supabase';

// Contenu chargé depuis des fichiers texte modifiables à la main, dans
// /content à la racine du projet (un fichier par banque de contenu).
// Éditer ces .txt, pousser sur GitHub, puis redéployer : le contenu se
// met à jour automatiquement au prochain build, sans toucher au code.
import jePenseRaw from '../../content/jepense.txt?raw';
import questionsRaw from '../../content/questions.txt?raw';
import etSiRaw from '../../content/etsi.txt?raw';
import defisRaw from '../../content/defis.txt?raw';

// Une ligne = une entrée. Lignes vides ignorées.
function parseLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// Blocs séparés par des titres "## Nom du thème".
function parseThemedBlocks(raw: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  let currentTheme: string | null = null;
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('##')) {
      currentTheme = line.replace(/^##\s*/, '').trim();
      result[currentTheme] = [];
    } else if (currentTheme) {
      result[currentTheme].push(line);
    }
  }
  return result;
}

// ─── À deux (ex-Jeux) : 6 expériences ────────────────────────────────────
export const DEFAULT_GAMES: Game[] = [
  {
    id: 'je-pense',
    name: 'Je pense à...',
    description: "L'un pense à quelque chose, l'autre doit deviner en posant des questions.",
    icon: 'Brain',
    enabled: true,
  },
  {
    id: 'photo-mystere',
    name: 'Photo Mystère',
    description: "Un fragment d'une photo de vos Instants à redécouvrir ensemble.",
    icon: 'Eye',
    enabled: true,
  },
  {
    id: 'qui-connait-mieux',
    name: 'Qui connaît le mieux ?',
    description: 'Une question, deux réponses en secret, puis on compare.',
    icon: 'Users',
    enabled: true,
  },
  {
    id: 'et-si',
    name: 'Et si...',
    description: 'Des questions hypothétiques, sans bonne réponse.',
    icon: 'HelpCircle',
    enabled: true,
  },
  {
    id: 'le-hasard',
    name: 'Le hasard',
    description: 'Un instant, une envie ou une prière, piochés au hasard.',
    icon: 'Shuffle',
    enabled: true,
  },
  {
    id: 'defis',
    name: 'Défis',
    description: 'Un petit défi à relever à deux, maintenant ou bientôt.',
    icon: 'Target',
    enabled: true,
  },
];

export const JE_PENSE_ITEMS = parseLines(jePenseRaw);

export const JE_PENSE_GUIDING_QUESTIONS = [
  "Est-ce qu'on l'a vécu ensemble ?",
  "C'est arrivé cette année ?",
  "C'est plutôt joyeux ou intense ?",
  "C'est lié à un voyage ?",
  'Est-ce que je connais cette personne ?',
];

export const QUI_CONNAIT_THEMES: Record<string, string[]> = parseThemedBlocks(questionsRaw);

export const ET_SI_QUESTIONS = parseLines(etSiRaw);

export const DEFIS = parseLines(defisRaw);

// Conservé pour compatibilité (utilisé comme secours dans le modal de jeu)
export const GAME_PROMPTS: Record<string, string[]> = {
  'je-pense': JE_PENSE_ITEMS,
  'et-si': ET_SI_QUESTIONS,
  defis: DEFIS,
};

export async function getGames(): Promise<Game[]> {
  return DEFAULT_GAMES;
}

export async function getGameSessions(): Promise<GameSession[]> {
  return getGameSessionsRemote();
}

export async function createGameSession(
  gameId: string,
  summary?: string,
  winner?: string,
  funFact?: string
): Promise<GameSession> {
  return createGameSessionRemote({
    game_id: gameId,
    played_at: new Date().toISOString(),
    summary,
    winner,
    fun_fact: funFact,
  });
}
