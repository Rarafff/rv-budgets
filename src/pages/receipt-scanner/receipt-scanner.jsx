import React, { useEffect, useMemo, useState } from "react";
import { createTransaction } from "../../api/transaction";
import { getWallets } from "../../api/wallet";
import { parseReceipt } from "../../api/receipt";
import { getBudgets } from "../../api/budget";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(amount || 0));

const today = () => new Date().toISOString().slice(0, 10);

const formatMonth = (periodMonth) => {
  const [year, month] = periodMonth.split("-");
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
};

const ReceiptScanner = () => {
  const [wallets, setWallets] = useState([]);
  const [budgetCategoriesByMonth, setBudgetCategoriesByMonth] = useState({});
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [form, setForm] = useState({
    walletId: "",
    title: "",
    category: "",
    note: "",
    amount: "",
    transactionDate: today(),
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [walletResponse, budgetResponse] = await Promise.all([
          getWallets(),
          getBudgets(today().slice(0, 7)),
        ]);
        const loadedWallets = walletResponse.data || [];
        setWallets(loadedWallets);
        setBudgetCategoriesByMonth({
          [today().slice(0, 7)]: [
            ...new Set((budgetResponse.data || []).map((budget) => budget.category)),
          ],
        });
        setForm((current) => ({
          ...current,
          walletId: current.walletId || loadedWallets[0]?.id || "",
        }));
      } catch (requestError) {
        setError(
          requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load wallets.",
        );
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewURL("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const allItems = useMemo(() => parseResult?.items || [], [parseResult]);
  const allSelected = allItems.length > 0 && selectedItems.length === allItems.length;
  const selectedTotal = useMemo(
    () =>
      allItems
        .filter((item) => selectedItems.includes(item.name))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [allItems, selectedItems],
  );

  const updateField = (field) => (event) => {
    if (field === "transactionDate") {
      loadBudgetCategories(event.target.value.slice(0, 7));
    }
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const useCurrentMonthDate = () => {
    const value = today();
    loadBudgetCategories(value.slice(0, 7));
    setForm((current) => ({
      ...current,
      transactionDate: value,
      category: "",
    }));
  };

  const loadBudgetCategories = async (periodMonth) => {
    if (!periodMonth || budgetCategoriesByMonth[periodMonth]) return;

    const response = await getBudgets(periodMonth);
    setBudgetCategoriesByMonth((current) => ({
      ...current,
      [periodMonth]: [
        ...new Set((response.data || []).map((budget) => budget.category)),
      ],
    }));
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile || null);
    setParseResult(null);
    setSelectedItems([]);
    setMessage("");
    setError("");
  };

  const handleParse = async () => {
    if (!file) {
      setError("Choose a receipt image first.");
      return;
    }

    setError("");
    setMessage("");
    setIsParsing(true);

    try {
      const response = await parseReceipt(file);
      const result = response.data;
      const suggested = result.suggestedTransaction || {};
      setParseResult(result);
      setSelectedItems((result.items || []).map((item) => item.name));
      setForm((current) => ({
        ...current,
        title: suggested.title || result.merchant || "",
        note: suggested.note || `Receipt scan${result.merchant ? `: ${result.merchant}` : ""}`,
        amount: String(suggested.amount || result.total || ""),
        transactionDate: suggested.transactionDate || result.date || today(),
      }));
      loadBudgetCategories((suggested.transactionDate || result.date || today()).slice(0, 7));
      setMessage("Receipt parsed. Review before saving.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to parse receipt.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const toggleItem = (name) => {
    setSelectedItems((current) =>
      current.includes(name)
        ? current.filter((itemName) => itemName !== name)
        : [...current, name],
    );
  };

  const toggleAll = () => {
    setSelectedItems(allSelected ? [] : allItems.map((item) => item.name));
  };

  const applySelectedTotal = () => {
    setForm((current) => ({
      ...current,
      amount: String(selectedTotal),
    }));
  };

  const activeBudgetCategories =
    budgetCategoriesByMonth[form.transactionDate.slice(0, 7)] || [];
  const activePeriodMonth = form.transactionDate.slice(0, 7);

  const handleSave = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await createTransaction({
        walletId: form.walletId,
        toWalletId: null,
        type: "expense",
        title: form.title,
        category: form.category,
        note: form.note,
        amount: Number(form.amount || 0),
        transactionDate: form.transactionDate,
      });

      setMessage("Transaction created from receipt.");
      setParseResult(null);
      setSelectedItems([]);
      setFile(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to create transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 md:px-8 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Scan Receipt
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload a receipt, review the AI suggestion, then save it.
          </p>
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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div>
            <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Receipt preview"
                  className="max-h-72 rounded-xl object-contain"
                />
              ) : (
                <>
                  <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                    <svg
                      className="size-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Choose a receipt image.
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            <button
              type="button"
              disabled={isParsing || !file}
              onClick={handleParse}
              className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isParsing ? "Parsing..." : "Parse Receipt"}
            </button>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Wallet
                </span>
                <select
                  className={inputClass}
                  value={form.walletId}
                  onChange={updateField("walletId")}
                >
                  <option value="">Select wallet...</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Date
                </span>
                <input
                  type="date"
                  className={inputClass}
                  value={form.transactionDate}
                  onChange={updateField("transactionDate")}
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Title
                </span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={updateField("title")}
                  placeholder="Merchant"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                </span>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={updateField("category")}
                >
                  <option value="">Select budget category...</option>
                  {activeBudgetCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {activeBudgetCategories.length === 0 && (
                  <div className="mt-2 rounded-xl bg-rose-50 p-3">
                    <p className="text-xs font-semibold text-rose-600">
                      No budget categories found for {formatMonth(activePeriodMonth)}.
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-800"
                      onClick={useCurrentMonthDate}
                    >
                      Use current month date instead
                    </button>
                  </div>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Amount
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.amount}
                  onChange={updateField("amount")}
                  placeholder="0"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Confidence
                </span>
                <div className="mt-2 flex h-11 items-center rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-600">
                  {parseResult?.confidence || "Not parsed"}
                </div>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Note
              </span>
              <input
                className={inputClass}
                value={form.note}
                onChange={updateField("note")}
                placeholder="Optional note"
              />
            </label>

            {parseResult && (
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                  <span>
                    {parseResult.merchant || "Receipt"} -{" "}
                    {parseResult.date || "Unknown date"}
                  </span>
                  <span className="text-slate-900">
                    {formatMoney(parseResult.total)}
                  </span>
                </div>

                {allItems.length > 0 && (
                  <label className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="size-4 rounded border-slate-300"
                    />
                    Select All Items
                    <button
                      type="button"
                      className="ml-auto text-xs font-bold text-blue-700"
                      onClick={applySelectedTotal}
                    >
                      Use selected total: {formatMoney(selectedTotal)}
                    </button>
                  </label>
                )}

                <div className="max-h-[22rem] overflow-y-auto">
                  {allItems.map((item) => (
                    <label
                      key={item.name}
                      className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.name)}
                        onChange={() => toggleItem(item.name)}
                        className="size-4 rounded border-slate-300"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {item.category}
                        </p>
                      </div>
                      <p className="ml-auto whitespace-nowrap text-sm font-bold text-slate-900">
                        {formatMoney(item.amount)}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isSaving || !parseResult}
              onClick={handleSave}
              className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Creating..." : "Create Transaction"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReceiptScanner;
