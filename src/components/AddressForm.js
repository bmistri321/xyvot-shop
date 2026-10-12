"use client";

import { useState } from "react";

// Reusable address form used by the address book and inline checkout.
// Calls onSubmit with the cleaned payload; onCancel closes without saving.

const EMPTY = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function AddressForm({ initial = {}, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});

  const update = (k) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function validate() {
    const er = {};
    if (!form.name.trim()) er.name = "Name is required.";
    const phone = form.phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) er.phone = "Enter a valid 10-digit mobile number.";
    if (!form.line1.trim()) er.line1 = "Address line 1 is required.";
    if (!form.city.trim()) er.city = "City is required.";
    if (!form.state.trim()) er.state = "State is required.";
    if (!/^\d{6}$/.test(form.pincode.replace(/\D/g, ""))) er.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      label: form.label.trim() || "Home",
      name: form.name.trim(),
      phone: form.phone.replace(/\D/g, "").slice(-10),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.replace(/\D/g, ""),
      is_default: !!form.is_default,
    });
  }

  const input =
    "w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none";
  const labelCls = "block text-sm font-bold mb-2";
  const errCls = "mt-1 text-xs text-red-600 font-medium";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="addr-label" className={labelCls}>Label</label>
          <select id="addr-label" value={form.label} onChange={update("label")} className={input}>
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={update("is_default")}
              className="w-5 h-5 accent-orange-600"
            />
            Set as default
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="addr-name" className={labelCls}>Full name</label>
          <input id="addr-name" type="text" value={form.name} onChange={update("name")} placeholder="Receiver's name" autoComplete="name" className={input} />
          {errors.name && <p className={errCls}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="addr-phone" className={labelCls}>Mobile number</label>
          <input id="addr-phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="10-digit mobile" autoComplete="tel" inputMode="numeric" className={input} />
          {errors.phone && <p className={errCls}>{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="addr-line1" className={labelCls}>Address line 1</label>
        <input id="addr-line1" type="text" value={form.line1} onChange={update("line1")} placeholder="House no, street, area" autoComplete="address-line1" className={input} />
        {errors.line1 && <p className={errCls}>{errors.line1}</p>}
      </div>

      <div>
        <label htmlFor="addr-line2" className={labelCls}>Address line 2 <span className="font-normal text-slate-400">(optional)</span></label>
        <input id="addr-line2" type="text" value={form.line2} onChange={update("line2")} placeholder="Apartment, floor" autoComplete="address-line2" className={input} />
      </div>

      <div>
        <label htmlFor="addr-landmark" className={labelCls}>Landmark <span className="font-normal text-slate-400">(optional)</span></label>
        <input id="addr-landmark" type="text" value={form.landmark} onChange={update("landmark")} placeholder="Near…" className={input} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="addr-city" className={labelCls}>City</label>
          <input id="addr-city" type="text" value={form.city} onChange={update("city")} placeholder="City" autoComplete="address-level2" className={input} />
          {errors.city && <p className={errCls}>{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="addr-state" className={labelCls}>State</label>
          <input id="addr-state" type="text" value={form.state} onChange={update("state")} placeholder="State" autoComplete="address-level1" className={input} />
          {errors.state && <p className={errCls}>{errors.state}</p>}
        </div>
        <div>
          <label htmlFor="addr-pincode" className={labelCls}>PIN code</label>
          <input id="addr-pincode" type="text" value={form.pincode} onChange={(e) => update("pincode")({ target: { ...e.target, value: e.target.value.replace(/\D/g, "").slice(0, 6) } })} placeholder="6-digit" autoComplete="postal-code" inputMode="numeric" className={input} />
          {errors.pincode && <p className={errCls}>{errors.pincode}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-full border-2 border-slate-200 font-bold hover:border-slate-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
      </div>
    </form>
  );
}

// One-line address summary for cards and selectors
export function formatAddress(a) {
  if (!a) return "";
  const parts = [a.line1, a.line2, a.landmark, a.city, a.state, a.pincode].filter(Boolean);
  return parts.join(", ");
}
