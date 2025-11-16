import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Loader2, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FileSharingDialogProps {
  userId: string;
}

const FileSharingDialog = ({ userId }: FileSharingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file name length
      if (selectedFile.name.length > 255) {
        toast({
          title: "File name too long",
          description: "File name must be less than 255 characters",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSend = async () => {
    if (!file || !selectedUser) {
      toast({
        title: "Missing information",
        description: "Please select a file and a recipient",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to private shared-files bucket
      const { error: uploadError } = await supabase.storage
        .from("shared-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Use signed URL for private file access (expires in 7 days)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("shared-files")
        .createSignedUrl(fileName, 604800); // 7 days in seconds

      if (urlError) throw urlError;

      const { error: insertError } = await supabase.from("sent_files").insert({
        sender_id: userId,
        receiver_id: selectedUser.id,
        file_url: signedUrlData.signedUrl,
        file_name: file.name,
        file_size: file.size,
      });

      if (insertError) throw insertError;

      await supabase.from("notifications").insert({
        user_id: selectedUser.id,
        type: "file",
        content: `sent you a file: ${file.name}`,
        actor_id: userId,
      });

      toast({
        title: "File sent!",
        description: `${file.name} sent to ${selectedUser.username}`,
      });

      setOpen(false);
      setFile(null);
      setSelectedUser(null);
      setSearchQuery("");
      setUsers([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Paperclip className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Select File (Max 10MB)</Label>
            <Input id="file" type="file" onChange={handleFileChange} disabled={uploading} />
            {file && <p className="text-sm text-muted-foreground mt-1">{file.name}</p>}
          </div>

          <div>
            <Label>Send to</Label>
            {selectedUser ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{selectedUser.username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="ml-auto"
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mt-2">
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
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={!file || !selectedUser || uploading}
            className="w-full gradient-primary"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send File"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileSharingDialog;
