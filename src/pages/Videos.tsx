import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import VideoUpload from "@/components/video/VideoUpload";
import VideoCard from "@/components/video/VideoCard";
import { Loader2 } from "lucide-react";

interface Video {
  id: string;
  video_url: string;
  caption: string | null;
  duration: number | null;
  views: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  video_likes: { user_id: string }[];
}

const Videos = () => {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
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
      fetchVideos();
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

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          video_likes (user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <VideoUpload userId={user.id} onVideoUploaded={fetchVideos} />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No videos yet. Upload the first one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                currentUserId={user.id}
                onUpdate={fetchVideos}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;