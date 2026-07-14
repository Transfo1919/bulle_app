import { BucketItem, PrayerTopic, Game, GameSession } from '../types';
import {
  getBucketItemsRemote,
  createBucketItemRemote,
  updateBucketItemRemote,
  deleteBucketItemRemote,
  getPrayerTopicsRemote,
  createPrayerTopicRemote,
  updatePrayerTopicRemote,
  deletePrayerTopicRemote,
  getGameSessionsRemote,
  createGameSessionRemote,
} from './supabase';

// ─── Envies (ex-Bucket) ────────────────────────────────────
export async function getBucketItems(): Promise<BucketItem[]> {
  return getBucketItemsRemote();
}

export async function createBucketItem(
  title: string,
  timing: 'ce_soir' | 'plus_tard' = 'plus_tard'
): Promise<BucketItem> {
  return createBucketItemRemote({
    id: `envie_${Date.now()}`,
    title,
    timing,
    completed: false,
    created_at: new Date().toISOString(),
  });
}

export async function toggleBucketItemComplete(item: BucketItem): Promise<BucketItem> {
  const completed = !item.completed;
  return updateBucketItemRemote(item.id, {
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  });
}

export async function deleteBucketItem(id: string): Promise<void> {
  return deleteBucketItemRemote(id);
}

// ─── Prière ────────────────────────────────────
export async function getPrayerTopics(): Promise<PrayerTopic[]> {
  return getPrayerTopicsRemote();
}

export async function createPrayerTopic(
  title: string,
  category: 'toport' | 'recognition',
  type: 'ponctuel' | 'récurrent' = 'ponctuel',
  description?: string
): Promise<PrayerTopic> {
  const now = new Date().toISOString();
  return createPrayerTopicRemote({
    id: `prayer_${Date.now()}`,
    title,
    description,
    type,
    category,
    status: category === 'recognition' ? 'answered' : 'active',
    created_at: now,
    answered_at: category === 'recognition' ? now : undefined,
  });
}

export async function markPrayerAnswered(topic: PrayerTopic): Promise<PrayerTopic> {
  return updatePrayerTopicRemote(topic.id, {
    status: 'answered',
    category: 'recognition',
    answered_at: new Date().toISOString(),
  });
}

export async function deletePrayerTopic(id: string): Promise<void> {
  return deletePrayerTopicRemote(id);
}

const ARCHIVE_AFTER_DAYS = 30;

