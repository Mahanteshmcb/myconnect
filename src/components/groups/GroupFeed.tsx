import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import GroupPostCard from "./GroupPostCard";

interface GroupFeedProps {
  groupId: string;
  userId: string;
  refreshFeed: number;
}

const GroupFeed = ({ groupId, userId, refreshFeed }: GroupFeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [groupId, refreshFeed]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          group_post_likes (user_id),
          group_post_comments (id)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching group posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No posts in this group yet. Be the first to share!</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <GroupPostCard key={post.id} post={post} currentUserId={userId} onUpdate={fetchPosts} />
      ))}
    </div>
  );
};

export default GroupFeed;