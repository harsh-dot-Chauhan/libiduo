import { getResend } from "./resend";
import { env } from "./env";
import { orderConfirmationHtml, orderConfirmationText, type OrderConfirmationData } from "./emails/order-confirmation";
import { shippingUpdateHtml, shippingUpdateText, type ShippingUpdateData } from "./emails/shipping-update";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://libiduo.com";

export function orderUrl(orderId: string) {
  return `${SITE_URL}/orders/${orderId}`;
}

export async function sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void> {
  try {
    await getResend().emails.send({
      from: env.FROM_EMAIL,
      to,
      subject: `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()} | Libiduo`,
      html: orderConfirmationHtml(data),
      text: orderConfirmationText(data),
    });
  } catch (err) {
    // Email failure must never break the order flow — log and continue
    console.error("[email] sendOrderConfirmation failed:", err);
  }
}

export async function sendShippingUpdate(to: string, data: ShippingUpdateData): Promise<void> {
  try {
    await getResend().emails.send({
      from: env.FROM_EMAIL,
      to,
      subject: `Your order #${data.orderId.slice(-8).toUpperCase()} has shipped! 🚚`,
      html: shippingUpdateHtml(data),
      text: shippingUpdateText(data),
    });
  } catch (err) {
    console.error("[email] sendShippingUpdate failed:", err);
  }
}
