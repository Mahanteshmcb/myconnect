import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { Loader2 } from "lucide-react";

const Search = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    users: [],
    posts: [],
    videos: [],
    hashtags: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], videos: [], hashtags: [] });
      return;
    }

    setQuery(searchQuery);
    setLoading(true);

    try {
      const searchTerm = searchQuery.toLowerCase().trim();
      const isHashtag = searchTerm.startsWith("#");
      const cleanTerm = isHashtag ? searchTerm.slice(1) : searchTerm;

      // Search users
      const { data: users } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%`)
        .limit(20);

      // Search posts
      const { data: posts } = await supabase
        .from("posts")
        .select("id, image_url, caption")
        .ilike("caption", `%${cleanTerm}%`)
        .limit(30);

      // Search videos
      const { data: videos } = await supabase
        .from("videos")
        .select("id, video_url, thumbnail_url, caption")
        .ilike("caption", `%${cleanTerm}%`)
        .limit(30);

      // Search hashtags
      const { data: hashtags } = await supabase
        .from("hashtags")
        .select("id, tag, use_count")
        .ilike("tag", `%${cleanTerm}%`)
        .order("use_count", { ascending: false })
        .limit(20);

      setResults({
        users: users || [],
        posts: posts || [],
        videos: videos || [],
        hashtags: hashtags || [],
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto pt-20 pb-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search users, posts, videos, or #hashtags..."
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : query ? (
          <SearchResults {...results} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Start typing to search for users, posts, videos, or hashtags
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;