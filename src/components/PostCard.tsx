import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import MentionText from "./MentionText"; // Import MentionText
import { createMentionNotifications } from "@/lib/mentionUtils"; // Import the utility

interface PostCardProps {
  post: any;
  currentUserId: string;
  onUpdate: () => void;
}

const PostCard = ({ post, currentUserId, onUpdate }: PostCardProps) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const isLiked = post.likes.some((like: any) => like.user_id === currentUserId);
  const likesCount = post.likes.length;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: post.id, user_id: currentUserId });

        if (post.user_id !== currentUserId) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            type: "like",
            content: "liked your post",
            actor_id: currentUserId,
            related_id: post.id,
          });
        }
      }
      onUpdate();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // Validate comment length (1000 chars max)
    if (comment.trim().length > 1000) {
      toast({
        title: "Comment too long",
        description: "Comment must be less than 1000 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: commentData, error: insertError } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: comment.trim(),
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Create notifications for mentions in the comment
      if (commentData?.id) {
        await createMentionNotifications(comment.trim(), currentUserId, post.id, "comment_mention");
      }

      if (post.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "comment",
          content: "commented on your post",
          actor_id: currentUserId,
          related_id: post.id,
        });
      }

      setComment("");
      onUpdate();
      toast({
        title: "Comment added!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-elegant border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.profiles.username}`}>
            <Avatar className="border-2 border-primary/20 hover:border-primary transition-colors">
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.profiles.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link
              to={`/profile/${post.profiles.username}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              {post.profiles.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <div className="relative">
        <img
          src={post.image_url}
          alt={post.caption || "Post"}
          className="w-full aspect-square object-cover"
        />
      </div>

      <CardContent className="pt-4 pb-2">
        <div className="flex items-center gap-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            className={isLiked ? "text-destructive hover:text-destructive" : ""}
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {post.comments.length}
          </Button>
        </div>

        {post.caption && (
          <p className="text-sm">
            <Link
              to={`/profile/${post.profiles.username}`}
              className="font-semibold hover:text-primary transition-colors mr-2"
            >
              {post.profiles.username}
            </Link>
            <MentionText text={post.caption} />
          </p>
        )}

        {showComments && post.comments.length > 0 && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {post.comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profiles.avatar_url} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {comment.profiles.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{comment.profiles.username}</span>{" "}
                    <MentionText text={comment.content} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <form onSubmit={handleComment} className="flex gap-2 w-full">
          <Input
            placeholder="Add a comment... Tag friends with @username"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!comment.trim()}
            className="gradient-primary shadow-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default PostCard;