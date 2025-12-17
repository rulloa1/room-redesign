import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, ArrowLeft, Plus, Sparkles, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { BeforeAfter } from "@/components/BeforeAfter";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { RoomCustomizations, RoomCustomizationOptions, getDefaultCustomizations } from "@/components/RoomCustomizations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getEdgeFunctionErrorMessage } from "@/lib/getEdgeFunctionErrorMessage";
import { toast } from "sonner";


interface ProjectData {
  id: string;
  name: string;
  style: string;
}

interface ProjectRoom {
  id: string;
  room_type: string;
  original_image: string;
  redesigned_image: string | null;
}

const roomTypes = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Home Office" },
  { value: "dining_room", label: "Dining Room" },
];

const styleNames: Record<string, string> = {
  modern: "Modern",
  scandinavian: "Scandinavian",
  industrial: "Industrial",
  bohemian: "Bohemian",
  minimalist: "Minimalist",
  traditional: "Traditional",
};

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [rooms, setRooms] = useState<ProjectRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRoom, setProcessingRoom] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoomType, setNewRoomType] = useState("living_room");
  const [newRoomImage, setNewRoomImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ProjectRoom | null>(null);
  const [customizations, setCustomizations] = useState<RoomCustomizationOptions>(getDefaultCustomizations());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProject();
    }
  }, [user, id]);

  const fetchProject = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: roomsData, error: roomsError } = await supabase
        .from("project_rooms")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true });

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
      navigate("/portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewRoomImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAddRoom = async () => {
    if (!newRoomImage) {
      toast.error("Please upload an image");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("project_rooms")
        .insert({
          project_id: id,
          room_type: newRoomType,
          original_image: newRoomImage,
        })
        .select()
        .single();

      if (error) throw error;

      setRooms([...rooms, data]);
      setDialogOpen(false);
      setNewRoomImage(null);
      toast.success("Room added!");
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error("Failed to add room");
    }
  };

  const handleRedesignRoom = async (room: ProjectRoom) => {
    if (!project) return;

    setProcessingRoom(room.id);

    try {
      const { data, error, response } = await supabase.functions.invoke("redesign-room", {
        body: {
          image: room.original_image,
          style: project.style,
          customizations: {
            wallColor: customizations.wallColor,
            wallColorCustom: customizations.wallColorCustom,
            trimStyle: customizations.trimStyle,
            trimColor: customizations.trimColor,
            additionalDetails: customizations.additionalDetails,
          },
        },
      });

      if (error) {
        const parsed = await getEdgeFunctionErrorMessage(error, response);
        throw new Error(parsed.message);
      }
      if (data?.error) throw new Error(data.error);

      if (data.redesignedImage) {
        const { error: updateError } = await supabase
          .from("project_rooms")
          .update({ redesigned_image: data.redesignedImage })
          .eq("id", room.id);

        if (updateError) throw updateError;

        setRooms(
          rooms.map((r) =>
            r.id === room.id ? { ...r, redesigned_image: data.redesignedImage } : r
          )
        );
        // Reset customizations after successful redesign
        setCustomizations(getDefaultCustomizations());
        toast.success("Room redesigned!");
      }
    } catch (error) {
      console.error("Redesign error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redesign");
    } finally {
      setProcessingRoom(null);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;

    try {
      const { error } = await supabase
        .from("project_rooms")
        .delete()
        .eq("id", roomId);

      if (error) throw error;
      setRooms(rooms.filter((r) => r.id !== roomId));
      if (selectedRoom?.id === roomId) setSelectedRoom(null);
      toast.success("Room deleted");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) return null;

  const getRoomLabel = (type: string) =>
    roomTypes.find((r) => r.value === type)?.label || type;

  return (
    <div className="min-h-screen gradient-hero">
      <LoadingOverlay isVisible={!!processingRoom} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-display font-semibold text-foreground">
              RoomRevive
            </span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Portfolio
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {styleNames[project.style]} Style • {rooms.length} room
                {rooms.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Room to Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={newRoomType} onValueChange={setNewRoomType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Photo</Label>
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={newRoomImage}
                      onClear={() => setNewRoomImage(null)}
                    />
                  </div>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleAddRoom}
                    disabled={!newRoomImage}
                  >
                    Add Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                No rooms yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Add your first room to start redesigning
              </p>
              <Button variant="hero" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Room List */}
              <div className="lg:col-span-1 space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedRoom?.id === room.id
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={room.original_image}
                        alt={getRoomLabel(room.room_type)}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {getRoomLabel(room.room_type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {room.redesigned_image ? "Redesigned" : "Original"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!room.redesigned_image && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedesignRoom(room);
                            }}
                            disabled={!!processingRoom}
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Room Preview */}
              <div className="lg:col-span-2">
                {selectedRoom ? (
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-display font-semibold text-foreground">
                        {getRoomLabel(selectedRoom.room_type)}
                      </h3>
                      {!selectedRoom.redesigned_image && (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleRedesignRoom(selectedRoom)}
                          disabled={!!processingRoom}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Redesign
                        </Button>
                      )}
                    </div>
                    
                    {/* Customizations panel - only show for rooms not yet redesigned */}
                    {!selectedRoom.redesigned_image && (
                      <div className="mb-4">
                        <RoomCustomizations
                          value={customizations}
                          onChange={setCustomizations}
                        />
                      </div>
                    )}
                    
                    {selectedRoom.redesigned_image ? (
                      <BeforeAfter
                        beforeImage={selectedRoom.original_image}
                        afterImage={selectedRoom.redesigned_image}
                        styleName={styleNames[project.style]}
                      />
                    ) : (
                      <img
                        src={selectedRoom.original_image}
                        alt={getRoomLabel(selectedRoom.room_type)}
                        className="w-full rounded-xl"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-card border border-border text-center">
                    <p className="text-muted-foreground">
                      Select a room to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Project;
