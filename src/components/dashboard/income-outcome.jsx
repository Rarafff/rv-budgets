import { useTranslation } from "../../i18n/use-translation";

const formatMoney = (amount) =>
  `Rp. ${Number(amount || 0).toLocaleString("id-ID")}`;

const IncomeOutcome = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const income = summary?.monthlyIncome || 0;
  const outcome = summary?.monthlyExpense || 0;
  const emergencyMonths = summary?.emergencyFundMonths || 0;
  const liquidAssets = summary?.liquidAssets || 0;

  return (
    <div className="income-outcome-total grid h-full gap-4 md:grid-cols-3">
      <div className="income-total flex h-48 w-full flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t("dashboard.income")}
          </h2>
          <p className="mt-8 text-2xl font-semibold">
            {isLoading ? t("dashboard.loading") : formatMoney(income)}
          </p>
        </div>
        <p className="w-fit rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
          {t("dashboard.thisMonth")}
        </p>
      </div>
      <div className="outcome-total flex h-48 w-full flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t("dashboard.outcome")}
          </h2>
          <p className="mt-8 text-2xl font-semibold">
            {isLoading ? t("dashboard.loading") : formatMoney(outcome)}
          </p>
        </div>
        <p className="w-fit rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">
          {t("dashboard.thisMonth")}
        </p>
      </div>
      <div className="emergency-fund-runway flex h-48 w-full flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t("dashboard.emergencyFund")}
          </h2>
          <p className="mt-6">
            <span className="text-2xl font-semibold">
              {isLoading ? "-" : emergencyMonths.toFixed(1)}
            </span>{" "}
            <span className="text-sm">{t("dashboard.months")}</span>
          </p>
        </div>
        <div>
          <div
            className="flex h-2 items-center justify-center rounded-full bg-amber-300 text-center text-xs leading-none"
            style={{ width: "45%" }}
          >
            {" "}
            45%
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t("dashboard.liquidAssets", { amount: formatMoney(liquidAssets) })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomeOutcome;
