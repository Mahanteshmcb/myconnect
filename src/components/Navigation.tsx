import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Compass, PlusSquare, Users, Play, Feather, Gamepad2, LogOut, User, Menu, X, Settings } from "lucide-react";
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
import NotificationBell from "./notifications/NotificationBell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProps {
  user: SupabaseUser;
}

const Navigation = ({ user }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navLinks = [
    { path: "/home", icon: <Home className="w-5 h-5" />, name: "Home" },
    { path: "/messages", icon: <MessageSquare className="w-5 h-5" />, name: "Messages" },
    { path: "/videos", icon: <Play className="w-5 h-5" />, name: "Watch" },
    { path: "/echoes", icon: <Feather className="w-5 h-5" />, name: "Echoes" },
    { path: "/groups", icon: <Users className="w-5 h-5" />, name: "Groups" },
    { path: "/explore", icon: <Compass className="w-5 h-5" />, name: "Explore" },
    { path: "/tictactoe", icon: <Gamepad2 className="w-5 h-5" />, name: "Games" },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <header className="fixed top-0 left-0 right-0 bg-background/70 backdrop-blur-xl border-b border-border/50 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold text-gradient">
            MyConnect
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  title={link.name}
                >
                  {link.icon}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setCreatePostOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:shadow-glow transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusSquare className="w-4 h-4" />
              Post
            </motion.button>

            <NotificationBell userId={user.id} />

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="w-9 h-9 ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${user.user_metadata.username}`} className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.icon}
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setCreatePostOpen(true)}
            className="flex flex-col items-center gap-0.5 p-1.5 text-primary"
          >
            <PlusSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Post</span>
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-lg pt-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreatePost userId={user.id} isOpen={isCreatePostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
};

export default Navigation;
