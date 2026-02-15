import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import authRouter from './routes/auth.js';
import { attachSockets } from './sockets/index.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
attachSockets(io);

const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blockcity';

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`BlockCity backend listening on :${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Mongo connection failed, running in stateless mode.', error.message);
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`BlockCity backend listening without DB on :${port}`);
    });
  });
