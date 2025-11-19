import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import RenderContent from "../RenderContent";

interface EchoCardProps {
  echo: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
    echo_likes: { user_id: string }[];
    _count?: {
      echo_replies: number;
    };
  };
  currentUserId: string;
  onUpdate: () => void;
}

const EchoCard = ({ echo, currentUserId, onUpdate }: EchoCardProps) => {
  const { toast } = useToast();
  const isLiked = echo.echo_likes.some((like) => like.user_id === currentUserId);
  const likesCount = echo.echo_likes.length;
  const repliesCount = echo._count?.echo_replies ?? 0;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from("echo_likes" as any)
          .delete()
          .eq("echo_id", echo.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("echo_likes" as any).insert({
          echo_id: echo.id,
          user_id: currentUserId,
        } as any);
      }
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex gap-4">
      <Avatar>
        <AvatarImage src={echo.profiles.avatar_url || undefined} />
        <AvatarFallback>{echo.profiles.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{echo.profiles.username}</p>
          <p className="text-xs text-muted-foreground">
            · {formatDistanceToNow(new Date(echo.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <RenderContent text={echo.content} />
        </div>
        <div className="flex items-center gap-6 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            {repliesCount}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EchoCard;