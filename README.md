# Memoir - AI Mental Wellness Platform

Memoir is an AI-powered mental wellness platform designed to help users with reflective journaling, mood tracking, and compassionate insights. It provides a safe space for users to document their thoughts, engage in AI-driven conversations, and gain personalized insights into their emotional well-being.

## Features

- **Reflective Journaling**: Write and save journal entries with automatic sentiment analysis.
- **AI Chat Companion**: Interact with AI personas (Mentor, Coach, Psychologist) for supportive conversations.
- **Mood Tracking**: Visualize mood trends over time with interactive charts.
- **Insights Dashboard**: Discover patterns, triggers, and habits through data visualization, including word clouds and emotion pie charts.
- **Time Travel Reflections**: Generate AI summaries of journal entries over custom date ranges.
- **Personalized Settings**: Customize AI persona, privacy settings, and theme preferences.
- **Demo Mode**: Graceful fallbacks for offline microservices, with seeded demo data.
- **Multi-Service Architecture**: Scalable setup with separate services for chat, sentiment, insights, and summaries.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** and **D3** for data visualization
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** for user data and journal logs
- **Neo4j** for graph-based insights
- **JWT** for authentication
- **Bcrypt** for password hashing

### Microservices (FastAPI)
- **Chat Service**: Handles AI conversations
- **Sentiment Service**: Analyzes text for emotions and keywords
- **Insights Service**: Extracts patterns and trends
- **Summary Service**: Generates reflective summaries

### Infrastructure
- **Docker** and Docker Compose for containerization
- **Uvicorn** for FastAPI services

## Project Structure

```
memoir/
├── frontend/          # React app (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/     # App pages (Landing, Login, Dashboard, etc.)
│   │   ├── main.tsx   # App entry point
│   │   └── index.css  # Global styles
│   ├── package.json
│   └── Dockerfile
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API routes (auth, journal, chat, etc.)
│   │   ├── models/    # Mongoose schemas (User, JournalLog)
│   │   ├── middleware/# Auth middleware
│   │   ├── server.js  # Main server file
│   │   └── seed.js    # Demo data seeder
│   ├── package.json
│   └── Dockerfile
├── services/          # FastAPI microservices
│   ├── chat/          # AI chat service
│   ├── sentiment/     # Sentiment analysis
│   ├── insights/      # Insights extraction
│   └── summary/       # Summary generation
├── docker-compose.yml # Docker orchestration
├── package.json       # Root scripts
└── README.md
```

## Installation

### Prerequisites
- **Docker Desktop** (for containerized setup)
- **Node.js** and **npm** (for local development)
- **Python** and **pip** (for microservices development)

### Quick Start with Docker
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd memoir
   ```

2. Start all services:
   ```bash
   docker compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - MongoDB: localhost:27017
   - Neo4j Browser: http://localhost:7474 (username: neo4j, password: pass)

### Development Setup (without Docker)
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run seed  # Seed demo data
   npm start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Microservices** (run each in separate terminals):
   ```bash
   cd services/<service-name>
   pip install -r requirements.txt
   uvicorn main:app --reload --port <port>
   ```
   - Chat: port 8002
   - Sentiment: port 8001
   - Insights: port 8004
   - Summary: port 8003

4. Set up databases:
   - Install MongoDB and Neo4j locally, or use Docker for them.

## Usage

1. **Sign Up/Login**: Create an account or log in with demo credentials (email: demo@memoir.app, password: demo1234).
2. **Dashboard**: View mood overview and quick actions.
3. **Journal**: Write entries, analyze sentiment, and view past logs.
4. **Chat**: Engage with AI personas for support.
5. **Insights**: Explore visualizations and patterns.
6. **Time Travel**: Generate summaries over date ranges.
7. **Settings**: Customize preferences and manage data.

## API Endpoints

### Backend (Express)
- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /journal/create` - Create journal entry
- `GET /journal/list` - List user journal entries
- `POST /chat/send` - Send chat message
- `POST /sentiment/analyze` - Analyze text sentiment
- `POST /insights/summary` - Generate summary
- `GET /insights/graph` - Get graph insights
- `POST /settings/update` - Update user settings

### Microservices (FastAPI)
- `POST /chat` (Chat Service) - AI chat response
- `POST /sentiment` (Sentiment Service) - Sentiment analysis
- `POST /insights` (Insights Service) - Extract insights
- `POST /summary` (Summary Service) - Generate summary

## Environment Variables

Create `.env` files in `backend/` and adjust as needed:

```env
# Backend
PORT=4000
MONGO_URI=mongodb://mongo:27017/memoir
JWT_SECRET=devsecret
SENTIMENT_URL=http://sentiment:8001/sentiment
CHAT_URL=http://chat:8002/chat
SUMMARY_URL=http://summary:8003/summary
NEO4J_URI=neo4j://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASS=pass
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please ensure code follows the project's style and includes tests where applicable.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

Memoir is designed for informational and supportive purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing mental health concerns, please consult a qualified healthcare professional or contact appropriate support services.

## Notes

- AI/microservice logic is stubbed for demo purposes. Replace with real models/APIs in production.
- Backend falls back to demo responses if microservices are unavailable.
- Demo data is seeded for testing; use `npm run seed` in backend.


