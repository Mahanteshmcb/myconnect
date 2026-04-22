import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Compass, Search, TrendingUp, Users, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  user_id: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Hashtag {
  id: string;
  tag: string;
  use_count: number;
}

const Explore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      
      // Get following list
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", session.user.id);
      setFollowingIds(following?.map(f => f.following_id) || []);
      
      await fetchExploreFeed(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchExploreFeed = async (userId: string) => {
    setLoading(true);
    try {
      const { data: followingList } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      const followedUserIds = followingList?.map(f => f.following_id) || [];
      const excludeIds = [userId, ...followedUserIds];

      // Fetch all posts with like counts
      const { data: allPosts } = await supabase
        .from("posts")
        .select("id, image_url, caption, user_id, created_at, likes(count)")
        .order("created_at", { ascending: false });

      if (allPosts) {
        // Filter and get trending posts (most liked from last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trendingFiltered = allPosts
          .filter(p => 
            !excludeIds.includes(p.user_id) && 
            new Date(p.created_at) > sevenDaysAgo
          )
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 10);
        setTrendingPosts(trendingFiltered);

        // Get general explore posts
        const exploreFiltered = allPosts
          .filter(p => !excludeIds.includes(p.user_id))
          .slice(0, 50);
        setPosts(exploreFiltered);
      }

      // Get recommended users (not following, random)
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", userId);

      if (allUsers) {
        const notFollowing = allUsers.filter(u => !followedUserIds.includes(u.id));
        const shuffled = notFollowing
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        setRecommendedUsers(shuffled);
      }

      // Get trending hashtags
      const { data: hashtags } = await supabase
        .from("hashtags")
        .select("id, tag, use_count")
        .order("use_count", { ascending: false })
        .limit(5);
      setTrendingHashtags(hashtags || []);
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

  const handleFollow = async (targetUserId: string) => {
    try {
      if (followingIds.includes(targetUserId)) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user?.id)
          .eq("following_id", targetUserId);
        setFollowingIds(prev => prev.filter(id => id !== targetUserId));
      } else {
        await supabase
          .from("follows")
          .insert({
            follower_id: user?.id,
            following_id: targetUserId,
          });
        setFollowingIds(prev => [...prev, targetUserId]);
      }
    } catch (error) {
      console.error("Error updating follow:", error);
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
      <main className="max-w-7xl mx-auto pt-20 pb-24 md:pb-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Compass className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
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
          <div className="mb-8 space-y-1 bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/${u.username}`}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar_url || ""} />
                    <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{u.username}</p>
                    {u.full_name && <p className="text-xs text-muted-foreground">{u.full_name}</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={followingIds.includes(u.id) ? "outline" : "default"}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollow(u.id);
                  }}
                  className="rounded-lg"
                >
                  {followingIds.includes(u.id) ? "Following" : "Follow"}
                </Button>
              </Link>
            ))}
          </div>
        )}

        {searchQuery.trim() === "" && (
          <>
            {/* Trending Posts Section */}
            {trendingPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Trending This Week</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  {trendingPosts.slice(0, 8).map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={`/post/${post.id}`} className="relative aspect-square group overflow-hidden rounded-lg block">
                        <img
                          src={post.image_url}
                          alt={post.caption || ""}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Users Section */}
            {recommendedUsers.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Suggested Users</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedUsers.map((u) => (
                    <Card key={u.id} className="shadow-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <Link to={`/${u.username}`} className="flex items-center gap-3 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={u.avatar_url || ""} />
                            <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{u.username}</p>
                            {u.full_name && <p className="text-xs text-muted-foreground truncate">{u.full_name}</p>}
                          </div>
                        </Link>
                        <Button
                          size="sm"
                          variant={followingIds.includes(u.id) ? "outline" : "default"}
                          onClick={() => handleFollow(u.id)}
                          className="rounded-lg ml-2"
                        >
                          {followingIds.includes(u.id) ? "Following" : "Follow"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags Section */}
            {trendingHashtags.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Trending Hashtags</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trendingHashtags.map((hashtag) => (
                    <Link
                      key={hashtag.id}
                      to={`/hashtag/${hashtag.tag}`}
                      className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <p className="font-semibold text-sm">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.use_count} posts</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Posts Grid */}
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No new posts to explore right now.</p>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">More Posts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  {posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link to={`/post/${post.id}`} className="relative aspect-square group overflow-hidden rounded-lg block">
                        <img
                          src={post.image_url}
                          alt={post.caption || ""}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Explore;
