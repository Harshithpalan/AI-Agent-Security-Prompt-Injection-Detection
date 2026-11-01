# AI Agent Security - Prompt Injection Detection

A web application for detecting prompt injection attacks in AI agent systems. Built with React (frontend) and Node.js/Express (backend).

## Features

- **Comprehensive Detection Engine**: Pattern matching for multiple attack vectors including:
  - Direct instruction overrides
  - Role-play and persona adoption
  - System prompt extraction attempts
  - Jailbreak patterns
  - Format manipulation
  - Delimiter and boundary attacks
  - Encoding attacks
  - Constraint violations

- **Heuristic Analysis**:
  - Repeated word detection
  - Excessive length checks
  - Multiple instruction detection
  - Uppercase intensity analysis

- **Risk Assessment**:
  - Risk levels: Low, Medium, High, Critical
  - Risk scoring (0-20)
  - Confidence percentage
  - Detailed findings with severity ratings

## Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Node.js, Express
- **Styling**: CSS with modern gradient design

## Installation

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Open the application in your browser
2. Enter a prompt in the text area
3. Click "Detect Injection" to analyze
4. View the detailed risk assessment and findings

## API Endpoints

### POST /api/detect

Analyzes a prompt for injection attacks.

**Request Body:**
```json
{
  "prompt": "your prompt text here"
}
```

**Response:**
```json
{
  "isInjection": true,
  "riskLevel": "high",
  "riskScore": 8,
  "findings": [...],
  "confidence": 0.75,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Project Structure

```
.
├── backend/
│   ├── server.js          # Express server
│   ├── detector.js        # Detection logic
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styling
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js     # Vite configuration
│   └── package.json
└── README.md
```

## License

MIT
