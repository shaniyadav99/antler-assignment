import { Document } from '../models/Document';
import { OpenAI } from 'openai';
import fs from 'fs';
import { promisify } from 'util';
import { LRUCache } from '../cache/LRUCache';

const readFile = promisify(fs.readFile);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize cache for document analysis results
const analysisCache = new LRUCache(parseInt(process.env.CACHE_SIZE || '1000'));

// Prompts for document analysis
const PROMPTS = {
  extractEntities: `Extract key entities from the following text. Include names, dates, organizations, and important topics. Format the response as a JSON array of objects with 'type' and 'value' fields.`,
  summarizeSections: `Summarize each section of the following text in one sentence. Format the response as a JSON array of objects with 'section' and 'summary' fields.`,
  analyzeSentiment: `Analyze the overall sentiment of the following text. Provide a sentiment score between -1 (negative) and 1 (positive), and a label (positive, negative, or neutral). Format the response as a JSON object with 'score' and 'label' fields.`,
};

export async function analyzeDocument(document: Document): Promise<void> {
  try {
    // Check cache first
    const cachedAnalysis = analysisCache.get(document._id.toString());
    if (cachedAnalysis) {
      document.analysis = cachedAnalysis;
      document.status = 'completed';
      await document.save();
      return;
    }

    // Read document content
    const content = await readFile(document.path, 'utf-8');

    // Chain of prompts for analysis
    const [entities, summaries, sentiment] = await Promise.all([
      analyzeWithRetry(PROMPTS.extractEntities, content),
      analyzeWithRetry(PROMPTS.summarizeSections, content),
      analyzeWithRetry(PROMPTS.analyzeSentiment, content),
    ]);

    // Update document with analysis results
    document.analysis = {
      entities: JSON.parse(entities),
      summaries: JSON.parse(summaries),
      sentiment: JSON.parse(sentiment),
    };

    // Cache the results
    analysisCache.put(document._id.toString(), document.analysis);

    document.status = 'completed';
    await document.save();
  } catch (error) {
    console.error('Document analysis failed:', error);
    throw error;
  }
}

async function analyzeWithRetry(prompt: string, content: string, maxRetries = 2): Promise<string> {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that analyzes documents." },
          { role: "user", content: `${prompt}\n\n${content}` }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError;
} 