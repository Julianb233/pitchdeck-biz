import { createAdminClient } from './admin';
import type { Database } from './types';

type AssetRow = Database['public']['Tables']['assets']['Row'];

/**
 * Save a generated asset to the Supabase assets table.
 */
export async function saveAsset(
  userId: string,
  subscriptionId: string | null,
  assetType: string,
  templateName: string | null,
  prompt: string | null,
  imageData: string | null,
  tokensCost: number,
  brandColors: string[] = [],
): Promise<AssetRow | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('assets')
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      asset_type: assetType,
      template_name: templateName,
      prompt,
      image_data: imageData,
      brand_colors: brandColors,
      tokens_used: tokensCost,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving asset to Supabase:', error);
    return null;
  }

  return data as AssetRow;
}

/**
 * Get a user's assets, ordered by created_at desc.
 */
export async function getUserAssets(
  userId: string,
  limit = 20,
): Promise<AssetRow[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user assets:', error);
    return [];
  }

  return (data ?? []) as AssetRow[];
}

/**
 * Get a single asset by ID.
 */
export async function getAsset(assetId: string): Promise<AssetRow | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }

  return data as AssetRow;
}
