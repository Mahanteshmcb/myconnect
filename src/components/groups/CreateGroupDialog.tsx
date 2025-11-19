import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateGroupDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

const CreateGroupDialog = ({ userId, open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim() || !avatarFile) {
      toast({ title: "Error", description: "Group name and avatar are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `avatars/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("group-media").upload(fileName, avatarFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("group-media").getPublicUrl(fileName);

      const { data: groupData, error: insertError } = await supabase
        .from("groups" as any)
        .insert({
          name,
          description,
          is_private: isPrivate,
          created_by: userId,
          avatar_url: publicUrl,
        } as any)
        .select("id")
        .single();
      if (insertError) throw insertError;

      await supabase.from("group_members" as any).insert({
        group_id: groupData.id,
        user_id: userId,
        role: "admin",
      } as any);

      toast({ title: "Group created!", description: `${name} is now live.` });
      onGroupCreated();
      onOpenChange(false);
      navigate(`/groups/${groupData.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Group Avatar</Label>
            <Input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
            <Label htmlFor="is-private">Private Group</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;