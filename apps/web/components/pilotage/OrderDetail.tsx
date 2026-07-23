"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  CreditCard,
  CheckCircle2,
  Bot,
  Loader2,
  Save,
  ChevronDown,
  Package,
  Copy,
  ExternalLink,
} from "lucide-react";
import { OFFERS } from "@/lib/offers";
import { computeTotal, priceHintToNumber, type Quote, type QuoteItem } from "@/lib/quote";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface OrderView {
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  type: string;
  description: string;
  budget: number | null;
  status: string;
  source: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  runs: { role: string; status: string; summary: string | null; output: string | null }[];
}

export function OrderDetail({ order }: { order: OrderView }) {
  const searchParams = useSearchParams();
  const existingQuote = order.metadata.quote as Quote | undefined;
  const payment = order.metadata.payment as { status?: string; paidAt?: string } | undefined;
  const paid = payment?.status === "paid" || searchParams.get("paid") === "1";

  const [items, setItems] = useState<QuoteItem[]>(
    existingQuote?.items?.length ? existingQuote.items : [{ label: "", quantity: 1, unitPrice: 0 }],
  );
  const [notes, setNotes] = useState(existingQuote?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openRun, setOpenRun] = useState<number | null>(null);
  const existingDelivery = order.metadata.delivery as { token: string } | undefined;
  const [deliveryUrl, setDeliveryUrl] = useState<string>(
    existingDelivery?.token
      ? (typeof window !== "undefined" ? window.location.origin : "") +
          `/livraison/${existingDelivery.token}`
      : "",
  );
  const [delivering, setDelivering] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = computeTotal(items);

  async function generateDelivery() {
    setDelivering(true);
    setError(null);
    try {
      const res = await fetch(`/api/pilotage/orders/${order.id}/deliver`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setDeliveryUrl(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDelivering(false);
    }
  }

  function addOffer(offerId: string) {
    const offer = OFFERS.find((o) => o.id === offerId);
    if (!offer) return;
    setItems((prev) => [
      ...prev.filter((it) => it.label.trim() || it.unitPrice),
      { offerId: offer.id, label: offer.name, quantity: 1, unitPrice: priceHintToNumber(offer.priceHint) },
    ]);
    setSaved(false);
  }

  function updateItem(i: number, patch: Partial<QuoteItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    setSaved(false);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setSaved(false);
  }

  async function saveQuote() {
    const valid = items.filter((it) => it.label.trim());
    if (valid.length === 0) {
      setError("Ajoutez au moins une ligne au devis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pilotage/orders/${order.id}/quote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: valid, notes }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erreur");
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      await saveQuote();
      const res = await fetch(`/api/pilotage/orders/${order.id}/checkout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/pilotage" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 leading-tight">{order.clientName}</h1>
            <p className="text-xs text-gray-400">{order.type}</p>
          </div>
          {paid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Payé
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
              {order.status}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Left: order + diagnosis */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Commande</h2>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info label="Client" value={order.clientName} />
              <Info label="Email" value={order.clientEmail ?? "—"} />
              <Info label="Téléphone" value={order.clientPhone ?? "—"} />
              <Info label="Source" value={order.source} />
              <Info label="Budget indiqué" value={order.budget ? formatPrice(order.budget) : "—"} />
              <Info label="Reçue le" value={new Date(order.createdAt).toLocaleDateString("fr-FR")} />
            </dl>
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">Brief</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.description}</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Diagnostic des agents</h2>
            {order.runs.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun agent lancé pour l'instant. Lancez la production depuis la commande.
              </p>
            ) : (
              <div className="space-y-2">
                {order.runs.map((run, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenRun(openRun === i ? null : i)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-800 flex-1">{run.role}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          run.status === "SUCCEEDED"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {run.status}
                      </span>
                      <ChevronDown
                        className={cn("w-4 h-4 text-gray-400 transition", openRun === i && "rotate-180")}
                      />
                    </button>
                    {openRun === i && (
                      <div className="px-3 pb-3 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-50 pt-2">
                        {run.output || run.summary || "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">Livraison clé en main</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Générez un lien privé que le client ouvre pour télécharger lui-même son produit fini.
              Une fois livré, il en est 100 % propriétaire — plus rien à gérer de votre côté.
            </p>
            {deliveryUrl ? (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={deliveryUrl}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(deliveryUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  title="Copier"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={deliveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  title="Ouvrir"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <button
                onClick={generateDelivery}
                disabled={delivering}
                className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                {delivering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                Générer le lien de livraison
              </button>
            )}
          </section>
        </div>

        {/* Right: quote builder */}
        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">Devis</h2>
            </div>

            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      value={it.label}
                      onChange={(e) => updateItem(i, { label: e.target.value })}
                      placeholder="Prestation"
                      className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-[11px] text-gray-400">Qté</label>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                      className="w-14 text-sm px-2 py-1 rounded-lg border border-gray-200"
                    />
                    <label className="text-[11px] text-gray-400 ml-auto">PU €</label>
                    <input
                      type="number"
                      min={0}
                      value={it.unitPrice}
                      onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                      className="w-24 text-sm px-2 py-1 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) addOffer(e.target.value);
                  e.target.value = "";
                }}
                className="flex-1 text-xs px-2 py-2 rounded-lg border border-gray-200 text-gray-500"
                defaultValue=""
              >
                <option value="">+ Ajouter une offre du catalogue…</option>
                {OFFERS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setItems((p) => [...p, { label: "", quantity: 1, unitPrice: 0 }])}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                title="Ligne libre"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes / conditions (optionnel)"
              rows={2}
              className="w-full mt-2 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
            </div>

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <div className="mt-3 space-y-2">
              <button
                onClick={saveQuote}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? "Devis enregistré ✓" : "Enregistrer le devis"}
              </button>
              {paid ? (
                <div className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Réglé
                </div>
              ) : (
                <button
                  onClick={pay}
                  disabled={paying || total <= 0}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Encaisser {total > 0 ? formatPrice(total) : ""}
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}
