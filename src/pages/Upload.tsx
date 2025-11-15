import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Upload = () => {
  const navigate = useNavigate();

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

        <Card className="p-8 max-w-2xl mx-auto bg-gradient-card border-border/50">
          <div className="text-center">
            <Folder className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-4">File-Based Video System</h1>
            <div className="text-left space-y-4 text-muted-foreground">
              <p>
                This application uses a file-based system. To add videos:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Copy your video files (.mp4, .mkv, .avi, .mov, .webm) to the configured folder</li>
                <li>Add subtitle files (.srt, .vtt) with the same name as your video:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Example: <code className="bg-secondary px-2 py-1 rounded">video.en.srt</code> for English subtitles</li>
                    <li>Example: <code className="bg-secondary px-2 py-1 rounded">video.es.srt</code> for Spanish subtitles</li>
                  </ul>
                </li>
                <li>The server will automatically detect and index your videos</li>
                <li>Refresh the library to see new videos</li>
              </ol>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-semibold mb-2">Configured Folder:</p>
                <code className="text-sm">/home/runner/$REPL_SLUG/videos</code>
              </div>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="mt-8 shadow-glow"
            >
              Go to Library
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
