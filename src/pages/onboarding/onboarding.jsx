import { useState } from "react";
import bearPhoneGreeting from "../../assets/bears/bear-phone-greeting.png";
import { Link, useNavigate } from "react-router-dom";
import { createBudget } from "../../api/budget";
import { createTransaction } from "../../api/transaction";
import { createWallet } from "../../api/wallet";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const currentMonth = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);

const starterBudgets = [
  { groupName: "Needs", category: "Food", limitAmount: "1500000", icon: "F" },
  { groupName: "Needs", category: "Transport", limitAmount: "500000", icon: "T" },
  { groupName: "Needs", category: "Bills", limitAmount: "500000", icon: "B" },
  { groupName: "Wants", category: "Hangout", limitAmount: "500000", icon: "H" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({
    name: "Main Wallet",
    type: "Bank",
    currency: "IDR",
    balance: "",
    accountNumber: "",
    creditLimit: "",
    dueDay: "",
  });
  const [budgets, setBudgets] = useState(starterBudgets);
  const [income, setIncome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateWallet = (field) => (event) => {
    setWallet((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateBudget = (index, field, value) => {
    setBudgets((current) =>
      current.map((budget, budgetIndex) =>
        budgetIndex === index ? { ...budget, [field]: value } : budget,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const walletResponse = await createWallet({
        ...wallet,
        balance: Number(wallet.balance || 0),
        creditLimit: Number(wallet.creditLimit || 0),
        dueDay: wallet.dueDay ? Number(wallet.dueDay) : null,
      });

      const createdWallet = walletResponse.data;
      const activeBudgets = budgets.filter(
        (budget) => budget.category.trim() && Number(budget.limitAmount || 0) > 0,
      );

      await Promise.all(
        activeBudgets.map((budget) =>
          createBudget({
            ...budget,
            category: budget.category.trim(),
            periodMonth: currentMonth,
            limitAmount: Number(budget.limitAmount || 0),
          }),
        ),
      );

      if (Number(income || 0) > 0) {
        await createTransaction({
          walletId: createdWallet.id,
          type: "income",
          title: "Starting income",
          category: "Salary",
          note: "Added during onboarding",
          amount: Number(income),
          transactionDate: today,
        });
      }

      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to finish onboarding.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 xl:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-700">Quick Setup</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Set up your first dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Create one wallet, starter budgets, and optional income.</p>
          </div>
          <img src={bearPhoneGreeting} alt="" className="hidden size-20 object-contain sm:block" />
        </div>
        <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-700">
          Skip for now
        </Link>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">1. First Wallet</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Wallet Name
              </span>
              <input
                className={inputClass}
                value={wallet.name}
                onChange={updateWallet("name")}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Type
              </span>
              <select
                className={inputClass}
                value={wallet.type}
                onChange={updateWallet("type")}
              >
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Paylater">Paylater</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current Balance
              </span>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={wallet.balance}
                onChange={updateWallet("balance")}
                placeholder="0"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Currency
              </span>
              <select
                className={inputClass}
                value={wallet.currency}
                onChange={updateWallet("currency")}
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">2. Starter Budgets</h2>
          <div className="mt-4 space-y-3">
            {budgets.map((budget, index) => (
              <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_1fr_4rem]">
                <select
                  className={inputClass}
                  value={budget.groupName}
                  onChange={(event) => updateBudget(index, "groupName", event.target.value)}
                >
                  <option value="Needs">Needs</option>
                  <option value="Wants">Wants</option>
                </select>
                <input
                  className={inputClass}
                  value={budget.category}
                  onChange={(event) => updateBudget(index, "category", event.target.value)}
                  placeholder="Category"
                />
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={budget.limitAmount}
                  onChange={(event) => updateBudget(index, "limitAmount", event.target.value)}
                  placeholder="Limit"
                />
                <input
                  className={`${inputClass} text-center`}
                  value={budget.icon}
                  onChange={(event) => updateBudget(index, "icon", event.target.value)}
                  maxLength={3}
                  placeholder="F"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">3. Optional Income</h2>
          <label className="mt-4 block max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Monthly income or latest paycheck
            </span>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              placeholder="0"
            />
          </label>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Setting up..." : "Finish Setup"}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
