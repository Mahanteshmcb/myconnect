import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, FileIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import FileSharingDialog from "@/components/files/FileSharingDialog";

interface FileItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  opened: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string;
  };
  receiver?: {
    username: string;
    avatar_url: string;
  };
}

const Files = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sentFiles, setSentFiles] = useState<FileItem[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      fetchFiles(session.user.id);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFiles = async (userId: string) => {
    try {
      const { data: sent } = await supabase
        .from("sent_files")
        .select("*, receiver:receiver_id(username, avatar_url)")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      const { data: received } = await supabase
        .from("sent_files")
        .select("*, sender:sender_id(username, avatar_url)")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      setSentFiles(sent || []);
      setReceivedFiles(received || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (user && file.receiver && !file.opened) {
      await supabase
        .from("sent_files")
        .update({ opened: true, opened_at: new Date().toISOString() })
        .eq("id", file.id);

      fetchFiles(user.id);
    }

    window.open(file.file_url, "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
          <h1 className="text-3xl font-bold">Files</h1>
          <FileSharingDialog userId={user.id} />
        </div>

        <Tabs defaultValue="received">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedFiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No files received yet
                </CardContent>
              </Card>
            ) : (
              receivedFiles.map((file) => (
                <Card key={file.id} className={!file.opened ? "border-primary" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={file.sender?.avatar_url} />
                        <AvatarFallback>
                          {file.sender?.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{file.file_name}</span>
                          {!file.opened && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          From {file.sender?.username} •{" "}
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })} •{" "}
                          {formatFileSize(file.file_size || 0)}
                        </div>
                      </div>
                      <Button onClick={() => handleDownload(file)} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentFiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No files sent yet
                </CardContent>
              </Card>
            ) : (
              sentFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={file.receiver?.avatar_url} />
                        <AvatarFallback>
                          {file.receiver?.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{file.file_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          To {file.receiver?.username} •{" "}
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })} •{" "}
                          {formatFileSize(file.file_size || 0)}
                          {file.opened && " • Opened"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Files;
