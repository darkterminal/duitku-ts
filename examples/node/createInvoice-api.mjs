/**
 * Contoh Create Invoice menggunakan Duitku-API di Node.js.
 *
 * Perbedaan dengan Pop: paymentMethod WAJIB diisi.
 *
 * Run: node examples/node/createInvoice-api.mjs
 */

import { Config, Api } from '../../dist/index.js';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const paymentAmount = 10000;
const paymentMethod = 'BT'; // Permata Bank Virtual Account (WAJIB untuk Api)
const email = 'customer@gmail.com';
const phoneNumber = '081234567890';
const productDetails = 'Test Payment';
const merchantOrderId = `order-${Date.now()}`;
const additionalParam = '';
const merchantUserInfo = '';
const customerVaName = 'John Doe';
const callbackUrl = 'http://YOUR_SERVER/callback';
const returnUrl = 'http://YOUR_SERVER/return';
const expiryPeriod = 60;

const firstName = 'John';
const lastName = 'Doe';

const address = {
  firstName,
  lastName,
  address: 'Jl. Kembangan Raya',
  city: 'Jakarta',
  postalCode: '11530',
  phone: phoneNumber,
  countryCode: 'ID',
};

const customerDetail = {
  firstName,
  lastName,
  email,
  phoneNumber,
  billingAddress: address,
  shippingAddress: address,
};

const itemDetails = [
  {
    name: productDetails,
    price: paymentAmount,
    quantity: 1,
  },
];

const params = {
  paymentAmount,
  paymentMethod, // WAJIB untuk Duitku-API
  merchantOrderId,
  productDetails,
  additionalParam,
  merchantUserInfo,
  customerVaName,
  email,
  phoneNumber,
  itemDetails,
  customerDetail,
  callbackUrl,
  returnUrl,
  expiryPeriod,
};

try {
  const response = await Api.createInvoice(params, config);
  console.log('=== Create Invoice Response (Api) ===');
  console.log(JSON.stringify(response, null, 2));
  console.log('');
  console.log('Payment URL:', response.paymentUrl);
  console.log('Reference:', response.reference);
} catch (error) {
  console.error('Error:', error.message);
}
