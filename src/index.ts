import { env } from './configs/env';
import { connectDB } from './db/mongoose';
import app from './app';

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[HTTP] listening on http://localhost:${env.PORT}`);
  });
}
start();
