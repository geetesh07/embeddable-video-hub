import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useState } from "react";

export const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => api.getVideo(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="w-full aspect-video bg-secondary rounded-lg" />
            <div className="h-8 bg-secondary rounded w-3/4" />
            <div className="h-4 bg-secondary rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Video not found</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const subtitleTracks = video?.subtitles?.map((sub) => ({
    kind: "subtitles" as const,
    label: sub.language.toUpperCase(),
    srcLang: sub.language,
    src: api.getSubtitleUrl(id!, sub.filename),
  }));

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer
              videoUrl={api.getVideoStreamUrl(id!)}
              subtitles={subtitleTracks}
              poster={undefined}
            />

            <Card className="p-6 bg-gradient-card border-border/50">
              <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  Modified: {new Date(video.modified).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-3 mb-6">
                <Button
                  onClick={() => setEmbedDialogOpen(true)}
                  className="shadow-glow"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Get Embed Code
                </Button>
              </div>

              <div>
                <h2 className="font-semibold mb-2">File Path</h2>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                  {video.relativePath || video.filename}
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <h2 className="font-semibold mb-4">Video Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Name</span>
                  <span className="font-medium truncate ml-2">
                    {video.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium uppercase">{video.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">
                    {(video.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </Card>

            {video.subtitles && video.subtitles.length > 0 && (
              <Card className="p-6 bg-gradient-card border-border/50">
                <h2 className="font-semibold mb-4">Available Subtitles</h2>
                <div className="space-y-2">
                  {video.subtitles.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <span className="text-sm font-medium">{sub.language.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {sub.language}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <EmbedDialog
        open={embedDialogOpen}
        onOpenChange={setEmbedDialogOpen}
        videoId={video.id}
        videoTitle={video.title}
      />
    </div>
  );
};
