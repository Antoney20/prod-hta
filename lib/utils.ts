import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}






interface RateLimitEntry {
  count: number;
  timestamp: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

/**
 * An in-memory rate limiter for Next.js
 * Note: This will reset when the server restarts
 */
export class MemoryRateLimiter {
  private static store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  
  constructor(
    windowMs: number = 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: number = 5
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean expired entries periodically (if running on server)
    if (typeof window === 'undefined') {
      this.cleanExpiredEntries();
      setInterval(() => this.cleanExpiredEntries(), 60 * 60 * 1000); // Clean every hour
    }
  }
  
  private cleanExpiredEntries(): void {
    const now = Date.now();
    
    Object.keys(MemoryRateLimiter.store).forEach(key => {
      if (now - MemoryRateLimiter.store[key].timestamp > this.windowMs) {
        delete MemoryRateLimiter.store[key];
      }
    });
  }
  
  /**
   * Check and increment the rate limit for a key
   * @param key - The key to check (usually an IP address)
   * @returns An object with limit information
   */
  checkAndIncrement(key: string): {
    success: boolean;
    remaining: number;
    reset: Date;
    limit: number;
  } {
    const now = Date.now();
    
    // Get current entry or create new one
    const entry = MemoryRateLimiter.store[key] || { count: 0, timestamp: now };
    
    // Reset if window has passed
    if (now - entry.timestamp > this.windowMs) {
      entry.count = 0;
      entry.timestamp = now;
    }
    
    // Check if rate limit exceeded
    const isLimited = entry.count >= this.maxRequests;
    
    // Only increment if not limited
    if (!isLimited) {
      entry.count += 1;
      MemoryRateLimiter.store[key] = entry;
    }
    
    return {
      success: !isLimited,
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: new Date(entry.timestamp + this.windowMs),
      limit: this.maxRequests
    };
  }
  
  /**
   * Get current rate limit status without incrementing
   * @param key - The key to check
   */
  getStatus(key: string): {
    remaining: number;
    reset: Date;
    limit: number;
  } {
    const now = Date.now();
    const entry = MemoryRateLimiter.store[key] || { count: 0, timestamp: now };
    
    // Reset if window has passed
    if (now - entry.timestamp > this.windowMs) {
      return {
        remaining: this.maxRequests,
        reset: new Date(now + this.windowMs),
        limit: this.maxRequests
      };
    }
    
    return {
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: new Date(entry.timestamp + this.windowMs),
      limit: this.maxRequests
    };
  }
}

// Export a singleton instance
export const emailRateLimiter = new MemoryRateLimiter();
