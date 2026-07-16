import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey;

// createClient() lève une exception synchrone si l'URL est vide/invalide, ce qui
// plante tout le bundle au chargement (écran blanc, avant même le premier rendu
// React). On utilise donc une URL de secours syntaxiquement valide quand les
// variables d'environnement ne sont pas encore configurées, et on expose
// isSupabaseConfigured pour que l'UI puisse afficher un message clair.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);

export async function getMemories() {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getTrashedMemories() {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMemory(memory: any) {
  const { data, error } = await supabase
    .from('moments')
    .insert([memory])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateMemory(id: string, updates: any) {
  const { data, error } = await supabase
    .from('moments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Suppression douce : on marque l'instant comme supprimé, il reste 30 jours
// en corbeille avant purge définitive (déclenchée côté client au chargement).
export async function trashMemory(id: string) {
  const { data, error } = await supabase
    .from('moments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function restoreMemory(id: string) {
  const { data, error } = await supabase
    .from('moments')
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function permanentlyDeleteMemory(id: string) {
  const { error } = await supabase
    .from('moments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function uploadPhoto(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(path, file);
  
  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from('photos')
    .getPublicUrl(data.path);
  
  return publicUrl.publicUrl;
}

export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createCollection(collection: any) {
  const { data, error } = await supabase
    .from('collections')
    .insert([collection])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ─── Bucket items ────────────────────────────────────
export async function getBucketItemsRemote() {
  const { data, error } = await supabase
    .from('bucket_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createBucketItemRemote(item: any) {
  const { data, error } = await supabase
    .from('bucket_items')
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBucketItemRemote(id: string, updates: any) {
  const { data, error } = await supabase
    .from('bucket_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBucketItemRemote(id: string) {
  const { error } = await supabase.from('bucket_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Prayer topics ────────────────────────────────────
export async function getPrayerTopicsRemote() {
  const { data, error } = await supabase
    .from('prayer_topics')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPrayerTopicRemote(topic: any) {
  const { data, error } = await supabase
    .from('prayer_topics')
    .insert([topic])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePrayerTopicRemote(id: string, updates: any) {
  const { data, error } = await supabase
    .from('prayer_topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePrayerTopicRemote(id: string) {
  const { error } = await supabase.from('prayer_topics').delete().eq('id', id);
  if (error) throw error;
}

// ─── Game sessions ────────────────────────────────────
export async function getGameSessionsRemote() {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .order('played_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createGameSessionRemote(session: any) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([session])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Collections ────────────────────────────────────
export async function getCollectionsRemote() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCollectionRemote(collection: any) {
  const { data, error } = await supabase
    .from('collections')
    .insert([collection])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCollectionRemote(id: string) {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw error;
}

// ─── Questions personnalisées (Qui connaît le mieux) ────────────────────────
export async function getCustomQuestionsRemote() {
  const { data, error } = await supabase
    .from('custom_questions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCustomQuestionRemote(item: any) {
  const { data, error } = await supabase
    .from('custom_questions')
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomQuestionRemote(id: string, updates: any) {
  const { data, error } = await supabase
    .from('custom_questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomQuestionRemote(id: string) {
  const { error } = await supabase.from('custom_questions').delete().eq('id', id);
  if (error) throw error;
}

// ─── Défis personnalisés ────────────────────────────────────
export async function getCustomDefisRemote() {
  const { data, error } = await supabase
    .from('custom_defis')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCustomDefiRemote(item: any) {
  const { data, error } = await supabase
    .from('custom_defis')
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomDefiRemote(id: string, updates: any) {
  const { data, error } = await supabase
    .from('custom_defis')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomDefiRemote(id: string) {
  const { error } = await supabase.from('custom_defis').delete().eq('id', id);
  if (error) throw error;
}
