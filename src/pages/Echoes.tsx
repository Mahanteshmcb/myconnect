import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import CreateEcho from "@/components/echoes/CreateEcho";
import EchoCard from "@/components/echoes/EchoCard";
import { Loader2 } from "lucide-react";

interface Echo {
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
}

const Echoes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [echoes, setEchoes] = useState<Echo[]>([]);
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
      fetchEchoes(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchEchoes = async (userId: string) => {
    try {
      const { data: followingIds } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      const ids = followingIds?.map(f => f.following_id) || [];
      ids.push(userId);

      const { data, error } = await supabase
        .from("echoes" as any)
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          echo_likes (user_id),
          echo_replies (id)
        `)
        .in("user_id", ids)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data.map(echo => ({
        ...echo,
        _count: {
          echo_replies: echo.echo_replies.length
        }
      }));

      setEchoes(formattedData as any);
    } catch (error) {
      console.error("Error fetching echoes:", error);
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
        <h1 className="text-2xl font-bold mb-4">Echoes</h1>
        <CreateEcho userId={user.id} onEchoCreated={() => fetchEchoes(user.id)} />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : echoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">The feed is quiet... Follow someone or post your first echo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {echoes.map((echo) => (
              <EchoCard
                key={echo.id}
                echo={echo}
                currentUserId={user.id}
                onUpdate={() => fetchEchoes(user.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Echoes;