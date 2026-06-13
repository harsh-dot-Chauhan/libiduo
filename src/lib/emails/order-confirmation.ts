export type OrderConfirmationData = {
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  orderUrl: string;
};

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const { orderId, customerName, items, total, shippingAddress, paymentMethod, orderUrl } = data;
  const shortId = orderId.slice(-8).toUpperCase();

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;text-align:right;">₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const address = [
    shippingAddress.name,
    shippingAddress.phone,
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}, ${shippingAddress.state} — ${shippingAddress.pincode}`,
  ]
    .filter(Boolean)
    .join("<br/>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Order Confirmed</title></head>
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

          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Order Confirmed! 🎉</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Hi ${customerName}, your order has been placed successfully.</p>

          <!-- Order ID badge -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#eff6ff;border-radius:8px;padding:12px 20px;">
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Order ID</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1d4ed8;font-family:monospace;">#${shortId}</p>
              </td>
            </tr>
          </table>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="padding:8px 0;text-align:left;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Item</th>
                <th style="padding:8px 0;text-align:center;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Qty</th>
                <th style="padding:8px 0;text-align:right;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111827;">Total</td>
                <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111827;text-align:right;">₹${total.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Two columns: address + payment -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:12px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Shipping To</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${address}</p>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:12px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Payment</p>
                <p style="margin:0;font-size:14px;color:#374151;">${paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${paymentMethod === "COD" ? "Pay when your order arrives" : "Paid online"}</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#4f46e5;border-radius:8px;">
                <a href="${orderUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Track Your Order</a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">You received this email because you placed an order on Libiduo. Questions? Reply to this email.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationText(data: OrderConfirmationData): string {
  const shortId = data.orderId.slice(-8).toUpperCase();
  const lines = [
    `Order Confirmed — #${shortId}`,
    ``,
    `Hi ${data.customerName}, your order has been placed.`,
    ``,
    `Items:`,
    ...data.items.map((i) => `  ${i.name} x${i.quantity} — ₹${(i.unitPrice * i.quantity).toLocaleString("en-IN")}`),
    ``,
    `Total: ₹${data.total.toLocaleString("en-IN")}`,
    `Payment: ${data.paymentMethod === "COD" ? "Cash on Delivery" : data.paymentMethod}`,
    ``,
    `Track your order: ${data.orderUrl}`,
  ];
  return lines.join("\n");
}
