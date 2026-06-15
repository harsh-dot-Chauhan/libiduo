import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about Libiduo — shipping, packaging, returns, and more." };

const GOLD = "#C9973A";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const DARK = "#0D0608";
const BORDER = "rgba(201,151,58,0.15)";

const FAQS = [
  {
    section: "Orders & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "We deliver within 3–7 business days across India. Metro cities typically receive orders in 3–4 days, while tier-2 and tier-3 cities may take up to 7 days.",
      },
      {
        q: "Do you offer Cash on Delivery?",
        a: "Yes. Cash on Delivery is available across India. Please keep the exact amount ready at the time of delivery.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once your order is dispatched, you will receive a tracking number via email. You can use it on our courier partner's website to track your shipment in real time.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship only within India. International shipping is on our roadmap and will be announced soon.",
      },
    ],
  },
  {
    section: "Discreet Packaging",
    items: [
      {
        q: "Will anyone know what's inside the package?",
        a: "Absolutely not. Every order is shipped in plain, unmarked packaging with no brand names, logos, or product descriptions on the outside. The sender name on the label is generic.",
      },
      {
        q: "How will the charge appear on my bank statement?",
        a: "The charge will appear under a neutral business name with no reference to Libiduo or the nature of the products.",
      },
    ],
  },
  {
    section: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Due to the intimate nature of our products, we do not accept returns once a package has been opened. If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos and we will arrange a replacement or full refund.",
      },
      {
        q: "My item arrived damaged. What do I do?",
        a: "Email us at support@libiduo.com within 48 hours with your order number and clear photos of the damage. We will process a replacement or refund within 2–3 business days.",
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds are processed within 5–7 business days to your original payment method. COD refunds are issued via bank transfer — please share your account details when raising a refund request.",
      },
    ],
  },
  {
    section: "Products",
    items: [
      {
        q: "Are your products body-safe?",
        a: "Yes. All products sold on Libiduo are made from body-safe materials such as medical-grade silicone, ABS plastic, or stainless steel. Material details are listed on each product page.",
      },
      {
        q: "How do I clean and maintain my products?",
        a: "We recommend cleaning products before and after each use with warm water and a mild soap or a dedicated toy cleaner. Storage and care instructions are included with each order.",
      },
      {
        q: "Are the products shown the same as what I receive?",
        a: "Yes. We strive to keep product images accurate. Minor colour variations may occur due to screen settings, but the product specifications remain identical to what is described.",
      },
    ],
  },
  {
    section: "Account & Privacy",
    items: [
      {
        q: "Do I need an account to place an order?",
        a: "Currently, an account is required to place an order so we can securely store your order history and delivery details. Registration takes less than a minute.",
      },
      {
        q: "Is my personal information safe?",
        a: "Yes. We use industry-standard encryption to protect your data. We never sell or share your personal information with third parties for marketing purposes. See our Privacy Policy for full details.",
      },
      {
        q: "I am 18+. How do I confirm my age?",
        a: "You confirm your age on the age gate that appears when you first visit the site. By proceeding past that screen, you declare that you are 18 years of age or older.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Help</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 700, color: TEXT, marginBottom: 12 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 48, lineHeight: 1.7 }}>
          Everything you need to know about ordering from Libiduo. Can&apos;t find an answer?{" "}
          <a href="mailto:support@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>Email us</a>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {FAQS.map(({ section, items }) => (
            <div key={section}>
              <h2 style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>{section}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.map(({ q, a }) => (
                  <div key={q} style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 10, lineHeight: 1.5 }}>{q}</p>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, margin: 0 }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
