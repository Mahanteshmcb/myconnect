import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle } from "lucide-react";

interface PostGridProps {
  userId: string;
}

const PostGrid = ({ userId }: PostGridProps) => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        likes (id),
        comments (id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square group cursor-pointer overflow-hidden rounded-sm"
        >
          <img
            src={post.image_url}
            alt={post.caption || "Post"}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-semibold">{post.likes.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5 fill-current" />
              <span className="font-semibold">{post.comments.length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
