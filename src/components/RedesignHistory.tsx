import { useEffect } from "react";
import { Heart, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRedesignHistory, RedesignHistoryItem } from "@/hooks/useRedesignHistory";
import { Skeleton } from "@/components/ui/skeleton";

interface RedesignHistoryProps {
  onSelectRedesign?: (item: RedesignHistoryItem) => void;
}

export const RedesignHistory = ({ onSelectRedesign }: RedesignHistoryProps) => {
  const { history, loading, fetchHistory, updateFavorite, deleteRedesign } = useRedesignHistory();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleToggleFavorite = async (item: RedesignHistoryItem) => {
    await updateFavorite(item.id, !item.is_favorite);
  };

  if (loading && history.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="w-full h-48 mb-4" />
              <Skeleton className="w-24 h-4 mb-2" />
              <Skeleton className="w-32 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No redesigns yet. Create your first redesign to see it here!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {history.map((item) => (
        <Card
          key={item.id}
          className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
          onClick={() => onSelectRedesign?.(item)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={item.redesigned_image_url}
                alt={`${item.style} redesign`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      item.is_favorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete redesign?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this redesign from your history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteRedesign(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="capitalize">
                  {item.style.replace("-", " ")}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.created_at)}
                </div>
              </div>
              {Object.keys(item.customizations || {}).length > 0 && (
                <p className="text-xs text-muted-foreground">Custom settings applied</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
