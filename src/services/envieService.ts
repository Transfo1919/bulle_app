import { BucketItem } from '../types';
import { getBucketItemsRemote, createBucketItemRemote, updateBucketItemRemote, deleteBucketItemRemote } from './supabase';

export async function getBucketItems(): Promise<BucketItem[]> {
  return getBucketItemsRemote();
}

export async function createBucketItem(
  title: string,
  timing: 'ce_soir' | 'plus_tard' = 'plus_tard'
): Promise<BucketItem> {
  return createBucketItemRemote({
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

export async function updateBucketItemTitle(id: string, title: string): Promise<BucketItem> {
  return updateBucketItemRemote(id, { title });
}

export async function deleteBucketItem(id: string): Promise<void> {
  return deleteBucketItemRemote(id);
}
