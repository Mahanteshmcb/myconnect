import { supabase } from "@/lib/supabase";

// Function to extract usernames from a given text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];
  return Array.from(new Set(matches.map((match) => match.substring(1)))); // Remove '@' and get unique usernames
};

// Function to create notifications for mentioned users
export const createMentionNotifications = async (
  text: string,
  actorId: string,
  relatedId: string, // post_id or video_id
  type: "post_mention" | "comment_mention" | "video_comment_mention" | "video_caption_mention" | "echo_mention",
) => {
  const mentionedUsernames = extractMentions(text);

  if (mentionedUsernames.length === 0) return;

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", mentionedUsernames);

  if (profileError) {
    console.error("Error fetching mentioned profiles:", profileError);
    return;
  }

  const notificationsToInsert = profiles
    .filter((profile) => profile.id !== actorId) // Don't notify self
    .map((profile) => ({
      user_id: profile.id,
      type: type,
      content: `mentioned you in a ${type.includes("comment") ? "comment" : "post"}`,
      actor_id: actorId,
      related_id: relatedId,
    }));

  if (notificationsToInsert.length > 0) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationsToInsert);

    if (notificationError) {
      console.error("Error creating mention notifications:", notificationError);
    }
  }
};