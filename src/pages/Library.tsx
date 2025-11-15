import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, Plus, Folder as FolderIcon, ChevronRight, Home } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoCard } from "@/components/VideoCard";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const { data: browseData, isLoading, refetch } = useQuery({
    queryKey: ["browse", currentPath],
    queryFn: () => api.browseFolders(currentPath),
  });

  const folders = browseData?.folders || [];
  const videos = browseData?.videos || [];
  const noFoldersConfigured = browseData?.error?.includes('No folders configured');

  const filteredVideos = searchQuery 
    ? videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleGoHome = () => {
    setCurrentPath(undefined);
  };

  const handleEmbed = (video: any) => {
    setSelectedVideo(video);
    setEmbedDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Library</h1>
            <p className="text-muted-foreground">
              Browse your video collection
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/upload")}
            className="shadow-glow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Video
          </Button>
        </div>

        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          {currentPath && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate max-w-md">
                {currentPath}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-secondary animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : noFoldersConfigured ? (
          <Card className="p-12 text-center bg-gradient-card border-border/50">
            <FolderIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Folders Configured</h3>
            <p className="text-muted-foreground mb-4">
              Add a folder path in the Folders page to start scanning for videos
            </p>
            <Button onClick={() => navigate("/folders")}>
              <Plus className="w-4 h-4 mr-2" />
              Manage Folder Paths
            </Button>
          </Card>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Folders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {folders.map((folder) => (
                    <Card
                      key={folder.path}
                      onClick={() => handleFolderClick(folder.path)}
                      className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors bg-gradient-card border-border/50"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FolderIcon className="w-12 h-12 text-primary" />
                        <span className="text-sm font-medium truncate w-full text-center">
                          {folder.name}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {filteredVideos.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Videos {searchQuery && `(${filteredVideos.length} results)`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      thumbnail={undefined}
                      duration={undefined}
                      viewCount={undefined}
                      createdAt={video.modified}
                      onDelete={() => toast.info("Delete not supported for files")}
                      onEmbed={() => handleEmbed(video)}
                    />
                  ))}
                </div>
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                  <Grid className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first video to get started
                </p>
                <Button onClick={() => navigate("/upload")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {selectedVideo && (
        <EmbedDialog
          open={embedDialogOpen}
          onOpenChange={setEmbedDialogOpen}
          videoId={selectedVideo.id}
          videoTitle={selectedVideo.title}
        />
      )}
    </div>
  );
};
