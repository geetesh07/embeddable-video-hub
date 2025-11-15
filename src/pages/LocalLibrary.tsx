import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, RefreshCw, ServerCog } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoCard } from "@/components/VideoCard";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api, Video } from "@/lib/api";

export const LocalLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const navigate = useNavigate();

  const { data: videos, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["local-videos"],
    queryFn: () => api.getVideos(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: serverHealth } = useQuery({
    queryKey: ["server-health"],
    queryFn: () => api.healthCheck(),
    refetchInterval: 10000,
  });

  const filteredVideos = videos?.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.folder?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmbed = (video: Video) => {
    setSelectedVideo(video);
    setEmbedDialogOpen(true);
  };

  const handleRefresh = async () => {
    toast.info("Refreshing video list...");
    await refetch();
    toast.success("Video list updated!");
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Local Video Library</h1>
            <p className="text-muted-foreground">
              {videos?.length || 0} videos • Serving from local folders
              {serverHealth && (
                <span className="ml-2 text-primary">
                  • {serverHealth.folders} folder{serverHealth.folders !== 1 ? 's' : ''} configured
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
            >
              <ServerCog className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search videos or folders..."
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
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnail={undefined}
                duration={undefined}
                viewCount={0}
                createdAt={video.modified}
                onDelete={() => toast.info("Delete not available in local mode")}
                onEmbed={() => handleEmbed(video)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Grid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No videos found" : "No videos yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Add video folders in settings to get started"}
            </p>
            <Button onClick={() => navigate("/settings")}>
              <ServerCog className="w-4 h-4 mr-2" />
              Configure Folders
            </Button>
          </div>
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
