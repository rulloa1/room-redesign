import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface RedesignHistoryItem {
  id: string;
  user_id: string;
  original_image_url: string;
  redesigned_image_url: string;
  style: string;
  customizations: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Note: This hook currently uses local state only.
// The redesign_history table needs to be created via migration to enable persistence.
export const useRedesignHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<RedesignHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (_limit = 20) => {
    if (!user) return;
    // No-op: table doesn't exist yet
    setLoading(false);
  }, [user]);

  const saveRedesign = useCallback(
    async (
      originalImageUrl: string,
      redesignedImageUrl: string,
      style: string,
      customizations: Record<string, unknown> = {},
      isFavorite = false
    ): Promise<string | null> => {
      if (!user) return null;

      const newItem: RedesignHistoryItem = {
        id: crypto.randomUUID(),
        user_id: user.id,
        original_image_url: originalImageUrl,
        redesigned_image_url: redesignedImageUrl,
        style,
        customizations,
        is_favorite: isFavorite,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setHistory((prev) => [newItem, ...prev]);
      return newItem.id;
    },
    [user]
  );

  const updateFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      if (!user) return;

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: isFavorite } : item
        )
      );
    },
    [user]
  );

  const deleteRedesign = useCallback(
    async (id: string) => {
      if (!user) return;

      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [user]
  );

  const getFavorites = useCallback(async () => {
    if (!user) return [];
    return history.filter((item) => item.is_favorite);
  }, [user, history]);

  return {
    history,
    loading,
    fetchHistory,
    saveRedesign,
    updateFavorite,
    deleteRedesign,
    getFavorites,
  };
};
