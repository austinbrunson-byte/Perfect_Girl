// Entry point. Reads config from the environment (see .env.example).
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production. Refusing to start with the dev default.');
  process.exit(1);
}

const app = createApp();
app.listen(PORT, () => console.log(`Perfect Girl API listening on :${PORT}`));
