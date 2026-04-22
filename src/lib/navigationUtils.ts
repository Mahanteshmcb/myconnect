/**
 * Navigation Utilities for Smooth UX
 * Handles navigation state, smooth transitions, and preventing issues
 */

import { NavigateFunction } from "react-router-dom";

/**
 * Safe navigation with route validation
 */
export const navigateTo = (navigate: NavigateFunction, path: string, replace = false) => {
  try {
    if (replace) {
      navigate(path, { replace: true });
    } else {
      navigate(path);
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }
};

/**
 * Get current user from session
 */
export const getCurrentUser = async (supabase: any) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Validate route access based on user session
 */
export const validateRouteAccess = async (supabase: any, requiredAuth = true) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (requiredAuth && !session) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating route access:", error);
    return false;
  }
};

/**
 * Debounce function for search and other actions
 */
export const debounce = (fn: Function, delay = 300) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = (fn: Function, delay = 300) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * Smooth scroll to element
 */
export const smoothScroll = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

/**
 * Handle pagination with smooth loading
 */
export const handlePagination = (
  currentPage: number,
  totalPages: number,
  pageSize = 10
) => {
  const offset = (currentPage - 1) * pageSize;
  const limit = pageSize;
  return { offset, limit };
};

/**
 * Format URLs for navigation
 */
export const formatUrl = (path: string, params?: Record<string, string>) => {
  let url = path;
  if (params) {
    Object.keys(params).forEach((key, index) => {
      url += (index === 0 && !path.includes("?") ? "?" : "&") + `${key}=${encodeURIComponent(params[key])}`;
    });
  }
  return url;
};

/**
 * Parse URL parameters
 */
export const parseUrlParams = (queryString: string) => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Handle async operations with error handling
 */
export const handleAsync = async (asyncFn: () => Promise<any>) => {
  try {
    const result = await asyncFn();
    return { success: true, data: result, error: null };
  } catch (error: any) {
    console.error("Async operation error:", error);
    return { success: false, data: null, error: error.message || "An error occurred" };
  }
};

/**
 * Retry logic for failed requests
 */
export const retryAsync = async (
  asyncFn: () => Promise<any>,
  retries = 3,
  delay = 1000
): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};
