import { useEffect, useState } from "react";
import IncomingBill from "../../components/dashboard/incoming-bill";
import IncomeOutcome from "../../components/dashboard/income-outcome";
import CalendarActivites from "../../components/dashboard/calendar-activites";
import ExpenseProgress from "../../components/dashboard/expense-progress";
import ExpenseRank from "../../components/dashboard/expense-rank";
import Budget from "../../components/dashboard/budget";
import Title from "../../components/dashboard/title";
import { getDashboardSummary } from "../../api/dashboard";
import { getUserProfile } from "../../api/user";
import { Link } from "react-router-dom";

const SetupChecklist = ({ summary, isLoading }) => {
  if (isLoading || !summary) return null;

  const items = [
    {
      label: "Create your first wallet",
      description: "Add cash, bank, e-wallet, credit card, or paylater.",
      href: "/wallet",
      done: (summary.wallets || []).length > 0,
    },
    {
      label: "Set this month budget",
      description: "Create Needs and Wants budget categories.",
      href: "/budget",
      done: (summary.budgetLimit || 0) > 0,
    },
    {
      label: "Add your first transaction",
      description: "Record income or expense so the dashboard has progress.",
      href: "/transactions",
      done: (summary.recentTransactions || []).length > 0,
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  if (doneCount === items.length) return null;

  return (
    <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">
            Setup Needed
          </p>
          <h2 className="text-lg font-bold text-slate-900">
            Finish these steps to activate your dashboard
          </h2>
        </div>
        <p className="text-sm font-bold text-slate-500">
          {doneCount}/{items.length} done
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
              item.done
                ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-slate-50 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{item.label}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  item.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {item.done ? "Done" : "Start"}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium opacity-75">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const index = () => {
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <Title summary={summary} profile={profile} isLoading={isLoading} />
      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}
      <SetupChecklist summary={summary} isLoading={isLoading} />
      <Budget summary={summary} isLoading={isLoading} />
      <ExpenseProgress summary={summary} />
      <CalendarActivites summary={summary} isLoading={isLoading} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-stretch">
        <IncomeOutcome summary={summary} isLoading={isLoading} />
        <IncomingBill
          summary={summary}
          isLoading={isLoading}
          onChanged={loadSummary}
        />
      </div>
      <ExpenseRank summary={summary} isLoading={isLoading} />
    </div>
  );
};

export default index;
