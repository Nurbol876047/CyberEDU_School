import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/hud/AppShell";

const rubik = localFont({
  src: [
    { path: "../../public/fonts/Rubik-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Rubik-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-rubik",
  display: "swap",
});

const montserrat = localFont({
  src: [
    { path: "../../public/fonts/Montserrat-700.ttf", weight: "700" },
    { path: "../../public/fonts/Montserrat-800.ttf", weight: "800" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QALQAN AI — кибербезопасность для школьников",
  description:
    "Интерактивная платформа обучения кибербезопасности: 3D-карта миссий, тренажёры, ИИ-наставник и аналитика для учителей.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${rubik.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen font-sans">
        <div className="bg-glow" />
        <div className="bg-grid" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
