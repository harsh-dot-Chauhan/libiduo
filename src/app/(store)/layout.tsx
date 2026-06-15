import LandingNavbar from "@/components/layout/LandingNavbar";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
      <WhatsAppButton />
    </>
  );
}
