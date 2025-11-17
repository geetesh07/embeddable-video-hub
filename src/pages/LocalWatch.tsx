import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2, Calendar, HardDrive, Loader2, ChevronRight, Play } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EmbedDialog } from "@/components/EmbedDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

export const LocalWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["local-video", id],
    queryFn: () => api.getVideo(id!),
    enabled: !!id,
  });

  const { data: nextVideos = [] } = useQuery({
    queryKey: ["nextVideos", id],
    queryFn: () => api.getNextVideos(id!, 5),
    enabled: !!id,
  });

  const getBreadcrumbs = () => {
    const crumbs = [{ name: "Library", path: "/" }];
    if (!video?.relativePath) return crumbs;
    
    const parts = video.relativePath.split('/').slice(0, -1);
    let currentPath = video.sourceFolder;
    
    parts.forEach((part, index) => {
      if (index === 0) {
        crumbs.push({ 
          name: part, 
          path: `/?path=${encodeURIComponent(currentPath)}`
        });
      } else {
        currentPath = `${currentPath}/${part}`;
        crumbs.push({ 
          name: part, 
          path: `/?path=${encodeURIComponent(currentPath)}`
        });
      }
    });
    
    return crumbs;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const handleNextVideo = (videoId: string) => {
    navigate(`/watch/${videoId}`);
  };

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

  const subtitleTracks = video.subtitles?.map((sub) => ({
    kind: "subtitles" as const,
    label: sub.language.toUpperCase(),
    srcLang: sub.language,
    src: api.getSubtitleUrl(video.id, sub.filename),
  }));

  const videoUrl = api.getVideoStreamUrl(video.id);
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(crumb.path)}
                className="h-auto py-1 px-2 text-sm hover:text-primary"
              >
                {crumb.name}
              </Button>
            </div>
          ))}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground truncate max-w-xs">{video.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            <VideoPlayer
              videoUrl={videoUrl}
              subtitles={subtitleTracks}
            />

            <Card className="p-6 bg-gradient-card border-border/50">
              <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(video.modified).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  {formatSize(video.size)}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setEmbedDialogOpen(true)}
                  className="shadow-glow"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Get Embed Code
                </Button>
              </div>
            </Card>
          </div>

          {/* Next Videos Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Up Next</h3>
              {nextVideos.length > 0 ? (
                <div className="space-y-3">
                  {nextVideos.map((nextVideo, index) => (
                    <div
                      key={nextVideo.id}
                      className="group cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
                      onClick={() => handleNextVideo(nextVideo.id)}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-32 h-18 bg-muted rounded flex-shrink-0 overflow-hidden">
                          <img
                            src={api.getThumbnailUrl(nextVideo.id)}
                            alt={nextVideo.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-muted">
                                  <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {nextVideo.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatSize(nextVideo.size)}
                          </p>
                          {nextVideo.folder && (
                            <p className="text-xs text-muted-foreground truncate">
                              📁 {nextVideo.folder}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No more videos in this folder</p>
              )}
            </Card>

            {/* Video Details Card */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Filename:</span>
                  <p className="font-mono text-xs break-all">{video.filename}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>{video.format.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p>{formatSize(video.size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Modified:</span>
                  <p>{new Date(video.modified).toLocaleString()}</p>
                </div>
                {video.subtitles && video.subtitles.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Subtitles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {video.subtitles.map((sub) => (
                        <span
                          key={sub.filename}
                          className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                        >
                          {sub.language.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
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
