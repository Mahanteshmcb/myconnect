import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  last_message: {
    content: string;
    created_at: string;
  } | null;
}

interface ConversationListProps {
  userId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationList = ({ userId, selectedConversationId, onSelectConversation }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchConversations)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, fetchConversations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const { data: participantData } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      const { data: conversationsData } = await supabase
        .from("conversations")
        .select("id, updated_at")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (!conversationsData) return;

      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id, profiles(id, username, avatar_url)")
            .eq("conversation_id", conv.id)
            .neq("user_id", userId)
            .single();

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            updated_at: conv.updated_at,
            other_user: participants?.profiles as any,
            last_message: lastMessage,
          };
        })
      );

      setConversations(conversationsWithDetails.filter((c) => c.other_user));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .neq("id", userId)
      .ilike("username", `%${searchQuery}%`)
      .limit(10);

    setUsers(data || []);
  };

  const startConversation = async (otherUserId: string) => {
    try {
      const existingConv = conversations.find((c) => c.other_user.id === otherUserId);
      if (existingConv) {
        onSelectConversation(existingConv.id);
        setNewChatOpen(false);
        return;
      }

      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      await supabase.from("conversation_participants").insert([
        { conversation_id: newConv.id, user_id: userId },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

      onSelectConversation(newConv.id);
      setNewChatOpen(false);
      fetchConversations();

      toast({
        title: "Conversation started!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Messages</h2>
        <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="gradient-primary shadow-glow">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button onClick={searchUsers}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer"
                    onClick={() => startConversation(user.id)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedConversationId === conv.id
                ? "bg-primary/10 border-l-4 border-primary"
                : "hover:bg-secondary"
            }`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <Avatar>
              <AvatarImage src={conv.other_user.avatar_url} />
              <AvatarFallback>{conv.other_user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{conv.other_user.username}</div>
              {conv.last_message && (
                <div className="text-sm text-muted-foreground truncate">
                  {conv.last_message.content}
                </div>
              )}
            </div>
            {conv.last_message && (
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
