import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, X } from "lucide-react";

interface CreateGroupPostProps {
  userId: string;
  groupId: string;
  onPostCreated: () => void;
}

const CreateGroupPost = ({ userId, groupId, onPostCreated }: CreateGroupPostProps) => {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please select an image file", variant: "destructive" });
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
      toast({ title: "Error", description: "Please select an image", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `group-posts/${groupId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("group-media").upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("group-media").getPublicUrl(fileName);
      const { error: insertError } = await supabase.from("group_posts").insert({
        user_id: userId,
        group_id: groupId,
        caption,
        image_url: publicUrl,
      });
      if (insertError) throw insertError;

      toast({ title: "Success!", description: "Your post has been shared in the group" });
      setCaption("");
      removeImage();
      onPostCreated();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="my-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share something with the group..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => document.getElementById("group-image-upload")?.click()}>
              <ImagePlus className="w-4 h-4 mr-2" />
              {imageFile ? "Change Image" : "Add Image"}
            </Button>
            <input id="group-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button type="submit" disabled={loading || !imageFile} className="gradient-primary">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateGroupPost;