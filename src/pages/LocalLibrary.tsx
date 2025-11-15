import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, RefreshCw, ServerCog, ChevronDown, ChevronRight, Folder, SortAsc } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoCard } from "@/components/VideoCard";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api, Video } from "@/lib/api";

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'folder-asc';

export const LocalLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('folder-asc');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
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

  // Group and sort videos
  const groupedVideos = useMemo(() => {
    if (!filteredVideos) return new Map<string, Video[]>();

    // Sort videos based on selected option
    let sortedVideos = [...filteredVideos];
    
    switch (sortBy) {
      case 'name-asc':
        sortedVideos.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        sortedVideos.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'date-asc':
        sortedVideos.sort((a, b) => new Date(a.modified).getTime() - new Date(b.modified).getTime());
        break;
      case 'date-desc':
        sortedVideos.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
        break;
      case 'folder-asc':
        sortedVideos.sort((a, b) => {
          const folderA = a.folder || 'Root';
          const folderB = b.folder || 'Root';
          if (folderA !== folderB) return folderA.localeCompare(folderB);
          return a.title.localeCompare(b.title);
        });
        break;
    }

    // Group by folder
    const grouped = new Map<string, Video[]>();
    sortedVideos.forEach(video => {
      const folderName = video.folder || 'Root';
      if (!grouped.has(folderName)) {
        grouped.set(folderName, []);
      }
      grouped.get(folderName)!.push(video);
    });

    // Sort folder names alphabetically
    return new Map([...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [filteredVideos, sortBy]);

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  };

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

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search videos or folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[200px]" data-testid="select-sort">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="folder-asc">Folder (A-Z)</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" data-testid="button-grid-view">
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-list-view">
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
          <div className="space-y-8">
            {Array.from(groupedVideos.entries()).map(([folderName, folderVideos]) => {
              const isCollapsed = collapsedFolders.has(folderName);
              
              return (
                <div key={folderName} className="space-y-4">
                  <button
                    onClick={() => toggleFolder(folderName)}
                    className="flex items-center gap-2 text-xl font-semibold hover-elevate active-elevate-2 w-full p-3 rounded-md"
                    data-testid={`button-folder-${folderName}`}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <Folder className="w-5 h-5 text-primary" />
                    <span>{folderName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({folderVideos.length} video{folderVideos.length !== 1 ? 's' : ''})
                    </span>
                  </button>
                  
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pl-7">
                      {folderVideos.map((video) => (
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
                  )}
                </div>
              );
            })}
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
