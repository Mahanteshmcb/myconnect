import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface Settings {
  private_profile: boolean;
  email_notifications: boolean;
  message_notifications: boolean;
  like_notifications: boolean;
  follow_notifications: boolean;
  comment_notifications: boolean;
}

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [settings, setSettings] = useState<Settings>({
    private_profile: false,
    email_notifications: true,
    message_notifications: true,
    like_notifications: true,
    follow_notifications: true,
    comment_notifications: true,
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
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
      
      // Load theme preference
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
      setTheme(savedTheme);
      
      // Load user settings from profiles table (extended with settings)
      fetchUserSettings(session.user.id);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Extract settings from profile data if they exist
      if (data) {
        setSettings({
          private_profile: (data as any).private_profile || false,
          email_notifications: (data as any).email_notifications !== false,
          message_notifications: (data as any).message_notifications !== false,
          like_notifications: (data as any).like_notifications !== false,
          follow_notifications: (data as any).follow_notifications !== false,
          comment_notifications: (data as any).comment_notifications !== false,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(settings as any)
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: "Settings saved!", description: "Your settings have been updated." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      toast({ title: "Password changed!", description: "Your password has been updated." });
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          {/* Privacy Settings */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control who can see your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Private Profile</Label>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
                </div>
                <Switch
                  checked={settings.private_profile}
                  onCheckedChange={(value) => handleSettingChange("private_profile", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Email Notifications</Label>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(value) => handleSettingChange("email_notifications", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Message Notifications</Label>
                <Switch
                  checked={settings.message_notifications}
                  onCheckedChange={(value) => handleSettingChange("message_notifications", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Like Notifications</Label>
                <Switch
                  checked={settings.like_notifications}
                  onCheckedChange={(value) => handleSettingChange("like_notifications", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Follow Notifications</Label>
                <Switch
                  checked={settings.follow_notifications}
                  onCheckedChange={(value) => handleSettingChange("follow_notifications", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Comment Notifications</Label>
                <Switch
                  checked={settings.comment_notifications}
                  onCheckedChange={(value) => handleSettingChange("comment_notifications", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base mb-3 block">Theme</Label>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">Contact support to change email</p>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base mb-4 block">Change Password</Label>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <Label htmlFor="new-password" className="text-sm">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="text-sm">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={saving || !passwordForm.new} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Save & Logout */}
          <div className="flex gap-4">
            <Button onClick={handleSaveSettings} disabled={saving} className="flex-1 gradient-primary shadow-elegant">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Settings
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex-1">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