export function isPrayerTopicArchived(topic: PrayerTopic): boolean {
  if (!topic.answered_at) return false;
  const daysSince = (Date.now() - new Date(topic.answered_at).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= ARCHIVE_AFTER_DAYS;
}

export function getRandomPrayerTopics(topics: PrayerTopic[], count = 1): PrayerTopic[] {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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

export const JE_PENSE_ITEMS = [
  'un lieu',
  'un objet du quotidien',
  'une envie',
  'un souvenir',
  'une personne',
  'un plat',
  'un instant',
  'un événement à venir',
];

export const JE_PENSE_GUIDING_QUESTIONS = [
  "Est-ce qu'on l'a vécu ensemble ?",
  "C'est arrivé cette année ?",
  "C'est plutôt joyeux ou intense ?",
  "C'est lié à un voyage ?",
  'Est-ce que je connais cette personne ?',
];

export const QUI_CONNAIT_THEMES: Record<string, string[]> = {
  Enfance: [
    'Quel est mon souvenir d\u2019enfance préféré ?',
    'Quel métier je voulais faire petit·e ?',
    'Quel était mon jouet ou doudou préféré ?',
    "Où est-ce que je passais mes vacances enfant ?",
    'Quelle était ma matière préférée à l\u2019école ?',
    'Quel était le surnom que mes parents me donnaient ?',
  ],
  Habitudes: [
    'Qu\u2019est-ce que je fais toujours avant de dormir ?',
    'Quel est mon petit rituel du matin ?',
    'Qu\u2019est-ce qui m\u2019agace le plus au quotidien ?',
    'Quel est mon plat réconfort ?',
    'Qu\u2019est-ce que je fais quand je suis stressé·e ?',
    'Quelle chanson j\u2019écoute en boucle en ce moment ?',
  ],
  Couple: [
    'Quel a été notre premier vrai fou rire ensemble ?',
    'Quel est mon souvenir préféré de nous deux ?',
    'Qu\u2019est-ce que je trouve le plus rassurant chez toi ?',
    'Quelle petite attention te touche le plus ?',
    'Quel a été notre plus beau voyage à deux ?',
    'Quel geste du quotidien me fait sentir aimé·e ?',
  ],
  Projets: [
    'Quel est le prochain endroit où je veux voyager ?',
    'Quel projet j\u2019aimerais réaliser dans les 5 prochaines années ?',
    'Quelle compétence j\u2019aimerais apprendre ?',
    'Quel changement j\u2019aimerais faire dans ma vie cette année ?',
    'Où j\u2019imagine qu\u2019on sera dans 10 ans ?',
    'Quel est un rêve que je n\u2019ai jamais osé dire tout haut ?',
  ],
  Goûts: [
    'Quel est mon film préféré ?',
    'Quel est mon plat préféré ?',
    'Quelle est ma saison préférée ?',
    'Quel genre de musique je préfère ?',
    'Quel est mon dessert préféré ?',
    'Quelle est ma couleur préférée en ce moment ?',
  ],
  Rêves: [
    'Quel serait mon métier de rêve, sans contrainte ?',
    'Où j\u2019aimerais vivre un jour ?',
    'Quel serait mon voyage de rêve ?',
    'Quelle est une chose folle que j\u2019aimerais faire une fois dans ma vie ?',
    'Quel super-pouvoir je choisirais ?',
    'À quoi ressemble ma journée idéale ?',
  ],
  Famille: [
    'Combien d\u2019enfants j\u2019aimerais avoir (ou pas) ?',
    'Quel membre de ma famille m\u2019a le plus marqué·e ?',
    'Quelle tradition familiale j\u2019aimerais garder ?',
    'Quel est mon meilleur souvenir de fête de famille ?',
    'Quelle valeur je veux absolument transmettre ?',
    'Qui, dans ma famille, ressemble le plus à moi ?',
  ],
  Spiritualité: [
    'Qu\u2019est-ce qui me donne un sentiment de paix ?',
    'Quel moment m\u2019a rapproché·e le plus de mes convictions ?',
    'Pour quoi suis-je le plus reconnaissant·e en ce moment ?',
    'Qu\u2019est-ce que je trouve sacré dans notre relation ?',
    'Quelle est une chose pour laquelle j\u2019aimerais prier ou méditer plus souvent ?',
    'Qu\u2019est-ce qui donne du sens à mes journées ?',
  ],
};

export const ET_SI_QUESTIONS = [
  'Et si on pouvait vivre un an n\u2019importe où dans le monde, où irait-on ?',
  'Et si on devait tout recommencer, qu\u2019est-ce qu\u2019on garderait absolument ?',
  'Et si on gagnait un an sans travailler, qu\u2019est-ce qu\u2019on ferait ?',
  'Et si on devait écrire un livre sur notre histoire, quel serait le titre ?',
  'Et si on pouvait revivre une seule journée ensemble, laquelle ?',
  'Et si on devait offrir un cadeau à notre "nous" d\u2019il y a 5 ans, ce serait quoi ?',
  'Et si on n\u2019avait plus jamais accès à nos téléphones un week-end entier, on ferait quoi ?',
  'Et si on devait choisir une seule chanson pour représenter notre couple ?',
  'Et si on pouvait inviter n\u2019importe qui à dîner, qui choisirait-on ?',
  'Et si on devait déménager demain, qu\u2019est-ce qu\u2019on emporterait en premier ?',
  'Et si on créait une tradition rien qu\u2019à nous, ce serait quoi ?',
  'Et si on pouvait donner un conseil à notre "nous" du début de la relation ?',
];

export const DEFIS = [
  'Se prendre en photo tous les deux, n\u2019importe où, maintenant.',
  'Se raconter un souvenir que l\u2019autre ne connaît pas encore.',
  'S\u2019écrire un mot doux à laisser quelque part pour l\u2019autre.',
  'Cuisiner un plat du pays d\u2019origine de l\u2019un de vous deux.',
  'Passer 10 minutes sans téléphone, juste à se parler.',
  'Refaire une activité de vos débuts.',
  'Complimenter l\u2019autre sur trois choses précises, là maintenant.',
  'Planifier une sortie surprise pour la semaine.',
  'Écouter la chanson qui vous rappelle vos débuts.',
  'Se masser les mains ou les épaules cinq minutes.',
  'Regarder ensemble vos toutes premières photos de couple.',
  'Écrire chacun trois mots qui décrivent votre couple, puis comparer.',
];

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
    id: `session_${Date.now()}`,
    game_id: gameId,
    played_at: new Date().toISOString(),
    summary,
    winner,
    fun_fact: funFact,
  });
}
