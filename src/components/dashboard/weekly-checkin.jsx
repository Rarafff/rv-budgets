import bearCalculator from "../../assets/bears/bear-calculator.png";
import { useTranslation } from "../../i18n/use-translation";

const formatMoney = (amount) =>
  `Rp. ${Math.max(0, Math.round(Number(amount || 0))).toLocaleString("id-ID")}`;

const formatShortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
    new Date(`${date}T00:00:00`),
  );

const WeeklyCheckin = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const today = new Date();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const weekEnd = summary?.weekEnd ? new Date(`${summary.weekEnd}T23:59:59`) : today;
  const lastDay = weekEnd < monthEnd ? weekEnd : monthEnd;
  const daysLeftThisWeek = Math.max(1, Math.ceil((lastDay - today) / 86_400_000) + 1);
  const daysLeftThisMonth = Math.max(1, Math.ceil((monthEnd - today) / 86_400_000) + 1);
  const hasBudget = Number(summary?.budgetLimit || 0) > 0;
  const safeToSpend = hasBudget
    ? Math.min(
        Math.max(0, Number(summary?.budgetRemaining || 0)),
        (Math.max(0, Number(summary?.budgetRemaining || 0)) / daysLeftThisMonth) * daysLeftThisWeek,
      )
    : 0;
  const weeklyNet = Number(summary?.weeklyIncome || 0) - Number(summary?.weeklyExpense || 0);

  return (
    <section className="cute-card relative mt-6 overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-100 sm:-right-7 sm:-bottom-10">
        <img src={bearCalculator} alt="" className="w-28 object-contain sm:w-48" />
      </div>
      <div className="relative max-w-4xl pb-24 sm:pb-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-black uppercase tracking-wide text-[#9a6428]">
            {t("weekly.title")}
          </p>
          {summary?.weekStart && summary?.weekEnd && (
            <span className="cute-pill rounded-full px-2.5 py-1 text-xs font-bold">
              {formatShortDate(summary.weekStart)} – {formatShortDate(summary.weekEnd)}
            </span>
          )}
        </div>
        <h2 className="mt-1 text-xl font-black text-[#4d2f1a]">
          {t("weekly.heading")}
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#edf7e8] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#507144]">
              {t("weekly.income")}
            </p>
            <p className="mt-2 text-lg font-black text-[#45613b]">
              {isLoading ? "…" : formatMoney(summary?.weeklyIncome)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#fff2e9] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#a45a35]">
              {t("weekly.expense")}
            </p>
            <p className="mt-2 text-lg font-black text-[#8b4228]">
              {isLoading ? "…" : formatMoney(summary?.weeklyExpense)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#fff7df] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#805323]">
              {t("weekly.safe")}
            </p>
            <p className="mt-2 text-lg font-black text-[#70441f]">
              {isLoading ? "…" : hasBudget ? formatMoney(safeToSpend) : "—"}
            </p>
          </div>
        </div>

        <p className="mt-4 pr-16 text-sm font-semibold text-[#765238] sm:pr-0">
          {isLoading
            ? t("dashboard.loading")
            : hasBudget
              ? weeklyNet >= 0
                ? t("weekly.positive", { amount: formatMoney(weeklyNet) })
                : t("weekly.negative", { amount: formatMoney(Math.abs(weeklyNet)) })
              : t("weekly.noBudget")}
        </p>
      </div>
    </section>
  );
};

export default WeeklyCheckin;
