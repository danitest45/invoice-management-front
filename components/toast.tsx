"use client";

export type ToastMessage = {
  id: number;
  type: "success" | "error";
  message: string;
};

type ToastViewportProps = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "rounded-2xl border px-4 py-3 shadow-card backdrop-blur",
            toast.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-900"
              : "border-rose-100 bg-rose-50 text-rose-900",
          ].join(" ")}
          role="alert"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wide opacity-70 transition duration-200 hover:-translate-y-0.5 hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
