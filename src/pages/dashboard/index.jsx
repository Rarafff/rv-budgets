import { useEffect, useState } from "react";
import IncomingBill from "../../components/dashboard/incoming-bill";
import IncomeOutcome from "../../components/dashboard/income-outcome";
import CalendarActivites from "../../components/dashboard/calendar-activites";
import ExpenseProgress from "../../components/dashboard/expense-progress";
import ExpenseRank from "../../components/dashboard/expense-rank";
import Budget from "../../components/dashboard/budget";
import WeeklyCheckin from "../../components/dashboard/weekly-checkin";
import MoneyHealth from "../../components/dashboard/money-health";
import CashflowForecast from "../../components/dashboard/cashflow-forecast";
import Title from "../../components/dashboard/title";
import { getDashboardSummary } from "../../api/dashboard";
import { getUserProfile } from "../../api/user";
import { Link } from "react-router-dom";
import bearCreditCard from "../../assets/bears/bear-credit-card.png";
import bearTarget from "../../assets/bears/bear-target.png";
import bearReceiptScan from "../../assets/bears/bear-receipt-scan.png";

const SetupChecklist = ({ summary, isLoading }) => {
  if (isLoading || !summary) return null;

  const items = [
    {
      label: "Create your first wallet",
      description: "Add cash, bank, e-wallet, credit card, or paylater.",
      href: "/wallet",
      done: (summary.wallets || []).length > 0,
      bear: bearCreditCard,
    },
    {
      label: "Set this month budget",
      description: "Create Needs and Wants budget categories.",
      href: "/budget",
      done: (summary.budgetLimit || 0) > 0,
      bear: bearTarget,
    },
    {
      label: "Add your first transaction",
      description: "Record income or expense so the dashboard has progress.",
      href: "/transactions",
      done: (summary.recentTransactions || []).length > 0,
      bear: bearReceiptScan,
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  if (doneCount === items.length) return null;

  return (
    <div className="cute-card mt-5 overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#9a6428]">
            Little steps, big progress
          </p>
          <h2 className="text-lg font-black text-[#4d2f1a]">
            Let’s make your money tracker feel like home
          </h2>
        </div>
        <p className="cute-pill rounded-full px-3 py-1 text-sm font-bold">
          {doneCount}/{items.length} done
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`relative overflow-hidden rounded-2xl border p-4 pr-20 transition hover:-translate-y-0.5 hover:shadow-md ${
              item.done
                ? "border-[#cde0bc] bg-[#f2f8ed] text-[#45613b]"
                : "border-[#f1dfc2] bg-[#fffaf0] text-[#4d2f1a]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{item.label}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  item.done
                    ? "bg-[#dcecd1] text-[#45613b]"
                    : "bg-[#f8df9a] text-[#805323]"
                }`}
              >
                {item.done ? "Done" : "Start"}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium opacity-75">
              {item.description}
            </p>
            <img src={item.bear} alt="" className="pointer-events-none absolute -bottom-5 -right-6 w-24 rotate-[-5deg]" />
          </Link>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
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
      <WeeklyCheckin summary={summary} isLoading={isLoading} />
      <CashflowForecast summary={summary} isLoading={isLoading} />
      <MoneyHealth summary={summary} isLoading={isLoading} />
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

export default Dashboard;
