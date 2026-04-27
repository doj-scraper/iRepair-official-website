// Client-side BotID instrumentation (initBotId)
// This file is imported dynamically on the client to avoid any server/runtime issues.
import { initBotId } from 'botid/client/core';

try {
  initBotId({
    protect: [
      // Protect POST endpoints that modify data / charge customers
      { path: '/api/checkout', method: 'POST' },
      { path: '/api/orders', method: 'POST' },
      // Protect auth/profile endpoints
      { path: '/api/auth-me', method: 'GET' },
      // Catch-all for other server-side POST endpoints
      { path: '/api/*', method: 'POST' },
    ],
    // debug could be enabled in development if needed
    // debug: process.env.NODE_ENV !== 'production',
  });
} catch (err) {
  // Non-fatal: avoid crashing client if BotID is misconfigured
  // The instrumentation will simply fail gracefully.
  // eslint-disable-next-line no-console
  console.error('BotID init failed:', err);
}
