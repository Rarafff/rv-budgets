import React, { useEffect, useMemo, useState } from "react";
import bearReceiptScan from "../../assets/bears/bear-receipt-scan.png";
import { useNavigate } from "react-router-dom";
import {
  createTransaction,
  createTransactionsBulk,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../../api/transaction";
import { getWallets } from "../../api/wallet";
import { createBill } from "../../api/bill";
import CategoryPicker from "../../components/category-picker";
import { useTranslation } from "../../i18n/use-translation";

const transactionTypes = [
  { id: "expense", label: "Expense", icon: "−" },
  { id: "income", label: "Income", icon: "+" },
  { id: "transfer", label: "Transfer", icon: "↔" },
];

const transactionTypeStyles = {
  expense: {
    selected: "border-rose-200 bg-rose-50 text-rose-700 shadow-sm",
    icon: "bg-rose-600 text-white",
  },
  income: {
    selected: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm",
    icon: "bg-emerald-600 text-white",
  },
  transfer: {
    selected: "border-sky-200 bg-sky-50 text-sky-700 shadow-sm",
    icon: "bg-sky-600 text-white",
  },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  walletId: "",
  toWalletId: "",
  type: "expense",
  title: "",
  category: "",
  note: "",
  amount: "",
  transactionDate: today(),
  isRecurringExpense: false,
};

const nextMonthlyDate = (dateValue) => {
  const [year, month, day] = String(dateValue).split("-").map(Number);
  const targetMonth = month === 12 ? 1 : month + 1;
  const targetYear = month === 12 ? year + 1 : year;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(amount || 0));

const signedAmount = (transaction) => {
  const amount = formatMoney(transaction.amount);
  if (transaction.type === "income") return `+${amount}`;
  if (transaction.type === "transfer") return amount;
  return `-${amount}`;
};

const amountTone = (type) => {
  if (type === "income") return "text-emerald-600";
  if (type === "transfer") return "text-blue-600";
  return "text-rose-600";
};

const groupLabel = (date) => {
  const value = new Date(`${date}T00:00:00`);
  const now = new Date();
  const todayValue = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(todayValue);
  yesterday.setDate(todayValue.getDate() - 1);

  if (value.getTime() === todayValue.getTime()) return "Today";
  if (value.getTime() === yesterday.getTime()) return "Yesterday";

  return value.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TransactionRow = ({
  transaction,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}) => (
  <article
    className={`rounded-xl border bg-white shadow-sm transition ${
      isOpen ? "border-blue-200 ring-2 ring-blue-100" : "border-slate-100"
    }`}
  >
    <button
      type="button"
      className="flex w-full items-center gap-4 p-4 text-left"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl font-black leading-none ${
          transaction.type === "income"
            ? "bg-emerald-100 text-emerald-700"
            : transaction.type === "transfer"
              ? "bg-blue-100 text-blue-700"
              : "bg-rose-100 text-rose-700"
        }`}
      >
        {transactionTypes.find((item) => item.id === transaction.type)?.icon || "−"}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-slate-900">{transaction.title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {transaction.type === "transfer"
            ? `${transaction.walletName} → ${transaction.toWalletName}`
            : transaction.category || "Uncategorized"}
        </p>
      </div>
      <p
        className={`ml-auto whitespace-nowrap text-sm font-bold ${amountTone(
          transaction.type,
        )}`}
      >
        {signedAmount(transaction)}
      </p>
      <span
        className={`text-slate-400 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      >
        ^
      </span>
    </button>

    {isOpen && (
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <div className="grid gap-3 text-xs sm:grid-cols-4">
          <div>
            <p className="font-bold uppercase tracking-wide text-slate-400">
              Wallet
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {transaction.walletName}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-slate-400">
              Category
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {transaction.category || "-"}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-slate-400">
              Date
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {transaction.transactionDate}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-slate-400">
              Note
            </p>
            <p className="mt-1 truncate font-semibold text-slate-700">
              {transaction.note || "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="h-9 rounded-lg border border-rose-100 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    )}
  </article>
);

const TransactionModal = ({
  form,
  wallets,
  editingTransaction,
  isSaving,
  onChange,
  onTypeChange,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const activeType = transactionTypes.find((item) => item.id === form.type);
  const isTransfer = form.type === "transfer";
  const walletLabel = form.type === "income" ? "To Wallet" : "From Wallet";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3d291b]/60 p-0 backdrop-blur-[2px] sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-transaction-title"
      onMouseDown={onClose}
    >
      <form
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-[#fffdf8] shadow-2xl sm:max-h-[calc(100svh-3rem)] sm:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#f1dfc2] bg-[#fffaf0] px-6 pb-5 pt-6 sm:px-5 sm:pb-4 sm:pt-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a96d2d]">
              Money tracker
            </p>
            <h2
              id="new-transaction-title"
              className="mt-1 text-xl font-black text-[#4d2f1a]"
            >
              {editingTransaction ? "Edit transaksi" : "Tambah transaksi"}
            </h2>
          </div>
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#ecd7b7] bg-white text-xl font-bold text-[#805323] shadow-sm transition hover:bg-[#fff3d9]"
            onClick={onClose}
            aria-label="Tutup modal transaksi"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-6 pb-6 sm:px-5 sm:pb-5">
          <div className="mt-5 grid grid-cols-3 gap-2">
            {transactionTypes.map((item) => {
              const isActive = item.id === form.type;
              const style = transactionTypeStyles[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                    isActive
                      ? style.selected
                      : "border-transparent bg-[#f7f8fa] text-slate-500 hover:bg-[#f1f3f5]"
                  }`}
                  onClick={() => onTypeChange(item.id)}
                  aria-label={item.label}
                >
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-md text-base font-black leading-none ${
                      isActive ? style.icon : "bg-white text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Date
              </span>
              <input
                className={inputClass}
                type="date"
                value={form.transactionDate}
                onChange={onChange("transactionDate")}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Amount
              </span>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.amount}
                onChange={onChange("amount")}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {walletLabel}
              </span>
              <select
                className={inputClass}
                value={form.walletId}
                onChange={onChange("walletId")}
                required
              >
                <option value="" disabled>
                  Select wallet...
                </option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} (
                    {formatMoney(wallet.balance, wallet.currency)})
                  </option>
                ))}
              </select>
            </label>

            {isTransfer ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  To Wallet
                </span>
                <select
                  className={inputClass}
                  value={form.toWalletId}
                  onChange={onChange("toWalletId")}
                  required
                >
                  <option value="" disabled>
                    Select wallet...
                  </option>
                  {wallets
                    .filter((wallet) => wallet.id !== form.walletId)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                </span>
                <CategoryPicker
                  className={inputClass}
                  value={form.category}
                  onChange={onChange("category")}
                  required={form.type === "expense"}
                  type={form.type}
                  placeholder="Select category..."
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Title
              </span>
              <input
                className={inputClass}
                placeholder="e.g. Kopi Kenangan"
                value={form.title}
                onChange={onChange("title")}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Note
              </span>
              <input
                className={inputClass}
                placeholder="Optional"
                value={form.note}
                onChange={onChange("note")}
              />
            </label>

            {!editingTransaction && form.type === "expense" && (
              <label className="flex items-start gap-3 rounded-xl border border-[#f1dfc2] bg-[#fff8e9] px-4 py-3 text-sm text-[#70441f]">
                <input
                  type="checkbox"
                  checked={form.isRecurringExpense}
                  onChange={onChange("isRecurringExpense")}
                  className="mt-0.5 size-4 rounded border-[#d9b77f] text-[#8b5a2b] focus:ring-[#c28b45]"
                />
                <span>
                  <span className="block font-black">
                    {t("transaction.requiredMonthly")}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-[#8d6a4c]">
                    {t("transaction.requiredMonthlyHint")}
                  </span>
                </span>
              </label>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#f1dfc2] bg-[#fffaf0] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 w-full rounded-xl bg-[#8b5a2b] text-sm font-black text-white shadow-sm transition hover:bg-[#70441f] disabled:cursor-not-allowed disabled:bg-[#cba982]"
          >
            {isSaving
              ? "Saving..."
              : editingTransaction
                ? "Save Transaction"
                : `Add ${activeType?.label ?? "Transaction"}`}
          </button>
        </footer>
      </form>
    </div>
  );
};

const BulkTransactionModal = ({
  rows,
  wallets,
  isSaving,
  onRowsChange,
  onClose,
  onSubmit,
}) => {
  const updateRow = (id, field, value) => {
    onRowsChange((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => {
    onRowsChange((current) => [
      ...current,
      {
        id: `bulk-${Date.now()}`,
        ...emptyForm,
        walletId: wallets[0]?.id || "",
      },
    ]);
  };

  const removeRow = (id) => {
    onRowsChange((current) => current.filter((row) => row.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-transaction-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[calc(100svh-3rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="bulk-transaction-title"
              className="text-lg font-bold text-slate-900"
            >
              Bulk Transaction Input
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add many income or expense transactions at once.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close bulk transaction modal"
          >
            x
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-10 px-3 py-3"></th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Wallet</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Title</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="text-slate-300 hover:text-rose-500"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove transaction row"
                    >
                      x
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="date"
                      className="w-32 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      value={row.transactionDate}
                      onChange={(event) =>
                        updateRow(row.id, "transactionDate", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      className="w-24 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      placeholder="0"
                      value={row.amount}
                      onChange={(event) =>
                        updateRow(row.id, "amount", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-32 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      value={row.type}
                      onChange={(event) =>
                        updateRow(row.id, "type", event.target.value)
                      }
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      value={row.walletId}
                      onChange={(event) =>
                        updateRow(row.id, "walletId", event.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <CategoryPicker
                      className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      value={row.category}
                      onChange={(event) =>
                        updateRow(row.id, "category", event.target.value)
                      }
                      type={row.type}
                      placeholder="Category"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="w-44 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      placeholder="e.g. Kopi Kenangan"
                      value={row.title}
                      onChange={(event) =>
                        updateRow(row.id, "title", event.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={addRow}
          >
            + Add Row
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            onClick={onSubmit}
          >
            {isSaving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Transaction = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [openTransaction, setOpenTransaction] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bulkRows, setBulkRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [walletResponse, transactionResponse] = await Promise.all([
        getWallets(),
        getTransactions(),
      ]);
      setWallets(walletResponse.data || []);
      setTransactions(transactionResponse.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const source =
        `${transaction.title} ${transaction.category} ${transaction.note} ${transaction.walletName}`.toLowerCase();
      return source.includes(search.toLowerCase());
    });

    return filtered.reduce((groups, transaction) => {
      const label = groupLabel(transaction.transactionDate);
      const existing = groups.find((group) => group.label === label);
      if (existing) {
        existing.items.push(transaction);
      } else {
        groups.push({ label, items: [transaction] });
      }
      return groups;
    }, []);
  }, [search, transactions]);

  const defaultWalletID = () => wallets[0]?.id || "";

  const openCreateModal = (type = "expense") => {
    setEditingTransaction(null);
    setForm({
      ...emptyForm,
      type,
      walletId: defaultWalletID(),
      transactionDate: today(),
    });
    setShowNewModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setForm({
      walletId: transaction.walletId || "",
      toWalletId: transaction.toWalletId || "",
      type: transaction.type || "expense",
      title: transaction.title || "",
      category: transaction.category || "",
      note: transaction.note || "",
      amount: String(transaction.amount ?? ""),
      transactionDate: transaction.transactionDate || today(),
      isRecurringExpense: false,
    });
    setShowNewModal(true);
  };

  const closeModal = () => {
    setShowNewModal(false);
    setEditingTransaction(null);
    setForm(emptyForm);
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  };

  const updateType = (type) => {
    setForm((current) => ({
      ...current,
      type,
      toWalletId: type === "transfer" ? current.toWalletId : "",
      category:
        type === "transfer"
          ? "Transfer"
          : current.category === "Transfer"
            ? ""
            : current.category,
    }));
  };

  const payloadFromForm = (source) => ({
    walletId: source.walletId,
    toWalletId: source.type === "transfer" ? source.toWalletId : null,
    type: source.type,
    title: source.title,
    category: source.type === "transfer" ? "Transfer" : source.category,
    note: source.note || "",
    amount: Number(source.amount || 0),
    transactionDate: source.transactionDate,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const payload = payloadFromForm(form);
      const response = editingTransaction
        ? await updateTransaction(editingTransaction.id, payload)
        : await createTransaction(payload);

      let recurringScheduleError = false;
      if (
        !editingTransaction &&
        form.type === "expense" &&
        form.isRecurringExpense
      ) {
        try {
          await createBill({
            walletId: form.walletId,
            name: form.title,
            category: form.category,
            provider: "",
            amount: Number(form.amount || 0),
            dueDate: nextMonthlyDate(form.transactionDate),
            status: "upcoming",
            note: form.note || "",
            isRecurring: true,
            repeatInterval: "monthly",
            autoPay: true,
          });
        } catch {
          recurringScheduleError = true;
        }
      }

      setTransactions((current) =>
        editingTransaction
          ? current.map((transaction) =>
              transaction.id === editingTransaction.id
                ? response.data
                : transaction,
            )
          : [response.data, ...current],
      );
      setMessage(
        editingTransaction
          ? "Transaction updated."
          : recurringScheduleError
            ? "Transaction added, but the monthly schedule could not be saved."
            : form.isRecurringExpense
              ? "Transaction added. Monthly automatic payment is scheduled."
              : "Transaction added.",
      );
      closeModal();
      await loadWalletsOnly();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const loadWalletsOnly = async () => {
    const response = await getWallets();
    setWallets(response.data || []);
  };

  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(`Delete ${transaction.title}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteTransaction(transaction.id);
      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id),
      );
      setMessage("Transaction deleted.");
      await loadWalletsOnly();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete transaction.",
      );
    }
  };

  const openBulkModal = () => {
    setBulkRows([
      {
        id: "bulk-1",
        ...emptyForm,
        walletId: defaultWalletID(),
        transactionDate: today(),
      },
      {
        id: "bulk-2",
        ...emptyForm,
        walletId: defaultWalletID(),
        transactionDate: today(),
      },
    ]);
    setShowBulkModal(true);
  };

  const handleBulkSubmit = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const validRows = bulkRows.filter(
        (row) => row.walletId && row.title && Number(row.amount || 0) > 0,
      );

      const response = await createTransactionsBulk(
        validRows.map((row) => payloadFromForm(row)),
      );
      const created = response.data || [];

      setTransactions((current) => [...created, ...current]);
      setMessage(`${created.length} transactions added.`);
      setShowBulkModal(false);
      await loadWalletsOnly();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save bulk transactions.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTransaction = (id) => {
    setOpenTransaction((current) => (current === id ? null : id));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track where your money goes.
            </p>
          </div>
          <img
            src={bearReceiptScan}
            alt=""
            className="hidden size-16 object-contain sm:block"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={() => navigate("/receipt-scanner")}
          >
            <span aria-hidden="true">▣</span>
            Scan Receipt
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={openBulkModal}
          >
            <span aria-hidden="true">▤</span>
            Add Bulk
          </button>
          <button
            type="button"
            onClick={() => openCreateModal("expense")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            + New Transaction
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </p>
      )}

      <div className="mt-5">
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>
          <input
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-300"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
            Loading transactions...
          </div>
        ) : wallets.length === 0 ? (
          <div className="companion-empty flex min-h-44 items-center justify-between overflow-hidden px-5 text-sm font-bold">
            <p className="max-w-xs">
              Create a wallet first before adding transactions.
            </p>
            <img
              src={bearReceiptScan}
              alt=""
              className="-my-5 -mr-4 w-36 object-contain"
            />
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="companion-empty flex min-h-44 items-center justify-between overflow-hidden px-5 text-sm font-bold">
            <p className="max-w-xs">
              No transactions yet. A receipt scan is a great first step.
            </p>
            <img
              src={bearReceiptScan}
              alt=""
              className="-my-5 -mr-4 w-36 object-contain"
            />
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <section key={group.label}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  {group.label}
                </h2>
              </div>

              <div className="space-y-3">
                {group.items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isOpen={openTransaction === transaction.id}
                    onToggle={() => toggleTransaction(transaction.id)}
                    onEdit={() => openEditModal(transaction)}
                    onDelete={() => handleDelete(transaction)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {showNewModal && (
        <TransactionModal
          form={form}
          wallets={wallets}
          editingTransaction={editingTransaction}
          isSaving={isSaving}
          onChange={updateForm}
          onTypeChange={updateType}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {showBulkModal && (
        <BulkTransactionModal
          rows={bulkRows}
          wallets={wallets}
          isSaving={isSaving}
          onRowsChange={setBulkRows}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  );
};

export default Transaction;
