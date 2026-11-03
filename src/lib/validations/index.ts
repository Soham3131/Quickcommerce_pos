import { z } from 'zod';
import { NextResponse } from 'next/server';

// --- Authentication Schemas ---
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required').max(100, 'Password is too long'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address format'),
  phone: z.string().trim().min(5, 'Phone must be at least 5 digits').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  address: z.string().optional(),
});

// --- Product Schemas ---
export const productCategorySchema = z.enum([
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Grocery & Staples',
  'Beverages',
  'Snacks & Sweets',
  'Personal Care',
  'Household & Cleaning',
  'Frozen Foods',
]);

export const productUnitSchema = z.enum(['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'box']);

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  sku: z.string().trim().min(2).max(50).toUpperCase(),
  barcode: z.string().trim().optional(),
  description: z.string().optional(),
  category: productCategorySchema,
  brand: z.string().optional(),
  image: z.string().min(1, 'Product image URL is required'),
  purchasePrice: z.number().nonnegative('Purchase price must be >= 0'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  mrp: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).default(5),
  hsnCode: z.string().optional(),
  unit: productUnitSchema.default('pcs'),
  currentStock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(5),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  isWeighed: z.boolean().default(false),
  isOnlinePublished: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// --- Inventory Schemas ---
export const adjustStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  type: z.enum(['add', 'remove', 'damage', 'expiry', 'correction']),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
  referenceInvoice: z.string().optional(),
});

// --- Order & POS Schemas ---
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  discountPercent: z.number().min(0).max(100).optional(),
  customPrice: z.number().nonnegative().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().trim().min(2, 'Customer name is required'),
  customerPhone: z.string().trim().min(5, 'Customer phone is required'),
  customerEmail: z.string().trim().email().optional().or(z.literal('')),
  customerAddress: z.string().optional(),
  orderType: z.enum(['in-store', 'takeaway', 'delivery']).default('delivery'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  orderDiscount: z.number().nonnegative().optional(),
  couponCode: z.string().trim().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'split']).default('cash'),
  amountPaid: z.number().nonnegative().optional(),
  deliverySlot: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'completed',
    'cancelled',
    'refunded',
  ]).optional(),
  action: z.enum(['assign_rider', 'cancel', 'update_status']).optional(),
  riderName: z.string().trim().min(2).optional(),
  riderPhone: z.string().trim().min(5).optional(),
  cancelReason: z.string().trim().optional(),
});

export const posCheckoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'POS cart cannot be empty'),
  customer: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  orderDiscount: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'split']).default('cash'),
  amountPaid: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

// --- Coupon Schemas ---
export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code cannot be empty').max(30),
  cartSubtotal: z.number().nonnegative('Subtotal must be >= 0'),
});

export const createCouponSchema = z.object({
  code: z.string().trim().min(2).max(30).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.number().nonnegative(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().nonnegative().optional(),
  freeShipping: z.boolean().default(false),
  usageLimit: z.number().int().positive().optional(),
});

// --- Customer & Address Schemas ---
export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().min(5, 'Phone is required'),
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z.string().optional(),
  customerType: z.enum(['Regular', 'Wholesale', 'Walk-in', 'VIP']).default('Regular'),
});

export const addAddressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  houseNo: z.string().trim().min(1),
  street: z.string().trim().min(1),
  area: z.string().trim().min(1),
  landmark: z.string().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().min(4).max(10),
  isDefault: z.boolean().default(false),
});

// --- Supplier & Purchase Schemas ---
export const createSupplierSchema = z.object({
  name: z.string().trim().min(2),
  contactPerson: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  email: z.string().trim().email(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  category: z.string().default('Grocery'),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  invoiceReference: z.string().optional(),
  purchaseDate: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productName: z.string().min(1),
        sku: z.string().min(1),
        unit: productUnitSchema.default('pcs'),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        taxRate: z.number().default(0),
        total: z.number().nonnegative(),
      })
    )
    .min(1, 'Purchase order must have at least one item'),
  subtotal: z.number().nonnegative(),
  taxTotal: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative(),
});

// --- Razorpay Payment Schemas ---
export const razorpayCreateOrderSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  receiptInvoice: z.string().optional(),
  notes: z.record(z.string()).optional(),
});

export const razorpayVerifySchema = z.object({
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().optional(),
  orderInvoiceNumber: z.string().optional(),
});

/**
 * Helper to safely validate request body against a Zod schema.
 * Returns either validated data or a standardized 400 error response.
 */
export async function validateRequestBody<Output, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = any>(
  req: Request,
  schema: z.ZodType<Output, Def, Input>
): Promise<{ success: true; data: Output } | { success: false; response: NextResponse }> {
  try {
    const rawBody = await req.json();
    const result = schema.safeParse(rawBody);

    if (!result.success) {
      const errorDetails = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: errorDetails,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Malformed JSON payload in request' },
        { status: 400 }
      ),
    };
  }
}
