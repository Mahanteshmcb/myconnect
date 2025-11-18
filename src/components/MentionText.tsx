import React from "react";
import { Link } from "react-router-dom";

interface MentionTextProps {
  text: string;
  className?: string;
}

const MentionText: React.FC<MentionTextProps> = ({ text, className }) => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(mentionRegex, (match, username, offset) => {
    // Add the text before the current mention
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }

    // Add the clickable mention
    parts.push(
      <Link
        key={offset}
        to={`/profile/${username}`}
        className="text-primary hover:underline font-semibold"
      >
        {match}
      </Link>
    );

    lastIndex = offset + match.length;
    return match;
  });

  // Add any remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};

export default MentionText;