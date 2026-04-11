import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  file_url: string | null;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface ConversationViewProps {
  conversationId: string;
  userId: string;
}

const ConversationView = ({ conversationId, userId }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchOtherUser();

    const messageChannel = supabase
      .channel(`conversation-messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const typingChannel = supabase.channel(`conversation-typing:${conversationId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchOtherUser = async () => {
    const { data } = await supabase
      .from("conversation_participants")
      .select("user_id, profiles(id, username, avatar_url)")
      .eq("conversation_id", conversationId)
      .neq("user_id", userId)
      .single();

    if (data) {
      setOtherUser(data.profiles);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles:sender_id(username, avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .is("read_at", null);
  };

  const handleTyping = () => {
    const channel = supabase.channel(`conversation-typing:${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (newMessage.trim().length > 5000) {
      toast({
        title: "Message too long",
        description: "Message must be less than 5000 characters",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: newMessage.trim(),
      });
      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {otherUser && (
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback>{otherUser.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{otherUser.username}</div>
              {isTyping && <div className="text-xs text-primary animate-pulse">typing...</div>}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === userId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.profiles.avatar_url} />
                  <AvatarFallback>{message.profiles.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className={`rounded-lg p-3 ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {message.content}
                  </div>
                  <div className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                    {isOwn && (
                      message.read_at ? <CheckCheck className="w-4 h-4 text-blue-500" /> : <Check className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} className="gradient-primary">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationView;