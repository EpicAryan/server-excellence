import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';

const app: Application = express();

app.use(cors({
  origin: '*', 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});


app.use('/api/auth', authRouter);

export default app;
