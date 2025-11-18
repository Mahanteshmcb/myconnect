import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
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
  const [postingComment, setPostingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newComment = payload.new as Comment;
            setComments((prev) => [
              {
                ...newComment,
                profiles: {
                  username: newComment.profiles?.username || "Unknown",
                  avatar_url: newComment.profiles?.avatar_url || null,
                },
              },
              ...prev,
            ]);
          }
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
          user_id,
          profiles:user_id (username, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setComments(data as Comment[]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment posted!",
      });
      // Realtime subscription will handle updating the comments list
    } catch (error: any) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <<think>**Addressing the Acknowledgment**

OK, so I've received the affirmative from the user. I'm moving forward. My last action was to provide the `CommentSection` component code and pledge to re-examine the import in `PostPage.tsx`. I believe I'm on track with resolving the import issues.


**Refining the Implementation**

Now I realize I had a slight misstep; I focused on presenting `CommentSection.tsx` but forgot to actually update `PostPage.tsx`. My oversight! I'm now integrating the corrected import and rendering the `CommentSection` component in `PostPage.tsx` to ensure everything functions properly.


**Correcting PostPage Integration**

I've realized my oversight and am rectifying it immediately. I have now updated `PostPage.tsx` to include the correct import for `CommentSection` and ensure it's rendered properly. This should address the previous issue.


</think>My apologies! I provided the content for `CommentSection.tsx` but forgot to complete the component's JSX and then update `PostPage.tsx` to correctly import and use it.

First, let's complete the `CommentSection.tsx` component.

<dyad-write path="src/components/CommentSection.tsx" description="Completing the CommentSection component with its JSX structure.">
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
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
  const [postingComment, setPostingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newComment = payload.new as Comment;
            // For new comments, we need to fetch the profile data as it's not included in the payload.new
            // This is a simplified approach; a more robust solution might involve a database function
            // to return the full comment object with profile data on insert.
            supabase.from("profiles").select("username, avatar_url").eq("id", newComment.user_id).single()
              .then(({ data: profileData }) => {
                if (profileData) {
                  setComments((prev) => [
                    {
                      ...newComment,
                      profiles: profileData,
                    },
                    ...prev,
                  ]);
                }
              })
              .catch(console.error);
          }
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
          user_id,
          profiles:user_id (username, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setComments(data as Comment[]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment posted!",
      });
      // Realtime subscription will handle updating the comments list
    } catch (error: any) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={postingComment}
        />
        <Button onClick={handlePostComment} disabled={postingComment || !newComment.trim()}>
          {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">
                  <span className="font-semibold">{comment.profiles.username}</span>{" "}
                  {comment.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;