import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const CacheStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cache/stats');
      const { hits, misses, evictions } = response.data;
      const total = hits + misses;
      setStats({
        ...response.data,
        hitRate: total > 0 ? (hits / total) * 100 : 0,
        missRate: total > 0 ? (misses / total) * 100 : 0,
      });
    } catch (err) {
      setError('Failed to fetch cache statistics');
      console.error('Fetch error:', err);
    }
  };

  const runBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3000/api/cache/benchmark', {
        cacheSize: 1000,
        iterations: 1000,
      });
      setBenchmarkResults(response.data);
    } catch (err) {
      setError('Failed to run benchmark');
      console.error('Benchmark error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cache Statistics
        </Typography>
        {stats ? (
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Hits</TableCell>
                  <TableCell>{stats.hits}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Misses</TableCell>
                  <TableCell>{stats.misses}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Evictions</TableCell>
                  <TableCell>{stats.evictions}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hit Rate</TableCell>
                  <TableCell>{stats.hitRate.toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Miss Rate</TableCell>
                  <TableCell>{stats.missRate.toFixed(2)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CircularProgress />
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Benchmark
        </Typography>
        <Button
          variant="contained"
          onClick={runBenchmark}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Run Benchmark
        </Button>
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        {benchmarkResults && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Average Latency</TableCell>
                  <TableCell>
                    {(
                      benchmarkResults.timings.reduce((a, b) => a + b, 0) /
                      benchmarkResults.timings.length
                    ).toFixed(2)}{' '}
                    ms
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Throughput</TableCell>
                  <TableCell>
                    {(
                      (1000 * benchmarkResults.timings.length) /
                      benchmarkResults.timings.reduce((a, b) => a + b, 0)
                    ).toFixed(2)}{' '}
                    ops/sec
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CacheStats;
