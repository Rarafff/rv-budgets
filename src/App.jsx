import { useState } from "react";
import Sidebar from "./components/sidebar";
import { Outlet } from "react-router-dom";
import logo from "./assets/logo.svg";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-fuchsia-50 text-slate-900 md:flex">
      <div className="pointer-events-none fixed -left-24 top-20 size-72 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="pointer-events-none fixed right-[-6rem] top-1/3 size-80 rounded-full bg-fuchsia-200/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-8rem] left-1/3 size-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative z-30 flex items-center justify-between border-b border-blue-100/70 bg-white/80 px-4 py-3 shadow-sm shadow-blue-100/50 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Budgets logo"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="text-lg font-semibold tracking-tight">Budgets.</div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        onClose={() => setSidebarOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:w-[14vw] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:h-screen md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
