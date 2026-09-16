import { useTranslation } from "../../i18n/use-translation";

const ExpenseProgress = ({ summary }) => {
  const { t } = useTranslation();
  const budgetGroups = summary?.budgetByGroup || [];
  const budgetPercent = summary?.budgetLimit > 0
    ? Math.min(Math.round(summary?.budgetUsedPercent || 0), 100)
    : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - budgetPercent / 100);
  const today = new Date();
  const currentDay = today.getDate();
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  return (
    <div className="expenses-progress cute-card mt-6 flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="calendar-bar relative mx-auto size-20 shrink-0 sm:size-24 lg:mx-0">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-current text-slate-200"
            strokeWidth="2"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-current text-[#7e9b65]"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          ></circle>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="text-sm font-bold text-slate-500">
            {t("dashboard.day", { day: currentDay })}
          </span>
        </div>
      </div>

      <div className="expense-progress-title text-center lg:w-44 lg:text-left">
        <p className="text-lg font-black text-[#4d2f1a]">
          {t("dashboard.budgetProgress")}
        </p>
        <p className="text-xs font-bold text-slate-500">
          {t("dashboard.dayFrom", { day: currentDay, total: totalDays })}
        </p>
      </div>

      <div className="needs-wants-save w-full space-y-3">
        {budgetGroups.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            {t("dashboard.noMonthlyBudget")}
          </p>
        ) : (
          budgetGroups.map((group) => {
            const percent = Math.round(group.percent || 0);
            const isOver = Number(group.overSpent || 0) > 0;
            return (
              <div key={group.groupName}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {t(`dashboard.${group.groupName.toLowerCase()}`)}
                  </span>
                  <span className={`text-sm font-medium ${isOver ? "text-rose-600" : "text-slate-700"}`}>
                    {percent}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${isOver ? "bg-rose-500" : group.groupName === "Wants" ? "bg-amber-400" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpenseProgress;
