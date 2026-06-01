import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

dotenv.config();

const app = express();

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, '');

const trustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(',') ?? []),
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .filter((origin): origin is string => Boolean(origin?.trim()))
  .map(normalizeOrigin);

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    return callback(null, trustedOrigins.includes(normalizeOrigin(origin)));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json({ limit: '50mb' }));

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World! from the server');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

export default app;
