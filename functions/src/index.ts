import { onRequest } from 'firebase-functions/v2/https';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as http from 'http';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import giftRoutes from './routes/gifts';
import slideRoutes from './routes/slides';
import uploadRoutes from './routes/uploads';
import insightRoutes from './routes/insights';

const app = new Hono().basePath('/v1');
app.use('*', cors());
app.get('/health', (c) => c.json({ status: 'ok', version: '2.0.0' }));

app.route('/auth', authRoutes);
app.route('/user', userRoutes);
app.route('/gifts', giftRoutes);
app.route('/gifts', slideRoutes);    // slides nested under /gifts/:giftId/slides
app.route('/uploads', uploadRoutes);
app.route('/gifts', insightRoutes);  // insights nested under /gifts/:id/insights

// Adapter: convert Node.js IncomingMessage/ServerResponse to Fetch API Request/Response
async function honoHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const protocol = 'https';
  const host = req.headers.host ?? 'localhost';
  const url = `${protocol}://${host}${req.url ?? '/'}`;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else {
      headers.set(key, value);
    }
  }

  const fetchRequest = new Request(url, {
    method: req.method ?? 'GET',
    headers,
    body: body && body.length > 0 ? body : undefined,
  });

  const fetchResponse = await app.fetch(fetchRequest);

  res.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const responseBody = await fetchResponse.arrayBuffer();
  res.end(Buffer.from(responseBody));
}

export const api = onRequest({ region: 'us-central1', cors: true }, honoHandler);
