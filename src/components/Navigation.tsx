import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, MessageSquare, Compass, Heart, PlusSquare, Users, Play, Feather, Search, FileText } from "lucide-react";
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
import { Button } from "@/components/ui/button";

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
    { path: "/search", icon: <Search />, name: "Search" },
    { path: "/messages", icon: <MessageSquare />, name: "Messages" },
    { path: "/videos", icon: <Play />, name: "Watch" },
    { path: "/echoes", icon: <Feather />, name: "Echoes" },
    { path: "/groups", icon: <Users />, name: "Groups" },
    { path: "/files", icon: <FileText />, name: "Files" },
    { path: "/explore", icon: <Compass />, name: "Explore" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            MyConnect
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`p-2 rounded-md hover:bg-accent transition-colors ${
                  location.pathname === link.path ? "text-primary" : "text-foreground/70"
                }`}
                title={link.name}
              >
                {link.icon}
              </Link>
            ))}
            <Button
              onClick={() => setCreatePostOpen(true)}
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:bg-accent"
              title="Create Post"
            >
              <PlusSquare />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreatePostOpen(true)}
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground/70 hover:bg-accent"
              title="Create Post"
            >
              <PlusSquare />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                  <AvatarFallback>{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${user.user_metadata?.username || user.id}`}>
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