import bearWalletReceipt from "../../assets/bears/bear-wallet-receipt.png";
import { useTranslation } from "../../i18n/use-translation";

const formatMoney = (amount) =>
  `Rp. ${Math.abs(Math.round(Number(amount || 0))).toLocaleString("id-ID")}`;

const CashflowForecast = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const forecast = Number(summary?.forecastBalance || 0);
  const isSafe = forecast >= 0;
  const forecastDate = summary?.forecastDate
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(
        new Date(`${summary.forecastDate}T00:00:00`),
      )
    : "";

  return (
    <section className={`relative mt-6 overflow-hidden rounded-[1.5rem] border p-5 shadow-[0_10px_30px_rgba(112,72,34,0.08)] sm:p-6 ${
      isSafe ? "border-[#cde0bc] bg-[#edf7e8]" : "border-rose-200 bg-[#fff0ea]"
    }`}>
      <img
        src={bearWalletReceipt}
        alt=""
        className="pointer-events-none absolute -bottom-2 -right-2 w-28 sm:-bottom-8 sm:-right-4 sm:w-44"
      />
      <div className="relative max-w-3xl pb-20 sm:pb-0">
        <p className={`text-sm font-black uppercase tracking-wide ${isSafe ? "text-[#557144]" : "text-[#a45a35]"}`}>
          {t("forecast.title")}
        </p>
        <h2 className="mt-1 text-xl font-black text-[#4d2f1a]">{t("forecast.heading")}</h2>
        <div className="mt-4 flex items-end gap-3">
          <p className={`text-3xl font-black ${isSafe ? "text-[#45613b]" : "text-rose-700"}`}>
            {isLoading ? "…" : `${isSafe ? "Rp. " : "-Rp. "}${formatMoney(forecast).replace("Rp. ", "")}`}
          </p>
          {forecastDate && <p className="pb-1 text-xs font-bold text-[#805f43]">{t("forecast.onDate", { date: forecastDate })}</p>}
        </div>
        <p className="mt-2 max-w-xl text-sm font-semibold text-[#765238]">
          {isLoading
            ? t("dashboard.loading")
            : isSafe
              ? t("forecast.safe", { amount: formatMoney(forecast) })
              : t("forecast.risk", { amount: formatMoney(forecast) })}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/70 px-3 py-1.5 text-[#765238]">{t("forecast.bills", { amount: formatMoney(summary?.forecastBills) })}</span>
          <span className="rounded-full bg-white/70 px-3 py-1.5 text-[#765238]">{t("forecast.spend", { amount: formatMoney(summary?.forecastSpend) })}</span>
        </div>
      </div>
    </section>
  );
};

export default CashflowForecast;
