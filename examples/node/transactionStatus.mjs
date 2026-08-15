/**
 * Contoh Check Transaction Status di Node.js.
 *
 * Run: node examples/node/transactionStatus.mjs
 */

import { Config, Pop, Api } from '../../dist/index.js';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const merchantOrderId = 'YOUR_MERCHANT_ORDER_ID';

// ============================================================
// Duitku-Pop
// ============================================================

try {
  console.log('=== Transaction Status (Pop) ===');
  const statusPop = await Pop.transactionStatus(merchantOrderId, config);
  console.log(JSON.stringify(statusPop, null, 2));

  if (statusPop.statusCode === '00') {
    console.log('✅ Action Success');
  } else if (statusPop.statusCode === '01') {
    console.log('⏳ Action Pending');
  } else {
    console.log('❌ Action Failed Or Expired');
  }
} catch (error) {
  console.error('Pop Error:', error.message);
}

// ============================================================
// Duitku-API
// ============================================================

try {
  console.log('');
  console.log('=== Transaction Status (Api) ===');
  const statusApi = await Api.transactionStatus(merchantOrderId, config);
  console.log(JSON.stringify(statusApi, null, 2));

  if (statusApi.statusCode === '00') {
    console.log('✅ Action Success');
  } else if (statusApi.statusCode === '01') {
    console.log('⏳ Action Pending');
  } else {
    console.log('❌ Action Failed Or Expired');
  }
} catch (error) {
  console.error('Api Error:', error.message);
}
