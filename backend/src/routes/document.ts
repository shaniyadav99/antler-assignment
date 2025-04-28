import express from 'express';
import multer from 'multer';
import path from 'path';
import { Document } from '../models/Document';
import { analyzeDocument } from '../services/documentAnalysis';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and TXT files are allowed.'));
    }
  },
});

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    await document.save();
    res.json({ id: document._id, status: document.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Analyze document
router.post('/analyze/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.status === 'processing') {
      return res.status(400).json({ error: 'Document is already being processed' });
    }

    document.status = 'processing';
    await document.save();

    // Start analysis in background
    analyzeDocument(document).catch(error => {
      console.error('Analysis failed:', error);
      document.status = 'failed';
      document.error = error.message;
      document.save();
    });

    res.json({ status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start analysis' });
  }
});

// Get analysis results
router.get('/results/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.status === 'pending' || document.status === 'processing') {
      return res.json({ status: document.status });
    }

    if (document.status === 'failed') {
      return res.status(500).json({ 
        status: 'failed',
        error: document.error 
      });
    }

    res.json({
      status: 'completed',
      analysis: document.analysis
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export const documentRouter = router; 