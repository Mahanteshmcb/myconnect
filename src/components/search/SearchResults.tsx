import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Hash, Image, Video } from "lucide-react";

interface SearchResultsProps {
  users: Array<{
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  }>;
  posts: Array<{
    id: string;
    image_url: string;
    caption: string | null;
  }>;
  videos: Array<{
    id: string;
    video_url: string;
    thumbnail_url: string | null;
    caption: string | null;
  }>;
  hashtags: Array<{
    id: string;
    tag: string;
    use_count: number;
  }>;
}

const SearchResults = ({ users, posts, videos, hashtags }: SearchResultsProps) => {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer"
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <Avatar>
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.username}</p>
                {user.full_name && (
                  <p className="text-sm text-muted-foreground">{user.full_name}</p>
                )}
              </div>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="posts">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No posts found</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square relative group cursor-pointer"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || "Post"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="videos">
        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No videos found</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {videos.map((video) => (
              <div
                key={video.id}
                className="aspect-square relative group cursor-pointer"
              >
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="hashtags" className="space-y-2">
        {hashtags.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hashtags found</p>
        ) : (
          hashtags.map((hashtag) => (
            <div
              key={hashtag.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">#{hashtag.tag}</p>
                <p className="text-sm text-muted-foreground">
                  {hashtag.use_count} {hashtag.use_count === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SearchResults;