import { useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  videoTitle: string;
}

export const EmbedDialog = ({
  open,
  onOpenChange,
  videoId,
  videoTitle,
}: EmbedDialogProps) => {
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;

  const iframeCode = `<iframe src="${baseUrl}/embed/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${videoTitle}"></iframe>`;
  
  const directUrl = `${baseUrl}/watch/${videoId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Embed Video
          </DialogTitle>
          <DialogDescription>
            Copy the embed code or direct link to share this video
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">Iframe Embed</TabsTrigger>
            <TabsTrigger value="direct">Direct Link</TabsTrigger>
          </TabsList>
          <TabsContent value="iframe" className="space-y-4">
            <div className="space-y-2">
              <Label>Embed Code</Label>
              <div className="relative">
                <Input
                  value={iframeCode}
                  readOnly
                  className="pr-12 font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => copyToClipboard(iframeCode)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="aspect-video bg-background rounded border border-border overflow-hidden">
                <iframe
                  src={`${baseUrl}/embed/${videoId}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={videoTitle}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="direct" className="space-y-4">
            <div className="space-y-2">
              <Label>Direct Video URL</Label>
              <div className="relative">
                <Input
                  value={directUrl}
                  readOnly
                  className="pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => copyToClipboard(directUrl)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link to allow others to watch the video directly
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
