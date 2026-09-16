import React, { useEffect, useMemo, useState } from "react";
import bearTarget from "../../assets/bears/bear-target.png";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../../api/budget";

const groups = ["Needs", "Wants"];

const emptyForm = {
  groupName: "Needs",
  category: "",
  transactionCategory: "",
  periodMonth: new Date().toISOString().slice(0, 7),
  limitAmount: "",
  icon: "",
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount) =>
  `Rp. ${Number(amount || 0).toLocaleString("id-ID")}`;

const groupAccent = {
  Needs: { dot: "bg-blue-500", bar: "bg-blue-500", icon: "bg-blue-100" },
  Wants: { dot: "bg-amber-400", bar: "bg-amber-400", icon: "bg-amber-100" },
};

const normalizeGroupName = (groupName) =>
  groups.includes(groupName) ? groupName : "Needs";

const BudgetItem = ({ item, onEdit, onDelete }) => {
  const accent = groupAccent[item.groupName] || groupAccent.Needs;
  const progress = Math.round(Number(item.progress || 0));

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${accent.icon}`}
        >
          {item.icon || item.category.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {item.category}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Tracks: {item.transactionCategory || item.category}
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-bold text-slate-900">
              {formatMoney(item.spentAmount)}
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full ${
                progress >= 100
                  ? "bg-rose-400"
                  : progress >= 90
                    ? "bg-amber-400"
                    : accent.bar
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs font-medium text-slate-400">
            from {formatMoney(item.limitAmount)} ({progress}%)
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg px-2 py-1 text-xs font-bold text-rose-400 hover:bg-rose-50 hover:text-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

const BudgetModal = ({
  form,
  editingBudget,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}) => (
  <div
    className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 sm:items-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="budget-form-title"
    onMouseDown={onClose}
  >
    <form
      className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="budget-form-title" className="text-lg font-bold text-slate-900">
          {editingBudget ? "Edit Budget" : "Add Budget"}
        </h2>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          aria-label="Close budget modal"
        >
          x
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Group
            </span>
            <select
              className={inputClass}
              value={form.groupName}
              onChange={onChange("groupName")}
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Month
            </span>
            <input
              type="month"
              className={inputClass}
              value={form.periodMonth}
              onChange={onChange("periodMonth")}
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Budget Name
          </span>
          <input
            className={inputClass}
            placeholder="e.g. Monthly Food Limit"
            value={form.category}
            onChange={onChange("category")}
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Transaction Category
          </span>
          <input
            className={inputClass}
            placeholder="e.g. Food"
            value={form.transactionCategory}
            onChange={onChange("transactionCategory")}
          />
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Transactions with this category will count toward this budget.
          </p>
        </label>

        <div className="grid gap-4 sm:grid-cols-[1fr_5rem]">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Limit Amount
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0"
              value={form.limitAmount}
              onChange={onChange("limitAmount")}
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Icon
            </span>
            <input
              className={`${inputClass} text-center`}
              placeholder="F"
              value={form.icon}
              onChange={onChange("icon")}
              maxLength={3}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSaving ? "Saving..." : editingBudget ? "Save Budget" : "Add Budget"}
      </button>
    </form>
  </div>
);

const BudgetSection = ({ title, items, onEdit, onDelete }) => {
  const accent = groupAccent[title] || groupAccent.Needs;
  const used = items.reduce((sum, item) => sum + Number(item.spentAmount || 0), 0);
  const limit = items.reduce((sum, item) => sum + Number(item.limitAmount || 0), 0);
  const progress = limit > 0 ? Math.round((used / limit) * 100) : 0;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`size-2 rounded-full ${accent.dot}`} />
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            {title}
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full ${accent.bar}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <span>Used: {formatMoney(used)}</span>
          <span>Limit: {formatMoney(limit)}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="companion-empty flex min-h-36 items-center justify-between overflow-hidden px-5 text-sm font-bold">
          <p className="max-w-xs">No {title.toLowerCase()} budgets yet. Start with a small plan for this month.</p>
          <img src={bearTarget} alt="" className="-my-5 -mr-4 w-28 object-contain" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <BudgetItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [periodMonth, setPeriodMonth] = useState(emptyForm.periodMonth);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const groupedBudgets = useMemo(
    () =>
      groups.reduce((acc, group) => {
        acc[group] = budgets.filter(
          (budget) => normalizeGroupName(budget.groupName) === group,
        );
        return acc;
      }, {}),
    [budgets],
  );

  const totalLimit = budgets.reduce(
    (sum, budget) => sum + Number(budget.limitAmount || 0),
    0,
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + Number(budget.spentAmount || 0),
    0,
  );

  useEffect(() => {
    loadBudgets();
  }, [periodMonth]);

  const loadBudgets = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getBudgets(periodMonth);
      setBudgets(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load budgets.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setForm({
      ...emptyForm,
      periodMonth,
    });
    setShowModal(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setForm({
      groupName: normalizeGroupName(budget.groupName),
      category: budget.category,
      transactionCategory: budget.transactionCategory || budget.category,
      periodMonth: budget.periodMonth,
      limitAmount: String(budget.limitAmount || ""),
      icon: budget.icon || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setForm(emptyForm);
  };

  const payload = () => ({
    groupName: form.groupName,
    category: form.category,
    transactionCategory: form.transactionCategory || form.category,
    periodMonth: form.periodMonth,
    limitAmount: Number(form.limitAmount || 0),
    icon: form.icon,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = editingBudget
        ? await updateBudget(editingBudget.id, payload())
        : await createBudget(payload());

      setMessage(editingBudget ? "Budget updated." : "Budget added.");
      closeModal();
      if (response.data.periodMonth !== periodMonth) {
        setPeriodMonth(response.data.periodMonth);
      } else {
        await loadBudgets();
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save budget.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (budget) => {
    const confirmed = window.confirm(`Delete ${budget.category} budget?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteBudget(budget.id);
      setBudgets((current) => current.filter((item) => item.id !== budget.id));
      setMessage("Budget deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete budget.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Set Budget</h1>
            <p className="mt-1 text-sm text-slate-500">Give every rupiah a clear job.</p>
          </div>
          <img src={bearTarget} alt="" className="hidden size-16 object-contain sm:block" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={openCreateModal}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            + Add Budget
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

      <section className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-100 text-blue-950 shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)] md:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Monthly Budget
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-bold tracking-tight text-blue-950">
                {formatMoney(totalLimit)}
              </p>
              <p className="pb-1 text-sm font-bold text-blue-700">
                spent {formatMoney(totalSpent)}
              </p>
            </div>
          </div>

          <div className="border-blue-200 md:border-l md:pl-8">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Active Period
              </span>
              <input
                type="month"
                className="mt-4 h-11 w-full rounded-xl border border-blue-200 bg-white/70 px-4 text-sm font-bold text-blue-950 outline-none"
                value={periodMonth}
                onChange={(event) => setPeriodMonth(event.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
          Loading budgets...
        </div>
      ) : (
        groups.map((group) => (
          <BudgetSection
            key={group}
            title={group}
            items={groupedBudgets[group] || []}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))
      )}

      {showModal && (
        <BudgetModal
          form={form}
          editingBudget={editingBudget}
          isSaving={isSaving}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Budget;
