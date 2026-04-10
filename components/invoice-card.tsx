"use client";

import type { Invoice } from "@/types/invoice";

type InvoiceCardProps = {
  invoice: Invoice;
  isDetailsOpen: boolean;
  isDetailsLoading: boolean;
  onToggleDetails: () => void;
  onAddItem: () => void;
  onCloseInvoice: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function InvoiceCard({
  invoice,
  isDetailsOpen,
  isDetailsLoading,
  onToggleDetails,
  onAddItem,
  onCloseInvoice,
}: InvoiceCardProps) {
  const isClosed = invoice.status === "Closed";

  return (
    <article className="rounded-3xl border border-white/80 bg-white p-6 shadow-card">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              #{invoice.invoiceNumber}
            </span>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                isClosed
                  ? "bg-slate-100 text-slate-700"
                  : "bg-emerald-100 text-emerald-800",
              ].join(" ")}
            >
              {invoice.status}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-ink">{invoice.customerName}</h3>
            <p className="mt-1 text-sm text-muted">Issued on {formatDate(invoice.issueDate)}</p>
          </div>
        </div>

        <div className="grid min-w-[220px] grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total amount</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatCurrency(invoice.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Items</p>
            <p className="mt-1 text-lg font-semibold text-ink">{invoice.itemCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          onClick={onToggleDetails}
        >
          {isDetailsOpen ? "Hide Details" : "View Details"}
        </button>
        <button
          type="button"
          className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          onClick={onAddItem}
          disabled={isClosed}
        >
          Add Item
        </button>
        <button
          type="button"
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          onClick={onCloseInvoice}
          disabled={isClosed}
        >
          Close Invoice
        </button>
      </div>

      {isDetailsOpen ? (
        <div className="mt-6 rounded-2xl border border-line bg-slate-50 p-5">
          {isDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
            </div>
          ) : invoice.items?.length ? (
            <div className="space-y-4">
              {invoice.items.map((item, index) => {
                const totalAmount = item.totalAmount ?? item.quantity * item.unitPrice;

                return (
                  <div
                    key={item.id ?? `${invoice.id}-${index}`}
                    className="rounded-2xl border border-white bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-ink">{item.description}</h4>
                        <p className="mt-1 text-sm text-muted">
                          Qty {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-ink">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    {item.justification ? (
                      <p className="mt-3 text-sm text-muted">
                        Justification: {item.justification}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">No items have been added to this invoice yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
