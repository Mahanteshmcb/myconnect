
import { Post, User, LongFormVideo, Video, ExploreItem } from '../types';

/**
 * CORE ENGINE
 * 
 * This file acts as the algorithmic brain of MyConnect.
 * It simulates complex backend logic usually handled by microservices.
 */

// --- Constants for Algorithm Tuning ---
const RECENCY_DECAY_FACTOR = 0.8; // How fast old posts lose value
const AFFINITY_WEIGHT = 2.5; // Multiplier for content from friends
const ENGAGEMENT_WEIGHT_LIKES = 1.0;
const ENGAGEMENT_WEIGHT_COMMENTS = 2.0;
const ENGAGEMENT_WEIGHT_SHARES = 3.5;
const TRENDING_THRESHOLD = 5000;

/**
 * 1. RANKING ALGORITHM (EdgeRank Inspired)
 * Calculates a score for every piece of content relative to the specific user.
 * Score = (Affinity * Weight * TimeDecay)
 */
export const calculateFeedScore = (post: Post, currentUser: User): number => {
    // A. Affinity: Relationship strength
    let affinity = 1.0;
    if (currentUser.followingIds?.includes(post.author.id)) {
        affinity = AFFINITY_WEIGHT;
    }
    if (post.author.id === currentUser.id) {
        affinity = 1.0; // Standard for self
    }

    // B. Weight: Engagement metrics
    // We parse the numeric values from the string/mock data if needed, assuming types.ts has numbers now
    const weight = (post.likes * ENGAGEMENT_WEIGHT_LIKES) + 
                   (post.comments * ENGAGEMENT_WEIGHT_COMMENTS) + 
                   (post.shares * ENGAGEMENT_WEIGHT_SHARES);

    // C. Time Decay
    // Calculate hours since posted
    const now = Date.now();
    const postTime = post.unixTimestamp || (now - Math.random() * 10000000); // Fallback if no timestamp
    const hoursElapsed = (now - postTime) / (1000 * 60 * 60);
    
    // Decay function: 1 / (time + 2)^gravity
    const timeDecay = 1 / Math.pow(hoursElapsed + 2, 1.5);

    // Final Score
    return affinity * weight * timeDecay;
};

export const getPersonalizedFeed = (posts: Post[], currentUser: User): Post[] => {
    const scoredPosts = posts.map(post => ({
        ...post,
        engagementScore: calculateFeedScore(post, currentUser)
    }));

    // Sort by score descending
    return scoredPosts.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
};

/**
 * 2. SEARCH ENGINE (Inverted Index Simulation)
 * Provides weighted fuzzy search capabilities.
 */
export const searchContent = <T extends { id: string, [key: string]: any }>(
    query: string, 
    items: T[], 
    fields: string[]
): T[] => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase().trim();
    const tokens = lowerQuery.split(/\s+/);

    return items.filter(item => {
        let score = 0;
        
        fields.forEach(field => {
            const value = getNestedValue(item, field);
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                
                // Exact match bonus
                if (lowerValue === lowerQuery) score += 100;
                // Contains exact query bonus
                if (lowerValue.includes(lowerQuery)) score += 50;
                
                // Token matching
                tokens.forEach(token => {
                    if (lowerValue.includes(token)) score += 10;
                });
            }
        });

        return score > 0;
    }); // We could sort by score here if we tracked it in a wrapper object
};

// Helper to access "author.name" string paths
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
};

/**
 * 3. ANALYTICS ENGINE (Simulated)
 * Tracks user behavior to improve future recommendations.
 */
const UserInterestProfile: Record<string, number> = {
    'tech': 0.5,
    'art': 0.5,
    'news': 0.5
};

export const trackInteraction = (type: 'view' | 'like' | 'click', category?: string) => {
    if (!category) return;
    
    const weight = type === 'like' ? 0.2 : type === 'click' ? 0.1 : 0.01;
    
    if (UserInterestProfile[category]) {
        UserInterestProfile[category] += weight;
    } else {
        UserInterestProfile[category] = 0.5 + weight;
    }
    
    // Normalize (simple cap)
    if (UserInterestProfile[category] > 1.0) UserInterestProfile[category] = 1.0;
    
    // In a real app, this would dispatch to an API
    // console.log("Updated Interest Profile:", UserInterestProfile);
};

/**
 * 4. TRENDING ALGORITHM
 * Detects velocity of engagement.
 */
export const getTrendingContent = (items: ExploreItem[]): ExploreItem[] => {
    // Simulate velocity: Randomly assign a 'velocity' multiplier to existing likes
    return items
        .map(item => ({
            ...item,
            trendingScore: item.likes * (1 + Math.random()) // Random velocity factor
        }))
        .sort((a, b) => b.trendingScore! - a.trendingScore!);
};

/**
 * 5. FORMATTER UTILITIES
 */
export const formatCompactNumber = (num: number): string => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
};
