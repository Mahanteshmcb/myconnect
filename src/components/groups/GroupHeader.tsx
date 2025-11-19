import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GroupHeaderProps {
  group: any;
  userId: string;
  onUpdate: () => void;
}

const GroupHeader = ({ group, userId, onUpdate }: GroupHeaderProps) => {
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkMembership();
  }, [group.id, userId]);

  const checkMembership = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("group_members" as any)
      .select("*")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .single();
    setMembership(data);
    setLoading(false);
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("group_members" as any).insert({
        group_id: group.id,
        user_id: userId,
        role: "user",
      } as any);
      if (error) throw error;
      toast({ title: `Welcome to ${group.name}!` });
      onUpdate();
      checkMembership();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("group_members" as any)
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", userId);
      if (error) throw error;
      toast({ title: `You have left ${group.name}.` });
      onUpdate();
      checkMembership();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderJoinButton = () => {
    if (loading) return <Button disabled><Loader2 className="w-4 h-4 animate-spin" /></Button>;
    if (membership) {
      return <Button variant="outline" onClick={handleLeave}>Leave Group</Button>;
    }
    return <Button onClick={handleJoin}>Join Group</Button>;
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20">
          <AvatarImage src={group.avatar_url} />
          <AvatarFallback className="text-4xl">{group.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground mt-1">{group.group_members[0]?.count || 0} members</p>
          <p className="mt-4">{group.description}</p>
        </div>
        <div className="self-center md:self-end">
          {renderJoinButton()}
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;