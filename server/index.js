import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import routes from './routes/index.js';
import { initSocket } from './socket/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

// Security and middleware configuration
app.use(helmet());

app.use(
    cors({
        origin: [env.CLIENT_URL],
        credentials: true,
    })
);

app.use(express.json({ limit: '1mb' }));

// API rate limiting
app.use(
    '/api/',
    rateLimit({
        windowMs: 60_000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
await connectDb();

const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
    console.log(`TaskFlow API on :${env.PORT}`);
});
