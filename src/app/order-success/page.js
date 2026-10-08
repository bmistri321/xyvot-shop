import Link from "next/link";

export const metadata = {
  title: "Order placed!",
  description: "Your Xyvot order has been placed successfully.",
};

export default async function OrderSuccessPage({ searchParams }) {
  const { order } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-6" aria-hidden="true">✅</p>
      <h1 className="text-4xl font-black">Order placed!</h1>
      <p className="mt-4 text-lg text-slate-600">
        Thank you for shopping with Xyvot. Your order is being prepared and
        will arrive in about 15 minutes.
      </p>
      {order && (
        <p className="mt-4 inline-block px-4 py-2 rounded-full bg-slate-100 text-sm font-mono">
          Order ID: {order.slice(0, 8)}…
        </p>
      )}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="px-8 py-3 rounded-full border-2 border-slate-200 font-bold hover:border-slate-900"
        >
          Track order
        </Link>
      </div>
    </main>
  );
}
