import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, UserMinus, Settings, Link as LinkIcon } from "lucide-react";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  currentUserId: string;
  onUpdate: () => void;
}

const ProfileHeader = ({ profile, isOwnProfile, currentUserId, onUpdate }: ProfileHeaderProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    website: profile.website || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [profile.id, currentUserId]);

  const fetchStats = async () => {
    const [followersRes, followingRes, postsRes] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact" }).eq("following_id", profile.id),
      supabase.from("follows").select("*", { count: "exact" }).eq("follower_id", profile.id),
      supabase.from("posts").select("*", { count: "exact" }).eq("user_id", profile.id),
    ]);

    setFollowerCount(followersRes.count || 0);
    setFollowingCount(followingRes.count || 0);
    setPostCount(postsRes.count || 0);
  };

  const checkFollowStatus = async () => {
    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", profile.id)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profile.id);
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: profile.id });

        await supabase.from("notifications").insert({
          user_id: profile.id,
          type: "follow",
          content: "started following you",
          actor_id: currentUserId,
        });

        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate bio length (500 chars max)
    if (editForm.bio.length > 500) {
      toast({
        title: "Bio too long",
        description: "Bio must be less than 500 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate full name length (100 chars max)
    if (editForm.full_name.length > 100) {
      toast({
        title: "Name too long",
        description: "Full name must be less than 100 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate website URL
    if (editForm.website && !/^(https?:\/\/)/.test(editForm.website)) {
      toast({
        title: "Invalid URL",
        description: "Website URL must start with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Validate avatar file size (10MB max)
    if (avatarFile && avatarFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate avatar file type
    if (avatarFile && !avatarFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name.trim(),
          bio: editForm.bio.trim(),
          website: editForm.website.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", currentUserId);

      if (error) throw error;

      toast({
        title: "Profile updated!",
      });

      setEditOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
        <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-elegant">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
            {profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {isOwnProfile ? (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full gradient-primary shadow-glow">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={loading}
                className={
                  isFollowing
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "gradient-primary shadow-glow"
                }
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex gap-6 mb-4 justify-center md:justify-start">
            <div className="text-center">
              <div className="font-bold text-lg">{postCount}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{followerCount}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{followingCount}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
          </div>

          <div>
            <p className="font-semibold">{profile.full_name}</p>
            {profile.bio && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                <LinkIcon className="w-4 h-4" />
                {profile.website.replace(/^(https?:\/\/)/, '')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;