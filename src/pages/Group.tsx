import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import GroupHeader from "@/components/groups/GroupHeader";
import CreateGroupPost from "@/components/groups/CreateGroupPost";
import GroupFeed from "@/components/groups/GroupFeed";

const GroupPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshFeed, setRefreshFeed] = useState(0);
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
      fetchGroupAndMembership();
    }
  }, [user, groupId]);

  const fetchGroupAndMembership = async () => {
    setLoading(true);
    try {
      const groupPromise = supabase.from("groups" as any).select("*, group_members(count)").eq("id", groupId).single();
      const membershipPromise = supabase.from("group_members" as any).select("*").eq("group_id", groupId).eq("user_id", user!.id).single();
      
      const [{ data: groupData, error: groupError }, { data: membershipData }] = await Promise.all([groupPromise, membershipPromise]);

      if (groupError) throw groupError;
      
      setGroup(groupData);
      setIsMember(!!membershipData);
    } catch (error) {
      console.error("Error fetching group data:", error);
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
      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <GroupHeader
          group={group}
          userId={user.id}
          onUpdate={fetchGroupAndMembership}
        />
        {isMember && (
          <CreateGroupPost
            userId={user.id}
            groupId={group.id}
            onPostCreated={() => setRefreshFeed(count => count + 1)}
          />
        )}
        <GroupFeed groupId={group.id} userId={user.id} refreshFeed={refreshFeed} />
      </main>
    </div>
  );
};

export default GroupPage;