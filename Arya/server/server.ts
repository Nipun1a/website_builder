import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();



const app = express();
const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(','),
    Credentials: true,
    optionsSuccessStatus: 200,
}

app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! from the server');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port} http://localhost:${port}`);

});

export default app;
