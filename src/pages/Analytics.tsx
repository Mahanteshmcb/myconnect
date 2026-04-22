import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, BarChart3, Heart, MessageCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Post {
  id: string;
  caption: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  views_count?: number;
}

interface AnalyticsData {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  avgLikesPerPost: number;
  posts: Post[];
  dailyStats: Array<{
    date: string;
    likes: number;
    comments: number;
    views: number;
  }>;
}

const Analytics = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { username } = useParams();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if viewing own analytics
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profile?.username !== username) {
        navigate(`/${username}`);
        return;
      }

      setIsOwnProfile(true);
      fetchAnalytics(session.user.id);
    };

    checkUser();
  }, [navigate, username]);

  const fetchAnalytics = async (userId: string) => {
    setLoading(true);
    try {
      // Get all posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          caption,
          image_url,
          created_at,
          likes(count),
          comments(count)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const postsData = posts?.map(p => ({
        id: p.id,
        caption: p.caption,
        image_url: p.image_url,
        created_at: p.created_at,
        likes_count: p.likes?.length || 0,
        comments_count: p.comments?.length || 0,
      })) || [];

      const totalLikes = postsData.reduce((sum, p) => sum + p.likes_count, 0);
      const totalComments = postsData.reduce((sum, p) => sum + p.comments_count, 0);
      const avgLikesPerPost = postsData.length > 0 ? totalLikes / postsData.length : 0;

      // Generate daily stats (grouped by date)
      const dailyMap: { [key: string]: { likes: number; comments: number; views: number } } = {};
      
      postsData.forEach(p => {
        const date = new Date(p.created_at).toLocaleDateString();
        if (!dailyMap[date]) {
          dailyMap[date] = { likes: 0, comments: 0, views: 0 };
        }
        dailyMap[date].likes += p.likes_count;
        dailyMap[date].comments += p.comments_count;
      });

      const dailyStats = Object.entries(dailyMap)
        .map(([date, stats]) => ({
          date,
          ...stats,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setAnalytics({
        totalPosts: postsData.length,
        totalLikes,
        totalComments,
        totalViews: totalLikes + totalComments, // Simple calculation
        avgLikesPerPost: Math.round(avgLikesPerPost * 10) / 10,
        posts: postsData.slice(0, 10), // Top 10 recent posts
        dailyStats,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isOwnProfile || loading || !analytics) {
    return (
      <div className="min-h-screen bg-background">
        {user && <Navigation user={user} />}
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-6xl mx-auto pt-20 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{analytics.totalPosts}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Heart className="w-4 h-4 text-destructive" />
                  Total Likes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{analytics.totalLikes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.avgLikesPerPost.toFixed(1)} avg per post
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{analytics.totalComments}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Total Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{analytics.totalViews}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {analytics.dailyStats.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Daily Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="likes" stroke="#ff1493" name="Likes" />
                      <Line type="monotone" dataKey="comments" stroke="#00bfff" name="Comments" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.dailyStats.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="likes" fill="#ff1493" name="Likes" />
                      <Bar dataKey="comments" fill="#00bfff" name="Comments" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Posts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No posts yet</p>
              ) : (
                analytics.posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <img
                      src={post.image_url}
                      alt={post.caption || "Post"}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">
                        {post.caption || "Untitled Post"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
