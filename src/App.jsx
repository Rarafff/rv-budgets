import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import { Outlet } from "react-router-dom";
import logo from "./assets/logo-bear.webp";
import hamburger from "./assets/hamburger-bear.webp";
import LanguageToggle from "./components/language-toggle";
import { useTranslation } from "./i18n/use-translation";
import { getDashboardSummary } from "./api/dashboard";
import NotificationCenter from "./components/notification-center";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    getDashboardSummary().then((response) => setNotificationSummary(response.data)).catch(() => setNotificationSummary(null));
  }, []);

  return (
    <div className="relative h-[100svh] overflow-hidden bg-[#fffaf0] text-[#3f2a1d] md:flex">
      <div className="pointer-events-none fixed -left-24 top-20 size-72 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none fixed right-[-6rem] top-1/3 size-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-8rem] left-1/3 size-96 rounded-full bg-orange-200/25 blur-3xl" />

      <div className="relative z-30 flex items-center justify-between border-b border-amber-100 bg-[#fffdf7]/90 px-4 py-3 shadow-sm shadow-amber-100/50 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Budgets logo"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="text-lg font-bold tracking-tight text-[#70441f]">Budgets.</div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden min-[420px]:flex" />
          <NotificationCenter summary={notificationSummary} compact />
          <button
            type="button"
            className="rounded-xl p-1.5 transition hover:scale-105 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa7941]"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={t("app.openMenu")}
            aria-expanded={sidebarOpen}
            aria-controls="main-navigation"
          >
            <img
              src={hamburger}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 object-contain"
            />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        notificationSummary={notificationSummary}
        onClose={() => setSidebarOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:w-[14vw] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <main className="relative z-10 h-[calc(100svh-4rem)] flex-1 overflow-y-auto px-4 py-6 md:h-[100svh] md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
