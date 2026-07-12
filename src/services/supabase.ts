import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createMemory(memory: any) {
  const { data, error } = await supabase
    .from('memories')
    .insert([memory])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateMemory(id: string, updates: any) {
  const { data, error } = await supabase
    .from('memories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteMemory(id: string) {
  const { error } = await supabase
    .from('memories')
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
