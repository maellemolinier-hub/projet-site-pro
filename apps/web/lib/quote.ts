/** Types partagés du devis (stocké dans Order.metadata.quote). */
export interface QuoteItem {
  offerId?: string;
  label: string;
  quantity: number;
  /** Prix unitaire en euros (HT). */
  unitPrice: number;
}

export interface Quote {
  items: QuoteItem[];
  notes?: string;
  currency: "eur";
  total: number;
  updatedAt: string;
}

export interface PaymentState {
  status: "pending" | "paid";
  sessionId?: string;
  amount?: number;
  paidAt?: string;
}

export function computeTotal(items: QuoteItem[]): number {
  return items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);
}

/** Convertit un indice de prix ("à partir de 1 500 €") en nombre d'euros. */
export function priceHintToNumber(hint?: string): number {
  if (!hint) return 0;
  const match = hint.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Math.round(parseFloat(match[1].replace(",", "."))) : 0;
}
