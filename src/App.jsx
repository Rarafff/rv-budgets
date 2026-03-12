import { useState } from "react";
import Sidebar from "./components/sidebar";
import { Outlet } from "react-router-dom";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 md:flex">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:hidden">
        <div className="text-lg font-semibold tracking-tight">Budgets.</div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
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
      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
