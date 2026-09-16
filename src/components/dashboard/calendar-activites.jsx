import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useTranslation } from "../../i18n/use-translation";
import bearSleeping from "../../assets/bears/bear-sleeping.png";

const formatMoney = (amount) =>
  `Rp. ${Number(amount || 0).toLocaleString("id-ID")}`;

const signedAmount = (transaction) => {
  const amount = formatMoney(transaction.amount);
  if (transaction.type === "income") return `+${amount}`;
  if (transaction.type === "transfer") return amount;
  return `-${amount}`;
};

const CalendarActivites = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  const transactions = summary?.recentTransactions || [];
  const events = (summary?.calendarEvents || []).map((event) => ({
    title: `${event.type === "income" ? "+" : event.type === "expense" ? "-" : ""}${Number(
      event.amount || 0,
    ).toLocaleString("id-ID")}`,
    date: event.date,
    extendedProps: {
      type: event.type,
    },
  }));

  return (
    <div className="activities-transaction-container mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-stretch">
      <div className="month-activities calendar-compact cute-card flex min-h-[32rem] w-full flex-col p-4 sm:p-6 lg:min-h-[36rem]">
        <p className="text-lg font-black text-[#4d2f1a]">{t("dashboard.thisMonthActivities")}</p>
        <div className="mt-4 min-h-0 flex-1">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="100%"
            fixedWeekCount={false}
            dayMaxEventRows={2}
            events={events}
            eventContent={({ event }) => {
              const title = event.title?.trim() ?? "";
              const type = event.extendedProps?.type;
              const isNegative = type === "expense";
              const textClass = isNegative
                ? "text-rose-600"
                : type === "income"
                  ? "text-emerald-600"
                  : "text-blue-600";

              const dotColor =
                type === "expense"
                  ? "#e11d48"
                  : type === "income"
                    ? "#10b981"
                    : "#2563eb";

              return (
                <span
                  className={`fc-amount text-xs font-semibold ${textClass}`}
                  style={{ "--fc-dot-color": dotColor }}
                  data-amount={title}
                  title={title}
                >
                  {title}
                </span>
              );
            }}
          />
        </div>
      </div>
      <div className="new-transactions cute-card flex max-h-[36rem] w-full flex-col overflow-hidden p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-black text-[#4d2f1a]">{t("dashboard.newTransactions")}</p>
          <p className="text-xs font-medium text-slate-500">
            {t("dashboard.items", { count: transactions.length })}
          </p>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-500">
              {t("dashboard.loadingTransactions")}
            </p>
          ) : transactions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <img src={bearSleeping} alt="" className="w-32" />
              <p className="mt-1 text-sm font-bold text-[#8d6a4c]">{t("dashboard.noRecentTransactions")}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="transaction-lists flex w-full flex-row items-center gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black uppercase text-blue-700">
                  {tx.type.slice(0, 1)}
                </div>
                <div className="Category-desc-container min-w-0">
                  <p className="font-medium text-slate-900">
                    {tx.category || tx.type}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {tx.title} - {tx.walletName}
                  </p>
                </div>
                <div className="amount-transaction ml-auto whitespace-nowrap text-sm font-semibold text-slate-700">
                  {signedAmount(tx)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarActivites;
