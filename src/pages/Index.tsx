import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Camera, Users, Heart, MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/feed");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-8 shadow-glow animate-pulse">
            <Camera className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-primary bg-clip-text text-transparent">
              MyConnect
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Share your moments, connect with friends, and build meaningful connections in a beautiful social space.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-primary shadow-glow hover:shadow-elegant transition-all text-lg px-8"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary/20 hover:border-primary"
            >
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur shadow-elegant border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect</h3>
              <p className="text-muted-foreground">Follow friends and discover new connections</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur shadow-elegant border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Share</h3>
              <p className="text-muted-foreground">Post photos and moments from your life</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur shadow-elegant border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Engage</h3>
              <p className="text-muted-foreground">Like and comment on posts you love</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
