import LandingNavbar from "@/components/layout/LandingNavbar";
import CartDrawer from "@/components/store/CartDrawer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <CartDrawer />
      <main>{children}</main>
      <WhatsAppButton />
    </>
  );
}
