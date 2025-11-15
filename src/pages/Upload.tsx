import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, File, X, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Upload = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFiles, setSubtitleFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.includes("video") || file.name.endsWith(".mkv")) {
        setVideoFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast.error("Please select a valid video file (.mp4 or .mkv)");
      }
    }
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSubtitleFiles((prev) => [...prev, ...files]);
  };

  const removeSubtitle = (index: number) => {
    setSubtitleFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadVideo = async () => {
    if (!videoFile || !title) {
      toast.error("Please provide a video file and title");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Upload video file
      const videoPath = `${Date.now()}_${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;
      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(videoPath);

      // Create video record
      const { data: videoData, error: dbError } = await supabase
        .from("videos")
        .insert({
          title,
          description,
          file_name: videoFile.name,
          file_size: videoFile.size,
          format: videoFile.name.endsWith(".mkv") ? "mkv" : "mp4",
          storage_path: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setUploadProgress(70);

      // Upload subtitles
      if (subtitleFiles.length > 0 && videoData) {
        for (let i = 0; i < subtitleFiles.length; i++) {
          const subtitleFile = subtitleFiles[i];
          const subtitlePath = `${Date.now()}_${subtitleFile.name}`;
          
          const { error: subtitleError } = await supabase.storage
            .from("subtitles")
            .upload(subtitlePath, subtitleFile);

          if (subtitleError) throw subtitleError;

          const { data: { publicUrl: subtitleUrl } } = supabase.storage
            .from("subtitles")
            .getPublicUrl(subtitlePath);

          // Extract language from filename (e.g., "subtitle.en.srt" -> "en")
          const langMatch = subtitleFile.name.match(/\.([a-z]{2})\./i);
          const language = langMatch ? langMatch[1] : "en";

          await supabase.from("subtitles").insert({
            video_id: videoData.id,
            language,
            label: language.toUpperCase(),
            file_name: subtitleFile.name,
            storage_path: subtitleUrl,
          });
        }
      }

      setUploadProgress(100);
      toast.success("Video uploaded successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
          <p className="text-muted-foreground mb-8">
            Upload your video files and make them available for embedding
          </p>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <Label htmlFor="video-upload" className="block mb-4">
                Video File <span className="text-destructive">*</span>
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  id="video-upload"
                  type="file"
                  accept="video/mp4,video/x-matroska,.mkv"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {videoFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MP4 or MKV (max 5GB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 space-y-4">
              <div>
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <Label htmlFor="subtitle-upload" className="block mb-4">
                Subtitles (Optional)
              </Label>
              <input
                id="subtitle-upload"
                type="file"
                accept=".srt,.vtt"
                multiple
                onChange={handleSubtitleChange}
                className="hidden"
              />
              <label
                htmlFor="subtitle-upload"
                className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload subtitle files</p>
                <p className="text-xs text-muted-foreground">
                  .srt or .vtt format
                </p>
              </label>
              {subtitleFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {subtitleFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSubtitle(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {uploading && (
              <Card className="p-6 bg-gradient-card border-border/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={uploadVideo}
                disabled={!videoFile || !title || uploading}
                className="flex-1 shadow-glow"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload Video
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
