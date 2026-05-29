import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {toNodeHandler} from 'better-auth/node';
import {auth} from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';



dotenv.config();



const app = express();
const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));

app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json({ limit: '50mb' }));


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! from the server');
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port} http://localhost:${port}`);

});

export default app;
