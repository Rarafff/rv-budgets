import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../i18n/use-translation";
import { getPushPublicKey, removePushSubscription, savePushSubscription } from "../api/push";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysUntil = (dateText) => {
  const date = new Date(`${dateText}T00:00:00`);
  return Math.round((date - startOfToday()) / 86_400_000);
};

const toApplicationServerKey = (key) => {
  const padded = `${key}${"=".repeat((4 - (key.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const NotificationCenter = ({ summary, compact = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const [pushStatus, setPushStatus] = useState("checking");
  const [pushMessage, setPushMessage] = useState("");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("unsupported");
      return;
    }
    setPushStatus(Notification.permission === "granted" ? "enabled" : Notification.permission);
  }, []);

  const notifications = useMemo(() => {
    if (!summary) return [];
    const items = [];

    (summary.incomingBills || []).forEach((bill) => {
      const remainingDays = daysUntil(bill.dueDate);
      if (bill.status === "overdue" || remainingDays < 0) {
        items.push({
          id: `bill-overdue-${bill.id}`,
          tone: "rose",
          title: t("notifications.billOverdue", { name: bill.name }),
          detail: t("notifications.billOverdueDetail"),
        });
      } else if (remainingDays <= 3) {
        items.push({
          id: `bill-soon-${bill.id}`,
          tone: "amber",
          title: t("notifications.billSoon", { name: bill.name }),
          detail: t("notifications.billSoonDetail", { count: remainingDays }),
        });
      }
    });

    (summary.budgetByGroup || []).forEach((group) => {
      const percent = Math.round(Number(group.percent || 0));
      if (percent >= 100) {
        items.push({
          id: `budget-over-${group.groupName}`,
          tone: "rose",
          title: t("notifications.budgetOver", { name: group.groupName }),
          detail: t("notifications.budgetOverDetail"),
        });
      } else if (percent >= 80) {
        items.push({
          id: `budget-near-${group.groupName}`,
          tone: "amber",
          title: t("notifications.budgetNear", { name: group.groupName, percent }),
          detail: t("notifications.budgetNearDetail"),
        });
      }
    });

    (summary.wallets || []).forEach((wallet) => {
      const isDebtWallet = ["Credit Card", "Paylater"].includes(wallet.type);
      const minimumBalance = Number(wallet.minimumBalance || 0);
      if (!isDebtWallet && minimumBalance > 0 && Number(wallet.balance || 0) <= minimumBalance) {
        items.push({
          id: `wallet-low-${wallet.id}`,
          tone: "amber",
          title: t("notifications.walletLow", { name: wallet.name }),
          detail: t("notifications.walletLowDetail", { amount: new Intl.NumberFormat("id-ID", { style: "currency", currency: wallet.currency || "IDR", maximumFractionDigits: 0 }).format(minimumBalance) }),
        });
      } else if (!isDebtWallet && Number(wallet.balance || 0) <= 0) {
        items.push({
          id: `wallet-empty-${wallet.id}`,
          tone: "amber",
          title: t("notifications.walletEmpty", { name: wallet.name }),
          detail: t("notifications.walletEmptyDetail"),
        });
      }
    });

    return items.slice(0, 8);
  }, [summary, t]);

  useEffect(() => {
    setHasSeen(false);
  }, [notifications.length]);

  const toggle = () => {
    setIsOpen((open) => !open);
    setHasSeen(true);
  };

  const enablePush = async () => {
    setPushMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus(permission);
        return;
      }
      const keyResponse = await getPushPublicKey();
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toApplicationServerKey(keyResponse.data.publicKey),
        });
      }
      await savePushSubscription(subscription.toJSON());
      setPushStatus("enabled");
      setPushMessage(t("notifications.pushEnabled"));
    } catch (error) {
      setPushStatus("error");
      setPushMessage(error.response?.data?.error || error.message || t("notifications.pushError"));
    }
  };

  const disablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscription(subscription.toJSON());
        await subscription.unsubscribe();
      }
      setPushStatus("default");
      setPushMessage(t("notifications.pushDisabled"));
    } catch (error) {
      setPushMessage(error.response?.data?.error || error.message || t("notifications.pushError"));
    }
  };

  return (
    <div className={`relative ${compact ? "" : "w-full"}`}>
      <button
        type="button"
        onClick={toggle}
        className={`relative inline-flex items-center justify-center rounded-xl border border-[#f1dfc2] bg-[#fffaf0] text-[#70441f] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff3d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa7941] ${
          compact ? "size-10" : "w-full gap-2 px-3 py-2.5"
        }`}
        aria-label={t("notifications.open")}
        aria-expanded={isOpen}
      >
        <span aria-hidden="true" className="text-lg">🔔</span>
        {!compact && <span className="text-sm font-bold">{t("notifications.label")}</span>}
        {notifications.length > 0 && !hasSeen && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-black leading-5 text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute z-[60] mt-2 overflow-hidden rounded-2xl border border-[#f1dfc2] bg-[#fffdf7] shadow-xl shadow-[#70441f]/15 ${
          compact ? "right-0 w-[min(22rem,calc(100vw-2rem))]" : "left-0 w-[min(22rem,calc(100vw-2rem))]"
        }`}>
          <div className="flex items-center justify-between border-b border-[#f1dfc2] px-4 py-3">
            <div>
              <p className="font-black text-[#4d2f1a]">{t("notifications.title")}</p>
              <p className="text-xs font-semibold text-[#8d6a4c]">{t("notifications.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-2 py-1 text-sm font-bold text-[#805323] hover:bg-[#fff3d5]"
              aria-label={t("app.closeMenu")}
            >
              ×
            </button>
          </div>
          <div className="max-h-80 divide-y divide-[#f6ead4] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-2xl" aria-hidden="true">🐻</p>
                <p className="mt-2 text-sm font-bold text-[#45613b]">{t("notifications.clear")}</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="flex gap-3 px-4 py-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.tone === "rose" ? "bg-rose-500" : "bg-amber-400"}`} />
                  <div>
                    <p className="text-sm font-bold text-[#4d2f1a]">{item.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#8d6a4c]">{item.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {pushStatus !== "unsupported" && (
            <div className="border-t border-[#f1dfc2] p-3">
              {pushStatus === "enabled" ? (
                <button type="button" onClick={disablePush} className="w-full rounded-xl bg-[#edf7e8] px-3 py-2 text-xs font-black text-[#45613b] hover:bg-[#dcecd1]">
                  {t("notifications.disablePush")}
                </button>
              ) : pushStatus === "denied" ? (
                <p className="text-center text-xs font-semibold text-[#8d6a4c]">{t("notifications.pushDenied")}</p>
              ) : (
                <button type="button" onClick={enablePush} className="w-full rounded-xl bg-[#fff1c7] px-3 py-2 text-xs font-black text-[#70441f] hover:bg-[#f8df9a]">
                  {t("notifications.enablePush")}
                </button>
              )}
              {pushMessage && <p className="mt-2 text-center text-xs font-semibold text-[#8d6a4c]">{pushMessage}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
