import { useTranslation } from "../../i18n/use-translation";
import bearCoin from "../../assets/bears/bear-coin.png";

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
    <div className="dashboard-title relative flex min-h-64 flex-col items-start justify-center gap-3 overflow-hidden rounded-[2rem] border border-[#efd9a4] bg-gradient-to-br from-[#fff4cf] via-[#fffbec] to-[#dfead6] px-6 py-7 shadow-[0_14px_40px_rgba(112,72,34,0.10)] md:min-h-48 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="left-title relative z-10 min-w-0 pr-20 md:pr-0">
        <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#9a6428]">Your money buddy</p>
        <h1 className="text-3xl font-black tracking-tight text-[#4d2f1a]">{t("dashboard.title")}</h1>
        <p className="mt-1 text-lg font-medium text-[#765238]">
          {greeting}, {username}
        </p>
        <div className="mt-3 flex w-full min-w-0 items-center rounded-full bg-[#63401f] px-4 py-2 text-sm font-semibold text-[#fff9eb] shadow-sm md:inline-flex md:w-auto">
          <span className="mr-2 inline-flex size-2 rounded-full bg-[#b9d39e]" />
          <span className="min-w-0 truncate">
            {isLoading
              ? t("dashboard.loadingStatus")
              : buildFinancialStatus(summary, t)}
          </span>
        </div>
      </div>
      <div className="right-title relative z-10 w-fit max-w-full self-start rounded-2xl border border-[#efd9a4] bg-white/75 px-4 py-2 text-xs font-bold text-[#805323] shadow-sm sm:text-sm md:mr-28 md:w-[10rem]">
        <p>{t("dashboard.period")}</p>
        <p className="whitespace-nowrap">
          {`${formatDate(firstDateOfMonth)} - ${formatDate(lastDateOfMonth)}`}
        </p>
      </div>
      <img src={bearCoin} alt="" className="pointer-events-none absolute -bottom-3 -right-3 w-28 rotate-[-8deg] md:-bottom-12 md:-right-6 md:w-56" />
    </div>
  );
};

export default Title;
