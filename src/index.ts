import dotenv from 'dotenv';
dotenv.config();
import db from "./config/db_connect";
import { Request, Response } from 'express';
import app from "./app";


const port = process.env.PORT || 4000;

db.$client.connect()
  .then(client => {
    console.log('Database connection successful');
    client.release(); 

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });

  app.get("/",(req: Request,res: Response)=>{
    res.json("Welcome to the API");
  });
