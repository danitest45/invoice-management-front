import axios from "axios";
import type {
  AddInvoiceItemPayload,
  ApiInvoice,
  CreateInvoicePayload,
  Invoice,
  InvoiceFilters,
} from "@/types/invoice";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:44323",
  headers: {
    "Content-Type": "application/json",
  },
});

function mapInvoice(invoice: ApiInvoice): Invoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.number,
    customerName: invoice.customerName,
    issueDate: invoice.issueDate,
    status: invoice.status,
    totalAmount: invoice.totalAmount,
    itemCount: invoice.items.length,
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalItemAmount,
      justification: item.justification,
    })),
  };
}

export async function getInvoices(filters: InvoiceFilters) {
  const { data } = await api.get<ApiInvoice[]>("/invoices", {
    params: {
      customer: filters.customerName?.trim() || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      status: filters.status && filters.status !== "All" ? filters.status : undefined,
    },
  });

  return data.map(mapInvoice);
}

export async function getInvoiceById(id: string | number) {
  const { data } = await api.get<ApiInvoice>(`/invoices/${id}`);
  return mapInvoice(data);
}

export async function createInvoice(payload: CreateInvoicePayload) {
  const { data } = await api.post<ApiInvoice>("/invoices", payload);
  return mapInvoice(data);
}

export async function addInvoiceItem(
  id: string | number,
  payload: AddInvoiceItemPayload,
) {
  const { data } = await api.post<ApiInvoice>(`/invoices/${id}/items`, payload);
  return mapInvoice(data);
}

export async function closeInvoice(id: string | number) {
  const { data } = await api.put<ApiInvoice>(`/invoices/${id}/close`);
  return mapInvoice(data);
}
