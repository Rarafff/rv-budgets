import { useEffect, useMemo, useState } from "react";
import {
  contributeGoal,
  createGoal,
  deleteGoal,
  getGoalContributions,
  getGoals,
  updateGoal,
} from "../../api/goal";
import { getWallets } from "../../api/wallet";

const emptyGoalForm = {
  name: "",
  category: "Savings",
  targetAmount: "",
  currentAmount: "",
  linkedWalletId: "",
  deadline: "",
  icon: "target",
  isEmergency: false,
};

const emptyContributionForm = {
  walletId: "",
  amount: "",
  note: "",
  contributionDate: new Date().toISOString().slice(0, 10),
};

const iconOptions = ["target", "shield", "plane", "gift", "home", "bike", "gold"];

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const formatMoney = (amount, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "No deadline";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const GoalIcon = ({ icon = "target", emergency = false }) => {
  const paths = {
    target: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <circle cx="10.5" cy="10.5" r="3" />
        <path d="M10.5 2.5v3M10.5 15.5v3M2.5 10.5h3M15.5 10.5h3" />
      </>
    ),
    shield: (
      <>
        <path d="M10.5 3.5 16 5.6v4.2c0 3.6-2 6.3-5.5 8-3.5-1.7-5.5-4.4-5.5-8V5.6l5.5-2.1Z" />
        <path d="m8.4 10.7 1.4 1.4 3-3.3" />
      </>
    ),
    plane: <path d="M18 4.5 8.2 14.3 4 12.8l-1.5 1.5 4.6 2.4 2.4 4.6 1.5-1.5-1.5-4.2L19.5 6 18 4.5Z" />,
    gift: (
      <>
        <path d="M4.5 8h12v9h-12V8Z" />
        <path d="M3.8 8h13.4V5.8H3.8V8ZM10.5 5.8V17" />
        <path d="M10.5 5.8C9.4 3.6 7 4 7 5.4c0 1 1 1.4 3.5.4ZM10.5 5.8c1.1-2.2 3.5-1.8 3.5-.4 0 1-1 1.4-3.5.4Z" />
      </>
    ),
    home: (
      <>
        <path d="m4.2 10 6.3-5.2 6.3 5.2" />
        <path d="M6 9.5v7h9v-7" />
        <path d="M9 16.5v-4h3v4" />
      </>
    ),
    bike: (
      <>
        <circle cx="6.3" cy="14.2" r="2.2" />
        <circle cx="14.7" cy="14.2" r="2.2" />
        <path d="M8 14.2h2.4l2.3-4.2h-3L8 14.2Zm4.7-4.2 2 4.2M8.3 8.5h2.4M12.7 10l-1.4-2.5" />
      </>
    ),
    gold: (
      <>
        <path d="M7.3 3.8 10.5 9l3.2-5.2M5.7 3.8h9.6" />
        <circle cx="10.5" cy="13.5" r="4" />
        <path d="m10.5 11.2.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2.7-1.5Z" />
      </>
    ),
  };

  return (
    <span
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${
        emergency ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
      }`}
    >
      <svg
        viewBox="0 0 21 21"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths[icon] || paths.target}
      </svg>
    </span>
  );
};

const GoalFormModal = ({
  form,
  wallets,
  editingGoal,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
    role="dialog"
    aria-modal="true"
    onMouseDown={onClose}
  >
    <form
      className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          {editingGoal ? "Edit Goal" : "New Goal"}
        </h2>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          aria-label="Close goal form"
        >
          x
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Goal Name
          </span>
          <input
            className={inputClass}
            value={form.name}
            onChange={onChange("name")}
            placeholder="e.g. Emergency Fund"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Category
            </span>
            <input
              className={inputClass}
              value={form.category}
              onChange={onChange("category")}
              placeholder="Savings"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Icon
            </span>
            <select className={inputClass} value={form.icon} onChange={onChange("icon")}>
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Target
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.targetAmount}
              onChange={onChange("targetAmount")}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Current Saved
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.currentAmount}
              onChange={onChange("currentAmount")}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Linked Wallet
          </span>
          <select
            className={inputClass}
            value={form.linkedWalletId}
            onChange={onChange("linkedWalletId")}
          >
            <option value="">No linked wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Deadline
          </span>
          <input
            type="date"
            className={inputClass}
            value={form.deadline}
            onChange={onChange("deadline")}
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <input
            type="checkbox"
            className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={form.isEmergency}
            onChange={onChange("isEmergency")}
          />
          <span>
            <span className="block text-sm font-bold text-slate-900">
              Emergency Fund
            </span>
            <span className="block text-xs font-medium text-slate-400">
              Keep this goal pinned at the top.
            </span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSaving ? "Saving..." : editingGoal ? "Save Goal" : "Create Goal"}
      </button>
    </form>
  </div>
);

const GoalDetailModal = ({
  goal,
  wallets,
  contributions,
  contributionForm,
  isSaving,
  onChangeContribution,
  onClose,
  onContribute,
  onEdit,
  onDelete,
}) => {
  if (!goal) return null;

  const remaining = Math.max(
    Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Goal Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close goal detail"
          >
            x
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <GoalIcon icon={goal.icon} emergency={goal.isEmergency} />
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900">{goal.name}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {goal.category} • {formatDate(goal.deadline)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Saved
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {formatMoney(goal.currentAmount)}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-500">
              {Math.min(Number(goal.progress || 0), 100).toFixed(0)}%
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(Number(goal.progress || 0), 100)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
            <span>Remaining {formatMoney(remaining)}</span>
            <span>Target {formatMoney(goal.targetAmount)}</span>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Linked wallet: {goal.linkedWalletName || "Not linked"}
          </p>
        </div>

        <form className="mt-5 rounded-2xl border border-slate-100 p-4" onSubmit={onContribute}>
          <h4 className="text-sm font-bold text-slate-900">Add Contribution</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Wallet
              </span>
              <select
                className={inputClass}
                value={contributionForm.walletId}
                onChange={onChangeContribution("walletId")}
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({formatMoney(wallet.balance, wallet.currency)})
                  </option>
                ))}
              </select>
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
                value={contributionForm.amount}
                onChange={onChangeContribution("amount")}
                required
              />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Date
              </span>
              <input
                type="date"
                className={inputClass}
                value={contributionForm.contributionDate}
                onChange={onChangeContribution("contributionDate")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Note
              </span>
              <input
                className={inputClass}
                value={contributionForm.note}
                onChange={onChangeContribution("note")}
                placeholder="Optional"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 h-10 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Saving..." : "Add Contribution"}
          </button>
        </form>

        <div className="mt-5">
          <h4 className="text-sm font-bold text-slate-900">Recent Contributions</h4>
          <div className="mt-3 space-y-2">
            {contributions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-400">
                No contributions yet.
              </p>
            ) : (
              contributions.slice(0, 5).map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {contribution.walletName}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      {formatDate(contribution.contributionDate)}
                      {contribution.note ? ` • ${contribution.note}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">
                    {formatMoney(contribution.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="h-11 rounded-xl border border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Goal = () => {
  const [goals, setGoals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [contributionForm, setContributionForm] = useState(emptyContributionForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const totalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0),
    [goals],
  );
  const totalTarget = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0),
    [goals],
  );

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [goalsResponse, walletsResponse] = await Promise.all([
        getGoals(),
        getWallets(),
      ]);
      setGoals(goalsResponse.data || []);
      setWallets(walletsResponse.data || []);
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to load goals."));
    } finally {
      setIsLoading(false);
    }
  };

  const loadContributions = async (goalID) => {
    try {
      const response = await getGoalContributions(goalID);
      setContributions(response.data || []);
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to load contributions."));
    }
  };

  const updateGoalForm = (field) => (event) => {
    const value = field === "isEmergency" ? event.target.checked : event.target.value;
    setGoalForm((current) => ({ ...current, [field]: value }));
  };

  const updateContributionForm = (field) => (event) => {
    setContributionForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setGoalForm(emptyGoalForm);
    setShowGoalForm(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      name: goal.name || "",
      category: goal.category || "Savings",
      targetAmount: String(goal.targetAmount ?? ""),
      currentAmount: String(goal.currentAmount ?? ""),
      linkedWalletId: goal.linkedWalletId || "",
      deadline: goal.deadline || "",
      icon: goal.icon || "target",
      isEmergency: Boolean(goal.isEmergency),
    });
    setShowGoalForm(true);
  };

  const closeGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setGoalForm(emptyGoalForm);
  };

  const goalPayload = () => ({
    name: goalForm.name,
    category: goalForm.category,
    targetAmount: Number(goalForm.targetAmount || 0),
    currentAmount: Number(goalForm.currentAmount || 0),
    linkedWalletId: goalForm.linkedWalletId || null,
    deadline: goalForm.deadline || null,
    icon: goalForm.icon,
    isEmergency: goalForm.isEmergency,
  });

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = editingGoal
        ? await updateGoal(editingGoal.id, goalPayload())
        : await createGoal(goalPayload());

      setGoals((current) =>
        editingGoal
          ? current.map((goal) => (goal.id === editingGoal.id ? response.data : goal))
          : [...current, response.data],
      );
      if (selectedGoal?.id === response.data.id) {
        setSelectedGoal(response.data);
      }
      setMessage(editingGoal ? "Goal updated." : "Goal created.");
      closeGoalForm();
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to save goal."));
    } finally {
      setIsSaving(false);
    }
  };

  const openGoalDetail = async (goal) => {
    setSelectedGoal(goal);
    setContributionForm({
      ...emptyContributionForm,
      walletId: goal.linkedWalletId || "",
    });
    setContributions([]);
    await loadContributions(goal.id);
  };

  const handleContribute = async (event) => {
    event.preventDefault();
    if (!selectedGoal) return;

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await contributeGoal(selectedGoal.id, {
        walletId: contributionForm.walletId,
        amount: Number(contributionForm.amount || 0),
        note: contributionForm.note,
        contributionDate: contributionForm.contributionDate,
      });

      const [goalsResponse, walletsResponse] = await Promise.all([
        getGoals(),
        getWallets(),
        loadContributions(selectedGoal.id),
      ]);
      setGoals(goalsResponse.data || []);
      setWallets(walletsResponse.data || []);
      const updatedGoal = (goalsResponse.data || []).find(
        (goal) => goal.id === selectedGoal.id,
      );
      if (updatedGoal) {
        setSelectedGoal(updatedGoal);
      }
      setContributionForm({
        ...emptyContributionForm,
        walletId: contributionForm.walletId,
      });
      setMessage("Contribution added.");
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to add contribution."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (goal) => {
    const confirmed = window.confirm(`Delete ${goal.name}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteGoal(goal.id);
      setGoals((current) => current.filter((currentGoal) => currentGoal.id !== goal.id));
      setSelectedGoal(null);
      setContributions([]);
      setMessage("Goal deleted.");
    } catch (requestError) {
      setError(getRequestMessage(requestError, "Failed to delete goal."));
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Goals
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Track savings targets outside your monthly spending budget.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
        >
          + New Goal
        </button>
      </header>

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

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-blue-600 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
            Total Saved
          </p>
          <p className="mt-2 text-3xl font-black">{formatMoney(totalSaved)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Total Target
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatMoney(totalTarget)}
          </p>
        </div>
      </section>

      <section className="mt-7 space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
            No goals yet. Add your first savings target.
          </div>
        ) : (
          goals.map((goal) => (
            <article
              key={goal.id}
              role="button"
              tabIndex={0}
              onClick={() => openGoalDetail(goal)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openGoalDetail(goal);
                }
              }}
              className={`rounded-2xl border bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                goal.isEmergency
                  ? "border-rose-100 shadow-rose-50"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <GoalIcon icon={goal.icon} emergency={goal.isEmergency} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-bold text-slate-900">
                      {goal.name}
                    </h2>
                    {goal.isEmergency && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        Emergency
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Due {formatDate(goal.deadline)} •{" "}
                    {goal.linkedWalletName || "No wallet linked"}
                  </p>
                </div>

                <div className="w-40 shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatMoney(goal.currentAmount)}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <span className="w-8 text-right text-[10px] font-bold text-slate-400">
                      {Math.min(Number(goal.progress || 0), 100).toFixed(0)}%
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(Number(goal.progress || 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {showGoalForm && (
        <GoalFormModal
          form={goalForm}
          wallets={wallets}
          editingGoal={editingGoal}
          isSaving={isSaving}
          onChange={updateGoalForm}
          onClose={closeGoalForm}
          onSubmit={handleGoalSubmit}
        />
      )}

      <GoalDetailModal
        goal={selectedGoal}
        wallets={wallets}
        contributions={contributions}
        contributionForm={contributionForm}
        isSaving={isSaving}
        onChangeContribution={updateContributionForm}
        onClose={() => setSelectedGoal(null)}
        onContribute={handleContribute}
        onEdit={() => openEditModal(selectedGoal)}
        onDelete={() => handleDelete(selectedGoal)}
      />
    </div>
  );
};

const getRequestMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

export default Goal;
