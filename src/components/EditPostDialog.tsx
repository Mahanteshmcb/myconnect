import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createMentionNotifications } from "@/lib/mentionUtils";
import { processHashtags } from "@/lib/hashtagUtils";

interface EditPostDialogProps {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: () => void;
}

const EditPostDialog = ({ post, open, onOpenChange, onPostUpdated }: EditPostDialogProps) => {
  const [caption, setCaption] = useState(post.caption || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (caption.length > 2000) {
      toast({
        title: "Caption too long",
        description: "Caption must be less than 2000 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ caption })
        .eq("id", post.id);

      if (error) throw error;

      await createMentionNotifications(caption, post.user_id, post.id, "post_mention");
      await processHashtags(caption, post.id);

      toast({ title: "Post updated successfully!" });
      onPostUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            placeholder="Edit your caption..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;