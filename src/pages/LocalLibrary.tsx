import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Folder as FolderIcon, ChevronRight, Home, Code2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { VideoCard } from "@/components/VideoCard";
import { FolderEmbedDialog } from "@/components/FolderEmbedDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const LocalLibrary = () => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<Array<{ name: string; path: string | null }>>([
    { name: "Home", path: null }
  ]);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  const { data: browseData, isLoading } = useQuery({
    queryKey: ["browse", currentPath],
    queryFn: () => api.browseFolders(currentPath || undefined),
  });

  const handleFolderClick = (folder: { name: string; path: string }) => {
    setCurrentPath(folder.path);
    setPathHistory([...pathHistory, { name: folder.name, path: folder.path }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = pathHistory[index].path;
    setCurrentPath(newPath);
    setPathHistory(pathHistory.slice(0, index + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Local Video Library</h1>
            <p className="text-muted-foreground">
              Browse your local video folders
            </p>
          </div>
        </div>

        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 mb-6">
          {pathHistory.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <Button
                variant={index === pathHistory.length - 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {index === 0 ? <Home className="w-4 h-4 mr-2" /> : <FolderIcon className="w-4 h-4 mr-2" />}
                {item.name}
              </Button>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Folders */}
            {browseData?.folders && browseData.folders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Folders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {browseData.folders.map((folder) => (
                    <Card
                      key={folder.path}
                      className="p-4 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <div className="flex items-center gap-3">
                        <FolderIcon className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{folder.name}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {browseData?.videos && browseData.videos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Videos</h2>
                  <Button
                    onClick={() => setEmbedDialogOpen(true)}
                    variant="outline"
                    className="shadow-glow"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Get Embed Codes for This Folder
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {browseData.videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      thumbnail={undefined}
                      duration={undefined}
                      viewCount={0}
                      createdAt={video.modified}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(!browseData?.folders || browseData.folders.length === 0) &&
              (!browseData?.videos || browseData.videos.length === 0) && (
                <div className="text-center py-16">
                  <FolderIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No content found</h3>
                  <p className="text-muted-foreground">
                    This folder is empty or no folders are configured
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      <FolderEmbedDialog
        open={embedDialogOpen}
        onOpenChange={setEmbedDialogOpen}
        videos={browseData?.videos || []}
        folderPath={currentPath}
      />
    </div>
  );
};
