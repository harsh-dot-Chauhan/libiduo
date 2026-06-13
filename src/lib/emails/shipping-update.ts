export type ShippingUpdateData = {
  orderId: string;
  customerName: string;
  itemSummary: string;
  orderUrl: string;
};

export function shippingUpdateHtml(data: ShippingUpdateData): string {
  const { orderId, customerName, itemSummary, orderUrl } = data;
  const shortId = orderId.slice(-8).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Your Order Has Shipped</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#4f46e5;padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">libiduo</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">

          <!-- Truck icon area -->
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#eff6ff;border-radius:50%;padding:20px;font-size:36px;">🚚</div>
          </div>

          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;text-align:center;">Your Order Is On Its Way!</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;text-align:center;">Hi ${customerName}, your order <strong style="color:#1d4ed8;font-family:monospace;">#${shortId}</strong> has been shipped.</p>

          <!-- Order summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9fafb;border-radius:8px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Order</p>
              <p style="margin:0;font-size:14px;color:#374151;">${itemSummary}</p>
            </td></tr>
          </table>

          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
            Our delivery partner will contact you before delivery.<br/>
            Please keep the exact amount ready for <strong>Cash on Delivery</strong>.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="background:#4f46e5;border-radius:8px;">
                <a href="${orderUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Track Order</a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Questions? Reply to this email and we&apos;ll help you out.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function shippingUpdateText(data: ShippingUpdateData): string {
  const shortId = data.orderId.slice(-8).toUpperCase();
  return [
    `Your order #${shortId} has shipped!`,
    ``,
    `Hi ${data.customerName},`,
    ``,
    `${data.itemSummary}`,
    ``,
    `Our delivery partner will contact you before delivery.`,
    `Please keep the exact amount ready for Cash on Delivery.`,
    ``,
    `Track your order: ${data.orderUrl}`,
  ].join("\n");
}
