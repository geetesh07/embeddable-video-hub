import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderTree, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Folders = () => {
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
            <FolderTree className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-4">Folder-Based Organization</h1>
            <div className="text-left space-y-4 text-muted-foreground">
              <p>
                Videos are organized by the folder structure on your file system.
              </p>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-semibold mb-2">How it works:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Create folders in your configured video directory</li>
                  <li>Place videos in subfolders to organize them</li>
                  <li>The server automatically scans all subdirectories</li>
                  <li>Videos appear in the library grouped by their folder path</li>
                </ul>
              </div>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-semibold mb-2">Example Structure:</p>
                <pre className="text-sm mt-2 text-left">
{`videos/
├── Movies/
│   ├── action/
│   │   └── movie1.mp4
│   └── comedy/
│       └── movie2.mp4
└── TV Shows/
    └── series1/
        └── episode1.mkv`}
                </pre>
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
