import React, { useEffect, useMemo, useState } from "react";
import {
  createWallet,
  deleteWallet,
  getWallets,
  updateWallet,
} from "../../api/wallet";

const walletTypes = ["Bank", "E-Wallet", "Cash", "Credit Card", "Paylater"];

const emptyForm = {
  name: "",
  type: "Bank",
  currency: "IDR",
  balance: "",
  accountNumber: "",
  creditLimit: "",
  dueDay: "",
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(amount || 0));

const isLiability = (type) => ["Credit Card", "Paylater"].includes(type);

const AccountIcon = ({ tone = "blue" }) => {
  const toneClass = {
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  }[tone];

  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
    >
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
        <rect width="18" height="12" x="3" y="6" rx="2" />
        <path d="M7 10h4" />
        <path d="M17 14h.01" />
      </svg>
    </span>
  );
};

const WalletCard = ({ wallet, isOpen, onToggle, onEdit, onDelete }) => {
  const liability = isLiability(wallet.type);
  const amount = formatMoney(wallet.balance, wallet.currency);

  return (
    <article
      className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition ${
        isOpen ? "md:row-span-2" : ""
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <AccountIcon
          tone={liability ? "rose" : wallet.type === "E-Wallet" ? "emerald" : "blue"}
        />
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{wallet.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {wallet.type}
          </p>
        </div>
        <p
          className={`ml-auto whitespace-nowrap text-sm font-bold ${
            liability ? "text-rose-500" : "text-slate-900"
          }`}
        >
          {liability ? `-${amount}` : amount}
        </p>
        <span
          className={`ml-2 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ^
        </span>
      </button>

      {isOpen && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            <p className="font-bold">Tracked wallet</p>
            <p className="mt-1 text-blue-500">
              This wallet is saved to your account.
            </p>
          </div>

          {wallet.accountNumber && (
            <div>
              <p className="font-bold uppercase tracking-wide text-slate-400">
                Account Number
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {wallet.accountNumber}
              </p>
            </div>
          )}

          {liability && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">
                  Limit
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {formatMoney(wallet.creditLimit, wallet.currency)}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">
                  Due Date
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {wallet.dueDay ? `Day ${wallet.dueDay}` : "Not set"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              className="h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="h-10 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

const AddWalletModal = ({
  form,
  isSaving,
  editingWallet,
  onChange,
  onClose,
  onSubmit,
}) => {
  const liability = isLiability(form.type);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-wallet-title"
      onMouseDown={onClose}
    >
      <form
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="add-wallet-title" className="text-lg font-bold text-slate-900">
            {editingWallet ? "Edit Wallet" : "Add Wallet"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close add wallet modal"
          >
            x
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Type
            </span>
            <select
              className={inputClass}
              value={form.type}
              onChange={onChange("type")}
            >
              {walletTypes.map((walletType) => (
                <option key={walletType} value={walletType}>
                  {walletType}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Name
            </span>
            <input
              className={inputClass}
              placeholder="e.g. BCA Main"
              value={form.name}
              onChange={onChange("name")}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Currency
              </span>
              <select
                className={inputClass}
                value={form.currency}
                onChange={onChange("currency")}
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {liability ? "Outstanding Balance" : "Current Balance"}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                placeholder="0"
                value={form.balance}
                onChange={onChange("balance")}
              />
            </label>
          </div>

          {["Bank", "Credit Card"].includes(form.type) && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Account Number
              </span>
              <input
                className={inputClass}
                placeholder="Optional"
                value={form.accountNumber}
                onChange={onChange("accountNumber")}
              />
            </label>
          )}

          {liability && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Limit
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0"
                  value={form.creditLimit}
                  onChange={onChange("creditLimit")}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Due Date
                </span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className={inputClass}
                  placeholder="10"
                  value={form.dueDay}
                  onChange={onChange("dueDay")}
                />
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? "Saving..." : editingWallet ? "Save Wallet" : "Add Wallet"}
        </button>
      </form>
    </div>
  );
};

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [openWallets, setOpenWallets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const cashWallets = useMemo(
    () => wallets.filter((wallet) => !isLiability(wallet.type)),
    [wallets],
  );
  const liabilityWallets = useMemo(
    () => wallets.filter((wallet) => isLiability(wallet.type)),
    [wallets],
  );
  const cashTotal = useMemo(
    () => cashWallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
    [cashWallets],
  );
  const liabilityTotal = useMemo(
    () =>
      liabilityWallets.reduce(
        (sum, wallet) => sum + Number(wallet.balance || 0),
        0,
      ),
    [liabilityWallets],
  );

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getWallets();
      setWallets(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load wallets.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWallet = (id) => {
    setOpenWallets((current) =>
      current.includes(id)
        ? current.filter((walletID) => walletID !== id)
        : [...current, id],
    );
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const openCreateModal = () => {
    setEditingWallet(null);
    setForm(emptyForm);
    setShowAddModal(true);
  };

  const openEditModal = (wallet) => {
    setEditingWallet(wallet);
    setForm({
      name: wallet.name || "",
      type: wallet.type || "Bank",
      currency: wallet.currency || "IDR",
      balance: String(wallet.balance ?? ""),
      accountNumber: wallet.accountNumber || "",
      creditLimit: String(wallet.creditLimit ?? ""),
      dueDay: wallet.dueDay ? String(wallet.dueDay) : "",
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingWallet(null);
    setForm(emptyForm);
  };

  const walletPayload = () => ({
    name: form.name,
    type: form.type,
    currency: form.currency,
    balance: Number(form.balance || 0),
    accountNumber: form.accountNumber,
    creditLimit: Number(form.creditLimit || 0),
    dueDay: form.dueDay ? Number(form.dueDay) : null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const payload = walletPayload();
      const response = editingWallet
        ? await updateWallet(editingWallet.id, payload)
        : await createWallet(payload);

      setWallets((current) =>
        editingWallet
          ? current.map((wallet) =>
              wallet.id === editingWallet.id ? response.data : wallet,
            )
          : [...current, response.data],
      );
      setOpenWallets((current) =>
        current.includes(response.data.id) ? current : [...current, response.data.id],
      );
      setMessage(editingWallet ? "Wallet updated." : "Wallet added.");
      closeModal();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save wallet.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (wallet) => {
    const confirmed = window.confirm(`Delete ${wallet.name}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteWallet(wallet.id);
      setWallets((current) =>
        current.filter((currentWallet) => currentWallet.id !== wallet.id),
      );
      setOpenWallets((current) =>
        current.filter((walletID) => walletID !== wallet.id),
      );
      setMessage("Wallet deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete wallet.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize every money source you own or owe.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Add New
        </button>
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

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Cash & Savings
          </h2>
          <p className="text-xs font-bold text-emerald-500">
            {formatMoney(cashTotal)}
          </p>
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
            Loading wallets...
          </div>
        ) : cashWallets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
            No cash or savings wallets yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cashWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                isOpen={openWallets.includes(wallet.id)}
                onToggle={() => toggleWallet(wallet.id)}
                onEdit={() => openEditModal(wallet)}
                onDelete={() => handleDelete(wallet)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Credit & Installments
          </h2>
          <p className="text-xs font-bold text-rose-500">
            -{formatMoney(liabilityTotal)}
          </p>
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
            Loading liabilities...
          </div>
        ) : liabilityWallets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
            No credit or installment wallets yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {liabilityWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                isOpen={openWallets.includes(wallet.id)}
                onToggle={() => toggleWallet(wallet.id)}
                onEdit={() => openEditModal(wallet)}
                onDelete={() => handleDelete(wallet)}
              />
            ))}
          </div>
        )}
      </section>

      {showAddModal && (
        <AddWalletModal
          form={form}
          isSaving={isSaving}
          editingWallet={editingWallet}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Wallet;
