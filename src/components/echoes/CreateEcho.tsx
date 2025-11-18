import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { processHashtags } from "@/lib/hashtagUtils";
import { createMentionNotifications } from "@/lib/mentionUtils";

interface CreateEchoProps {
  userId: string;
  onEchoCreated: () => void;
}

const CreateEcho = ({ userId, onEchoCreated }: CreateEchoProps) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const characterLimit = 280;

  const handleSubmit = async () => {
    if (!content.trim() || content.length > characterLimit) {
      toast({
        title: "Invalid Echo",
        description: `Echo must be between 1 and ${characterLimit} characters.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: echoData, error } = await supabase.from("echoes").insert({
        user_id: userId,
        content: content.trim(),
      }).select('id').single();

      if (error) throw error;

      if (echoData?.id) {
        await processHashtags(content, echoData.id, null);
        await createMentionNotifications(content, userId, echoData.id, "echo_mention");
      }

      toast({ title: "Success!", description: "Your echo has been shared." });
      setContent("");
      onEchoCreated();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <Textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={characterLimit}
        className="border-0 focus-visible:ring-0 ring-offset-0 p-0 shadow-none resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        <p className={`text-sm ${content.length > characterLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {content.length} / {characterLimit}
        </p>
        <Button onClick={handleSubmit} disabled={loading || !content.trim()}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Echo"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEcho;