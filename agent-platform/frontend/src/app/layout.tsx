import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingChatbot } from "@/components/chat/booking-chatbot";
import { LiveChatWidget } from "@/components/chat/live-chat-widget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vaghlabs.com"),
  title: {
    default: "Vagh Labs | AI Automation for Revenue and Operations",
    template: "%s | Vagh Labs",
  },
  description:
    "Build and deploy production-ready AI chatbots, workflow automation, and data systems that save time and grow revenue.",
  openGraph: {
    title: "Vagh Labs | AI Automation for Revenue and Operations",
    description:
      "Production-ready AI chatbots, workflow automation, and data systems tailored to your business.",
    url: "https://vaghlabs.com",
    siteName: "Vagh Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vagh Labs | AI Automation for Revenue and Operations",
    description:
      "Production-ready AI chatbots, workflow automation, and data systems tailored to your business.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} ${mono.variable} font-sans min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          themes={["dark", "light"]}
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main-content" className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
            <Suspense fallback={null}>
              <LiveChatWidget />
              <BookingChatbot />
            </Suspense>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
