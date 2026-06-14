import { useEffect, useMemo, useState } from "react";
import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
} from "../../api/asset";
import { getWallets } from "../../api/wallet";

const assetTypes = ["Liquid Asset", "Fixed Asset"];

const assetCategories = {
  "Liquid Asset": ["Gold", "Stock", "Crypto", "Mutual Fund", "Deposit", "Other"],
  "Fixed Asset": [
    "House",
    "Land",
    "Apartment",
    "Vehicle",
    "Electronics",
    "Gear",
    "Other",
  ],
};

const emptyForm = {
  assetType: "Liquid Asset",
  category: "Gold",
  name: "",
  quantity: "1",
  unit: "",
  purchasePrice: "",
  currentPrice: "",
  currentValue: "",
  note: "",
  acquiredAt: "",
};

const toneClass = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
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

const assetTone = (asset) => {
  if (asset.category === "Gold") return "amber";
  if (asset.category === "Crypto") return "violet";
  if (asset.assetType === "Liquid Asset") return "blue";
  return "emerald";
};

const AssetIcon = ({ tone = "blue", label = "A" }) => (
  <span
    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${toneClass[tone]}`}
  >
    {label.slice(0, 1).toUpperCase()}
  </span>
);

const AssetModal = ({
  form,
  editingAsset,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}) => {
  const categories = assetCategories[form.assetType] || [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <form
        className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editingAsset ? "Edit Asset" : "Add Asset"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close asset modal"
          >
            x
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Asset Type
              </span>
              <select
                className={inputClass}
                value={form.assetType}
                onChange={onChange("assetType")}
              >
                {assetTypes.map((assetType) => (
                  <option key={assetType} value={assetType}>
                    {assetType}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </span>
              <select
                className={inputClass}
                value={form.category}
                onChange={onChange("category")}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Asset Name
            </span>
            <input
              className={inputClass}
              placeholder={form.assetType === "Liquid Asset" ? "e.g. Gold 5gr" : "e.g. MacBook Pro"}
              value={form.name}
              onChange={onChange("name")}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Quantity
              </span>
              <input
                type="number"
                min="0"
                step="0.000001"
                className={inputClass}
                value={form.quantity}
                onChange={onChange("quantity")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Unit
              </span>
              <input
                className={inputClass}
                placeholder="gr, lot, BTC"
                value={form.unit}
                onChange={onChange("unit")}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Buy Price / Unit
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.purchasePrice}
                onChange={onChange("purchasePrice")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current Price / Unit
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.currentPrice}
                onChange={onChange("currentPrice")}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Current Value
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.currentValue}
              onChange={onChange("currentValue")}
              placeholder="Auto-calculated if current price is filled"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Acquired Date
              </span>
              <input
                type="date"
                className={inputClass}
                value={form.acquiredAt}
                onChange={onChange("acquiredAt")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Note
              </span>
              <input
                className={inputClass}
                value={form.note}
                onChange={onChange("note")}
                placeholder="Optional"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? "Saving..." : editingAsset ? "Save Asset" : "Add Asset"}
        </button>
      </form>
    </div>
  );
};

const AssetCard = ({ asset, onEdit, onDelete }) => (
  <article className="rounded-xl bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <AssetIcon tone={assetTone(asset)} label={asset.name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{asset.name}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {asset.category}
        </p>
      </div>
      <p className="ml-auto whitespace-nowrap text-sm font-bold text-slate-900">
        {formatMoney(asset.currentValue)}
      </p>
    </div>
    <div className="mt-3 flex justify-between gap-4 text-xs font-semibold text-slate-500">
      <span>
        {Number(asset.quantity || 0).toLocaleString("id-ID")} {asset.unit}
      </span>
      <span className="text-right">
        {formatMoney(asset.currentPrice)} / {asset.unit || "unit"}
      </span>
    </div>
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
      <span
        className={`text-xs font-bold ${
          Number(asset.gainLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {Number(asset.gainLoss || 0) >= 0 ? "+" : ""}
        {formatMoney(asset.gainLoss)} ({Number(asset.gainLossPct || 0).toFixed(1)}%)
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onEdit(asset)}
          className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white hover:text-slate-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(asset)}
          className="rounded-lg px-2 py-1 text-xs font-bold text-rose-400 hover:bg-rose-50 hover:text-rose-600"
        >
          Delete
        </button>
      </div>
    </div>
  </article>
);

