import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://shop.xyvot.com";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16a34a",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xyvot Shop — Groceries Delivered in 15 Minutes",
    template: "%s | Xyvot Shop",
  },
  description:
    "Shop fresh groceries, vegetables, dairy, and daily essentials online. 15-minute express delivery from neighbourhood shops.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Xyvot",
    statusBarStyle: "default",
    startupImage: [
      { url: "/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-1668x2424.png", media: "(device-width: 834px) and (device-height: 1212px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    ],
  },
  formatDetection: { telephone: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Xyvot Shop",
    title: "Xyvot Shop — Groceries Delivered in 15 Minutes",
    description:
      "Shop fresh groceries, vegetables, dairy, and daily essentials online. 15-minute express delivery.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-slate-900 min-h-screen flex flex-col">
        <ServiceWorkerRegister />
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="bg-slate-950 text-slate-400 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <div className="flex flex-col sm:flex-row justify-between gap-8">
                <div>
                  <p className="text-2xl font-black text-white">
                    xyvot<span className="text-green-600">.</span>
                  </p>
                  <p className="mt-3 text-sm max-w-xs">
                    Groceries and essentials delivered in 15 minutes from
                    neighbourhood shops.
                  </p>
                </div>
                <nav aria-label="Footer" className="flex gap-12 text-sm">
                  <div>
                    <p className="font-bold text-white mb-3">Shop</p>
                    <ul className="space-y-2">
                      <li><a href="/" className="hover:text-white">Home</a></li>
                      <li><a href="/search" className="hover:text-white">Search</a></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-white mb-3">Company</p>
                    <ul className="space-y-2">
                      <li><a href="https://www.xyvot.com" className="hover:text-white">About</a></li>
                      <li><a href="https://business.xyvot.com" className="hover:text-white">Sell on Xyvot</a></li>
                    </ul>
                  </div>
                </nav>
              </div>
              <p className="mt-10 pt-6 border-t border-slate-800 text-xs">
                © 2026 Xyvot. All rights reserved.
              </p>
            </div>
          </footer>
          {/* Spacer so the mobile tab bar never covers footer content */}
          <div
            aria-hidden="true"
            className="sm:hidden shrink-0"
            style={{ height: "calc(4rem + env(safe-area-inset-bottom))" }}
          />
          <MobileTabBar />
        </CartProvider>
      </body>
    </html>
  );
}
