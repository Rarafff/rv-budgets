const formatCompactMoney = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount || 0));

const buildFinancialStatus = (summary) => {
  if (!summary) return "Loading your financial status...";

  const bills = summary.incomingBills || [];
  const topExpense = summary.expenseByCategory?.[0];

  if ((summary.budgetOverSpent || 0) > 0) {
    return `Over budget by ${formatCompactMoney(summary.budgetOverSpent)}${
      topExpense ? `, mostly from ${topExpense.category}` : ""
    }.`;
  }

  if ((summary.budgetLimit || 0) > 0) {
    const remaining = formatCompactMoney(summary.budgetRemaining || 0);
    const billText =
      bills.length > 0 ? ` ${bills.length} bill${bills.length > 1 ? "s" : ""} coming soon.` : "";
    return `${remaining} budget left this month.${billText}`;
  }

  if ((summary.monthlyExpense || 0) > 0) {
    return `Spent ${formatCompactMoney(summary.monthlyExpense)} this month${
      topExpense ? `, mostly on ${topExpense.category}` : ""
    }.`;
  }

  return "No spending yet this month. Add a budget to start tracking progress.";
};

const Title = ({ summary, profile, isLoading }) => {
  const username = profile?.name || "there";
  const now = new Date();
  const greeting = now.getHours() >= 6 && now.getHours() < 18 ? "Good day" : "Good evening";
  const firstDateOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date) =>
    date.toLocaleDateString("en-EN", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="dashboard-title flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="left-title min-w-0">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-lg text-slate-700">
          {greeting}, {username}
        </p>
        <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          <span className="mr-2 inline-flex size-2 rounded-full bg-emerald-400" />
          <span className="truncate">
            {isLoading ? "Checking your financial status..." : buildFinancialStatus(summary)}
          </span>
        </div>
      </div>
      <div className="right-title w-fit max-w-full self-start rounded-lg bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700 sm:text-sm md:w-[10rem]">
        <p>Period</p>
        <p className="whitespace-nowrap">
          {`${formatDate(firstDateOfMonth)} - ${formatDate(lastDateOfMonth)}`}
        </p>
      </div>
    </div>
  );
};

export default Title;
