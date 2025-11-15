import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Folder as FolderIcon, Plus, Edit, Trash2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Folders = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: folders, isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*, videos(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("folders").insert({
        name: folderName,
        description: folderDescription,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created successfully");
      setDialogOpen(false);
      setFolderName("");
      setFolderDescription("");
    },
    onError: () => {
      toast.error("Failed to create folder");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase.from("folders").delete().eq("id", folderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete folder");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Folders</h1>
            <p className="text-muted-foreground">
              Organize your videos into folders
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-card border-border/50">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Add a new folder to organize your videos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="e.g., Course Materials"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="folder-description">Description</Label>
                  <Textarea
                    id="folder-description"
                    value={folderDescription}
                    onChange={(e) => setFolderDescription(e.target.value)}
                    placeholder="Optional description"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={() => createFolderMutation.mutate()}
                  disabled={!folderName || createFolderMutation.isPending}
                  className="w-full"
                >
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-secondary animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : folders && folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {folder.videos?.[0]?.count || 0} videos
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteFolderMutation.mutate(folder.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                {folder.description && (
                  <p className="text-sm text-muted-foreground">
                    {folder.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <FolderIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No folders yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first folder to organize videos
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-card border-border/50">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Add a new folder to organize your videos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name-empty">Folder Name</Label>
                    <Input
                      id="folder-name-empty"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="e.g., Course Materials"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="folder-description-empty">Description</Label>
                    <Textarea
                      id="folder-description-empty"
                      value={folderDescription}
                      onChange={(e) => setFolderDescription(e.target.value)}
                      placeholder="Optional description"
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={() => createFolderMutation.mutate()}
                    disabled={!folderName || createFolderMutation.isPending}
                    className="w-full"
                  >
                    Create Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};
