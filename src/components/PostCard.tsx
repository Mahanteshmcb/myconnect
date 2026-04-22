import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, MoreHorizontal, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const PostCard = ({ post, currentUser, onUpdate }: { post: any; currentUser: User; onUpdate: () => void }) => {
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
        setLikesCount((prev) => prev - 1);
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
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await supabase.from("comments").insert({ post_id: post.id, user_id: currentUser.id, content: comment.trim() });
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
  const handleReportPost = async () => {
    try {
      const { error } = await supabase.from("reports").insert({
        type: "inappropriate_content",
        reason: "User reported this post",
        content_type: "post",
        content_id: post.id,
        reporter_id: currentUser.id,
      });
      if (error) throw error;
      toast({ title: "Report submitted", description: "Thank you for helping us keep the platform safe." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-lg mx-auto shadow-card border-border/50 overflow-hidden rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Link to={`/${post.profiles.username}`} className="flex items-center gap-3 group">
              <Avatar className="ring-2 ring-border group-hover:ring-primary/50 transition-all">
                <AvatarImage src={post.profiles.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.profiles.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{post.profiles.username}</p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
              </div>
            </Link>
            {post.user_id === currentUser.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">Delete Post</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleReportPost} className="text-destructive flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <Link to={`/post/${post.id}`}>
          <img src={post.image_url} alt={post.caption || "Post image"} className="w-full aspect-square object-cover" />
        </Link>
        <CardContent className="pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                isLiked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </motion.button>
            <Link to={`/post/${post.id}`}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                <MessageCircle className="w-5 h-5" />
                {post.comments.length}
              </div>
            </Link>
          </div>
          {post.caption && (
            <p className="text-sm">
              <Link to={`/${post.profiles.username}`} className="font-semibold hover:text-primary transition-colors">{post.profiles.username}</Link>{" "}
              {post.caption}
            </p>
          )}
          {post.comments.length > 0 && (
            <Link to={`/post/${post.id}`} className="text-sm text-muted-foreground mt-2 block hover:text-foreground transition-colors">
              View all {post.comments.length} comments
            </Link>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <form onSubmit={handleComment} className="flex gap-2 w-full">
            <Input placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} className="rounded-xl bg-muted/30 border-border/50" />
            <Button type="submit" size="icon" disabled={!comment.trim()} className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PostCard;
