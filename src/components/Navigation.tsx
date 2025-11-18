import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Home, User, LogOut, MessageCircle, Paperclip, Shield, Video, Search } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import NotificationBell from "@/components/notifications/NotificationBell";

interface NavigationProps {
  user: SupabaseUser;
}

const Navigation = ({ user }: NavigationProps) => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      setIsAdmin(roles?.some((r) => r.role === "admin" || r.role === "moderator") || false);
    };

    fetchProfile();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-glow">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
            MyConnect
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to="/feed">
              <Home className="w-5 h-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to="/videos">
              <Video className="w-5 h-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to="/search">
              <Search className="w-5 h-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to="/messages">
              <MessageCircle className="w-5 h-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to="/files">
              <Paperclip className="w-5 h-5" />
            </Link>
          </Button>

          <NotificationBell userId={user.id} />

          {isAdmin && (
            <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
              <Link to="/admin">
                <Shield className="w-5 h-5" />
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
            <Link to={`/profile/${username}`}>
              <User className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>

          <Link to={`/profile/${username}`}>
            <Avatar className="border-2 border-primary/20 hover:border-primary transition-colors">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
