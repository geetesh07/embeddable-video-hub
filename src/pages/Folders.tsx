import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Folder as FolderIcon, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Folders = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: folders, isLoading } = useQuery({
    queryKey: ["configFolders"],
    queryFn: () => api.getConfigFolders(),
  });

  const addFolderMutation = useMutation({
    mutationFn: (path: string) => api.addFolder(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configFolders"] });
      toast.success("Folder added successfully");
      setDialogOpen(false);
      setFolderPath("");
    },
    onError: () => {
      toast.error("Failed to add folder");
    },
  });

  const removeFolderMutation = useMutation({
    mutationFn: (path: string) => api.removeFolder(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configFolders"] });
      toast.success("Folder removed from scanning");
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to remove folder");
    },
  });

  const handleAddFolder = () => {
    if (!folderPath.trim()) {
      toast.error("Please enter a folder path");
      return;
    }
    addFolderMutation.mutate(folderPath);
  };

  const handleRemoveFolder = (path: string) => {
    setFolderToDelete(path);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Scan Paths</h1>
            <p className="text-muted-foreground">
              Configure which folders the server scans for videos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Add Folder Path
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-card border-border/50">
              <DialogHeader>
                <DialogTitle>Add Folder Path</DialogTitle>
                <DialogDescription>
                  Enter the full path to a folder containing videos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-path">Folder Path</Label>
                  <Input
                    id="folder-path"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="/home/runner/$REPL_SLUG/videos/movies"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: /home/runner/$REPL_SLUG/videos/my-collection
                  </p>
                </div>
                <Button
                  onClick={handleAddFolder}
                  disabled={!folderPath.trim() || addFolderMutation.isPending}
                  className="w-full"
                >
                  Add Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-secondary animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : folders && folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Card key={folder} className="p-6 bg-gradient-card border-border/50">
                <div className="flex items-start gap-4">
                  <FolderIcon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={folder}>
                      {folder.split('/').pop() || folder}
                    </p>
                    <p className="text-sm text-muted-foreground truncate" title={folder}>
                      {folder}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFolder(folder)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-card border-border/50">
            <FolderIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No folders configured</h3>
            <p className="text-muted-foreground mb-4">
              Add a folder path to start scanning for videos
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Folder Path
            </Button>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Folder Path?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop scanning this folder for videos. The files will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeFolderMutation.mutate(folderToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Path
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
