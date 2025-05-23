import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app: Application = express();

// app.use(cors({
//   origin: '*', 
//   credentials: true,
// }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Specific frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add OPTIONS preflight handler
app.options('*', cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});


app.use('/api', routes);

export default app;
