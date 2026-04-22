import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface FeedProps {
  user: User;
}

const Feed = ({ user }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const POSTS_PER_PAGE = 10;

  const fetchFeed = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
    }

    try {
      // Get blocked users
      const { data: blockedUsers } = await supabase
        .from("blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id);

      const blockedIds = blockedUsers?.map((b) => b.blocked_id) || [];

      const { data: followingIds } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingIds !== null) {
        const ids = followingIds.map((f) => f.following_id);
        ids.push(user.id); // Include user's own posts

        // Filter out blocked users
        const visibleIds = ids.filter((id) => !blockedIds.includes(id));

        setOffset((prevOffset) => {
          const currentOffset = loadMore ? prevOffset : 0;

          supabase
            .from("posts")
            .select(
              `
              *,
              profiles:user_id (username, avatar_url),
              likes (user_id),
              comments (id)
            `
            )
            .in("user_id", visibleIds.length > 0 ? visibleIds : ["00000000-0000-0000-0000-000000000000"])
            .order("created_at", { ascending: false })
            .range(currentOffset, currentOffset + POSTS_PER_PAGE - 1)
            .then(({ data: feedPosts, error }) => {
              if (error) throw error;

              if (loadMore) {
                setPosts((prev) => [...prev, ...(feedPosts || [])]);
              } else {
                setPosts(feedPosts || []);
              }

              setHasMore((feedPosts?.length || 0) >= POSTS_PER_PAGE);
            });

          return loadMore ? prevOffset + POSTS_PER_PAGE : POSTS_PER_PAGE;
        });
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchFeed();
  }, [user.id]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          fetchFeed(true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading, fetchFeed]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Your feed is empty. Follow some users to see their posts!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => fetchFeed()} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-8 text-center">
        {isLoadingMore && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground text-sm">No more posts</p>
        )}
      </div>
    </div>
  );
};

export default Feed;