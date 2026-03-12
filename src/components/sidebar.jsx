const Sidebar = ({ className = "", onClose }) => {
  return (
    <aside
      className={`flex min-h-screen flex-col w-full border-b border-slate-100 bg-white px-4 py-5 md:h-screen md:w-[14vw] md:min-w-[180px] md:max-w-[240px] md:border-b-0 md:border-r md:px-5 cursor-pointer ${className}`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-200 text-sm font-bold text-rose-700">
            RV.
          </div>
          <div className="text-lg font-semibold tracking-tight">Budgets.</div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="mt-6 flex-1 min-h-0 overflow-y-auto">
        <ul className="space-y-1 text-sm font-medium text-slate-700">
          <li className="rounded-xl bg-rose-200 px-3 py-2 text-rose-900">
            Home
          </li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Dompet</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Trans</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Budget</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Scanner</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Goals</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Aset</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Utang</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Investasi</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">
            AI Advisor
          </li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Laporan</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Profil</li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <ul className="space-y-1 text-sm font-medium text-slate-600">
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">Yang Baru</li>
          <li className="rounded-xl px-3 py-2 hover:bg-slate-100">
            Mode Gelap
          </li>
          <li className="rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50">
            Logout
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