const Asset = () => {
  const [wallets, setWallets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const liquidAssets = useMemo(
    () => assets.filter((asset) => asset.assetType === "Liquid Asset"),
    [assets],
  );
  const fixedAssets = useMemo(
    () => assets.filter((asset) => asset.assetType === "Fixed Asset"),
    [assets],
  );
  const cashTotal = useMemo(
    () =>
      wallets
        .filter((wallet) => !isLiability(wallet.type))
        .reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
    [wallets],
  );
  const debtTotal = useMemo(
    () =>
      wallets
        .filter((wallet) => isLiability(wallet.type))
        .reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
    [wallets],
  );
  const liquidTotal = useMemo(
    () => liquidAssets.reduce((sum, asset) => sum + Number(asset.currentValue || 0), 0),
    [liquidAssets],
  );
  const fixedTotal = useMemo(
    () => fixedAssets.reduce((sum, asset) => sum + Number(asset.currentValue || 0), 0),
    [fixedAssets],
  );
  const estimatedWealth = cashTotal + liquidTotal + fixedTotal - debtTotal;

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [walletResponse, assetResponse] = await Promise.all([
        getWallets(),
        getAssets(),
      ]);
      setWallets(walletResponse.data || []);
      setAssets(assetResponse.data || []);
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to load assets."));
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => {
      if (field === "assetType") {
        return {
          ...current,
          assetType: value,
          category: assetCategories[value]?.[0] || "",
        };
      }
      return { ...current, [field]: value };
    });
  };

  const openCreateModal = () => {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setForm({
      assetType: asset.assetType || "Liquid Asset",
      category: asset.category || "Other",
      name: asset.name || "",
      quantity: String(asset.quantity || "1"),
      unit: asset.unit || "",
      purchasePrice: String(asset.purchasePrice || ""),
      currentPrice: String(asset.currentPrice || ""),
      currentValue: String(asset.currentValue || ""),
      note: asset.note || "",
      acquiredAt: asset.acquiredAt || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    setForm(emptyForm);
  };

  const payload = () => ({
    assetType: form.assetType,
    category: form.category,
    name: form.name,
    quantity: Number(form.quantity || 1),
    unit: form.unit,
    purchasePrice: Number(form.purchasePrice || 0),
    currentPrice: Number(form.currentPrice || 0),
    currentValue: Number(form.currentValue || 0),
    note: form.note,
    acquiredAt: form.acquiredAt || null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = editingAsset
        ? await updateAsset(editingAsset.id, payload())
        : await createAsset(payload());

      setAssets((current) =>
        editingAsset
          ? current.map((asset) =>
              asset.id === editingAsset.id ? response.data : asset,
            )
          : [...current, response.data],
      );
      setMessage(editingAsset ? "Asset updated." : "Asset added.");
      closeModal();
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to save asset."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (asset) => {
    const confirmed = window.confirm(`Delete ${asset.name}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteAsset(asset.id);
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setMessage("Asset deleted.");
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to delete asset."));
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Assets
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Track your wealth across cash, assets, and investments.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
        >
          + Add Asset
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

      <section className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-100 p-7 text-blue-950 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-700">
              Estimated Wealth
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              {formatMoney(estimatedWealth)}
            </h2>
            <p className="mt-3 text-sm font-bold text-blue-700">
              Cash + assets - liabilities
            </p>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SummaryTile label="Cash" value={cashTotal} />
            <SummaryTile label="Liquid Assets" value={liquidTotal} />
            <SummaryTile label="Fixed Assets" value={fixedTotal} />
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
          Loading assets...
        </div>
      ) : (
        <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[1fr_0.95fr]">
          <section className="flex min-h-[560px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Wallets & Accounts</h2>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {wallets.length === 0 ? (
                <EmptyState text="No wallets yet." />
              ) : (
                wallets.map((wallet) => (
                  <article
                    key={wallet.id}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <AssetIcon
                      tone={isLiability(wallet.type) ? "rose" : wallet.type === "E-Wallet" ? "emerald" : "blue"}
                      label={wallet.name}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{wallet.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {wallet.type}
                      </p>
                    </div>
                    <p
                      className={`ml-auto whitespace-nowrap text-sm font-bold ${
                        isLiability(wallet.type) ? "text-rose-500" : "text-slate-900"
                      }`}
                    >
                      {isLiability(wallet.type) ? "-" : ""}
                      {formatMoney(wallet.balance, wallet.currency)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <div className="flex min-h-[560px] flex-col gap-6">
            <AssetList
              title="Liquid Assets"
              assets={liquidAssets}
              emptyText="No liquid assets yet."
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
            <AssetList
              title="Fixed Assets"
              assets={fixedAssets}
              emptyText="No fixed assets yet."
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {showModal && (
        <AssetModal
          form={form}
          editingAsset={editingAsset}
          isSaving={isSaving}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const SummaryTile = ({ label, value }) => (
  <div className="rounded-2xl bg-white/70 p-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
      {label}
    </p>
    <p className="mt-1 font-bold">{formatMoney(value)}</p>
  </div>
);

const AssetList = ({ title, assets, emptyText, onEdit, onDelete }) => (
  <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
      {assets.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  </section>
);

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
    {text}
  </div>
);

const getRequestMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

export default Asset;
