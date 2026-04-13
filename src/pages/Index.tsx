import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Users, Heart, MessageCircle, Sparkles, Play, Feather } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/home");
    });
  }, [navigate]);

  const features = [
    { icon: <Users className="w-6 h-6" />, title: "Connect", desc: "Follow friends and discover new people" },
    { icon: <Heart className="w-6 h-6" />, title: "Share", desc: "Post photos, stories, and moments" },
    { icon: <MessageCircle className="w-6 h-6" />, title: "Chat", desc: "Real-time messaging with anyone" },
    { icon: <Play className="w-6 h-6" />, title: "Watch", desc: "Upload and discover short videos" },
    { icon: <Feather className="w-6 h-6" />, title: "Echoes", desc: "Share thoughts with your network" },
    { icon: <Users className="w-6 h-6" />, title: "Groups", desc: "Create communities around interests" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "hsl(250, 85%, 60%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "hsl(330, 85%, 60%)" }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-8 shadow-elegant"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight">
            MyConnect
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Your modern social space — share moments, connect with friends, and build meaningful relationships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="gradient-primary shadow-elegant hover:shadow-glow transition-all text-lg px-10 h-13 rounded-xl"
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="outline"
                className="text-lg px-10 h-13 rounded-xl border-border hover:border-primary/50"
              >
                Sign In
              </Button>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm shadow-card border border-border/50 text-left hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
