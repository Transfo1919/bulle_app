import { BucketItem, PrayerTopic, Game, GameSession } from '../types';

// ─── Bucket Services ────────────────────────────────────
export async function getBucketItems() {
  // Placeholder - would call Supabase
  return [];
}

export async function createBucketItem(title: string): Promise<BucketItem> {
  return {
    id: `bucket_${Date.now()}`,
    title,
    completed: false,
    created_at: new Date().toISOString(),
  };
}

export async function toggleBucketItemComplete(item: BucketItem): Promise<BucketItem> {
  return {
    ...item,
    completed: !item.completed,
    completed_at: !item.completed ? new Date().toISOString() : undefined,
  };
}

export async function deleteBucketItem(_id: string): Promise<void> {
  // Placeholder - would call Supabase
}

// ─── Prayer Services ────────────────────────────────────
export async function getPrayerTopics() {
  // Placeholder - would call Supabase
  return [];
}

export async function createPrayerTopic(
  title: string,
  type: 'ponctuel' | 'récurrent',
  description?: string
): Promise<PrayerTopic> {
  return {
    id: `prayer_${Date.now()}`,
    title,
    description,
    type,
    status: 'active',
    created_at: new Date().toISOString(),
  };
}

export async function markPrayerAnswered(topic: PrayerTopic): Promise<PrayerTopic> {
  return {
    ...topic,
    status: 'answered',
    answered_at: new Date().toISOString(),
  };
}

export async function deletePrayerTopic(_id: string): Promise<void> {
  // Placeholder - would call Supabase
}

export function getRandomPrayerTopics(topics: PrayerTopic[], count = 1): PrayerTopic[] {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Game Services ────────────────────────────────────
export const DEFAULT_GAMES: Game[] = [
  {
    id: 'questions',
    name: 'Questions aléatoires',
    description: 'Posez-vous des questions surprenantes',
    icon: 'HelpCircle',
    enabled: true,
  },
  {
    id: 'je-pense',
    name: 'Je pense à...',
    description: 'Devinez à quoi l\'autre pense',
    icon: 'Brain',
    enabled: true,
  },
  {
    id: 'qui-de-nous',
    name: 'Qui de nous deux ?',
    description: 'Répondez aux questions sur vous deux',
    icon: 'Users',
    enabled: true,
  },
  {
    id: 'defis',
    name: 'Défis',
    description: 'Relevez des défis amusants ensemble',
    icon: 'Target',
    enabled: true,
  },
  {
    id: 'souvenir-express',
    name: 'Souvenir Express',
    description: 'Racontez un souvenir en 60 secondes',
    icon: 'Zap',
    enabled: true,
  },
  {
    id: 'devine-souvenir',
    name: 'Devine le souvenir',
    description: 'Devinez le souvenir de l\'autre',
    icon: 'Eye',
    enabled: true,
  },
];

export async function getGames(): Promise<Game[]> {
  // Placeholder - would call Supabase
  return DEFAULT_GAMES;
}

export async function createGameSession(
  gameId: string,
  summary?: string,
  winner?: string,
  funFact?: string
): Promise<GameSession> {
  return {
    id: `session_${Date.now()}`,
    game_id: gameId,
    played_at: new Date().toISOString(),
    summary,
    winner,
    fun_fact: funFact,
  };
}
