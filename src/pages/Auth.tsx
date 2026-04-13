import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Mail, Lock, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/home");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) navigate("/home");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Check your inbox",
          description: "We've sent you a password reset link.",
        });
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Successfully signed in." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, full_name: fullName },
            emailRedirectTo: `${window.location.origin}/home`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "hsl(250, 85%, 60%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: "hsl(330, 85%, 60%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "hsl(250, 85%, 60%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-elegant"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gradient mb-2">MyConnect</h1>
          <p className="text-muted-foreground text-sm">
            Share moments, connect with the world
          </p>
        </motion.div>

        {/* Card */}
        <Card className="shadow-elegant border-border/40 backdrop-blur-sm bg-card/80">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={mode} variants={formVariants} initial="initial" animate="animate" exit="exit">
                <h2 className="text-2xl font-bold mb-1">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {mode === "login"
                    ? "Sign in to continue your journey"
                    : mode === "signup"
                    ? "Join thousands connecting on MyConnect"
                    : "Enter your email and we'll send a reset link"}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                  {mode === "signup" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="username" placeholder="johndoe" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} className="pl-10 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors" />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
                        {mode === "login" && (
                          <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 h-12 bg-muted/50 border-border/50 focus:bg-background transition-colors" />
                      </div>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" className="w-full h-12 gradient-primary shadow-elegant hover:shadow-glow transition-all text-base font-semibold" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-6 text-center space-y-2">
                  {mode === "forgot" ? (
                    <button onClick={() => setMode("login")} className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">
                      Back to sign in
                    </button>
                  ) : (
                    <button
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mode === "login" ? (
                        <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
                      ) : (
                        <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
