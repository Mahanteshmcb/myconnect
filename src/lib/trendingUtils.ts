// Utility functions for calculating trending content scores

export interface TrendingScore {
  id: string;
  score: number;
  recency_score: number;
  engagement_score: number;
}

/**
 * Calculate a trending score for posts based on:
 * - Engagement (likes + comments)
 * - Recency (newer posts rank higher)
 * - Time decay (score decreases over time)
 */
export function calculatePostTrendingScore(
  post: any,
  now: Date = new Date()
): number {
  const createdAt = new Date(post.created_at);
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // Engagement score: likes + comments
  const likes = post.likes?.length || 0;
  const comments = post.comments?.length || 0;
  const engagementScore = (likes * 2 + comments * 3); // Comments weight more
  
  // Recency score: exponential decay
  // Posts from 24 hours ago get 50% weight, 48 hours = 25%, etc.
  const recencyScore = Math.pow(0.5, ageInHours / 24) * 100;
  
  // Combined trending score
  const trendingScore = (engagementScore * 0.6) + (recencyScore * 0.4);
  
  return trendingScore;
}

/**
 * Calculate trending hashtag score based on:
 * - Recent usage
 * - Overall popularity
 */
export function calculateHashtagTrendingScore(
  hashtag: any,
  recentUsageCount: number,
  now: Date = new Date()
): number {
  const basePopularity = hashtag.use_count || 0;
  const recentBoost = recentUsageCount * 5; // Recent usage is weighted heavily
  
  return basePopularity * 0.4 + recentBoost * 0.6;
}

/**
 * Sort items by trending score
 */
export function sortByTrending<T>(
  items: T[],
  scoreFn: (item: T) => number
): T[] {
  return [...items].sort((a, b) => scoreFn(b) - scoreFn(a));
}

/**
 * Get trending posts from an array
 */
export function getTrendingPosts(
  posts: any[],
  timeWindowHours: number = 72
): any[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);
  
  return posts
    .filter(post => new Date(post.created_at) > cutoff)
    .map(post => ({
      ...post,
      trendingScore: calculatePostTrendingScore(post, now),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

/**
 * Get trending hashtags from an array
 */
export function getTrendingHashtags(
  hashtags: any[],
  timeWindowDays: number = 7
): any[] {
  return hashtags
    .map(hashtag => ({
      ...hashtag,
      trendingScore: calculateHashtagTrendingScore(hashtag, hashtag.use_count),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);
}
