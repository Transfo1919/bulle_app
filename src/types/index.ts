export type Mood = 'soleil' | 'calme' | 'gris' | 'tempete';

export interface Memory {
  id: string;
  title?: string;
  text: string;
  date: string;
  mood: Mood;
  location?: string;
  collection_id?: string;
  source: 'manual' | 'game' | 'bucket' | 'prayer';
  photos?: Photo[];
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  memory_id: string;
  url: string;
  width: number;
  height: number;
  taken_at?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  cover_photo?: string;
  start_date: string;
  end_date: string;
  memories: Memory[];
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface GameSession {
  id: string;
  game_id: string;
  played_at: string;
  summary?: string;
  winner?: string;
  fun_fact?: string;
}

export interface BucketItem {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface PrayerTopic {
  id: string;
  title: string;
  description?: string;
  type: 'ponctuel' | 'récurrent';
  status: 'active' | 'answered';
  created_at: string;
  answered_at?: string;
}

export interface Settings {
  language: 'fr' | 'en';
  theme: 'light' | 'dark';
}
