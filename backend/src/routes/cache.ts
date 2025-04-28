import express from 'express';
import { LRUCache } from '../cache/LRUCache';

const router = express.Router();
const cache = new LRUCache(parseInt(process.env.CACHE_SIZE || '1000'));

// Get cache statistics
router.get('/stats', (req, res) => {
  const stats = cache.getStats();
  res.json(stats);
});

// Get item from cache
router.get('/:key', (req, res) => {
  const value = cache.get(req.params.key);
  if (value === null) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ value });
});

// Put item in cache
router.put('/:key', (req, res) => {
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }
  cache.put(req.params.key, value);
  res.json({ success: true });
});

// Clear cache
router.delete('/', (req, res) => {
  cache.clear();
  res.json({ success: true });
});

// Run benchmark
router.post('/benchmark', async (req, res) => {
  try {
    const { cacheSize, iterations } = req.body;
    const benchmarkCache = new LRUCache(cacheSize || 1000);
    const results = {
      timings: [] as number[],
      stats: {
        hits: 0,
        misses: 0,
        evictions: 0,
      },
    };

    for (let i = 0; i < (iterations || 1000); i++) {
      const start = process.hrtime();
      const key = `key${i}`;
      benchmarkCache.put(key, `value${i}`);
      benchmarkCache.get(key);
      const [seconds, nanoseconds] = process.hrtime(start);
      results.timings.push(seconds * 1000 + nanoseconds / 1000000);
    }

    results.stats = benchmarkCache.getStats();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Benchmark failed' });
  }
});

export const cacheRouter = router; 