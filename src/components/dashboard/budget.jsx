import React from "react";

const formatMoney = (amount) =>
  `Rp. ${Number(amount || 0).toLocaleString("id-ID")}`;

const Budget = ({ summary, isLoading }) => {
  const income = summary?.monthlyIncome || 0;
  const expense = summary?.monthlyExpense || 0;
  const budgetLimit = summary?.budgetLimit || 0;
  const budgetSpent = summary?.budgetSpent || 0;
  const remaining = summary?.budgetRemaining || 0;
  const overSpent = summary?.budgetOverSpent || 0;
  const usedPercent = budgetLimit > 0
    ? Math.min(Math.round(summary?.budgetUsedPercent || 0), 100)
    : 0;
  const hasBudget = budgetLimit > 0;
  const isOverBudget = overSpent > 0;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]">
      <div
        className={`budget-left rounded-xl p-5 shadow-sm sm:p-6 lg:p-7 ${
          isOverBudget ? "bg-rose-100 text-rose-950" : "bg-blue-100 text-blue-950"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="left-side-budget">
            <p
              className={`mb-2 text-xs font-bold uppercase tracking-wide md:text-sm ${
                isOverBudget ? "text-rose-700" : "text-blue-700"
              }`}
            >
              {isOverBudget ? "Over Budget By" : "Remaining Budget Left"}
            </p>
            <p className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isLoading
                ? "Loading..."
                : hasBudget
                  ? formatMoney(isOverBudget ? overSpent : remaining)
                  : "No budget set"}
            </p>
          </div>

          <div>
            <div className={`w-full rounded-full ${isOverBudget ? "bg-rose-200" : "bg-blue-200"}`}>
              <div
                className={`flex h-4 items-center justify-center rounded-full p-0.5 text-center text-xs font-medium leading-none text-white ${
                  isOverBudget ? "bg-rose-600" : "bg-blue-600"
                }`}
                style={{ width: `${usedPercent}%` }}
              >
                {hasBudget ? `${Math.round(summary?.budgetUsedPercent || 0)}%` : "0%"}
              </div>
            </div>
            <p className={`mt-2 text-xs font-medium ${isOverBudget ? "text-rose-700" : "text-blue-700"}`}>
              <em>
                {hasBudget
                  ? isOverBudget
                    ? `${formatMoney(budgetSpent)} used from ${formatMoney(budgetLimit)} monthly budget`
                    : `${formatMoney(budgetSpent)} used from ${formatMoney(budgetLimit)} monthly budget`
                  : "Create budgets to track remaining monthly allocation"}
              </em>
            </p>
          </div>
        </div>
      </div>

      <div className="income-budget flex min-h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isLoading ? "Loading..." : formatMoney(income)}
          </p>
        </div>
        <p className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          +4% from last month
        </p>
      </div>

      <div className="expense-budget flex min-h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Expense</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isLoading ? "Loading..." : formatMoney(expense)}
          </p>
        </div>
        <p className="w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
          {income > 0 ? `${Math.round((expense / income) * 100)}% of income` : "No income yet"}
        </p>
      </div>
    </div>
  );
};

export default Budget;
