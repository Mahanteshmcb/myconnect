import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import VideoComments from "./VideoComments";

interface VideoCardProps {
  video: {
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
  };
  currentUserId: string;
  onUpdate: () => void;
}

const VideoCard = ({ video, currentUserId, onUpdate }: VideoCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const isLiked = video.video_likes.some((like) => like.user_id === currentUserId);
  const likesCount = video.video_likes.length;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from("video_likes")
          .delete()
          .eq("video_id", video.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("video_likes").insert({
          video_id: video.id,
          user_id: currentUserId,
        });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Increment view count
      await supabase
        .from("videos")
        .update({ views: video.views + 1 })
        .eq("id", video.id);
      onUpdate();
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={video.profiles.avatar_url || undefined} />
          <AvatarFallback>{video.profiles.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{video.profiles.username}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="relative bg-black">
        <video
          src={video.video_url}
          controls
          className="w-full max-h-[600px]"
          onPlay={handlePlay}
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-6 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            Comment
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-5 h-5 mr-1" />
            Share
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground text-sm ml-auto">
            <Eye className="w-4 h-4" />
            {video.views}
          </div>
        </div>

        {video.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{video.profiles.username}</span>
            {video.caption}
          </p>
        )}
      </div>

      {showComments && (
        <VideoComments
          videoId={video.id}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default VideoCard;