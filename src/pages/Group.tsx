import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import GroupHeader from "@/components/groups/GroupHeader";
import { Card, CardContent } from "@/components/ui/card";

const GroupPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user && groupId) {
      fetchGroup();
    }
  }, [user, groupId]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*, group_members(count)")
        .eq("id", groupId)
        .single();
      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group:", error);
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || !group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
        <GroupHeader
          group={group}
          userId={user.id}
          onUpdate={fetchGroup}
        />
        <div className="mt-6">
          {/* Placeholder for group post feed */}
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Group posts will appear here soon!
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GroupPage;