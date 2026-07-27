import { useTranslation } from "../../i18n/use-translation";

const expenseIcons = {
  food: (
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
      <path d="M4 3v8" />
      <path d="M8 3v8" />
      <path d="M4 7h4" />
      <path d="M6 11v10" />
      <path d="M15 3v18" />
      <path d="M15 3c3 2 5 5 5 8h-5" />
    </svg>
  ),
  shopping: (
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
      <path d="M6 8h12l-1 13H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  ),
  family: (
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  dining: (
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
      <path d="M5 12h14" />
      <path d="M7 12a5 5 0 0 1 10 0" />
      <path d="M6 16h12" />
      <path d="M8 20h8" />
    </svg>
  ),
};

const formatMoney = (amount) =>
  `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

const ExpenseRank = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const expenses = summary?.expenseByCategory || [];
  const remaining = summary?.budgetRemaining || 0;
  const budgetLimit = summary?.budgetLimit || 0;
  const budgetGroups = summary?.budgetByGroup || [];
  const circumference = 2 * Math.PI * 42;
  const groupStyles = {
    Needs: { dot: "bg-violet-300", stroke: "text-violet-300" },
    Wants: { dot: "bg-orange-300", stroke: "text-orange-300" },
  };
  let segmentOffset = 0;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="biggest-expense flex h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            {t("dashboard.topExpenses")}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {t("dashboard.thisMonth")}
          </p>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {isLoading ? (
            <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-500">
              {t("dashboard.loadingExpenses")}
            </p>
          ) : expenses.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-500">
              {t("dashboard.noExpensesThisMonth")}
            </p>
          ) : expenses.map((expense) => (
            <div
              key={expense.category}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                {expenseIcons[expense.icon] ?? expenseIcons.shopping}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {expense.category}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {t("dashboard.thisMonth")}
                </p>
              </div>
              <p className="ml-auto whitespace-nowrap text-sm font-bold text-slate-900">
                {formatMoney(expense.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="budget-realization flex h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t("dashboard.budgetUsage")}
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {t("dashboard.monthlyAllocationOverview")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            {t("dashboard.export")}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {budgetGroups.length === 0 ? (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              {t("dashboard.noMonthlyBudgetSet")}
            </div>
          ) : budgetGroups.map((segment) => (
            <div
              key={segment.groupName}
              className="flex items-center gap-2 text-xs font-medium text-slate-600"
            >
              <span className={`size-2.5 rounded-full ${groupStyles[segment.groupName]?.dot || "bg-slate-300"}`} />
              {t(`dashboard.${segment.groupName.toLowerCase()}`)}
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="relative size-44">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100"
              />
              {budgetGroups.map((group) => {
                const fraction = budgetLimit > 0 ? Number(group.spent || 0) / budgetLimit : 0;
                const length = Math.max(0, Math.min(fraction, 1)) * circumference;
                const dashOffset = -segmentOffset;
                segmentOffset += length;
                return (
                  <circle
                    key={group.groupName}
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className={groupStyles[group.groupName]?.stroke || "text-slate-300"}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                {t("dashboard.remaining")}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatMoney(remaining)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            {t("dashboard.thisMonth")}
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            {t("dashboard.budgetDetails")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseRank;
