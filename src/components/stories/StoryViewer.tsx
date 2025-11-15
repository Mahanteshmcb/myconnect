import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
  onClose: () => void;
  userId: string;
}

const StoryViewer = ({ stories, onClose, userId }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return prev;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length, onClose]);

  const currentStory = stories[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex gap-1 mb-4">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={currentStory.profiles.avatar_url} />
              <AvatarFallback>{currentStory.profiles.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <div className="font-semibold">{currentStory.profiles.username}</div>
              <div className="text-xs opacity-75">
                {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {currentStory.media_type.startsWith("image") ? (
          <img src={currentStory.media_url} alt="Story" className="max-w-full max-h-full object-contain" />
        ) : (
          <video src={currentStory.media_url} className="max-w-full max-h-full" autoPlay muted />
        )}
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={handlePrevious} />
        <div className="flex-1" onClick={handleNext} />
      </div>
    </div>
  );
};

export default StoryViewer;
