console.log("=== ĐÃ VÀO APP.TS ===");
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
