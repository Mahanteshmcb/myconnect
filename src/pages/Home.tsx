import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import StoriesBar from "@/components/stories/StoriesBar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchFeed = async (userId: string) => {
  const { data: followingIds } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const ids = followingIds?.map(f => f.following_id) || [];
  ids.push(userId); // Include user's own posts

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
    .in("user_id", ids)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

const Home = () => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["feed", user?.id],
    queryFn: () => user ? fetchFeed(user.id) : [],
    enabled: !!user,
  });

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    refetch();
  };

  if (!user) {
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
        <StoriesBar userId={user.id} />
        <CreatePost userId={user.id} onPostCreated={handlePostCreated} isOpen={false} onOpenChange={() => {}} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your feed is empty. Follow some users to see their posts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;