import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import paymentsRouter from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: true }));
app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use('/api/payments', paymentsRouter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is healthy.' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Payments server listening on http://localhost:${port}`);
  });
}
