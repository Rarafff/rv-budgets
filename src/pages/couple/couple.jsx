import { useEffect, useState } from "react";
import {
  createCouple,
  getCoupleSummary,
  getMyCouple,
  joinCouple,
} from "../../api/couple";

const formatMoney = (amount) =>
  `Rp. ${Number(amount || 0).toLocaleString("id-ID")}`;

const Couple = () => {
  const [couple, setCouple] = useState(null);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ name: "", inviteCode: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCouple = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const coupleResponse = await getMyCouple();
      const coupleData = coupleResponse.data;
      setCouple(coupleData);
      if (coupleData?.id) {
        const summaryResponse = await getCoupleSummary();
        setSummary(summaryResponse.data);
      } else {
        setSummary(null);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load couple.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCouple();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      await createCouple({ name: form.name || "Couple Budget" });
      setForm({ name: "", inviteCode: "" });
      await loadCouple();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Failed to create couple.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      await joinCouple({ inviteCode: form.inviteCode });
      setForm({ name: "", inviteCode: "" });
      await loadCouple();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Failed to join couple.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(couple.inviteCode);
      setMessage("Invite code copied.");
    } catch {
      setError("Failed to copy invite code.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:px-10">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-blue-700">
          Couple
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Couple Budget
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View combined personal budget and spending for you and your partner.
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 text-sm font-bold text-slate-500">
          Loading couple...
        </div>
      ) : !couple ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">Create Couple</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a shared space and give the invite code to your partner.
            </p>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-4 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none"
              placeholder="Rafli & Partner"
            />
            <button
              disabled={isSaving}
              className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:opacity-60"
            >
              Create Couple
            </button>
          </form>

          <form
            onSubmit={handleJoin}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">Join Couple</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use the invite code shared by your partner.
            </p>
            <input
              value={form.inviteCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  inviteCode: event.target.value,
                }))
              }
              className="mt-4 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm uppercase outline-none"
              placeholder="INVITE CODE"
            />
            <button
              disabled={isSaving}
              className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-60"
            >
              Join Couple
            </button>
          </form>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{couple.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use this code to invite your partner.
              </p>
            </div>
            <button
              type="button"
              onClick={copyInviteCode}
              className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100"
            >
              {couple.inviteCode} - Copy
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase text-blue-700">
                Combined Budget Left
              </p>
              <p className="mt-2 text-xl font-black text-blue-950">
                {formatMoney(summary?.budgetRemaining)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Combined Expense
              </p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {formatMoney(summary?.budgetSpent)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase text-emerald-700">
                Your Spending
              </p>
              <p className="mt-2 text-xl font-black text-emerald-950">
                {formatMoney(summary?.mySpending)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase text-amber-700">
                Partner Spending
              </p>
              <p className="mt-2 text-xl font-black text-amber-950">
                {formatMoney(summary?.partnerSpending)}
              </p>
            </div>
          </div>
          {Number(summary?.budgetLimit || 0) === 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
              No personal budgets found for either member this month.
            </p>
          )}

          {Number(summary?.budgetLimit || 0) > 0 &&
            Number(summary?.budgetSpent || 0) === 0 && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                No personal expenses found for either member this month.
              </p>
            )}
        </section>
      )}
    </div>
  );
};

export default Couple;
