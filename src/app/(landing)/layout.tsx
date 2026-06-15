import LandingNavbar from "@/components/layout/LandingNavbar";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
    </>
  );
}
