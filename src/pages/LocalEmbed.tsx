import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "@/components/VideoPlayer";
import { api } from "@/lib/api";

export const LocalEmbed = () => {
  const { id } = useParams();

  const { data: video, isLoading } = useQuery({
    queryKey: ["local-video", id],
    queryFn: () => api.getVideo(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white">
        <p>Video not found</p>
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

  return (
    <div className="w-full h-screen bg-black">
      <VideoPlayer
        videoUrl={videoUrl}
        subtitles={subtitleTracks}
      />
    </div>
  );
};
