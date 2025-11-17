import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  subtitles?: Array<{
    kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    label: string;
    srcLang: string;
    src: string;
  }>;
  poster?: string;
}

export const VideoPlayer = ({ videoUrl, subtitles = [], poster }: VideoPlayerProps) => {
  const plyrRef = useRef<any>(null);

  useEffect(() => {
    const player = plyrRef.current?.plyr;
    if (!player) return;

    // Stop video when it ends - prevent replay
    const handleEnded = () => {
      player.stop();
    };

    // Add click-to-pause functionality on the video element
    const handleVideoClick = (e: MouseEvent) => {
      // Don't toggle if clicking on controls
      const target = e.target as HTMLElement;
      if (target.closest('.plyr__controls')) return;
      
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    };

    player.on('ended', handleEnded);
    
    // Find the video element and add click handler
    const videoElement = player.elements.wrapper?.querySelector('video');
    if (videoElement) {
      videoElement.addEventListener('click', handleVideoClick);
    }

    return () => {
      player.off('ended', handleEnded);
      if (videoElement) {
        videoElement.removeEventListener('click', handleVideoClick);
      }
    };
  }, []);

  const plyrProps = {
    ref: plyrRef,
    source: {
      type: "video" as const,
      sources: [
        {
          src: videoUrl,
          type: videoUrl.endsWith(".mkv") ? "video/x-matroska" : "video/mp4",
        },
      ],
      tracks: subtitles,
      poster: poster,
    },
    options: {
      autoplay: false,
      loop: { active: false },
      preload: 'auto',
      keyboard: { 
        focused: true, 
        global: true 
      },
      tooltips: { 
        controls: true, 
        seek: true 
      },
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["captions", "quality", "speed"],
      quality: {
        default: 1080,
        options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
      },
      captions: {
        active: true,
        update: true,
      },
      i18n: {
        restart: "Restart",
        rewind: "Rewind {seektime}s",
        play: "Play",
        pause: "Pause",
        fastForward: "Forward {seektime}s",
        seek: "Seek",
        seekLabel: "{currentTime} of {duration}",
        played: "Played",
        buffered: "Buffered",
        currentTime: "Current time",
        duration: "Duration",
        volume: "Volume",
        mute: "Mute",
        unmute: "Unmute",
        enableCaptions: "Enable captions",
        disableCaptions: "Disable captions",
        download: "Download",
        enterFullscreen: "Enter fullscreen",
        exitFullscreen: "Exit fullscreen",
        frameTitle: "Player for {title}",
        captions: "Captions",
        settings: "Settings",
        pip: "PIP",
        menuBack: "Go back to previous menu",
        speed: "Speed",
        normal: "Normal",
        quality: "Quality",
        loop: "Loop",
      },
    },
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
      <Plyr {...plyrProps} />
      <div className="text-xs text-gray-400 mt-2 px-2">
        💡 Click video to play/pause • Space to pause • ← → to seek • ↑ ↓ for volume • F for fullscreen
      </div>
    </div>
  );
};
