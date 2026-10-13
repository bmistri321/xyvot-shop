// Shown by the service worker when the device is offline.
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <WifiOff className="w-12 h-12 mb-4 text-slate-300" aria-hidden="true" />
      <h1 className="text-2xl font-black text-slate-900">You&apos;re offline</h1>
      <p className="mt-2 text-slate-500 max-w-xs">
        Check your internet connection and try again. Your cart is saved on this
        device.
      </p>
      <a
        href="/"
        className="mt-6 px-6 py-3 rounded-full bg-orange-600 text-white text-sm font-bold"
      >
        Try again
      </a>
    </main>
  );
}
