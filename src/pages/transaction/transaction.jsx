import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTransaction,
  createTransactionsBulk,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../../api/transaction";
import { getWallets } from "../../api/wallet";
import { getBudgets } from "../../api/budget";

const transactionTypes = [
  { id: "expense", label: "Expense", icon: "↗" },
  { id: "income", label: "Income", icon: "↙" },
  { id: "transfer", label: "Transfer", icon: "↔" },
];

const incomeCategories = ["Salary", "Bonus", "Investment", "Gift", "Other"];

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
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${
          transaction.type === "income"
            ? "bg-emerald-100 text-emerald-700"
            : transaction.type === "transfer"
              ? "bg-blue-100 text-blue-700"
              : "bg-rose-100 text-rose-700"
        }`}
      >
        {transactionTypes.find((item) => item.id === transaction.type)?.icon ||
          "↗"}
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
  budgetCategories,
  editingTransaction,
  isSaving,
  onChange,
  onTypeChange,
  onClose,
  onSubmit,
}) => {
  const activeType = transactionTypes.find((item) => item.id === form.type);
  const isTransfer = form.type === "transfer";
  const walletLabel = form.type === "income" ? "To Wallet" : "From Wallet";
  const categoryOptions =
    form.type === "expense" ? budgetCategories : incomeCategories;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-transaction-title"
      onMouseDown={onClose}
    >
      <form
        className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="new-transaction-title"
            className="text-lg font-bold text-slate-900"
          >
            {editingTransaction ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close transaction modal"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {transactionTypes.map((item) => {
            const isActive = item.id === form.type;

            return (
              <button
                key={item.id}
                type="button"
                className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
                onClick={() => onTypeChange(item.id)}
              >
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-md ${
                    isActive ? "bg-blue-600 text-white" : "bg-white"
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
                  {wallet.name} ({formatMoney(wallet.balance, wallet.currency)})
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
              <select
                className={inputClass}
                value={form.category}
                onChange={onChange("category")}
                required={form.type === "expense"}
              >
                <option value="">
                  {form.type === "expense"
                    ? "Select budget category..."
                    : "Select category..."}
                </option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {form.type === "expense" && budgetCategories.length === 0 && (
                <p className="mt-2 text-xs font-semibold text-rose-500">
                  Create a budget for this transaction month first.
                </p>
              )}
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
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving
            ? "Saving..."
            : editingTransaction
              ? "Save Transaction"
              : `Add ${activeType?.label ?? "Transaction"}`}
        </button>
      </form>
    </div>
  );
};

const BulkTransactionModal = ({
  rows,
  wallets,
  budgetCategoriesByMonth,
  isSaving,
  onRowsChange,
  onLoadBudgetCategories,
  onClose,
  onSubmit,
}) => {
  const updateRow = (id, field, value) => {
    if (field === "transactionDate") {
      onLoadBudgetCategories(value.slice(0, 7));
    }
    onRowsChange((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const rowCategories = (row) => {
    if (row.type === "income") return incomeCategories;
    const periodMonth = row.transactionDate?.slice(0, 7) || today().slice(0, 7);
    return budgetCategoriesByMonth[periodMonth] || [];
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
                    <select
                      className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none focus:border-blue-200 focus:bg-white"
                      value={row.category}
                      onChange={(event) =>
                        updateRow(row.id, "category", event.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {rowCategories(row).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
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
  const [budgetCategoriesByMonth, setBudgetCategoriesByMonth] = useState({});
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
      await loadBudgetCategories(today().slice(0, 7));
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
      const source = `${transaction.title} ${transaction.category} ${transaction.note} ${transaction.walletName}`.toLowerCase();
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

  const loadBudgetCategories = async (periodMonth) => {
    if (!periodMonth || budgetCategoriesByMonth[periodMonth]) return;

    const response = await getBudgets(periodMonth);
    const categories = [...new Set((response.data || []).map((budget) => budget.category))];
    setBudgetCategoriesByMonth((current) => ({
      ...current,
      [periodMonth]: categories,
    }));
  };

  const openCreateModal = (type = "expense") => {
    loadBudgetCategories(today().slice(0, 7));
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
    loadBudgetCategories((transaction.transactionDate || today()).slice(0, 7));
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
    });
    setShowNewModal(true);
  };

  const closeModal = () => {
    setShowNewModal(false);
    setEditingTransaction(null);
    setForm(emptyForm);
  };

  const updateForm = (field) => (event) => {
    if (field === "transactionDate") {
      loadBudgetCategories(event.target.value.slice(0, 7));
    }
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const updateType = (type) => {
    setForm((current) => ({
      ...current,
      type,
      toWalletId: type === "transfer" ? current.toWalletId : "",
      category: type === "transfer" ? "Transfer" : current.category,
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

      setTransactions((current) =>
        editingTransaction
          ? current.map((transaction) =>
              transaction.id === editingTransaction.id ? response.data : transaction,
            )
          : [response.data, ...current],
      );
      setMessage(editingTransaction ? "Transaction updated." : "Transaction added.");
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
    loadBudgetCategories(today().slice(0, 7));
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track where your money goes.
          </p>
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
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
            Create a wallet first before adding transactions.
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
            No transactions yet.
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
          budgetCategories={
            budgetCategoriesByMonth[form.transactionDate.slice(0, 7)] || []
          }
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
          budgetCategoriesByMonth={budgetCategoriesByMonth}
          isSaving={isSaving}
          onRowsChange={setBulkRows}
          onLoadBudgetCategories={loadBudgetCategories}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  );
};

export default Transaction;
