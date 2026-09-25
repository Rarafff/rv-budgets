import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createBill, deleteBill, payBill, updateBill } from "../../api/bill";
import { getWallets } from "../../api/wallet";
import { useTranslation } from "../../i18n/use-translation";
import { confirmDelete } from "../../lib/alerts";

const billIcons = {
  card: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h2" />
      <path d="M10 15h4" />
    </svg>
  ),
};

const today = () => new Date().toISOString().slice(0, 10);
const formatMoney = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date, language) =>
  new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));

const emptyForm = {
  name: "",
  provider: "",
  amount: "",
  dueDate: today(),
  walletId: "",
  category: "",
  note: "",
  isRecurring: false,
  repeatInterval: "",
  autoPay: false,
};

const IncomingBill = ({ summary, isLoading, onChanged }) => {
  const { language, t } = useTranslation();
  const incomingBills = summary?.incomingBills || [];
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoadingChoices, setIsLoadingChoices] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const hasWallets = wallets.length > 0;
  const isMissingSetup = !hasWallets;

  useEffect(() => {
    if (!showModal) return;

    const loadChoices = async () => {
      setIsLoadingChoices(true);
      try {
        const walletResponse = await getWallets();
        const walletItems = walletResponse.data || [];

        setWallets(walletItems);
        setForm((current) => ({
          ...current,
          walletId: current.walletId || walletItems[0]?.id || "",
        }));
      } catch (requestError) {
        setError(
          requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load bill choices.",
        );
      } finally {
        setIsLoadingChoices(false);
      }
    };

    loadChoices();
  }, [showModal]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateModal = () => {
    setError("");
    setEditingBill(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (bill) => {
    setError("");
    setEditingBill(bill);
    setForm({
      name: bill.name || "",
      provider: bill.provider || "",
      amount: String(bill.amount || ""),
      dueDate: bill.dueDate || today(),
      walletId: bill.walletId || "",
      category: bill.category || "",
      note: bill.note || "",
      isRecurring: Boolean(bill.isRecurring),
      repeatInterval: bill.repeatInterval || "",
      autoPay: Boolean(bill.autoPay),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBill(null);
    setForm(emptyForm);
  };

  const submitBill = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        repeatInterval: form.isRecurring ? "monthly" : "",
        autoPay: form.isRecurring && form.autoPay,
        status: "upcoming",
      };

      if (editingBill) {
        await updateBill(editingBill.id, payload);
      } else {
        await createBill(payload);
      }
      closeModal();
      await onChanged?.();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          editingBill ? "Failed to update bill." : "Failed to add bill.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (bill) => {
    const confirmed = await confirmDelete(bill.name);
    if (!confirmed) return;

    setIsSaving(true);
    setError("");
    try {
      await deleteBill(bill.id);
      await onChanged?.();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete bill.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePay = async (bill) => {
    if (!bill.walletId) {
      setError("Bill needs a wallet before it can be paid.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await payBill(bill.id, {
        walletId: bill.walletId,
        paymentDate: today(),
      });
      await onChanged?.();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to pay bill.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="incoming-bill-container flex h-48 flex-col rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          {billIcons.card}
        </span>
        <h2 className="text-base font-bold text-slate-900">
          {t("dashboard.incomingBills")}
        </h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
        >
          {t("dashboard.add")}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
          {error}
        </p>
      )}

      <div className="bills-container mt-4 min-h-0 w-full flex-1 divide-y divide-slate-100 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="py-6 text-center text-sm font-semibold text-slate-500">
            {t("dashboard.loadingBills")}
          </p>
        ) : incomingBills.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-slate-500">
            {t("dashboard.noIncomingBills")}
          </p>
        ) : (
          incomingBills.map((bill) => (
            <div key={bill.id} className="bill-item flex w-full items-center gap-3 py-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {billIcons.card}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{bill.name}</p>
                  {bill.status === "overdue" && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600">
                      {t("dashboard.overdue")}
                    </span>
                  )}
                  {bill.status === "skipped" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      Dilewati · saldo kurang
                    </span>
                  )}
                  {bill.isRecurring && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                      {t("dashboard.monthly")}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {(bill.provider || bill.category) || t("dashboard.bill")} -{" "}
                  {t("dashboard.dueBy", {
                    date: formatDate(bill.dueDate, language),
                  })}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                  {formatMoney(bill.amount)}
                </p>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handlePay(bill)}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("dashboard.pay")}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => openEditModal(bill)}
                  className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleDelete(bill)}
                  className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6 sm:items-center">
          <form
            onSubmit={submitBill}
            className="max-h-[calc(100svh-3rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBill ? t("dashboard.editBill") : t("dashboard.addBill")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                {t("dashboard.close")}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-600">
                {t("common.name")}
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  placeholder="Electricity"
                />
              </label>
              <label className="text-sm font-bold text-slate-600">
                {t("dashboard.provider")}
                <input
                  value={form.provider}
                  onChange={(event) => updateForm("provider", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  placeholder="PLN"
                />
              </label>
              <label className="text-sm font-bold text-slate-600">
                {t("common.amount")}
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(event) => updateForm("amount", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  placeholder="420000"
                />
              </label>
              <label className="text-sm font-bold text-slate-600">
                {t("common.dueDate")}
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateForm("dueDate", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="text-sm font-bold text-slate-600">
                {t("common.wallet")}
                <select
                  value={form.walletId}
                  onChange={(event) => updateForm("walletId", event.target.value)}
                  required
                  disabled={!hasWallets}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                >
                  <option value="">{t("common.selectWallet")}</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-slate-600">
                {t("dashboard.budgetCategory")}
                <input
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  placeholder="Electricity, Internet, Rent"
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-bold text-slate-600">
              {t("common.note")}
              <textarea
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                placeholder={t("common.optional")}
              />
            </label>

            <label className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(event) => updateForm("isRecurring", event.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {t("dashboard.repeatMonthly")}
            </label>

            {form.isRecurring && (
              <label className="mt-3 flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-3 text-sm font-bold text-amber-900">
                <input
                  type="checkbox"
                  checked={form.autoPay}
                  onChange={(event) => updateForm("autoPay", event.target.checked)}
                  className="mt-0.5 size-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                />
                <span>
                  Bayar otomatis pada tanggal jatuh tempo
                  <small className="mt-0.5 block font-medium text-amber-700">Jika saldo tidak cukup, tagihan dilewati dan Anda akan diberi notifikasi.</small>
                </span>
              </label>
            )}

            {!isLoadingChoices && isMissingSetup && (
              <div className="mt-3 space-y-2">
                {!hasWallets && (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    <span>Create a wallet before adding a bill.</span>
                    <Link to="/wallet" className="shrink-0 text-blue-700 hover:underline">
                      Go to Wallet
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || isLoadingChoices || isMissingSetup}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : isLoadingChoices
                  ? t("dashboard.loadingSetup")
                  : editingBill
                    ? t("common.saveChanges")
                    : t("dashboard.saveBill")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IncomingBill;
