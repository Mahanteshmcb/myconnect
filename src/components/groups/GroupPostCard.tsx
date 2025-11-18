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

const GroupPostCard = ({ post, currentUserId, onUpdate }: { post: any, currentUserId: string, onUpdate: () => void }) => {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const isLiked = post.group_post_likes.some((like: any) => like.user_id === currentUserId);
  const likesCount = post.group_post_likes.length;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase.from("group_post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
      } else {
        await supabase.from("group_post_likes").insert({ post_id: post.id, user_id: currentUserId });
      }
      onUpdate();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await supabase.from("group_post_comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: comment.trim(),
      });
      setComment("");
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.profiles.username}`}>
            <Avatar>
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${post.profiles.username}`} className="font-semibold">{post.profiles.username}</Link>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
          </div>
        </div>
      </CardHeader>
      <img src={post.image_url} alt={post.caption || "Group Post"} className="w-full" />
      <CardContent className="pt-4">
        {post.caption && <p className="text-sm mb-4">{post.caption}</p>}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className={isLiked ? "text-destructive" : ""} onClick={handleLike}>
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} /> {likesCount}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="w-5 h-5 mr-1" /> {post.group_post_comments.length}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleComment} className="flex gap-2 w-full">
          <Input placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button type="submit" size="icon" disabled={!comment.trim()}><Send className="w-4 h-4" /></Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default GroupPostCard;