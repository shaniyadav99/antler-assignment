import { CacheEntry } from './types';

export class LRUCache {
  private capacity: number;
  private cache: Map<string, CacheEntry>;
  private head: CacheEntry | null;
  private tail: CacheEntry | null;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  };

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  public get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    this.moveToHead(entry);
    this.stats.hits++;
    return entry.value;
  }

  public put(key: string, value: any): void {
    let entry = this.cache.get(key);

    if (entry) {
      entry.value = value;
      this.moveToHead(entry);
    } else {
      entry = {
        key,
        value,
        prev: null,
        next: this.head,
      };

      if (this.head) {
        this.head.prev = entry;
      }
      this.head = entry;

      if (!this.tail) {
        this.tail = entry;
      }

      this.cache.set(key, entry);

      if (this.cache.size > this.capacity) {
        this.evict();
      }
    }
  }

  private moveToHead(entry: CacheEntry): void {
    if (entry === this.head) return;

    // Remove from current position
    if (entry.prev) {
      entry.prev.next = entry.next;
    }
    if (entry.next) {
      entry.next.prev = entry.prev;
    }

    // Move to head
    entry.prev = null;
    entry.next = this.head;
    if (this.head) {
      this.head.prev = entry;
    }
    this.head = entry;

    // Update tail if needed
    if (entry === this.tail && entry.prev) {
      this.tail = entry.prev;
    }
  }

  private evict(): void {
    if (!this.tail) return;

    const key = this.tail.key;
    this.cache.delete(key);
    this.stats.evictions++;

    if (this.tail.prev) {
      this.tail.prev.next = null;
      this.tail = this.tail.prev;
    } else {
      this.head = null;
      this.tail = null;
    }
  }

  public getStats(): typeof this.stats {
    return { ...this.stats };
  }

  public clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }
} 