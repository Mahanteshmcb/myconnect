import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";

const PostCard = ({ post, currentUser, onUpdate }: { post: any, currentUser: User, onUpdate: () => void }) => {
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsLiked(post.likes.some((like: any) => like.user_id === currentUser.id));
    setLikesCount(post.likes.length);
  }, [post, currentUser.id]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: currentUser.id });
        if (post.user_id !== currentUser.id) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            type: "like",
            content: "liked your post",
            actor_id: currentUser.id,
            related_id: post.id,
          });
        }
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: comment.trim(),
      });
      if (post.user_id !== currentUser.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "comment",
          content: "commented on your post",
          actor_id: currentUser.id,
          related_id: post.id,
        });
      }
      setComment("");
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
      toast({ title: "Success", description: "Post deleted." });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Link to={`/${post.profiles.username}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.profiles.username}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </div>
          </Link>
          {post.user_id === currentUser.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">Delete Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <Link to={`/post/${post.id}`}>
        <img src={post.image_url} alt={post.caption || "Post image"} className="w-full aspect-square object-cover" />
      </Link>
      <CardContent className="pt-4 pb-2">
        <div className="flex items-center gap-4 mb-3">
          <Button variant="ghost" size="sm" className={isLiked ? "text-destructive" : ""} onClick={handleLike}>
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} /> {likesCount}
          </Button>
          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-5 h-5 mr-1" /> {post.comments.length}
            </Button>
          </Link>
        </div>
        <p className="text-sm">
          <Link to={`/${post.profiles.username}`} className="font-semibold">{post.profiles.username}</Link>{" "}
          {post.caption}
        </p>
        {post.comments.length > 0 && (
          <Link to={`/post/${post.id}`} className="text-sm text-muted-foreground mt-2 block">
            View all {post.comments.length} comments
          </Link>
        )}
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

export default PostCard;