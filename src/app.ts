import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app: Application = express();

// app.use(cors({
//   origin: '*', 
//   credentials: true,
// }));
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Set-Cookie'], // Allow frontend to access Set-Cookie headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add OPTIONS preflight handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.sendStatus(200);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});


app.use('/api', routes);

export default app;
