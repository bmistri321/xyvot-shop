import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://shop.xyvot.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xyvot Shop — Groceries Delivered in 15 Minutes",
    template: "%s | Xyvot Shop",
  },
  description:
    "Shop fresh groceries, vegetables, dairy, and daily essentials online. 15-minute express delivery from neighbourhood shops.",
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
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="bg-slate-950 text-slate-400 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <div className="flex flex-col sm:flex-row justify-between gap-8">
                <div>
                  <p className="text-2xl font-black text-white">
                    xyvot<span className="text-orange-600">.</span>
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
        </CartProvider>
      </body>
    </html>
  );
}
