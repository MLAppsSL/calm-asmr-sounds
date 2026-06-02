import type { User } from '@supabase/supabase-js';

export type AuthUser = User;

export type FavoritesRow = {
  id: string;
  user_id: string;
  sound_id: string;
  added_at: string;
};
