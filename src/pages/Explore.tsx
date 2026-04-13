import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2, Compass, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Explore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      fetchExploreFeed(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchExploreFeed = async (userId: string) => {
    setLoading(true);
    try {
      const { data: followingIds } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
      const followedUserIds = followingIds?.map(f => f.following_id) || [];
      const excludeIds = [userId, ...followedUserIds];

      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url, caption")
        .not("user_id", "in", `(${excludeIds.map(id => `'${id}'`).join(',')})`)
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

  const searchUsers = async (query: string) => {
    if (!query.trim()) { setUsers([]); return; }
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      <main className="max-w-4xl mx-auto pt-20 pb-24 md:pb-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Compass className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
          />
        </div>

        {/* Search results */}
        {users.length > 0 && (
          <div className="mb-6 space-y-1 bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/${u.username}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                  ) : (
                    u.username[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{u.username}</p>
                  {u.full_name && <p className="text-xs text-muted-foreground">{u.full_name}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No new posts to explore right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Link to={`/post/${post.id}`} className="relative aspect-square group overflow-hidden rounded-xl block">
                  <img src={post.image_url} alt={post.caption || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
