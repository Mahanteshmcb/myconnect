import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

const CommentSection = ({ postId, currentUserId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`post_comments_${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          // Simple refetch for now, can be optimized later
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          profiles:user_id (username, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (error: any) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      // The real-time subscription will handle the update, but we can also manually refetch
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2">Comments ({comments.length})</h3>

      {/* Comment Input */}
      <div className="flex items-start space-x-3">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          disabled={posting}
        />
        <Button
          onClick={handlePostComment}
          disabled={!newComment.trim() || posting}
          className="self-start"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
        </Button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{comment.profiles.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;