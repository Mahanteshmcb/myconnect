import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, MessageSquare, Compass, Heart, PlusSquare, Users, Play } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import CreatePost from "./CreatePost";
import { useState } from "react";

interface NavigationProps {
  user: SupabaseUser;
}

const Navigation = ({ user }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navLinks = [
    { path: "/home", icon: <Home />, name: "Home" },
    { path: "/messages", icon: <MessageSquare />, name: "Messages" },
    { path: "/videos", icon: <Play />, name: "Watch" },
    { path: "/groups", icon: <Users />, name: "Groups" },
    { path: "/explore", icon: <Compass />, name: "Explore" },
    { path: "/notifications", icon: <Heart />, name: "Notifications" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold font-pacifico text-primary">
            Instelegram
          </Link>

          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`p-2 rounded-md hover:bg-accent ${
                  location.pathname === link.path ? "text-primary" : "text-foreground/70"
                }`}
                title={link.name}
              >
                {link.icon}
              </Link>
            ))}
            <button
              onClick={() => setCreatePostOpen(true)}
              className="p-2 rounded-md hover:bg-accent text-foreground/70"
              title="Create Post"
            >
              <PlusSquare />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${user.user_metadata.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
      <CreatePost userId={user.id} isOpen={isCreatePostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
};

export default Navigation;