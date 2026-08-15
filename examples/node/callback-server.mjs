/**
 * Contoh Callback Server menggunakan Express di Node.js.
 *
 * Duitku mengirim callback via HTTP POST dengan content-type
 * application/x-www-form-urlencoded.
 *
 * Run: node examples/node/callback-server.mjs
 * Test: curl -X POST http://localhost:3000/callback \
 *   -d "merchantCode=D0001&amount=10000&merchantOrderId=12345&resultCode=00&reference=ABC123&signature=VALID_SIGNATURE"
 *
 * Catatan: Contoh Express memerlukan dependency tambahan. Install dengan:
 * > npm install express
 */

import express from 'express';
import { Config, Pop, Api, DuitkuError } from '../../dist/index.js';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const app = express();
const PORT = 3000;

// Parse x-www-form-urlencoded body
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Callback Duitku-Pop
// ============================================================

app.post('/callback/pop', (req, res) => {
  try {
    const notification = Pop.callback(req.body, config);
    console.log('=== Callback Notification (Pop) ===');
    console.log(JSON.stringify(notification, null, 2));

    if (notification.resultCode === '00') {
      console.log('✅ Payment Success');
      // TODO: Update status order di database
    } else if (notification.resultCode === '01') {
      console.log('❌ Payment Failed');
      // TODO: Tandai order sebagai gagal
    }

    res.json(notification);
  } catch (error) {
    console.error('Callback Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// Callback Duitku-API
// ============================================================

app.post('/callback/api', (req, res) => {
  try {
    const notification = Api.callback(req.body, config);
    console.log('=== Callback Notification (Api) ===');
    console.log(JSON.stringify(notification, null, 2));

    if (notification.resultCode === '00') {
      console.log('✅ Payment Success');
    } else if (notification.resultCode === '01') {
      console.log('❌ Payment Failed');
    }

    res.json(notification);
  } catch (error) {
    console.error('Callback Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(`Callback server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  POST /callback/pop  - Callback Duitku-Pop');
  console.log('  POST /callback/api  - Callback Duitku-API');
});
