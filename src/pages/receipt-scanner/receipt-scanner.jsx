import React, { useEffect, useMemo, useState } from "react";
import { createTransaction } from "../../api/transaction";
import { getWallets } from "../../api/wallet";
import { parseReceipt } from "../../api/receipt";
import bearReceiptScan from "../../assets/bears/bear-receipt-scan.png";
import CategoryPicker from "../../components/category-picker";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(amount || 0));

const today = () => new Date().toISOString().slice(0, 10);

const ReceiptScanner = () => {
  const [wallets, setWallets] = useState([]);
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
        const walletResponse = await getWallets();
        const loadedWallets = walletResponse.data || [];
        setWallets(loadedWallets);
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
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
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
        category: suggested.category || result.category || current.category,
      }));
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
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Scan Receipt</h1>
            <p className="mt-1 text-sm text-slate-500">Upload a receipt, review the AI suggestion, then save it.</p>
          </div>
          <img src={bearReceiptScan} alt="" className="hidden size-16 object-contain sm:block" />
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
            <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Receipt preview"
                  className="max-h-72 rounded-xl object-contain"
                />
              ) : (
                <>
                  <img src={bearReceiptScan} alt="" className="w-28 object-contain" />
                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Choose a receipt image.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                id="receipt-camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
              />
              <label
                htmlFor="receipt-camera-input"
                className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
              >
                Take Photo
              </label>

              <input
                id="receipt-upload-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
              <label
                htmlFor="receipt-upload-input"
                className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Upload Image
              </label>
            </div>

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
                <CategoryPicker
                  className={inputClass}
                  value={form.category}
                  onChange={updateField("category")}
                  type="expense"
                  placeholder="Pilih kategori..."
                />
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
