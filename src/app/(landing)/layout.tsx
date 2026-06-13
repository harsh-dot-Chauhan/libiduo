import LandingNavbar from "@/components/layout/LandingNavbar";
import CartDrawer from "@/components/store/CartDrawer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <CartDrawer />
      <main>{children}</main>
    </>
  );
}
