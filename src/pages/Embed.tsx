import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "@/components/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";

export const Embed = () => {
  const { id } = useParams();

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: subtitles } = useQuery({
    queryKey: ["subtitles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtitles")
        .select("*")
        .eq("video_id", id);

      if (error) throw error;
      return data;
    },
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

  const subtitleTracks = subtitles?.map((sub) => ({
    kind: "subtitles" as const,
    label: sub.label,
    srcLang: sub.language,
    src: sub.storage_path,
  }));

  return (
    <div className="w-full h-screen bg-black">
      <VideoPlayer
        videoUrl={video.storage_path}
        subtitles={subtitleTracks}
        poster={video.thumbnail_path}
      />
    </div>
  );
};
