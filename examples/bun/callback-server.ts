/**
 * Contoh Callback Server menggunakan Bun.serve.
 *
 * Duitku mengirim callback via HTTP POST dengan content-type
 * application/x-www-form-urlencoded.
 *
 * Run: bun examples/bun/callback-server.ts
 * Test: curl -X POST http://localhost:3011/callback \
 *   -d "merchantCode=D0001&amount=10000&merchantOrderId=12345&resultCode=00&reference=ABC123&signature=VALID_SIGNATURE"
 */

import { Config, Pop, Api } from '../../src/index';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

Bun.serve({
  port: 3011,

  // req akan otomatis bertipe Request setelah @types/bun terinstall
  async fetch(req) {
    const url = new URL(req.url);

    // Callback Duitku-Pop
    if (req.method === 'POST' && url.pathname === '/callback/pop') {
      try {
        const formData = await req.formData();
        const body = Object.fromEntries(formData.entries());

        const notification = Pop.callback(body, config);
        console.log('=== Callback Notification (Pop) ===');
        console.log(JSON.stringify(notification, null, 2));

        if (notification.resultCode === '00') {
          console.log('✅ Payment Success');
        } else if (notification.resultCode === '01') {
          console.log('❌ Payment Failed');
        }

        return Response.json(notification);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Callback Error:', message);
        return Response.json({ error: message }, { status: 400 });
      }
    }

    // Callback Duitku-API
    if (req.method === 'POST' && url.pathname === '/callback/api') {
      try {
        const formData = await req.formData();
        const body = Object.fromEntries(formData.entries());

        const notification = Api.callback(body, config);
        console.log('=== Callback Notification (Api) ===');
        console.log(JSON.stringify(notification, null, 2));

        return Response.json(notification);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Callback Error:', message);
        return Response.json({ error: message }, { status: 400 });
      }
    }

    // Home
    if (url.pathname === '/') {
      return new Response(`
        Duitku Callback Server
        ======================
        POST /callback/pop  - Callback Duitku-Pop
        POST /callback/api  - Callback Duitku-API
      `);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log('Callback server running at http://localhost:3011');
console.log('');
console.log('Endpoints:');
console.log('  POST /callback/pop  - Callback Duitku-Pop');
console.log('  POST /callback/api  - Callback Duitku-API');
