export interface CacheEntry {
  key: string;
  value: any;
  prev: CacheEntry | null;
  next: CacheEntry | null;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  missRate: number;
} 