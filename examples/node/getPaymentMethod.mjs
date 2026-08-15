/**
 * Contoh Get Payment Method di Node.js.
 *
 * Run: node examples/node/getPaymentMethod.mjs
 */

import { Config, Pop, Api } from '../../dist/index.js';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const paymentAmount = '10000';

// ============================================================
// Duitku-Pop
// ============================================================

try {
  console.log('=== Payment Methods (Pop) ===');
  const methodsPop = await Pop.getPaymentMethod(paymentAmount, config);
  console.log(JSON.stringify(methodsPop, null, 2));
} catch (error) {
  console.error('Pop Error:', error.message);
}

// ============================================================
// Duitku-API
// ============================================================

try {
  console.log('');
  console.log('=== Payment Methods (Api) ===');
  const methodsApi = await Api.getPaymentMethod(paymentAmount, config);
  console.log(JSON.stringify(methodsApi, null, 2));
} catch (error) {
  console.error('Api Error:', error.message);
}
