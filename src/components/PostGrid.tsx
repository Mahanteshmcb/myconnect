import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
      .select(`*, likes (id), comments (id)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setPosts(data || []);
  };

  if (posts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No posts yet</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-3">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <Link to={`/post/${post.id}`} className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl block">
            <img src={post.image_url} alt={post.caption || "Post"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center gap-4 text-primary-foreground opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-semibold">{post.likes.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="font-semibold">{post.comments.length}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default PostGrid;
