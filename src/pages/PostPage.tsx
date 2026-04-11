import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  caption: string | null;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  likes: { user_id: string }[];
  comments: { id: string }[];
  _count?: {
    comments: number;
  };
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user && postId) {
      fetchPost();
    }
  }, [user, postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url),
          likes (user_id),
          comments (id)
        `
        )
        .eq("id", postId)
        .single();

      if (error) throw error;

      if (data) {
        const formattedPost = {
          ...data,
          _count: {
            comments: data.comments.length,
          },
        };
        setPost(formattedPost as Post);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching post",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching post:", error);
      setPost(null); // Ensure post is null if there's an error
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Or a loading spinner/redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : post ? (
          <div className="space-y-6">
            <PostCard post={post} currentUser={user} onUpdate={fetchPost} />
            <CommentSection postId={post.id} currentUserId={user.id} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Post not found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostPage;