import bearCelebration from "../../assets/bears/bear-celebration.png";
import bearWorriedMoney from "../../assets/bears/bear-worried-money.png";
import { useTranslation } from "../../i18n/use-translation";

const getHealth = (summary) => {
  if (!summary) return { score: 0, checks: [] };

  const budgetPercent = Number(summary.budgetUsedPercent || 0);
  const hasBudget = Number(summary.budgetLimit || 0) > 0;
  const hasOverdueBill = (summary.incomingBills || []).some((bill) => bill.status === "overdue");
  const hasSoonBill = (summary.incomingBills || []).some((bill) => {
    const due = new Date(`${bill.dueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / 86_400_000) <= 3;
  });
  const weeklyNet = Number(summary.weeklyIncome || 0) - Number(summary.weeklyExpense || 0);
  const emergencyMonths = Number(summary.emergencyFundMonths || 0);
  const hasGoals = Number(summary.goalCount || 0) > 0;

  const checks = [
    {
      id: "budget",
      score: !hasBudget ? 8 : budgetPercent >= 100 ? 0 : budgetPercent >= 80 ? 12 : 25,
      max: 25,
      state: !hasBudget ? "setup" : budgetPercent >= 100 ? "warning" : budgetPercent >= 80 ? "watch" : "good",
    },
    {
      id: "cashflow",
      score: weeklyNet >= 0 ? 20 : 5,
      max: 20,
      state: weeklyNet >= 0 ? "good" : "warning",
    },
    {
      id: "emergency",
      score: emergencyMonths >= 3 ? 20 : emergencyMonths >= 1 ? 12 : 5,
      max: 20,
      state: emergencyMonths >= 3 ? "good" : emergencyMonths >= 1 ? "watch" : "warning",
    },
    {
      id: "bills",
      score: hasOverdueBill ? 0 : hasSoonBill ? 12 : 20,
      max: 20,
      state: hasOverdueBill ? "warning" : hasSoonBill ? "watch" : "good",
    },
    {
      id: "goals",
      score: !hasGoals ? 7 : Number(summary.goalOverdueCount || 0) > 0 ? 3 : 15,
      max: 15,
      state: !hasGoals ? "setup" : Number(summary.goalOverdueCount || 0) > 0 ? "warning" : "good",
    },
  ];

  return { score: checks.reduce((total, item) => total + item.score, 0), checks };
};

const MoneyHealth = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const { score, checks } = getHealth(summary);
  const isStrong = score >= 75;
  const headline = score >= 75 ? t("health.strong") : score >= 50 ? t("health.steady") : t("health.attention");

  return (
    <section className="cute-card relative mt-6 overflow-hidden p-5 sm:p-6">
      <img
        src={isStrong ? bearCelebration : bearWorriedMoney}
        alt=""
        className="pointer-events-none absolute -bottom-2 -right-2 w-28 opacity-100 sm:-bottom-8 sm:-right-7 sm:w-48"
      />
      <div className="relative max-w-4xl pb-28 sm:pb-0">
        <p className="text-sm font-black uppercase tracking-wide text-[#9a6428]">{t("health.title")}</p>
        <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1 sm:flex-nowrap">
          <p className={`text-5xl font-black ${isStrong ? "text-[#45613b]" : "text-[#805323]"}`}>
            {isLoading ? "—" : score}
          </p>
          <p className="pb-1 text-sm font-bold text-[#8d6a4c]">/ 100</p>
          <p className="w-full text-sm font-black text-[#4d2f1a] sm:w-auto sm:pb-1">{isLoading ? t("dashboard.loading") : headline}</p>
        </div>
        <p className="mt-2 pr-12 text-sm font-semibold text-[#765238] sm:pr-0">{t("health.description")}</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          {checks.map((check) => (
            <div key={check.id} className="rounded-xl bg-[#fffaf0] p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#8d6a4c]">{t(`health.${check.id}`)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1dfc2]">
                <div
                  className={`h-full rounded-full ${check.state === "good" ? "bg-[#7e9b65]" : check.state === "watch" ? "bg-amber-400" : "bg-rose-400"}`}
                  style={{ width: `${(check.score / check.max) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-black text-[#4d2f1a]">{check.score}/{check.max}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoneyHealth;
