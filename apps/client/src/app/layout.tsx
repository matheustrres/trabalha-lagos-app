import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "TrabalhaLagos — Vagas de emprego na Região dos Lagos",
    template: "%s — TrabalhaLagos",
  },
  description:
    "Encontre trabalho perto de você na Região dos Lagos. Vagas CLT, PJ, freelancer e temporário.",
  metadataBase: new URL("https://trabalhalagos.com.br"),
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="pt-BR"
    className={`${dmSans.variable} ${playfairDisplay.variable}`}
  >
    <body className="font-sans bg-surface text-gray-900 antialiased">
      <QueryProvider>
        <Header />
        <main className="max-w-lg mx-auto pb-20">{children}</main>
        <BottomNav />
      </QueryProvider>
    </body>
  </html>
);

export default RootLayout;
