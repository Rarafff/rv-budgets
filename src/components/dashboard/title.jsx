import { useTranslation } from "../../i18n/use-translation";

const formatCompactMoney = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount || 0));

const buildFinancialStatus = (summary, t) => {
  if (!summary) return t("dashboard.loadingFinancialStatus");

  const bills = summary.incomingBills || [];
  const topExpense = summary.expenseByCategory?.[0];

  if ((summary.budgetOverSpent || 0) > 0) {
    return t("dashboard.overBudgetBy", {
      amount: formatCompactMoney(summary.budgetOverSpent),
      category: topExpense
        ? t("dashboard.mostlyFrom", { category: topExpense.category })
        : "",
    });
  }

  if ((summary.budgetLimit || 0) > 0) {
    const remaining = formatCompactMoney(summary.budgetRemaining || 0);
    const billText =
      bills.length > 0
        ? t("dashboard.billsComing", {
            count: bills.length,
            plural: bills.length > 1 ? "s" : "",
          })
        : "";
    return t("dashboard.budgetLeft", { amount: remaining, bills: billText });
  }

  if ((summary.monthlyExpense || 0) > 0) {
    return t("dashboard.spentThisMonth", {
      amount: formatCompactMoney(summary.monthlyExpense),
      category: topExpense
        ? t("dashboard.mostlyOn", { category: topExpense.category })
        : "",
    });
  }

  return t("dashboard.noSpending");
};

const Title = ({ summary, profile, isLoading }) => {
  const { language, t } = useTranslation();
  const username = profile?.name || "there";
  const now = new Date();
  const greeting =
    now.getHours() >= 6 && now.getHours() < 18
      ? t("dashboard.goodDay")
      : t("dashboard.goodEvening");
  const firstDateOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date) =>
    date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="dashboard-title flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="left-title min-w-0">
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="mt-1 text-lg text-slate-700">
          {greeting}, {username}
        </p>
        <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          <span className="mr-2 inline-flex size-2 rounded-full bg-emerald-400" />
          <span className="truncate">
            {isLoading
              ? t("dashboard.loadingStatus")
              : buildFinancialStatus(summary, t)}
          </span>
        </div>
      </div>
      <div className="right-title w-fit max-w-full self-start rounded-lg bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700 sm:text-sm md:w-[10rem]">
        <p>{t("dashboard.period")}</p>
        <p className="whitespace-nowrap">
          {`${formatDate(firstDateOfMonth)} - ${formatDate(lastDateOfMonth)}`}
        </p>
      </div>
    </div>
  );
};

export default Title;
