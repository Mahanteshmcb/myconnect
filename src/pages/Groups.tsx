import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  is_private: boolean;
}

const Groups = () => {
  const [user, setUser] = useState<User | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchGroups(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchGroups = async (userId: string) => {
    setLoading(true);
    try {
      // Get user's groups via group_members table
      const { data: userGroupIds, error: userGroupsError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (userGroupsError) throw userGroupsError;

      if (userGroupIds && userGroupIds.length > 0) {
        const groupIds = userGroupIds.map(m => m.group_id);
        const { data: myGroupsData, error: myGroupsDataError } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);

        if (myGroupsDataError) throw myGroupsDataError;
        setMyGroups(myGroupsData as any);
      } else {
        setMyGroups([]);
      }

      // Get public groups
      const { data: publicGroupsData, error: publicGroupsError } = await supabase
        .from("groups")
        .select("*")
        .eq("is_private", false);

      if (publicGroupsError) throw publicGroupsError;
      
      const myGroupIds = new Set(userGroupIds?.map(m => m.group_id) || []);
      setPublicGroups((publicGroupsData as any[]).filter((g: Group) => !myGroupIds.has(g.id)));

    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({ title: "Error", description: "Could not fetch groups.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsCreating(true);
    try {
      const { data: groupData, error } = await supabase
        .from("groups")
        .insert({ name: newGroup.name, description: newGroup.description, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from("group_members")
        .insert({ group_id: groupData.id, user_id: user.id, role: 'admin' });

      if (memberError) throw memberError;

      toast({ title: "Success", description: "Group created successfully." });
      setCreateOpen(false);
      setNewGroup({ name: "", description: "" });
      fetchGroups(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: user.id, role: 'member' });

      if (error) throw error;

      toast({ title: "Success", description: "Joined group successfully." });
      fetchGroups(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" /> Groups
          </h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">My Groups</h2>
            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((group) => (
                  <Link to={`/group/${group.id}`} key={group.id}>
                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={group.avatar_url} />
                            <AvatarFallback>{group.name[0]}</AvatarFallback>
                          </Avatar>
                          {group.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">You haven't joined any groups yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Discover Public Groups</h2>
            {publicGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicGroups.map((group) => (
                  <Card key={group.id} className="hover:border-primary transition-colors flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={group.avatar_url} />
                          <AvatarFallback>{group.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="line-clamp-1">{group.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{group.description}</p>
                      <div className="flex gap-2">
                        <Link to={`/group/${group.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">View</Button>
                        </Link>
                        <Button 
                          onClick={(e) => handleJoinGroup(e, group.id)}
                          className="gradient-primary"
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No public groups to show.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Groups;