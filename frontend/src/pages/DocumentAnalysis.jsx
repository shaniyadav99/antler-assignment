import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';

const DocumentAnalysis = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('pending');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/document/results/${id}`);
        setStatus(response.data.status);

        if (response.data.status === 'completed') {
          setAnalysis(response.data.analysis);
        } else if (response.data.status === 'failed') {
          setError(response.data.error);
        }
      } catch (err) {
        setError('Failed to fetch analysis results');
        console.error('Fetch error:', err);
      }
    };

    const interval = setInterval(() => {
      if (status === 'pending' || status === 'processing') {
        fetchResults();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, status]);

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (status === 'pending' || status === 'processing') {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {status === 'processing' ? 'Analyzing document...' : 'Waiting to start analysis...'}
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sentiment Analysis
        </Typography>
        <Typography variant="body1">
          Score: {analysis.sentiment.score.toFixed(2)}
        </Typography>
        <Typography variant="body1">
          Label: {analysis.sentiment.label}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Extracted Entities
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.entities.map((entity, index) => (
                <TableRow key={index}>
                  <TableCell>{entity.type}</TableCell>
                  <TableCell>{entity.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Section Summaries
        </Typography>
        <List>
          {analysis.summaries.map((summary, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={summary.section}
                secondary={summary.summary}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DocumentAnalysis;
