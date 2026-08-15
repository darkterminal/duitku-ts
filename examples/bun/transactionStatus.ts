/**
 * Contoh Check Transaction Status di Bun.
 *
 * Run: bun examples/bun/transactionStatus.ts
 */

import { Config, Pop, Api } from '../../src/index';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const merchantOrderId = 'YOUR_MERCHANT_ORDER_ID';

try {
  console.log('=== Transaction Status (Pop) ===');
  const status = await Pop.transactionStatus(merchantOrderId, config);
  console.log(JSON.stringify(status, null, 2));

  if (status.statusCode === '00') {
    console.log('✅ Success');
  } else if (status.statusCode === '01') {
    console.log('⏳ Pending');
  } else {
    console.log('❌ Failed/Expired');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
}
