import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, FolderOpen, Trash2, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  style: string;
  created_at: string;
  room_count?: number;
}

const styleNames: Record<string, string> = {
  modern: "Modern",
  scandinavian: "Scandinavian",
  industrial: "Industrial",
  bohemian: "Bohemian",
  minimalist: "Minimalist",
  traditional: "Traditional",
};

const Portfolio = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectStyle, setNewProjectStyle] = useState("modern");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_rooms(id)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const projectsWithCount = data?.map((p) => ({
        ...p,
        room_count: p.project_rooms?.length || 0,
      })) || [];

      setProjects(projectsWithCount);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: newProjectName,
          style: newProjectStyle,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Project created!");
      setDialogOpen(false);
      setNewProjectName("");
      navigate(`/project/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
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
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                My Portfolio
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your room redesign projects
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="My Dream Home"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-style">Design Style</Label>
                    <Select
                      value={newProjectStyle}
                      onValueChange={setNewProjectStyle}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(styleNames).map(([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleCreateProject}
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                No projects yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to start redesigning rooms
              </p>
              <Button variant="hero" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {styleNames[project.style]} • {project.room_count} room
                        {project.room_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Project
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
