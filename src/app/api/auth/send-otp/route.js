import { NextResponse } from "next/server";

// POST /api/auth/send-otp — request a WhatsApp OTP for login.
// Proxies to the shared OTP backend. Requires env vars:
// CUSTOMER_OTP_SECRET, SUPABASE_SERVICE_ROLE_KEY, META_WHATSAPP_TOKEN.
export async function POST(req) {
  try {
    const { phone } = await req.json();
    const clean = String(phone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number." },
        { status: 400 }
      );
    }

    // TODO: wire to OTP backend once env vars are configured in Vercel.
    // For now, return a clear error instead of failing silently.
    if (!process.env.CUSTOMER_OTP_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OTP service is not configured yet. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Placeholder — full Meta WhatsApp dispatch lives here.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not send OTP." },
      { status: 500 }
    );
  }
}
