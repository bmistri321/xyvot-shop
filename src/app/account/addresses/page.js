"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AddressForm, { formatAddress } from "@/components/AddressForm";
import { getSessionPhone } from "@/lib/session";

export default function AddressesPage() {
  const [phone, setPhone] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // address object or "new"
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setPhone(getSessionPhone());
  }, []);

  const load = useCallback(async (p) => {
    if (!p) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/addresses?phone=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not load addresses.");
      setAddresses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phone) load(phone);
    else setLoading(false);
  }, [phone, load]);

  async function handleSave(payload) {
    if (!phone) return;
    setSaving(true);
    try {
      const isEdit = editing && editing !== "new";
      const url = isEdit ? `/api/addresses/${editing.id}` : "/api/addresses";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, phone }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not save address.");
      setEditing(null);
      await load(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!phone || !confirm("Delete this address?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/addresses/${id}?phone=${encodeURIComponent(phone)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not delete address.");
      await load(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetDefault(id) {
    const addr = addresses.find((a) => a.id === id);
    if (!addr || !phone) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addr, phone, is_default: true }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not set default.");
      await load(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!phone && !loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Saved addresses</h1>
        <p className="mt-4 text-slate-500">Log in to manage your delivery addresses.</p>
        <Link href="/account" className="mt-8 inline-block px-8 py-3 rounded-full bg-slate-900 text-white font-bold">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex gap-2">
          <li><Link href="/account" className="hover:text-slate-900">Account</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">Addresses</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Saved addresses</h1>
        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-orange-600"
          >
            + Add new
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-4 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </p>
      )}

      {editing && (
        <div className="mb-8 p-6 bg-slate-50 rounded-3xl">
          <h2 className="font-bold mb-4">{editing === "new" ? "Add address" : "Edit address"}</h2>
          <AddressForm
            initial={editing === "new" ? {} : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4" aria-hidden="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !editing ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl">
          <p className="text-4xl mb-4" aria-hidden="true">📍</p>
          <p className="text-xl font-bold">No saved addresses</p>
          <p className="mt-2 text-slate-500">Add one to check out faster.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {addresses.map((a) => (
            <li key={a.id} className="bg-white border border-slate-200 rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold">
                      {a.label || "Home"}
                    </span>
                    {a.is_default && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-bold">{a.name} <span className="font-normal text-slate-500">• {a.phone}</span></p>
                  <p className="mt-1 text-sm text-slate-600">{formatAddress(a)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!a.is_default && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    disabled={saving}
                    className="px-4 py-2 rounded-full border-2 border-slate-200 text-xs font-bold hover:border-slate-900 disabled:opacity-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => setEditing(a)}
                  className="px-4 py-2 rounded-full border-2 border-slate-200 text-xs font-bold hover:border-slate-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="px-4 py-2 rounded-full border-2 border-red-200 text-xs font-bold text-red-600 hover:border-red-600 disabled:opacity-50"
                >
                  {deleting === a.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
