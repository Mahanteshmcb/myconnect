import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import ConversationList from "@/components/messages/ConversationList";
import ConversationView from "@/components/messages/ConversationView";
import { Loader2, MessageSquare } from "lucide-react";

const Messages = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-6xl mx-auto pt-20 pb-8 md:pb-8 px-4 h-[calc(100vh-5rem)]">
        <div className="h-full flex gap-0 md:gap-4 rounded-2xl overflow-hidden border border-border/50 shadow-card bg-card">
          {/* Conversation list - full width on mobile when no conversation selected */}
          <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-border/50`}>
            <ConversationList
              userId={user.id}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>

          {/* Conversation view - full width on mobile when conversation selected */}
          <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selectedConversationId ? (
              <div className="flex flex-col h-full">
                {/* Mobile back button */}
                <button
                  className="md:hidden flex items-center gap-2 p-3 text-sm text-primary font-medium border-b border-border/50"
                  onClick={() => setSelectedConversationId(null)}
                >
                  ← Back to conversations
                </button>
                <div className="flex-1 overflow-hidden">
                  <ConversationView conversationId={selectedConversationId} userId={user.id} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <MessageSquare className="w-12 h-12 opacity-30" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
