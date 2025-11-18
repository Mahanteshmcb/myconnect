import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePostProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePost = ({ userId, isOpen, onOpenChange }: CreatePostProps) => {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast({ title: "Error", description: "Please select an image.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("posts").upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(fileName);
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        caption,
        image_url: publicUrl,
      });
      if (insertError) throw insertError;

      toast({ title: "Success!", description: "Your post has been shared." });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      closeDialog();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setCaption("");
    removeImage();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-8 cursor-pointer hover:bg-secondary/50 transition-colors">
              <ImagePlus className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload an image</span>
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={loading || !imageFile} className="w-full gradient-primary shadow-glow">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing...</> : "Share"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;