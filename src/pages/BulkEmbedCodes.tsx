import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Code2, Search, Download } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const BulkEmbedCodes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["all-videos"],
    queryFn: () => api.getVideos(),
  });

  const filteredVideos = searchQuery && videos
    ? videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos || [];

  const baseUrl = window.location.origin;

  const getEmbedCode = (videoId: string, title: string) => {
    return `<iframe src="${baseUrl}/embed/${videoId}" width="1920" height="1080" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${title}"></iframe>`;
  };

  const copyToClipboard = async (text: string, videoId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(videoId);
      toast.success("Embed code copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy. Please try again.");
      console.error("Failed to copy:", err);
    }
  };

  const copyAllEmbedCodes = async () => {
    const allCodes = filteredVideos
      .map((video) => {
        const embedCode = getEmbedCode(video.id, video.title);
        return `<!-- ${video.title} -->\n${embedCode}\n`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(allCodes);
      toast.success("All embed codes copied!");
    } catch (err) {
      toast.error("Failed to copy all codes. Please try again.");
      console.error("Failed to copy:", err);
    }
  };

  const downloadAllEmbedCodes = () => {
    const allCodes = filteredVideos
      .map((video) => {
        const embedCode = getEmbedCode(video.id, video.title);
        return `<!-- ${video.title} -->\n${embedCode}\n`;
      })
      .join("\n");

    const blob = new Blob([allCodes], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "embed-codes.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Embed codes downloaded!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary" />
              Bulk Embed Codes
            </h1>
            <p className="text-muted-foreground">
              All your videos with 1920x1080 embed codes ready to copy
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyAllEmbedCodes}
              disabled={filteredVideos.length === 0}
              className="shadow-glow"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All Codes
            </Button>
            <Button
              onClick={downloadAllEmbedCodes}
              disabled={filteredVideos.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as HTML
            </Button>
          </div>
        </div>

        <div className="relative flex-1 max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-secondary animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-card border-border/50">
            <Code2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No videos match your search query"
                : "Add videos to your library to generate embed codes"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => {
              const embedCode = getEmbedCode(video.id, video.title);
              const isCopied = copiedId === video.id;

              return (
                <Card
                  key={video.id}
                  className="p-6 bg-gradient-card border-border/50"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {video.id} • Resolution: 1920x1080
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(embedCode, video.id)}
                        className="shadow-glow"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Embed Code (1920x1080)
                      </Label>
                      <Textarea
                        value={embedCode}
                        readOnly
                        className="font-mono text-xs bg-secondary/50 min-h-[80px] resize-none"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {filteredVideos.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} with embed codes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
