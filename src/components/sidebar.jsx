import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/auth";
import logo from "../assets/logo-bear.webp";
import closeMenu from "../assets/x-burger.webp";
import LanguageToggle from "./language-toggle";
import { useTranslation } from "../i18n/use-translation";
import NotificationCenter from "./notification-center";

const Sidebar = ({ className = "", onClose, notificationSummary }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const linkClass = ({ isActive }) =>
    `block rounded-2xl px-3 py-2.5 transition ${
      isActive ? "bg-[#f8df9a] text-[#70441f] shadow-sm" : "hover:bg-[#fff3d5]"
    }`;

  const handleLogout = () => {
    clearAuth();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      id="main-navigation"
      className={`flex min-h-[100svh] flex-col w-full border-b border-[#f1dfc2] bg-[#fffdf7]/95 px-4 py-5 md:sticky md:top-0 md:h-[100svh] md:self-start md:w-[14vw] md:min-w-[180px] md:max-w-[240px] md:border-b-0 md:border-r md:px-5 ${className}`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Budgets logo"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <div className="text-lg font-bold tracking-tight text-[#70441f]">Budgets.</div>
        </div>
        <button
          type="button"
          className="rounded-xl p-1.5 text-[0px] transition hover:scale-105 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa7941] md:hidden"
          onClick={onClose}
          aria-label={t("app.closeMenu")}
        >
          <img
            src={closeMenu}
            alt=""
            aria-hidden="true"
            className="h-9 w-9 object-contain"
          />
          ✕
        </button>
      </div>

      <LanguageToggle className="mt-5 justify-between" />
      <div className="mt-3 hidden md:block">
        <NotificationCenter summary={notificationSummary} />
      </div>

      <nav className="mt-6 flex-1 min-h-0 overflow-y-auto">
        <ul className="space-y-1 text-sm font-semibold text-[#765238]">
          <li>
            <NavLink to="/" end className={linkClass} onClick={onClose}>
              {t("nav.home")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/wallet" className={linkClass} onClick={onClose}>
              {t("nav.wallet")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions" className={linkClass} onClick={onClose}>
              {t("nav.transactions")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/budget" className={linkClass} onClick={onClose}>
              {t("nav.budget")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={linkClass} onClick={onClose}>
              {t("nav.goals")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets" className={linkClass} onClick={onClose}>
              {t("nav.asset")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/couple" className={linkClass} onClick={onClose}>
              {t("nav.couple")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/advisor" className={linkClass} onClick={onClose}>
              {t("nav.advisor")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={linkClass} onClick={onClose}>
              {t("nav.report")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={linkClass} onClick={onClose}>
              {t("nav.profile")}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-[#f1dfc2] pt-4">
        <ul className="space-y-1 text-sm font-semibold text-[#8d6a4c]">
          <li className="rounded-2xl px-3 py-2 hover:bg-[#fff3d5]">
            {t("nav.whatsNew")}
          </li>
          <li className="rounded-2xl px-3 py-2 hover:bg-[#fff3d5]">
            {t("nav.darkMode")}
          </li>
          <li
            className="rounded-2xl px-3 py-2 text-rose-600 hover:bg-rose-50"
            onClick={handleLogout}
          >
            {t("nav.logout")}
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
