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
                This application uses a file-based system. Videos are automatically scanned from configured folders.
              </p>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-semibold mb-2">To add videos:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Copy your video files to the videos folder</li>
                  <li>Add subtitle files with language codes (e.g., video.en.srt)</li>
                  <li>Refresh the library to see new videos</li>
                </ol>
              </div>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-semibold mb-2">Manage Scan Paths:</p>
                <p className="text-sm">
                  Go to the <strong>Folders</strong> page to add or remove folder paths that the server scans for videos.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => navigate("/")}
                className="flex-1 shadow-glow"
              >
                Go to Library
              </Button>
              <Button
                onClick={() => navigate("/folders")}
                variant="outline"
                className="flex-1"
              >
                Manage Folders
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
