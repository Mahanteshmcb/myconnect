import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import PostPage from "@/pages/PostPage";
import Messages from "@/pages/Messages";
import Groups from "@/pages/Groups";
import Group from "@/pages/Group";
import Explore from "@/pages/Explore";
import Videos from "@/pages/Videos";
import Echoes from "@/pages/Echoes";
import Files from "@/pages/Files";
import Search from "@/pages/Search";
import HashtagPage from "@/pages/Hashtag";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/echoes" element={<Echoes />} />
          <Route path="/files" element={<Files />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hashtags/:tag" element={<HashtagPage />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/group/:groupId" element={<Group />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;