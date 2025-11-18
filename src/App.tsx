import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import PostPage from "@/pages/Post";
import Messages from "@/pages/Messages";
import Groups from "@/pages/Groups";
import Group from "@/pages/Group";
import Explore from "@/pages/Explore";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/group/:groupId" element={<Group />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;