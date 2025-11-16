import { useState } from "react";
import { Copy, Check, Code2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Video } from "@/lib/api";

interface FolderEmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: Video[];
  folderPath: string | null;
}

export const FolderEmbedDialog = ({
  open,
  onOpenChange,
  videos,
  folderPath,
}: FolderEmbedDialogProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getEmbedCode = (videoId: string, title: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
    const allCodes = videos
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
    const allCodes = videos
      .map((video) => {
        const embedCode = getEmbedCode(video.id, video.title);
        return `<!-- ${video.title} -->\n${embedCode}\n`;
      })
      .join("\n");

    const blob = new Blob([allCodes], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const folderName = folderPath?.split("/").pop() || "folder";
    a.download = `${folderName}-embed-codes.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Embed codes downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Embed Codes for This Folder
          </DialogTitle>
          <DialogDescription>
            {videos.length} video{videos.length !== 1 ? "s" : ""} in {folderPath || "Home"} folder - All codes are 1920x1080
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={copyAllEmbedCodes}
            disabled={videos.length === 0}
            className="shadow-glow"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy All Codes
          </Button>
          <Button
            onClick={downloadAllEmbedCodes}
            disabled={videos.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as HTML
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {videos.map((video) => {
              const embedCode = getEmbedCode(video.id, video.title);
              const isCopied = copiedId === video.id;

              return (
                <Card
                  key={video.id}
                  className="p-4 bg-gradient-card border-border/50"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {video.filename} • 1920x1080
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
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Embed Code
                      </Label>
                      <Textarea
                        value={embedCode}
                        readOnly
                        className="font-mono text-xs bg-secondary/50 min-h-[60px] resize-none"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
