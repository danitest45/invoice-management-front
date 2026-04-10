"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { InvoiceCard } from "@/components/invoice-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Modal } from "@/components/modal";
import { ToastViewport, type ToastMessage } from "@/components/toast";
import {
  addInvoiceItem,
  closeInvoice,
  createInvoice,
  getInvoiceById,
  getInvoices,
} from "@/lib/api";
import type {
  AddInvoiceItemPayload,
  ApiValidationError,
  Invoice,
  InvoiceFilters,
} from "@/types/invoice";

type FormErrors = {
  customerName?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  justification?: string;
  general?: string;
};

const defaultFilters: InvoiceFilters = {
  customerName: "",
  startDate: "",
  endDate: "",
  status: "Open",
};

const initialNewInvoice = {
  customerName: "",
};

const initialItemForm: AddInvoiceItemPayload = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  justification: "",
};

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiValidationError>(error)) {
    return "Something went wrong. Please try again.";
  }

  const validationErrors = error.response?.data?.errors;
  if (validationErrors) {
    return Object.entries(validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join(" | ");
  }

  return error.response?.data?.message ?? "Request failed. Please review your input.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function HomePage() {
  const [filters, setFilters] = useState<InvoiceFilters>(defaultFilters);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isClosingInvoice, setIsClosingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | number | null>(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | number | null>(null);
  const [newInvoiceForm, setNewInvoiceForm] = useState(initialNewInvoice);
  const [itemForm, setItemForm] = useState<AddInvoiceItemPayload>(initialItemForm);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [newInvoiceErrors, setNewInvoiceErrors] = useState<FormErrors>({});
  const [itemErrors, setItemErrors] = useState<FormErrors>({});
  const [closeInvoiceError, setCloseInvoiceError] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "Open").length,
    [invoices],
  );

  const closedCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "Closed").length,
    [invoices],
  );

  useEffect(() => {
    void fetchInvoices(defaultFilters);
  }, []);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [toasts]);

  async function fetchInvoices(nextFilters: InvoiceFilters) {
    setIsLoading(true);

    try {
      const data = await getInvoices(nextFilters);
      setInvoices(data);
    } catch (error) {
      pushToast("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function pushToast(type: ToastMessage["type"], message: string) {
    setToasts((current) => [...current, { id: Date.now() + Math.random(), type, message }]);
  }

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function validateNewInvoiceForm(customerName: string) {
    const trimmedCustomerName = customerName.trim();
    const errors: FormErrors = {};

    if (!trimmedCustomerName) {
      errors.customerName = "Customer name is required.";
    }

    return {
      errors,
      sanitizedCustomerName: trimmedCustomerName,
      isValid: Object.keys(errors).length === 0,
    };
  }

  function validateItemForm(payload: AddInvoiceItemPayload, invoice: Invoice | null) {
    const trimmedDescription = payload.description.trim();
    const trimmedJustification = payload.justification?.trim() ?? "";
    const errors: FormErrors = {};
    const totalAmount = payload.quantity * payload.unitPrice;

    if (!invoice) {
      errors.general = "Invoice not found.";
    }

    if (invoice?.status === "Closed") {
      errors.general = "Closed invoice cannot be changed.";
    }

    if (!trimmedDescription || trimmedDescription.length < 3) {
      errors.description = "Description must have at least 3 characters.";
    }

    if (payload.quantity <= 0) {
      errors.quantity = "Quantity must be greater than zero.";
    }

    if (payload.unitPrice <= 0) {
      errors.unitPrice = "Unit price must be greater than zero.";
    }

    if (totalAmount > 1000 && !trimmedJustification) {
      errors.justification = "Justification is required for items above R$ 1,000.";
    }

    return {
      errors,
      sanitizedPayload: {
        ...payload,
        description: trimmedDescription,
        justification: trimmedJustification,
      },
      isValid: Object.keys(errors).length === 0,
    };
  }

  function getCloseInvoiceValidationMessage(invoice: Invoice | null) {
    if (!invoice) {
      return "Invoice not found.";
    }

    if (invoice.status === "Closed") {
      return "Invoice is already closed.";
    }

    if (invoice.itemCount === 0) {
      return "Cannot close an invoice without items.";
    }

    return "";
  }

  async function handleSearch() {
    await fetchInvoices(filters);
  }

  async function handleCreateInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNewInvoiceForm(newInvoiceForm.customerName);
    setNewInvoiceErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsCreatingInvoice(true);

    try {
      await createInvoice({
        customerName: validation.sanitizedCustomerName,
      });
      pushToast("success", "Invoice created successfully.");
      setIsNewInvoiceOpen(false);
      setNewInvoiceForm(initialNewInvoice);
      setNewInvoiceErrors({});
      await fetchInvoices(filters);
    } catch (error) {
      pushToast("error", getErrorMessage(error));
    } finally {
      setIsCreatingInvoice(false);
    }
  }

  async function handleToggleDetails(invoice: Invoice) {
    const isSameInvoice = expandedInvoiceId === invoice.id;
    if (isSameInvoice) {
      setExpandedInvoiceId(null);
      return;
    }

    setExpandedInvoiceId(invoice.id);

    if (invoice.items) {
      return;
    }

    setDetailsLoadingId(invoice.id);

    try {
      const invoiceDetails = await getInvoiceById(invoice.id);
      setInvoices((current) =>
        current.map((entry) => (entry.id === invoice.id ? invoiceDetails : entry)),
      );
    } catch (error) {
      pushToast("error", getErrorMessage(error));
    } finally {
      setDetailsLoadingId(null);
    }
  }

  async function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateItemForm(itemForm, selectedInvoice);
    setItemErrors(validation.errors);

    if (!validation.isValid || !selectedInvoice) {
      return;
    }

    setIsAddingItem(true);

    try {
      await addInvoiceItem(selectedInvoice.id, {
        ...validation.sanitizedPayload,
        justification: validation.sanitizedPayload.justification || undefined,
      });
      pushToast("success", "Item added successfully.");
      setIsAddItemOpen(false);
      setItemForm(initialItemForm);
      setItemErrors({});

      const refreshedInvoice = await getInvoiceById(selectedInvoice.id);
      setInvoices((current) =>
        current.map((entry) => (entry.id === selectedInvoice.id ? refreshedInvoice : entry)),
      );
      setExpandedInvoiceId(selectedInvoice.id);
    } catch (error) {
      pushToast("error", getErrorMessage(error));
    } finally {
      setIsAddingItem(false);
    }
  }

  async function handleConfirmCloseInvoice() {
    const validationMessage = getCloseInvoiceValidationMessage(selectedInvoice);
    setCloseInvoiceError(validationMessage);

    if (validationMessage || !selectedInvoice) {
      return;
    }

    setIsClosingInvoice(true);

    try {
      await closeInvoice(selectedInvoice.id);
      pushToast("success", "Invoice closed successfully.");
      setIsCloseConfirmOpen(false);
      setCloseInvoiceError("");
      await fetchInvoices(filters);
    } catch (error) {
      pushToast("error", getErrorMessage(error));
    } finally {
      setIsClosingInvoice(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                  Invoice Management
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
                  Professional invoice operations from one dashboard
                </h1>
                <p className="mt-3 text-base text-muted">
                  Search invoices, create new records, add billable items, and close
                  completed invoices through a simple REST-connected interface.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm"
                onClick={() => {
                  setNewInvoiceErrors({});
                  setIsNewInvoiceOpen(true);
                }}
              >
                + New Invoice
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Total loaded</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{invoices.length}</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">Open</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-900">{activeCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-600">Closed</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{closedCount}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-slate-50 p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Customer name</span>
                  <input
                    type="text"
                    value={filters.customerName}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        customerName: event.target.value,
                      }))
                    }
                    placeholder="Search by customer"
                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Start date</span>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">End date</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Status</span>
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        status: event.target.value as InvoiceFilters["status"],
                      }))
                    }
                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="All">All</option>
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-sm xl:w-auto"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="rounded-[2rem] border border-white/70 bg-white p-16 shadow-card">
              <LoadingSpinner />
              <p className="mt-4 text-center text-sm text-muted">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-line bg-white p-16 text-center shadow-card">
              <h2 className="text-2xl font-semibold text-ink">No invoices found</h2>
              <p className="mt-3 text-sm text-muted">
                Adjust your filters or create a new invoice to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  isDetailsOpen={expandedInvoiceId === invoice.id}
                  isDetailsLoading={detailsLoadingId === invoice.id}
                  onToggleDetails={() => void handleToggleDetails(invoice)}
                  onAddItem={() => {
                    setSelectedInvoice(invoice);
                    setItemForm(initialItemForm);
                    setItemErrors({});
                    setIsAddItemOpen(true);
                  }}
                  onCloseInvoice={() => {
                    setSelectedInvoice(invoice);
                    setCloseInvoiceError(getCloseInvoiceValidationMessage(invoice));
                    setIsCloseConfirmOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={isNewInvoiceOpen}
        onClose={() => {
          if (!isCreatingInvoice) {
            setIsNewInvoiceOpen(false);
          }
        }}
        title="Create a new invoice"
        description="Enter the customer name to create a new invoice record."
      >
        <form className="space-y-4" onSubmit={handleCreateInvoice}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Customer name</span>
            <input
              type="text"
              value={newInvoiceForm.customerName}
              onChange={(event) =>
                setNewInvoiceForm({
                  customerName: event.target.value,
                })
              }
              placeholder="Customer or company name"
              className={[
                "rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/15",
                newInvoiceErrors.customerName
                  ? "border border-rose-300 focus:border-rose-400"
                  : "border border-line focus:border-accent",
              ].join(" ")}
              required
            />
            {newInvoiceErrors.customerName ? (
              <p className="text-sm text-rose-600">{newInvoiceErrors.customerName}</p>
            ) : null}
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingInvoice}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isCreatingInvoice ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddItemOpen}
        onClose={() => {
          if (!isAddingItem) {
            setIsAddItemOpen(false);
          }
        }}
        title="Add invoice item"
        description={
          selectedInvoice
            ? `Add a line item to invoice #${selectedInvoice.invoiceNumber}.`
            : "Add a line item."
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddItem}>
          {itemErrors.general ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
              {itemErrors.general}
            </div>
          ) : null}

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-ink">Description</span>
            <input
              type="text"
              value={itemForm.description}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Item description"
              className={[
                "rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/15",
                itemErrors.description
                  ? "border border-rose-300 focus:border-rose-400"
                  : "border border-line focus:border-accent",
              ].join(" ")}
              required
            />
            {itemErrors.description ? (
              <p className="text-sm text-rose-600">{itemErrors.description}</p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              value={itemForm.quantity}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              className={[
                "rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/15",
                itemErrors.quantity
                  ? "border border-rose-300 focus:border-rose-400"
                  : "border border-line focus:border-accent",
              ].join(" ")}
              required
            />
            {itemErrors.quantity ? (
              <p className="text-sm text-rose-600">{itemErrors.quantity}</p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Unit price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={itemForm.unitPrice}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  unitPrice: Number(event.target.value),
                }))
              }
              className={[
                "rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/15",
                itemErrors.unitPrice
                  ? "border border-rose-300 focus:border-rose-400"
                  : "border border-line focus:border-accent",
              ].join(" ")}
              required
            />
            {itemErrors.unitPrice ? (
              <p className="text-sm text-rose-600">{itemErrors.unitPrice}</p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-ink">Justification (optional)</span>
            <textarea
              value={itemForm.justification}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  justification: event.target.value,
                }))
              }
              placeholder="Add context for this item if needed"
              rows={4}
              className={[
                "rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/15",
                itemErrors.justification
                  ? "border border-rose-300 focus:border-rose-400"
                  : "border border-line focus:border-accent",
              ].join(" ")}
            />
            {itemErrors.justification ? (
              <p className="text-sm text-rose-600">{itemErrors.justification}</p>
            ) : null}
          </label>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 md:col-span-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Item total</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {formatCurrency(itemForm.quantity * itemForm.unitPrice)}
              </p>
            </div>
            <button
              type="submit"
              disabled={isAddingItem}
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isAddingItem ? "Saving..." : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCloseConfirmOpen}
        onClose={() => {
          if (!isClosingInvoice) {
            setIsCloseConfirmOpen(false);
          }
        }}
        title="Close invoice"
        description="Are you sure you want to close this invoice?"
      >
        <div className="space-y-5">
          {closeInvoiceError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {closeInvoiceError}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-muted">
              Closed invoices can still be viewed, but adding items and closing actions will be
              disabled.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              onClick={() => setIsCloseConfirmOpen(false)}
              disabled={isClosingInvoice}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onClick={() => void handleConfirmCloseInvoice()}
              disabled={isClosingInvoice || Boolean(closeInvoiceError)}
            >
              {isClosingInvoice ? "Closing..." : "Yes, close invoice"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
