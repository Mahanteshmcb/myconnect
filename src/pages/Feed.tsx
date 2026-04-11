import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import PostCard from "@/components/PostCard";
import StoriesBar from "@/components/stories/StoriesBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PostCardSkeleton from "@/components/PostCardSkeleton";

const fetchPosts = async () => {
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
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

const Feed = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    enabled: !!user,
  });

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <StoriesBar userId={user.id} />
        
        {isLoading ? (
          <div className="space-y-6">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;