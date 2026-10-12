"use client";

// Customer session helpers — the shop stores OTP-verified session in localStorage
// as { phone, verifiedAt } under "xyvot-session" (see src/app/account/page.js).

const KEY = "xyvot-session";

export function getSessionPhone() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.phone || null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSessionPhone();
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
