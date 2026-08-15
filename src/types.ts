// ============================================================
// Config
// ============================================================

/**
 * Opsi untuk membuat instance Config.
 */
export interface DuitkuConfigOptions {
  /** API key merchant dari Duitku dashboard */
  apiKey: string;
  /** Merchant code dari Duitku dashboard */
  merchantCode: string;
  /** true = sandbox, false = production (default: true) */
  isSandboxMode?: boolean;
  /** Aktifkan sanitasi parameter request (default: true) */
  isSanitizedMode?: boolean;
  /** Aktifkan penulisan log ke file (default: true) */
  duitkuLogs?: boolean;
}

// ============================================================
// Address & Customer Detail
// ============================================================

/**
 * Alamat pelanggan (untuk billing dan shipping).
 */
export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  countryCode: string;
}

/**
 * Detail pelanggan untuk keperluan invoice.
 */
export interface CustomerDetail {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  billingAddress: Address;
  shippingAddress: Address;
}

// ============================================================
// Item Detail
// ============================================================

/**
 * Detail item dalam transaksi.
 */
export interface ItemDetail {
  /** Nama produk (max 50 karakter setelah sanitasi) */
  name: string;
  /** Harga per unit */
  price: number;
  /** Jumlah item */
  quantity: number;
}

// ============================================================
// Create Invoice
// ============================================================

/**
 * Parameter untuk membuat invoice.
 *
 * - `paymentMethod` bersifat opsional untuk Duitku-Pop.
 * - `paymentMethod` wajib diisi untuk Duitku-API (contoh: "BT" untuk Permata VA).
 */
export interface CreateInvoiceParams {
  /** Total amount transaksi */
  paymentAmount: number;
  /** Kode metode pembayaran (opsional untuk Pop, wajib untuk Api). Contoh: "BT" */
  paymentMethod?: string;
  /** Order ID dari merchant, harus unik */
  merchantOrderId: string;
  /** Deskripsi produk */
  productDetails: string;
  /** Parameter tambahan (opsional) */
  additionalParam?: string;
  /** Info user merchant (opsional) */
  merchantUserInfo?: string;
  /** Nama yang ditampilkan pada konfirmasi bank (VA) */
  customerVaName?: string;
  /** Email pelanggan */
  email?: string;
  /** Nomor telepon pelanggan */
  phoneNumber?: string;
  /** Daftar item detail */
  itemDetails?: ItemDetail[];
  /** Detail pelanggan */
  customerDetail?: CustomerDetail;
  /** URL callback untuk notifikasi pembayaran */
  callbackUrl?: string;
  /** URL redirect setelah pembayaran selesai */
  returnUrl?: string;
  /** Masa berlaku invoice dalam menit */
  expiryPeriod?: number;
}

/**
 * Response dari createInvoice.
 */
export interface CreateInvoiceResponse {
  /** Kode status. "00" = sukses */
  statusCode: string;
  /** Pesan status */
  statusMessage: string;
  /** Kode merchant */
  merchantCode: string;
  /** Reference ID untuk checkout.process() di frontend */
  reference: string;
  /** URL pembayaran (redirect) */
  paymentUrl: string;
}

// ============================================================
// Transaction Status
// ============================================================

/**
 * Response dari transactionStatus.
 */
export interface TransactionStatusResponse {
  /** Kode status. "00" = sukses, "01" = pending */
  statusCode: string;
  /** Pesan status */
  statusMessage: string;
  /** Order ID dari merchant */
  merchantOrderId: string;
  /** Reference ID dari Duitku */
  reference: string;
  /** Amount transaksi */
  amount: number;
  /** Biaya transaksi */
  fee: number;
}

// ============================================================
// Callback Notification
// ============================================================

/**
 * Data notifikasi callback dari Duitku.
 *
 * Duitku mengirim callback via HTTP POST dengan content-type
 * `application/x-www-form-urlencoded`.
 */
export interface CallbackNotification {
  /** Kode merchant */
  merchantCode: string;
  /** Amount transaksi */
  amount: number;
  /** Order ID dari merchant */
  merchantOrderId: string;
  /** Deskripsi produk */
  productDetail: string;
  /** Parameter tambahan (bisa null) */
  additionalParam: string | null;
  /** Kode pembayaran (bisa null) */
  paymentCode: string | null;
  /** Hasil transaksi. "00" = sukses, "01" = gagal */
  resultCode: string;
  /** User ID merchant (bisa null) */
  merchantUserId: string | null;
  /** Reference ID dari Duitku */
  reference: string;
  /** Signature untuk validasi */
  signature: string;
  /** Hash user (bisa null) */
  spUserHash: string | null;
}

// ============================================================
// Payment Method
// ============================================================

/**
 * Info biaya untuk satu metode pembayaran.
 */
export interface PaymentFee {
  /** Nama metode pembayaran */
  name: string;
  /** Kode metode pembayaran */
  code: string;
  /** Biaya untuk metode ini */
  fee: number;
}

/**
 * Response dari getPaymentMethod.
 */
export interface GetPaymentMethodResponse {
  /** Kode response. "00" = sukses */
  responseCode: string;
  /** Pesan response */
  responseMessage: string;
  /** Daftar metode pembayaran beserta biayanya */
  paymentFee: PaymentFee[];
}
