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

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
  credentials: true,
  optionsSuccessStatus: 200,
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
