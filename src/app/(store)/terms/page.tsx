import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms and conditions governing your use of the Libiduo platform." };

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

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Legal</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 700, color: TEXT, marginBottom: 12 }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 8, lineHeight: 1.7 }}>
          Last updated: June 2026
        </p>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 48, lineHeight: 1.7 }}>
          Please read these Terms carefully before using the Libiduo website. By accessing or purchasing from our store, you agree to be bound by these Terms.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Section title="1. Age Requirement">
            <p>You must be at least <strong style={{ color: TEXT }}>18 years of age</strong> to access or purchase from Libiduo. By using this site, you confirm that you are 18 or older. We reserve the right to cancel any order and refuse service if we have reason to believe the customer does not meet this requirement.</p>
          </Section>

          <Section title="2. Use of the Platform">
            <p style={{ marginBottom: 12 }}>You agree to use Libiduo only for lawful purposes and in a manner consistent with all applicable laws and regulations. You must not:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Attempt to gain unauthorised access to any part of our systems</li>
              <li>Use the site to transmit harmful, fraudulent, or abusive content</li>
              <li>Resell products purchased from Libiduo without prior written permission</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </Section>

          <Section title="3. Account Responsibility">
            <p>You are responsible for maintaining the confidentiality of your account credentials. All activity that occurs under your account is your responsibility. Please notify us immediately at <a href="mailto:support@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>support@libiduo.com</a> if you suspect unauthorised access.</p>
          </Section>

          <Section title="4. Orders & Pricing">
            <p style={{ marginBottom: 12 }}>All prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Modify prices at any time without prior notice</li>
              <li>Cancel orders where pricing errors have occurred</li>
              <li>Refuse or cancel orders at our discretion, with a full refund issued</li>
            </ul>
            <p style={{ marginTop: 12 }}>An order confirmation email does not constitute acceptance of your order. Acceptance occurs only when your order is dispatched.</p>
          </Section>

          <Section title="5. Returns & Refunds">
            <p style={{ marginBottom: 12 }}>Due to health and hygiene standards applicable to intimate products, we do not accept returns on opened items. Refunds or replacements are offered only where:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>An item arrives damaged or defective</li>
              <li>An incorrect item was sent</li>
              <li>The order was not delivered</li>
            </ul>
            <p style={{ marginTop: 12 }}>All refund requests must be raised within 48 hours of delivery with supporting evidence. See our <a href="/faq" style={{ color: GOLD, textDecoration: "none" }}>FAQ</a> for full details.</p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>All content on this website — including text, images, logos, and design — is the property of Libiduo and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
          </Section>

          <Section title="7. Disclaimers & Limitation of Liability">
            <p style={{ marginBottom: 12 }}>The Libiduo platform is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the site will be error-free or uninterrupted.</p>
            <p>To the maximum extent permitted by law, Libiduo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or the products purchased. Our total liability shall not exceed the amount paid for the specific order giving rise to the claim.</p>
          </Section>

          <Section title="8. Governing Law">
            <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in India.</p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>We reserve the right to update these Terms at any time. Changes take effect immediately upon being posted to this page. Continued use of the site after any change constitutes your acceptance of the revised Terms.</p>
          </Section>

          <Section title="10. Contact">
            <p>For any questions regarding these Terms, please contact us at <a href="mailto:support@libiduo.com" style={{ color: GOLD, textDecoration: "none" }}>support@libiduo.com</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
