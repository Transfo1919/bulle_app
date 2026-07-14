import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getMemories() {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .order('created_at', { ascending: false });
  
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

export async function deleteMemory(id: string) {
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
