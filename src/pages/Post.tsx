import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2, Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const PostPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const { postId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchPost(session.user.id);
    };
    checkUser();
  }, [navigate, postId]);

  const fetchPost = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          likes (user_id),
          comments (
            *,
            profiles:user_id (username, avatar_url)
          )
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({ title: "Error", description: "Could not fetch post.", variant: "destructive" });
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    const isLiked = post.likes.some((like: any) => like.user_id === user.id);
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      }
      fetchPost(user.id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: comment.trim(),
      });
      setComment("");
      fetchPost(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
          <div className="bg-black flex items-center justify-center">
            <img src={post.image_url} alt={post.caption || ""} className="max-h-[80vh] object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="p-4 border-b">
              <Link to={`/${post.profiles.username}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.profiles.avatar_url} />
                  <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{post.profiles.username}</span>
              </Link>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex items-start gap-3">
                <Link to={`/${post.profiles.username}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.profiles.avatar_url} />
                    <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <p className="text-sm">
                  <Link to={`/${post.profiles.username}`} className="font-semibold">{post.profiles.username}</Link>{" "}
                  {post.caption}
                </p>
              </div>
              {post.comments.map((c: any) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Link to={`/${c.profiles.username}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={c.profiles.avatar_url} />
                      <AvatarFallback>{c.profiles.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <p className="text-sm">
                      <Link to={`/${c.profiles.username}`} className="font-semibold">{c.profiles.username}</Link>{" "}
                      {c.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={handleLike}>
                  <Heart className={`w-6 h-6 ${post.likes.some((l: any) => l.user_id === user.id) ? "text-destructive fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </div>
              <p className="text-sm font-semibold">{post.likes.length} likes</p>
              <p className="text-xs text-muted-foreground uppercase mt-2">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
            <form onSubmit={handleComment} className="p-4 border-t flex gap-2">
              <Input placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button type="submit" size="icon" disabled={!comment.trim()}><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostPage;