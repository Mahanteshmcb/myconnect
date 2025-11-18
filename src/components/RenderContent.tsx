import React from "react";
import { Link } from "react-router-dom";

interface RenderContentProps {
  text: string;
  className?: string;
}

const RenderContent: React.FC<RenderContentProps> = ({ text, className }) => {
  // This regex finds @mentions and #hashtags
  const regex = /(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const username = part.substring(1);
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              className="text-primary hover:underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("#")) {
          const tag = part.substring(1);
          return (
            <Link
              key={index}
              to={`/hashtags/${tag}`}
              className="text-primary hover:underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
};

export default RenderContent;