import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface VideoCommentsProps {
  videoId: string;
  currentUserId: string;
  onUpdate: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const VideoComments = ({ videoId, currentUserId, onUpdate }: VideoCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("video_comments")
      .select("*, profiles:user_id(username, avatar_url)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("video_comments").insert({
        video_id: videoId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-border p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !newComment.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles.avatar_url || undefined} />
              <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-secondary rounded-lg p-2">
                <p className="font-semibold text-sm">{comment.profiles.username}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoComments;