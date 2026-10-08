import { NextResponse } from "next/server";

// POST /api/auth/verify-otp — verify the OTP code.
export async function POST(req) {
  try {
    const { phone, otp } = await req.json();
    const clean = String(phone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(clean) || String(otp || "").length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid phone or code." },
        { status: 400 }
      );
    }

    if (!process.env.CUSTOMER_OTP_SECRET) {
      return NextResponse.json(
        { success: false, error: "OTP service is not configured yet." },
        { status: 503 }
      );
    }

    // TODO: HMAC verification against customer_otp_challenges table.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification failed." },
      { status: 500 }
    );
  }
}
