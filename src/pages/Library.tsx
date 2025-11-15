import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Grid, List, Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoCard } from "@/components/VideoCard";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete video");
    },
  });

  const filteredVideos = videos?.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Manage and share your video collection
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
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail_path}
                duration={video.duration}
                viewCount={video.view_count}
                createdAt={video.created_at}
                onDelete={() => deleteVideoMutation.mutate(video.id)}
                onEmbed={() => handleEmbed(video)}
              />
            ))}
          </div>
        ) : (
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
