import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PwaProvider } from "@/components/providers/pwa-provider";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrabalhaLagos",
  },
  icons: {
    icon: [
      { url: "/brand/trabalhalagos-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c7a5a",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="pt-BR"
    className={`${dmSans.variable} ${playfairDisplay.variable}`}
  >
    <body className="font-sans bg-surface text-gray-900 antialiased">
      <QueryProvider>
        <PwaProvider />
        <Header />
        <main
          id="app-main"
          className="mx-auto min-h-[calc(100dvh-57px)] max-w-lg bg-white pb-20 has-[>[data-panel-layout]]:pb-0 has-[>[data-profile-layout]]:min-h-0"
        >
          {children}
        </main>
        <BottomNav />
      </QueryProvider>
    </body>
  </html>
);

export default RootLayout;
