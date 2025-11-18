import { supabase } from "@/lib/supabase";

// Function to extract hashtags from a given text
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(hashtagRegex);
  if (!matches) return [];
  // Return unique, lowercase hashtags without the '#'
  return Array.from(new Set(matches.map((match) => match.substring(1).toLowerCase())));
};

// Function to process and link hashtags for a post or video
export const processHashtags = async (
  text: string,
  postId?: string | null,
  videoId?: string | null,
) => {
  const tags = extractHashtags(text);
  const contentId = postId || videoId;
  const contentType = postId ? "post_id" : "video_id";

  if (!contentId) return;

  // 1. Get existing hashtag links for this content
  const { data: existingLinks } = await supabase
    .from("post_hashtags")
    .select("id, hashtags(tag)")
    .eq(contentType, contentId);

  const existingTags = existingLinks?.map(link => (link.hashtags as any).tag) || [];
  
  // 2. Determine which tags to add and which to remove
  const tagsToAdd = tags.filter(tag => !existingTags.includes(tag));
  const tagsToRemove = existingTags.filter(tag => !tags.includes(tag));

  // 3. Upsert all new tags into the 'hashtags' table and get their IDs
  if (tagsToAdd.length > 0) {
    const upsertedHashtags = await Promise.all(
      tagsToAdd.map(tag => 
        supabase.from("hashtags").upsert({ tag }, { onConflict: 'tag' }).select('id').single()
      )
    );

    const newLinks = upsertedHashtags
      .map(result => result.data?.id)
      .filter(Boolean)
      .map(hashtagId => ({
        [contentType]: contentId,
        hashtag_id: hashtagId,
      }));

    if (newLinks.length > 0) {
      await supabase.from("post_hashtags").insert(newLinks as any);
    }
  }

  // 4. Remove old hashtag links that are no longer in the text
  if (tagsToRemove.length > 0) {
    const { data: hashtagsToRemoveData } = await supabase
      .from("hashtags")
      .select("id")
      .in("tag", tagsToRemove);

    if (hashtagsToRemoveData && hashtagsToRemoveData.length > 0) {
      const hashtagIdsToRemove = hashtagsToRemoveData.map(h => h.id);
      await supabase
        .from("post_hashtags")
        .delete()
        .eq(contentType, contentId)
        .in("hashtag_id", hashtagIdsToRemove);
    }
  }
};