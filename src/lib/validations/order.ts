import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export const placeOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["COD"]).default("COD"),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
