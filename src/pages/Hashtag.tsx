import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2, Hash } from "lucide-react";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  caption: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  likes: { user_id: string }[];
  comments: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
  }[];
}

const HashtagPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { tag } = useParams<{ tag: string }>();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchPostsByHashtag();
    };

    checkUser();
  }, [navigate, tag]);

  const fetchPostsByHashtag = async () => {
    if (!tag) return;
    setLoading(true);
    try {
      const { data: hashtagData } = await supabase
        .from("hashtags")
        .select("id")
        .eq("tag", tag)
        .single();

      if (!hashtagData) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: postHashtags } = await supabase
        .from("post_hashtags")
        .select("post_id")
        .eq("hashtag_id", hashtagData.id)
        .not("post_id", "is", null);

      if (!postHashtags || postHashtags.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = postHashtags.map((ph) => ph.post_id);

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url),
          likes (user_id),
          comments (
            id,
            content,
            created_at,
            profiles:user_id (username, avatar_url)
          )
        `)
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);

    } catch (error) {
      console.error("Error fetching posts by hashtag:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !tag) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Hash className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{tag}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found for this hashtag.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user.id}
                onUpdate={fetchPostsByHashtag}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HashtagPage;