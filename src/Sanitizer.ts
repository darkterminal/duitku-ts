/**
 * Request params filters.
 *
 * Truncate fields that have length limit, remove not allowed characters from other fields.
 *
 * This feature is optional, you can control it with `isSanitizedMode` (default: true).
 *
 * Port dari `Duitku/Sanitizer.php` ke TypeScript dengan pendekatan immutable.
 * Mengembalikan object baru tanpa mengubah input asli.
 *
 * @module Sanitizer
 */

type SanitizeRule = string;

const rules: Record<string, SanitizeRule> = {
  // Root level params
  paymentAmount: 'int|maxLength:50',
  merchantOrderId: 'string|maxLength:50',
  productDetails: 'string|maxLength:255',
  additionalParam: 'string|maxLength:255',
  merchantUserInfo: 'string|maxLength:255',
  customerVaName: 'string|maxLength:20',
  phoneNumber: 'string|maxLength:20|phone',
  expiryPeriod: 'int',

  // itemDetails
  name: 'string|maxLength:50',
  quantity: 'int',
  price: 'int',

  // billingAddress and shippingAddress
  firstName: 'string|maxLength:50',
  lastName: 'string|maxLength:50',
  address: 'string|maxLength:255',
  city: 'string|maxLength:50',
  postalCode: 'string|maxLength:50',
  phone: 'string|maxLength:20|phone',
  countryCode: 'string|maxLength:50',
};

export class Sanitizer {
  /**
   * Sanitasi payload request.
   * Mengembalikan object baru (immutable) tanpa mengubah input asli.
   *
   * @param parameterArray - Payload request yang akan disanitasi
   * @returns Sanitized copy dari payload
   *
   * @example
   * ```ts
   * const params = {
   *   paymentAmount: 10000,
   *   merchantOrderId: 'order-001',
   *   productDetails: 'Test Payment',
   *   phoneNumber: '+62 812-3456-7890',
   * };
   *
   * const sanitized = Sanitizer.request(params);
   * console.log(sanitized.phoneNumber); // '62812-3456-7890'
   * console.log(params.phoneNumber);    // '+62 812-3456-7890' (tidak berubah)
   * ```
   */
  static request<T extends object>(parameterArray: T): T {
    if (!parameterArray || typeof parameterArray !== 'object') {
      return parameterArray;
    }

    // Cast ke Record<string, unknown> untuk manipulasi internal
    const result = { ...parameterArray } as Record<string, unknown>;

    for (const [rulesLabel, parameterValue] of Object.entries(result)) {
      if (Array.isArray(parameterValue)) {
        // itemDetails adalah array
        result[rulesLabel] = parameterValue.map((item) =>
          Sanitizer.sanitizeNested(item as Record<string, unknown>)
        );
      } else if (parameterValue && typeof parameterValue === 'object') {
        // customerDetail adalah object
        result[rulesLabel] = Sanitizer.sanitizeNested(parameterValue as Record<string, unknown>);
      } else {
        if (rules[rulesLabel]) {
          result[rulesLabel] = Sanitizer.sanitizeValue(rules[rulesLabel], parameterValue);
        }
      }
    }

    return result as T;
  }

  /**
   * Sanitasi nested object (customerDetail dengan billingAddress/shippingAddress).
   */
  private static sanitizeNested(obj: Record<string, unknown>): Record<string, unknown> {
    const result = { ...obj };
    for (const [key, value] of Object.entries(result)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // billingAddress / shippingAddress
        result[key] = Sanitizer.sanitizeAddress(value as Record<string, unknown>);
      } else if (rules[key]) {
        result[key] = Sanitizer.sanitizeValue(rules[key], value);
      }
    }
    return result;
  }

  /**
   * Sanitasi address object (billingAddress atau shippingAddress).
   */
  private static sanitizeAddress(address: Record<string, unknown>): Record<string, unknown> {
    const result = { ...address };
    for (const [key, value] of Object.entries(result)) {
      if (rules[key]) {
        result[key] = Sanitizer.sanitizeValue(rules[key], value);
      }
    }
    return result;
  }

  /**
   * Apply sanitization rules ke satu value.
   *
   * Urutan eksekusi rules mengikuti PHP implementation:
   * `rsort()` pada attributeTags, sehingga urutan eksekusi:
   * 1. string / int (type casting)
   * 2. phone (regex filter)
   * 3. maxLength (truncation)
   */
  private static sanitizeValue(rule: SanitizeRule, value: unknown): unknown {
    const attributeTags = rule.split('|').sort().reverse();
    let result = value;

    for (const attributeTag of attributeTags) {
      const [tag, tagValue] = attributeTag.split(':');
      switch (tag) {
        case 'string':
          result = String(result);
          break;
        case 'int':
          result = Math.trunc(Number(result));
          break;
        case 'maxLength':
          result = String(result).substring(0, parseInt(tagValue, 10));
          break;
        case 'phone':
          result = String(result).replace(/[^\d\-()]/g, '');
          break;
      }
    }

    return result;
  }
}
