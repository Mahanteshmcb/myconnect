import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface FeedProps {
  user: User;
}

const Feed = ({ user }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data: followingIds } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingIds) {
        const ids = followingIds.map(f => f.following_id);
        ids.push(user.id); // Include user's own posts

        const { data: feedPosts, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (username, avatar_url),
            likes (user_id),
            comments (id)
          `)
          .in("user_id", ids)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(feedPosts || []);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-12">Your feed is empty. Follow some users to see their posts!</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchFeed} />
      ))}
    </div>
  );
};

export default Feed;