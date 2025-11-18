import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Plus } from "lucide-react";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  group_members: [{ count: number }];
}

const Groups = () => {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchGroups();
    };
    checkUser();
  }, [navigate]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*, group_members(count)")
        .eq("is_private", false);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <main className="max-w-4xl mx-auto pt-20 pb-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Discover Groups</h1>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No public groups found. Why not create the first one?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link to={`/groups/${group.id}`} key={group.id}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary/20">
                      <AvatarImage src={group.avatar_url} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-center">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {group.description}
                    </p>
                    <p className="text-sm font-semibold">
                      {group.group_members[0]?.count || 0} members
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <CreateGroupDialog
        userId={user.id}
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
};

export default Groups;