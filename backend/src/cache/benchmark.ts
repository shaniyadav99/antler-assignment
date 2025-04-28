import { LRUCache } from './LRUCache';
import { performance } from 'perf_hooks';

const CACHE_SIZE = 1000;
const TEST_ITERATIONS = 10000;
const WARMUP_ITERATIONS = 1000;

async function benchmark() {
  console.log('Starting cache benchmark...');
  console.log(`Cache size: ${CACHE_SIZE}`);
  console.log(`Test iterations: ${TEST_ITERATIONS}`);
  console.log(`Warmup iterations: ${WARMUP_ITERATIONS}`);

  const cache = new LRUCache(CACHE_SIZE);
  const results = {
    warmup: { hits: 0, misses: 0 },
    test: { hits: 0, misses: 0 },
    timings: [] as number[],
  };

  // Warmup phase
  console.log('\nWarmup phase...');
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const key = `key${i}`;
    cache.put(key, `value${i}`);
    cache.get(key);
  }
  results.warmup = cache.getStats();
  cache.clear();

  // Test phase
  console.log('\nTest phase...');
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    const start = performance.now();
    const key = `key${i}`;
    cache.put(key, `value${i}`);
    cache.get(key);
    const end = performance.now();
    results.timings.push(end - start);
  }
  results.test = cache.getStats();

  // Calculate statistics
  const timings = results.timings.sort((a, b) => a - b);
  const p50 = timings[Math.floor(timings.length * 0.5)];
  const p95 = timings[Math.floor(timings.length * 0.95)];
  const p99 = timings[Math.floor(timings.length * 0.99)];
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;

  // Print results
  console.log('\nBenchmark Results:');
  console.log('------------------');
  console.log('Warmup Phase:');
  console.log(`  Hits: ${results.warmup.hits}`);
  console.log(`  Misses: ${results.warmup.misses}`);
  console.log(`  Hit Rate: ${(results.warmup.hits / (results.warmup.hits + results.warmup.misses) * 100).toFixed(2)}%`);

  console.log('\nTest Phase:');
  console.log(`  Hits: ${results.test.hits}`);
  console.log(`  Misses: ${results.test.misses}`);
  console.log(`  Hit Rate: ${(results.test.hits / (results.test.hits + results.test.misses) * 100).toFixed(2)}%`);
  console.log(`  Evictions: ${results.test.evictions}`);

  console.log('\nPerformance Metrics:');
  console.log(`  Average Latency: ${avg.toFixed(3)}ms`);
  console.log(`  P50 Latency: ${p50.toFixed(3)}ms`);
  console.log(`  P95 Latency: ${p95.toFixed(3)}ms`);
  console.log(`  P99 Latency: ${p99.toFixed(3)}ms`);
  console.log(`  Throughput: ${(TEST_ITERATIONS / (timings.reduce((a, b) => a + b, 0) / 1000)).toFixed(2)} ops/sec`);
}

benchmark().catch(console.error); 