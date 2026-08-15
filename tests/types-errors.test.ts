import { describe, it, expect } from 'vitest';
import { DuitkuError } from '../src/errors';
import type {
  CreateInvoiceParams,
  CallbackNotification,
  CreateInvoiceResponse,
  TransactionStatusResponse,
  GetPaymentMethodResponse,
  CustomerDetail,
  ItemDetail,
  Address,
} from '../src/types';

describe('DuitkuError', () => {
  it('should create error with message only', () => {
    const error = new DuitkuError('Access denied');
    expect(error.message).toBe('Access denied');
    expect(error.name).toBe('DuitkuError');
    expect(error.statusCode).toBeUndefined();
    expect(error.responseBody).toBeUndefined();
  });

  it('should create error with statusCode and responseBody', () => {
    const error = new DuitkuError('Duitku Error: 400 response: Bad Request', 400, 'Bad Request');
    expect(error.message).toBe('Duitku Error: 400 response: Bad Request');
    expect(error.statusCode).toBe(400);
    expect(error.responseBody).toBe('Bad Request');
  });

  it('should be instanceof Error', () => {
    const error = new DuitkuError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DuitkuError);
  });
});

describe('Types compile-time check', () => {
  it('should accept valid CreateInvoiceParams', () => {
    const params: CreateInvoiceParams = {
      paymentAmount: 10000,
      merchantOrderId: 'order-001',
      productDetails: 'Test Payment',
      email: 'customer@gmail.com',
      phoneNumber: '081234567890',
      customerVaName: 'John Doe',
      callbackUrl: 'http://YOUR_SERVER/callback',
      returnUrl: 'http://YOUR_SERVER/return',
      expiryPeriod: 60,
    };
    expect(params.paymentAmount).toBe(10000);
  });

  it('should accept CreateInvoiceParams with paymentMethod (Api)', () => {
    const params: CreateInvoiceParams = {
      paymentAmount: 10000,
      paymentMethod: 'BT',
      merchantOrderId: 'order-002',
      productDetails: 'Test Payment',
    };
    expect(params.paymentMethod).toBe('BT');
  });

  it('should accept CreateInvoiceParams with itemDetails and customerDetail', () => {
    const address: Address = {
      firstName: 'John',
      lastName: 'Doe',
      address: 'Jl. Kembangan Raya',
      city: 'Jakarta',
      postalCode: '11530',
      phone: '081234567890',
      countryCode: 'ID',
    };

    const customerDetail: CustomerDetail = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@gmail.com',
      phoneNumber: '081234567890',
      billingAddress: address,
      shippingAddress: address,
    };

    const itemDetails: ItemDetail[] = [{ name: 'Test Payment', price: 10000, quantity: 1 }];

    const params: CreateInvoiceParams = {
      paymentAmount: 10000,
      merchantOrderId: 'order-003',
      productDetails: 'Test Payment',
      itemDetails,
      customerDetail,
    };

    expect(params.itemDetails).toHaveLength(1);
    expect(params.customerDetail?.billingAddress.city).toBe('Jakarta');
  });

  it('should accept CallbackNotification with nullable fields', () => {
    const notification: CallbackNotification = {
      merchantCode: 'D0001',
      amount: 10000,
      merchantOrderId: '12345',
      productDetail: '',
      additionalParam: null,
      paymentCode: null,
      resultCode: '00',
      merchantUserId: null,
      reference: 'D00015HL5BJKRM27MCUS',
      signature: '4104f20a70c933113c66c004fe25a9f1',
      spUserHash: null,
    };
    expect(notification.resultCode).toBe('00');
    expect(notification.additionalParam).toBeNull();
  });

  it('should accept CreateInvoiceResponse', () => {
    const response: CreateInvoiceResponse = {
      statusCode: '00',
      statusMessage: 'SUCCESS',
      merchantCode: 'D0001',
      reference: 'D0001ABC123',
      paymentUrl: 'https://sandbox.duitku.com/payment/123',
    };
    expect(response.statusCode).toBe('00');
  });

  it('should accept TransactionStatusResponse', () => {
    const response: TransactionStatusResponse = {
      statusCode: '00',
      statusMessage: 'SUCCESS',
      merchantOrderId: '1',
      reference: 'D0001ABC123',
      amount: 10000,
      fee: 4000,
    };
    expect(response.amount).toBe(10000);
  });

  it('should accept GetPaymentMethodResponse', () => {
    const response: GetPaymentMethodResponse = {
      responseCode: '00',
      responseMessage: 'SUCCESS',
      paymentFee: [
        { name: 'Permata Bank Virtual Account', code: 'BT', fee: 4000 },
        { name: 'BCA Virtual Account', code: 'BC', fee: 4000 },
      ],
    };
    expect(response.paymentFee).toHaveLength(2);
  });
});
