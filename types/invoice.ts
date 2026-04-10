export type InvoiceStatus = "Open" | "Closed";

export type ApiInvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalItemAmount?: number;
  justification?: string | null;
};

export type ApiInvoice = {
  id: string;
  number: string;
  customerName: string;
  issueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  items: ApiInvoiceItem[];
};

export type InvoiceItem = {
  id?: string | number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount?: number;
  justification?: string | null;
};

export type Invoice = {
  id: string | number;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  itemCount: number;
  items?: InvoiceItem[];
};

export type InvoiceFilters = {
  customerName?: string;
  startDate?: string;
  endDate?: string;
  status?: "Open" | "Closed" | "All";
};

export type CreateInvoicePayload = {
  customerName: string;
};

export type AddInvoiceItemPayload = {
  description: string;
  quantity: number;
  unitPrice: number;
  justification?: string;
};

export type ApiValidationError = {
  message?: string;
  errors?: Record<string, string[]>;
};
