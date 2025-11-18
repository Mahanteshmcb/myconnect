import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";

interface VideoUploadProps {
  userId: string;
  onVideoUploaded: () => void;
}

const VideoUpload = ({ userId, onVideoUploaded }: VideoUploadProps) => {
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;

    setUploading(true);
    try {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      // Create video element to get duration
      const video = document.createElement('video');
      video.src = videoPreview!;
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      const duration = Math.floor(video.duration);

      const { error: dbError } = await supabase.from("videos").insert({
        user_id: userId,
        video_url: publicUrl,
        caption: caption.trim() || null,
        duration,
      });

      if (dbError) throw dbError;

      toast({
        title: "Video uploaded!",
        description: "Your video has been shared",
      });

      setCaption("");
      clearVideo();
      onVideoUploaded();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Upload Video</h3>
      
      {videoPreview ? (
        <div className="relative mb-4">
          <video
            src={videoPreview}
            controls
            className="w-full rounded-lg max-h-96"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80"
            onClick={clearVideo}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-secondary/50 transition-colors mb-4">
          <Upload className="w-12 h-12 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to upload video</span>
          <span className="text-xs text-muted-foreground mt-1">Max 100MB</span>
          <Input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </label>
      )}

      <Textarea
        placeholder="Write a caption... (use #hashtags)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-4"
        rows={3}
      />

      <Button
        onClick={uploadVideo}
        disabled={!videoFile || uploading}
        className="w-full gradient-primary"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Video"
        )}
      </Button>
    </div>
  );
};

export default VideoUpload;