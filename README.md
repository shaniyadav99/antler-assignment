# AI/ML Integration Assignment - MERN Stack

This project implements two main components:

1. A caching system for AI responses with LRU eviction policy
2. An AI-powered document analysis application

## Project Structure

```
antler-assignment/
├── backend/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── cache/          # LRU Cache implementation
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Frontend utilities
│   └── package.json
└── package.json           # Root package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- OpenAI API key (or other LLM API key)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Create environment variables:

```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/antler-assignment
OPENAI_API_KEY=your_api_key
CACHE_SIZE=1000  # Number of items to keep in cache
```

### Running the Application

1. Start MongoDB
2. Start the backend:

```bash
cd backend
npm run dev
```

3. Start the frontend:

```bash
cd frontend
npm start
```

## Features

### Part 1: Caching System

- LRU (Least Recently Used) cache implementation
- In-memory storage with MongoDB fallback
- Thread-safe operations
- Performance benchmarking

### Part 2: Document Analysis

- Document upload and storage
- AI-powered analysis with chain-of-prompts
- Real-time progress tracking
- Structured data extraction
- Sentiment analysis

## API Documentation

### Cache System

- `GET /api/cache/stats` - Get cache statistics
- `GET /api/cache/benchmark` - Run performance benchmarks

### Document Analysis

- `POST /api/upload` - Upload document
- `POST /api/analyze` - Analyze document
- `GET /api/results/:id` - Get analysis results

## Testing

Run tests for both backend and frontend:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Performance Benchmarks

The caching system includes built-in benchmarking tools to measure:

- Cache hit/miss rates
- Response times
- Memory usage
- Throughput

## License

MIT
