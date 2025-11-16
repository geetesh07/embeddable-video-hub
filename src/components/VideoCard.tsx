import { Video, Play, Clock, Eye, MoreVertical, Check, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  viewCount: number;
  createdAt: string;
  onDelete?: () => void;
  onEmbed?: () => void;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  duration,
  viewCount,
  onDelete,
  onEmbed,
}: VideoCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [thumbnailError, setThumbnailError] = useState(false);

  // Get progress for this video
  const { data: progress } = useQuery({
    queryKey: ['progress', id],
    queryFn: () => api.getProgress(id),
  });

  // Toggle completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress?.completed) {
        return api.resetProgress(id);
      } else {
        return api.markComplete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', id] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const thumbnailUrl = api.getThumbnailUrl(id);

  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer">
      <div
        className="relative aspect-video bg-secondary overflow-hidden"
        onClick={() => navigate(`/watch/${id}`)}
      >
        {!thumbnailError ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setThumbnailError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Completion badge */}
        {progress?.completed && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Complete
          </div>
        )}

        {/* Watched badge */}
        {progress?.watched && !progress?.completed && (
          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            In Progress
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(duration)}
          </div>
        )}

        {/* Progress bar */}
        {progress && progress.progress > 0 && progress.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/watch/${id}`)}>
                <Play className="w-4 h-4 mr-2" />
                Watch
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompleteMutation.mutate();
                }}
              >
                {progress?.completed ? (
                  <>
                    <Circle className="w-4 h-4 mr-2" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </DropdownMenuItem>
              {onEmbed && (
                <DropdownMenuItem onClick={onEmbed}>
                  <Video className="w-4 h-4 mr-2" />
                  Get Embed Code
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {viewCount} views
          </span>
          {progress && progress.progress > 0 && (
            <span>• {Math.round(progress.progress)}% watched</span>
          )}
        </div>
      </div>
    </Card>
  );
};
