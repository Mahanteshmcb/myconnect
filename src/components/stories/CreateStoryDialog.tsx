import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus } from "lucide-react";

interface CreateStoryDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateStoryDialog = ({ userId, open, onOpenChange, onCreated }: CreateStoryDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/") && !selectedFile.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/stories/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("stories").upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("stories").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("stories").insert({
        user_id: userId,
        media_url: publicUrl,
        media_type: file.type,
      });

      if (insertError) throw insertError;

      toast({
        title: "Story posted!",
      });

      onOpenChange(false);
      setFile(null);
      setPreview(null);
      onCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="story-file">Upload Image or Video</Label>
            <Input
              id="story-file"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {preview && (
            <div className="relative rounded-lg overflow-hidden">
              {file?.type.startsWith("image/") ? (
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
              ) : (
                <video src={preview} className="w-full h-64 object-cover" controls />
              )}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full gradient-primary shadow-glow"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                Post Story
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryDialog;