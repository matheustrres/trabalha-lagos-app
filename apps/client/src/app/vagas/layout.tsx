import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

interface VagasLayoutProps {
  children: React.ReactNode;
}

const VagasLayout = ({ children }: VagasLayoutProps) => (
  <>
    <Header />
    <main className="max-w-lg mx-auto pb-20">{children}</main>
    <BottomNav />
  </>
);

export default VagasLayout;
