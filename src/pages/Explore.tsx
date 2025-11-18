import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2, Compass } from "lucide-react";

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
}

const Explore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchExploreFeed(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchExploreFeed = async (userId: string) => {
    setLoading(true);
    try {
      const { data: followingIds } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      const followedUserIds = followingIds?.map(f => f.following_id) || [];
      
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url, caption")
        .not("user_id", "in", `(${[userId, ...followedUserIds].map(id => `'${id}'`).join(',')})`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching explore feed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background">
        {user && <Navigation user={user} />}
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No new posts to explore right now.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="relative aspect-square group overflow-hidden rounded-md">
                <img src={post.image_url} alt={post.caption || ""} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;