import { useEffect, useMemo, useState } from "react";
import { getMonthlyReport } from "../../api/report";
import { useTranslation } from "../../i18n/use-translation";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatMoney = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatPercent = (amount) => `${Number(amount || 0).toFixed(1)}%`;

const formatDate = (date, language = "id") => {
  if (!date) return "-";
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const StatCard = ({ label, value, tone = "slate" }) => {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-slate-100 bg-white text-slate-900",
  };

  return (
    <Card className={tones[tone]}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
};

const HealthScore = ({ health }) => {
  const { t } = useTranslation();
  const score = Number(health?.score || 0);
  const dash = `${Math.min(score / 100, 1) * 264} 264`;

  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-[150px_1fr] md:items-center">
        <div className="relative mx-auto size-32">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray={dash}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black text-blue-600">{score}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400">/ 100</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("report.financialHealthScore")}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {t("report.healthDescription")}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {health?.label || t("report.noData")}
          </span>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <HealthMetric label={t("report.savingsRatio")} value={formatPercent(health?.savingsRatio)} progress={health?.savingsRatio} />
            <HealthMetric label={t("report.budgetDiscipline")} value={formatPercent(health?.budgetDiscipline)} progress={health?.budgetDiscipline} />
            <HealthMetric label={t("report.runway")} value={`${Number(health?.runwayMonths || 0).toFixed(1)} mo`} progress={(Number(health?.runwayMonths || 0) / 6) * 100} />
            <HealthMetric label={t("report.debtRatio")} value={formatPercent(health?.debtRatio)} progress={100 - Number(health?.debtRatio || 0)} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const HealthMetric = ({ label, value, progress }) => (
  <div>
    <div className="mb-1 flex justify-between gap-2 text-[11px] font-bold text-slate-400">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-blue-500"
        style={{ width: `${Math.max(0, Math.min(Number(progress || 0), 100))}%` }}
      />
    </div>
  </div>
);

const CategoryBreakdown = ({ categories }) => {
  const { t } = useTranslation();
  const topCategory = categories[0];
  const circumference = 258;
  let offset = 0;
  const colors = ["#3b82f6", "#f97316", "#8b5cf6", "#f59e0b", "#10b981"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="flex min-h-[360px] flex-col">
        <h2 className="text-lg font-bold text-slate-900">
          {t("report.expenseBreakdown")}
        </h2>
        <div className="flex flex-1 items-center justify-center">
          <div className="relative mx-auto size-72 max-w-full">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r="41" fill="none" stroke="#f1f5f9" strokeWidth="13" />
              {categories.slice(0, 5).map((category, index) => {
                const length = (Number(category.percent || 0) / 100) * circumference;
                const strokeDashoffset = -offset;
                offset += length;
                return (
                  <circle
                    key={category.category}
                    cx="60"
                    cy="60"
                    r="41"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="13"
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">
                  {topCategory ? formatPercent(topCategory.percent) : "0.0%"}
                </p>
                <p className="mt-1 text-base font-bold text-slate-400">
                  {topCategory?.category || t("report.noExpense")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-slate-900">
          {t("report.topCategories")}
        </h2>
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-2">
          {categories.length === 0 ? (
            <EmptyState text={t("report.noExpenseCategories")} />
          ) : (
            categories.map((category, index) => (
              <article key={category.category} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{category.category}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {formatPercent(category.percent)}
                  </p>
                </div>
                <p className="ml-auto text-sm font-bold text-slate-900">
                  {formatMoney(category.amount)}
                </p>
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const DailyChart = ({ days }) => {
  const { t } = useTranslation();
  const max = Math.max(...days.map((day) => Number(day.amount || 0)), 0);

  return (
    <Card>
      <h2 className="text-lg font-bold text-slate-900">
        {t("report.dailySpending")}
      </h2>
      <div className="mt-5 flex h-56 items-end gap-1 rounded-xl border-l border-b border-dashed border-slate-300 px-3 pb-2">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex-1 rounded-t bg-rose-300"
            style={{ height: `${max > 0 ? Math.max((day.amount / max) * 100, day.amount ? 4 : 0) : 0}%` }}
            title={t("report.dayTitle", {
              day: day.day,
              amount: formatMoney(day.amount),
            })}
          />
        ))}
      </div>
    </Card>
  );
};

const BudgetPerformance = ({ rows, showAll, onToggleShowAll }) => {
  const { t } = useTranslation();
  const visibleRows = showAll ? rows : rows.slice(0, 6);

  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-900">
        {t("report.budgetPerformance")}
      </h2>
      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState text={t("report.noBudgets")} />
        </div>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-4">{t("report.category")}</th>
                  <th className="px-4 py-4 text-right">{t("report.allocation")}</th>
                  <th className="px-4 py-4 text-right">{t("report.used")}</th>
                  <th className="px-4 py-4">{t("report.progress")}</th>
                  <th className="px-4 py-4 text-right">{t("report.percentUsed")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={`${row.groupName}-${row.category}`} className="border-b border-slate-50">
                    <td className="px-4 py-5">
                      <p className="font-bold text-slate-900">{row.category}</p>
                      <p className="text-xs font-semibold text-slate-400">{row.groupName}</p>
                    </td>
                    <td className="px-4 py-5 text-right font-semibold text-slate-500">{formatMoney(row.allocation)}</td>
                    <td className="px-4 py-5 text-right font-bold text-slate-900">{formatMoney(row.used)}</td>
                    <td className="px-4 py-5">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${row.percentUsed >= 90 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${Math.min(Number(row.percentUsed || 0), 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right font-bold text-slate-500">{formatPercent(row.percentUsed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 6 && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="mt-4 h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              {showAll
                ? t("report.close")
                : t("report.viewAllCategories", { count: rows.length })}
            </button>
          )}
        </>
      )}
    </Card>
  );
};

const GoalProgress = ({ goals }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <h2 className="text-lg font-bold text-slate-900">
      {t("report.goalProgress")}
    </h2>
    <div className="mt-5 space-y-5">
      {goals.length === 0 ? (
        <EmptyState text={t("report.noGoals")} />
      ) : (
        goals.map((goal) => (
          <div key={goal.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{goal.name}</p>
                <p className="text-xs font-semibold text-slate-400">{goal.category}</p>
              </div>
              <span className="text-xs font-black text-blue-600">
                {formatPercent(goal.percent)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(Number(goal.percent || 0), 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
              <span>{formatMoney(goal.currentAmount)}</span>
              <span>{formatMoney(goal.targetAmount)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </Card>
  );
};

const DebtSummary = ({ debtBalance, cashBalance }) => {
  const { t } = useTranslation();

  return (
  <Card className="flex min-h-[290px] flex-col">
    <h2 className="text-lg font-bold text-slate-900">
      {t("report.debtSummary")}
    </h2>
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${debtBalance > 0 ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={debtBalance > 0 ? "M12 8v5M12 17h.01M10.3 4.2 2.8 17.3A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.7L13.7 4.2a2 2 0 0 0-3.4 0Z" : "M5 13 9 17 19 7"} />
        </svg>
      </span>
      <p className="mt-3 text-sm font-bold text-slate-700">
        {debtBalance > 0 ? formatMoney(debtBalance) : t("report.noDebt")}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">
        {t("report.cashBalance", { amount: formatMoney(cashBalance) })}
      </p>
    </div>
  </Card>
  );
};

const ExportModal = ({ report, onClose }) => {
  const { t } = useTranslation();
  const downloadCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Period", report?.period?.month || ""],
      ["Income", report?.income || 0],
      ["Expense", report?.expense || 0],
      ["Net", report?.net || 0],
      ["Savings Ratio", report?.savingsRatio || 0],
      [],
      ["Category", "Amount", "Percent"],
      ...(report?.topCategories || []).map((category) => [
        category.category,
        category.amount,
        category.percent,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${report?.period?.month || "monthly"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            {t("report.exportData")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("report.closeExportModal")}
          >
            x
          </button>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          {t("report.downloadCsvSummary", {
            period: report?.period?.month || t("report.thisMonth"),
          })}
        </p>
        <button
          type="button"
          onClick={downloadCSV}
          className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
        >
          {t("report.downloadCsv")}
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
    {text}
  </div>
);

const Report = () => {
  const { language, t } = useTranslation();
  const [periodMonth, setPeriodMonth] = useState(currentMonth());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllBudget, setShowAllBudget] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadReport();
  }, [periodMonth]);

  const loadReport = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getMonthlyReport(periodMonth);
      setReport(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          t("report.failedLoad"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const monthLabel = useMemo(() => {
    const [year, month] = periodMonth.split("-");
    return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, 1));
  }, [language, periodMonth]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t("report.analysis")}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {t("report.subtitle")}
          </p>
          <input
            type="month"
            className="mt-4 h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none"
            value={periodMonth}
            onChange={(event) => setPeriodMonth(event.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-blue-600 shadow-sm hover:bg-blue-50 disabled:opacity-50"
          disabled={!report}
          aria-label={t("report.downloadReport")}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M5 21h14" />
          </svg>
        </button>
      </header>

      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
          {t("report.loadingReport")}
        </div>
      ) : report ? (
        <div className="mt-6 space-y-6">
          <HealthScore health={report.healthScore} />

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label={t("report.saved")} value={formatMoney(report.saved)} tone="blue" />
            <StatCard label={t("report.savingsRatio")} value={formatPercent(report.savingsRatio)} tone="amber" />
            <StatCard label={t("report.income")} value={formatMoney(report.income)} tone="emerald" />
            <StatCard label={t("report.expense")} value={formatMoney(report.expense)} tone="rose" />
          </div>

          <CategoryBreakdown categories={report.topCategories || []} />

          <div className="grid gap-6 lg:grid-cols-2">
            <DailyChart days={report.dailySpending || []} />
            <Card>
              <h2 className="text-lg font-bold text-slate-900">
                {t("report.quickSummary")}
              </h2>
              <div className="mt-6 space-y-5">
                {[
                  [t("report.period"), monthLabel],
                  [
                    t("report.averageDailyExpense"),
                    t("report.perDay", {
                      amount: formatMoney(report.averageDailyExpense),
                    }),
                  ],
                  [
                    t("report.highestSpendingDay"),
                    report.highestSpendingDay
                      ? `${formatDate(report.highestSpendingDay.date, language)} - ${formatMoney(report.highestSpendingDay.amount)}`
                      : "-",
                  ],
                  [
                    t("report.totalTransactions"),
                    t("report.transactions", {
                      count: report.transactionCount || 0,
                    }),
                  ],
                  [
                    t("report.noSpendDays"),
                    t("report.days", { count: report.noSpendDays || 0 }),
                  ],
                  [t("report.goalContributions"), formatMoney(report.goalContributions)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-4 text-sm last:border-0">
                    <span className="font-semibold text-slate-500">{label}</span>
                    <span className="text-right font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <BudgetPerformance
            rows={report.budgetPerformance || []}
            showAll={showAllBudget}
            onToggleShowAll={() => setShowAllBudget((current) => !current)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <GoalProgress goals={report.goalProgress || []} />
            <DebtSummary
              debtBalance={Number(report.debtBalance || 0)}
              cashBalance={Number(report.cashBalance || 0)}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState text={t("report.noReportData")} />
        </div>
      )}

      {showExportModal && (
        <ExportModal report={report} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default Report;
