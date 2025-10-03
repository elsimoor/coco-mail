import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes';
import noteRoutes from './routes/noteRoutes';
import fileRoutes from './routes/fileRoutes';

dotenv.config();

async function start() {
  const app = express();
  const db = await connectToDatabase();

  app.use(cors());
  app.use(express.json());

  app.use('/api/emails', emailRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/files', fileRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});