/**
 * Contoh Get Payment Method di Bun.
 *
 * Run: bun examples/bun/getPaymentMethod.ts
 */

import { Config, Pop } from '../../src/index';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

try {
  const methods = await Pop.getPaymentMethod('10000', config);
  console.log('=== Payment Methods ===');
  console.log(JSON.stringify(methods, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
}
