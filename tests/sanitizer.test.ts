import { describe, it, expect } from 'vitest';
import { Sanitizer } from '../src/Sanitizer';

describe('Sanitizer', () => {
  // ============================================================
  // Basic Sanitization
  // ============================================================

  describe('basic sanitization', () => {
    it('should cast paymentAmount to int', () => {
      const params = { paymentAmount: '10000' };
      const result = Sanitizer.request(params);
      expect(result.paymentAmount).toBe(10000);
      expect(typeof result.paymentAmount).toBe('number');
    });

    it('should cast merchantOrderId to string', () => {
      const params = { merchantOrderId: 12345 };
      const result = Sanitizer.request(params);
      expect(result.merchantOrderId).toBe('12345');
      expect(typeof result.merchantOrderId).toBe('string');
    });

    it('should cast expiryPeriod to int', () => {
      const params = { expiryPeriod: '60' };
      const result = Sanitizer.request(params);
      expect(result.expiryPeriod).toBe(60);
      expect(typeof result.expiryPeriod).toBe('number');
    });

    it('should truncate merchantOrderId to maxLength 50', () => {
      const longString = 'a'.repeat(60);
      const params = { merchantOrderId: longString };
      const result = Sanitizer.request(params);
      expect((result.merchantOrderId as string).length).toBe(50);
    });

    it('should truncate productDetails to maxLength 255', () => {
      const longString = 'a'.repeat(300);
      const params = { productDetails: longString };
      const result = Sanitizer.request(params);
      expect((result.productDetails as string).length).toBe(255);
    });

    it('should truncate additionalParam to maxLength 255', () => {
      const longString = 'a'.repeat(300);
      const params = { additionalParam: longString };
      const result = Sanitizer.request(params);
      expect((result.additionalParam as string).length).toBe(255);
    });

    it('should truncate merchantUserInfo to maxLength 255', () => {
      const longString = 'a'.repeat(300);
      const params = { merchantUserInfo: longString };
      const result = Sanitizer.request(params);
      expect((result.merchantUserInfo as string).length).toBe(255);
    });

    it('should truncate customerVaName to maxLength 20', () => {
      const longString = 'a'.repeat(30);
      const params = { customerVaName: longString };
      const result = Sanitizer.request(params);
      expect((result.customerVaName as string).length).toBe(20);
    });
  });

  // ============================================================
  // Phone Number Sanitization
  // ============================================================

  describe('phone number sanitization', () => {
    it('should remove spaces from phoneNumber', () => {
      const params = { phoneNumber: '0812 3456 7890' };
      const result = Sanitizer.request(params);
      expect(result.phoneNumber).toBe('081234567890');
    });

    it('should remove plus sign from phoneNumber', () => {
      const params = { phoneNumber: '+6281234567890' };
      const result = Sanitizer.request(params);
      expect(result.phoneNumber).toBe('6281234567890');
    });

    it('should keep dash in phoneNumber', () => {
      const params = { phoneNumber: '0812-3456-7890' };
      const result = Sanitizer.request(params);
      expect(result.phoneNumber).toBe('0812-3456-7890');
    });

    it('should keep parentheses in phoneNumber', () => {
      const params = { phoneNumber: '(021)5551234' };
      const result = Sanitizer.request(params);
      expect(result.phoneNumber).toBe('(021)5551234');
    });

    it('should remove all non-allowed characters from phoneNumber', () => {
      const params = { phoneNumber: '+62 812-3456-7890 ext' }; // Hapus tanda kurung
      const result = Sanitizer.request(params);
      // Huruf 'ext', spasi, dan '+' dihapus. Angka dan dash dipertahankan.
      expect(result.phoneNumber).toBe('62812-3456-7890');
    });

    it('should truncate phoneNumber to maxLength 20', () => {
      const params = { phoneNumber: '081234567890123456789' }; // 21 chars
      const result = Sanitizer.request(params);
      expect((result.phoneNumber as string).length).toBe(20);
    });

    it('should sanitize phone in address', () => {
      const params = {
        customerDetail: {
          billingAddress: {
            phone: '+62 812-3456-7890',
          },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.billingAddress.phone).toBe('62812-3456-7890');
    });
  });

  // ============================================================
  // Nested Objects: itemDetails
  // ============================================================

  describe('itemDetails sanitization', () => {
    it('should sanitize itemDetails array', () => {
      const params = {
        itemDetails: [
          { name: 'Product A', price: '10000', quantity: '1' },
          { name: 'Product B', price: '20000', quantity: '2' },
        ],
      };
      const result = Sanitizer.request(params);
      const items = result.itemDetails as any[];

      expect(items).toHaveLength(2);
      expect(items[0].price).toBe(10000);
      expect(items[0].quantity).toBe(1);
      expect(items[1].price).toBe(20000);
      expect(items[1].quantity).toBe(2);
    });

    it('should truncate item name to maxLength 50', () => {
      const longName = 'a'.repeat(60);
      const params = {
        itemDetails: [{ name: longName, price: 10000, quantity: 1 }],
      };
      const result = Sanitizer.request(params);
      const item = (result.itemDetails as any[])[0];
      expect(item.name.length).toBe(50);
    });

    it('should cast item price to int', () => {
      const params = {
        itemDetails: [{ name: 'Product', price: '10000.50', quantity: 1 }],
      };
      const result = Sanitizer.request(params);
      const item = (result.itemDetails as any[])[0];
      expect(item.price).toBe(10000);
      expect(typeof item.price).toBe('number');
    });

    it('should cast item quantity to int', () => {
      const params = {
        itemDetails: [{ name: 'Product', price: 10000, quantity: '5' }],
      };
      const result = Sanitizer.request(params);
      const item = (result.itemDetails as any[])[0];
      expect(item.quantity).toBe(5);
      expect(typeof item.quantity).toBe('number');
    });
  });

  // ============================================================
  // Nested Objects: customerDetail
  // ============================================================

  describe('customerDetail sanitization', () => {
    it('should sanitize customerDetail object', () => {
      const params = {
        customerDetail: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+62 812-3456-7890',
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;

      expect(customer.firstName).toBe('John');
      expect(customer.phoneNumber).toBe('62812-3456-7890');
    });

    it('should truncate firstName to maxLength 50', () => {
      const longName = 'a'.repeat(60);
      const params = {
        customerDetail: { firstName: longName },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.firstName.length).toBe(50);
    });

    it('should truncate lastName to maxLength 50', () => {
      const longName = 'a'.repeat(60);
      const params = {
        customerDetail: { lastName: longName },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.lastName.length).toBe(50);
    });
  });

  // ============================================================
  // Nested Objects: Address
  // ============================================================

  describe('address sanitization', () => {
    it('should sanitize billingAddress', () => {
      const params = {
        customerDetail: {
          billingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: 'Jl. Sudirman',
            city: 'Jakarta',
            postalCode: '12345',
            phone: '+62 812-3456-7890',
            countryCode: 'ID',
          },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      const address = customer.billingAddress;

      expect(address.firstName).toBe('John');
      expect(address.phone).toBe('62812-3456-7890');
      expect(address.countryCode).toBe('ID');
    });

    it('should sanitize shippingAddress', () => {
      const params = {
        customerDetail: {
          shippingAddress: {
            firstName: 'Jane',
            phone: '(021)5551234',
          },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      const address = customer.shippingAddress;

      expect(address.firstName).toBe('Jane');
      expect(address.phone).toBe('(021)5551234');
    });

    it('should truncate address to maxLength 255', () => {
      const longAddress = 'a'.repeat(300);
      const params = {
        customerDetail: {
          billingAddress: { address: longAddress },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.billingAddress.address.length).toBe(255);
    });

    it('should truncate city to maxLength 50', () => {
      const longCity = 'a'.repeat(60);
      const params = {
        customerDetail: {
          billingAddress: { city: longCity },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.billingAddress.city.length).toBe(50);
    });

    it('should truncate postalCode to maxLength 50', () => {
      const longPostal = 'a'.repeat(60);
      const params = {
        customerDetail: {
          billingAddress: { postalCode: longPostal },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.billingAddress.postalCode.length).toBe(50);
    });

    it('should truncate countryCode to maxLength 50', () => {
      const longCode = 'a'.repeat(60);
      const params = {
        customerDetail: {
          billingAddress: { countryCode: longCode },
        },
      };
      const result = Sanitizer.request(params);
      const customer = result.customerDetail as any;
      expect(customer.billingAddress.countryCode.length).toBe(50);
    });
  });

  // ============================================================
  // Immutability
  // ============================================================

  describe('immutability', () => {
    it('should not mutate original object', () => {
      const params = { paymentAmount: '10000', phoneNumber: '+62 812-3456-7890' };

      Sanitizer.request(params);

      expect(params.paymentAmount).toBe('10000');
      expect(params.phoneNumber).toBe('+62 812-3456-7890');
    });

    it('should not mutate nested itemDetails', () => {
      const params = {
        itemDetails: [{ name: 'Product', price: '10000', quantity: '1' }],
      };

      Sanitizer.request(params);

      expect(params.itemDetails[0].price).toBe('10000');
      expect(params.itemDetails[0].quantity).toBe('1');
    });

    it('should not mutate nested customerDetail', () => {
      const params = {
        customerDetail: {
          firstName: 'John',
          phoneNumber: '+62 812-3456-7890',
        },
      };

      Sanitizer.request(params);

      expect(params.customerDetail.phoneNumber).toBe('+62 812-3456-7890');
    });
  });

  // ============================================================
  // Edge Cases
  // ============================================================

  describe('edge cases', () => {
    it('should handle null parameterArray', () => {
      // @ts-expect-error - testing null input
      const result = Sanitizer.request(null);
      expect(result).toBeNull();
    });

    it('should handle undefined parameterArray', () => {
      // @ts-expect-error - testing undefined input
      const result = Sanitizer.request(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle empty object', () => {
      const result = Sanitizer.request({});
      expect(result).toEqual({});
    });

    it('should ignore fields without rules', () => {
      const params = { unknownField: 'value', paymentAmount: '10000' };
      const result = Sanitizer.request(params);
      expect(result.unknownField).toBe('value');
      expect(result.paymentAmount).toBe(10000);
    });

    it('should handle empty string', () => {
      const params = { merchantOrderId: '' };
      const result = Sanitizer.request(params);
      expect(result.merchantOrderId).toBe('');
    });

    it('should handle zero value', () => {
      const params = { paymentAmount: 0 };
      const result = Sanitizer.request(params);
      expect(result.paymentAmount).toBe(0);
    });

    it('should handle negative value', () => {
      const params = { paymentAmount: -100 };
      const result = Sanitizer.request(params);
      expect(result.paymentAmount).toBe(-100);
    });

    it('should handle float value for int rule', () => {
      const params = { paymentAmount: 10000.99 };
      const result = Sanitizer.request(params);
      expect(result.paymentAmount).toBe(10000); // Math.trunc removes decimal
    });
  });

  // ============================================================
  // Complete Payload Test
  // ============================================================

  describe('complete payload', () => {
    it('should sanitize complete CreateInvoiceParams', () => {
      const params = {
        paymentAmount: '10000',
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
        additionalParam: 'param',
        merchantUserInfo: 'user info',
        customerVaName: 'John Doe',
        email: 'customer@gmail.com',
        phoneNumber: '+62 812-3456-7890',
        itemDetails: [
          { name: 'Product A', price: '5000', quantity: '1' },
          { name: 'Product B', price: '5000', quantity: '1' },
        ],
        customerDetail: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+62 812-3456-7890',
          billingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: 'Jl. Sudirman',
            city: 'Jakarta',
            postalCode: '12345',
            phone: '+62 812-3456-7890',
            countryCode: 'ID',
          },
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: 'Jl. Sudirman',
            city: 'Jakarta',
            postalCode: '12345',
            phone: '+62 812-3456-7890',
            countryCode: 'ID',
          },
        },
        callbackUrl: 'http://example.com/callback',
        returnUrl: 'http://example.com/return',
        expiryPeriod: '60',
      };

      const result = Sanitizer.request(params);

      // Root level
      expect(result.paymentAmount).toBe(10000);
      expect(result.phoneNumber).toBe('62812-3456-7890');
      expect(result.expiryPeriod).toBe(60);

      // itemDetails
      const items = result.itemDetails as any[];
      expect(items[0].price).toBe(5000);
      expect(items[0].quantity).toBe(1);

      // customerDetail
      const customer = result.customerDetail as any;
      expect(customer.phoneNumber).toBe('62812-3456-7890');
      expect(customer.billingAddress.phone).toBe('62812-3456-7890');
      expect(customer.shippingAddress.phone).toBe('62812-3456-7890');
    });
  });
});
