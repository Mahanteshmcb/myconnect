import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type !== "recovery") {
      // Also check query params
      const searchParams = new URLSearchParams(window.location.search);
      const searchType = searchParams.get("type");
      if (searchType !== "recovery") {
        // Allow the page to render anyway - the session might already be set
      }
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated!", description: "Your password has been reset successfully." });
      setTimeout(() => navigate("/home"), 2000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "hsl(250, 85%, 60%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-elegant">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">MyConnect</h1>
        </div>

        <Card className="shadow-elegant border-border/40 backdrop-blur-sm bg-card/80">
          <CardContent className="p-8">
            {success ? (
              <motion.div className="text-center py-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
                <p className="text-muted-foreground">Redirecting you now...</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">Set new password</h2>
                <p className="text-muted-foreground text-sm mb-6">Enter your new password below</p>
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 h-12 bg-muted/50 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pl-10 h-12 bg-muted/50 border-border/50" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 gradient-primary shadow-elegant" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
