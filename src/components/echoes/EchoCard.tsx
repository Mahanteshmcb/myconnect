import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import RenderContent from "../RenderContent";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EchoReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

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
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<EchoReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [creatingReply, setCreatingReply] = useState(false);

  const isLiked = echo.echo_likes.some((like) => like.user_id === currentUserId);
  const likesCount = echo.echo_likes.length;
  const repliesCount = echo._count?.echo_replies ?? 0;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from("echo_likes")
          .delete()
          .eq("echo_id", echo.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("echo_likes").insert({
          echo_id: echo.id,
          user_id: currentUserId,
        });
      }
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from("echo_replies")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("echo_id", echo.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data as any);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleOpenReplies = async () => {
    setShowReplies(true);
    if (replies.length === 0) {
      fetchReplies();
    }
  };

  const handleCreateReply = async () => {
    if (!replyText.trim()) {
      toast({ title: "Error", description: "Reply cannot be empty.", variant: "destructive" });
      return;
    }

    if (replyText.length > 280) {
      toast({ title: "Error", description: "Reply must be 280 characters or less.", variant: "destructive" });
      return;
    }

    setCreatingReply(true);
    try {
      const { error } = await supabase
        .from("echo_replies")
        .insert({
          echo_id: echo.id,
          user_id: currentUserId,
          content: replyText,
        });

      if (error) throw error;

      setReplyText("");
      fetchReplies();
      onUpdate();
      toast({ title: "Success", description: "Reply posted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreatingReply(false);
    }
  };

  return (
    <>
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleOpenReplies}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              {repliesCount}
            </Button>
          </div>
        </div>
      </div>

      {/* Replies Dialog */}
      <Dialog open={showReplies} onOpenChange={setShowReplies}>
        <DialogContent className="max-w-2xl max-h-96">
          <DialogHeader>
            <DialogTitle>Replies ({repliesCount})</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {/* Reply Input */}
            <div className="flex gap-3 pb-4 border-b border-border">
              <Input
                placeholder="Reply to this echo..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={280}
                className="flex-1"
              />
              <Button
                onClick={handleCreateReply}
                disabled={creatingReply || !replyText.trim()}
                className="gradient-primary"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Replies List */}
            {loadingReplies ? (
              <div className="text-center text-muted-foreground">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-center text-muted-foreground">No replies yet. Be the first!</div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-3 text-sm">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={reply.profiles.avatar_url || undefined} />
                    <AvatarFallback>{reply.profiles.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{reply.profiles.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-foreground mt-1">{reply.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EchoCard;