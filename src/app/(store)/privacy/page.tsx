import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Libiduo collects, uses, and protects your personal information." };

const GOLD = "#C9973A";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const DARK = "#0D0608";
const BORDER = "rgba(201,151,58,0.15)";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 16, padding: "28px 28px" }}>
      <h2 style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>{title}</h2>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Legal</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 700, color: TEXT, marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 8, lineHeight: 1.7 }}>
          Last updated: June 2026
        </p>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 48, lineHeight: 1.7 }}>
          At Libiduo, your privacy is a priority. This policy explains what information we collect, how we use it, and the choices you have.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Section title="1. Information We Collect">
            <p style={{ marginBottom: 12 }}>We collect information you provide directly when you:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Create an account (name, email address, password hash)</li>
              <li>Place an order (delivery address, phone number)</li>
              <li>Contact our support team</li>
            </ul>
            <p>We also collect limited technical data automatically: IP address, browser type, device type, pages visited, and session duration. This data is used solely to improve site performance and is never linked to your identity.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>To process and fulfil your orders</li>
              <li>To send order confirmations and delivery updates</li>
              <li>To respond to your support queries</li>
              <li>To prevent fraud and ensure the security of your account</li>
              <li>To improve our website and product offering</li>
            </ul>
            <p style={{ marginTop: 12 }}>We do <strong style={{ color: TEXT }}>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. Discreet Data Handling">
            <p>We understand the sensitive nature of our products. Your purchase history and personal details are stored securely and are never disclosed to any third party except as required to fulfil your order (e.g., our logistics partner receives only the name and address needed for delivery).</p>
          </Section>

          <Section title="4. Cookies">
            <p style={{ marginBottom: 12 }}>We use essential cookies to keep you signed in and remember your cart. We do not use third-party advertising cookies or tracking pixels.</p>
            <p>You can disable cookies in your browser settings, but some site features (such as staying signed in) will not function correctly without them.</p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p style={{ marginBottom: 12 }}>Your data is stored on secure, encrypted servers. Passwords are hashed using industry-standard algorithms and are never stored in plain text.</p>
            <p>We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by emailing us at <a href="mailto:privacy@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>privacy@libiduo.com</a>.</p>
          </Section>

          <Section title="6. Third-Party Services">
            <p style={{ marginBottom: 12 }}>We use the following third-party services, each governed by their own privacy policies:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong style={{ color: TEXT }}>Cloudinary</strong> — product image hosting</li>
              <li><strong style={{ color: TEXT }}>Upstash Redis</strong> — session caching</li>
              <li><strong style={{ color: TEXT }}>Google OAuth</strong> — optional sign-in (only if you choose to sign in with Google)</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p style={{ marginBottom: 12 }}>You have the right to:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p style={{ marginTop: 12 }}>To exercise any of these rights, contact us at <a href="mailto:privacy@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>privacy@libiduo.com</a>.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this policy periodically. When we do, the &quot;Last updated&quot; date at the top of this page will change. Continued use of the site after any changes constitutes your acceptance of the revised policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>For any privacy-related questions or concerns, please reach us at <a href="mailto:privacy@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>privacy@libiduo.com</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
