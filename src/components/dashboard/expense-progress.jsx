const ExpenseProgress = ({ summary }) => {
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
    <div className="expenses-progress mt-6 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:gap-6">
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
            className="stroke-current text-blue-600"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          ></circle>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="text-sm font-bold text-slate-500">
            Day {currentDay}
          </span>
        </div>
      </div>

      <div className="expense-progress-title text-center lg:w-44 lg:text-left">
        <p className="text-lg font-bold text-slate-700">Budget Progress</p>
        <p className="text-xs font-bold text-slate-500">
          Day {currentDay} from {totalDays}
        </p>
      </div>

      <div className="needs-wants-save w-full space-y-3">
        {budgetGroups.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No monthly budget set.
          </p>
        ) : (
          budgetGroups.map((group) => {
            const percent = Math.round(group.percent || 0);
            const isOver = Number(group.overSpent || 0) > 0;
            return (
              <div key={group.groupName}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {group.groupName.toUpperCase()}
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
