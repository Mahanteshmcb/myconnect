import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StoryViewer from "./StoryViewer";
import CreateStoryDialog from "./CreateStoryDialog";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface GroupedStories {
  [userId: string]: {
    user: {
      id: string;
      username: string;
      avatar_url: string;
    };
    stories: Story[];
  };
}

interface StoriesBarProps {
  userId: string;
}

const StoriesBar = ({ userId }: StoriesBarProps) => {
  const [stories, setStories] = useState<GroupedStories>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [hasOwnStory, setHasOwnStory] = useState(false);

  useEffect(() => {
    fetchStories();

    const channel = supabase
      .channel("stories")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, fetchStories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*, profiles:user_id(id, username, avatar_url)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      const grouped: GroupedStories = {};
      let userHasStory = false;

      data.forEach((story) => {
        if (story.user_id === userId) {
          userHasStory = true;
        }

        if (!grouped[story.user_id]) {
          grouped[story.user_id] = {
            user: {
              id: story.user_id,
              username: story.profiles.username,
              avatar_url: story.profiles.avatar_url,
            },
            stories: [],
          };
        }
        grouped[story.user_id].stories.push(story);
      });

      setStories(grouped);
      setHasOwnStory(userHasStory);
    }
  };

  const handleStoryClick = async (storyUserId: string) => {
    setSelectedUserId(storyUserId);

    if (storyUserId !== userId) {
      const userStories = stories[storyUserId]?.stories || [];
      for (const story of userStories) {
        await supabase.from("story_views").insert({
          story_id: story.id,
          viewer_id: userId,
        }).select().maybeSingle();
      }
    }
  };

  const userStoryGroup = stories[userId];
  const otherStories = Object.entries(stories).filter(([uid]) => uid !== userId);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          <div
            className={`relative cursor-pointer ${
              hasOwnStory ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onClick={() => (hasOwnStory ? handleStoryClick(userId) : setCreateStoryOpen(true))}
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={userStoryGroup?.user.avatar_url} />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            {!hasOwnStory && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-xs text-center">Your Story</span>
        </div>

        {otherStories.map(([uid, group]) => (
          <div key={uid} className="flex flex-col items-center gap-2 min-w-[80px]">
            <div
              className="ring-2 ring-primary ring-offset-2 cursor-pointer rounded-full"
              onClick={() => handleStoryClick(uid)}
            >
              <Avatar className="w-16 h-16">
                <AvatarImage src={group.user.avatar_url} />
                <AvatarFallback>{group.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-center truncate w-full">{group.user.username}</span>
          </div>
        ))}
      </div>

      {selectedUserId && (
        <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
          <DialogContent className="max-w-md p-0">
            <StoryViewer
              stories={stories[selectedUserId]?.stories || []}
              onClose={() => setSelectedUserId(null)}
              userId={userId}
            />
          </DialogContent>
        </Dialog>
      )}

      <CreateStoryDialog
        userId={userId}
        open={createStoryOpen}
        onOpenChange={setCreateStoryOpen}
        onCreated={fetchStories}
      />
    </>
  );
};

export default StoriesBar;
