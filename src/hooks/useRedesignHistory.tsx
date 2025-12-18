import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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

export const useRedesignHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<RedesignHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (limit = 20) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("redesign_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching redesign history:", error);
      toast.error("Failed to load redesign history");
    } finally {
      setLoading(false);
    }
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

      try {
        const { data, error } = await supabase
          .from("redesign_history")
          .insert({
            user_id: user.id,
            original_image_url: originalImageUrl,
            redesigned_image_url: redesignedImageUrl,
            style,
            customizations,
            is_favorite: isFavorite,
          })
          .select()
          .single();

        if (error) throw error;

        setHistory((prev) => [data, ...prev]);
        return data.id;
      } catch (error) {
        console.error("Error saving redesign:", error);
        toast.error("Failed to save redesign");
        return null;
      }
    },
    [user]
  );

  const updateFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("redesign_history")
          .update({ is_favorite: isFavorite })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setHistory((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_favorite: isFavorite } : item
          )
        );
      } catch (error) {
        console.error("Error updating favorite:", error);
        toast.error("Failed to update favorite");
      }
    },
    [user]
  );

  const deleteRedesign = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("redesign_history")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setHistory((prev) => prev.filter((item) => item.id !== id));
        toast.success("Redesign deleted");
      } catch (error) {
        console.error("Error deleting redesign:", error);
        toast.error("Failed to delete redesign");
      }
    },
    [user]
  );

  const getFavorites = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("redesign_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

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
