import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import logo from "../../assets/logo.svg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    newPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await resetPassword(form);
      setMessage(response.data?.message || "Password reset.");
      setTimeout(() => navigate("/login"), 900);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-xl">
        <div className="text-center">
          <img
            src={logo}
            alt="Budgets logo"
            className="mx-auto size-20 rounded-3xl object-cover"
          />
          <h1 className="mt-6 text-4xl font-black tracking-tight">
            Reset Password
          </h1>
        </div>

        <form
          className="mt-12 rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70 md:p-10"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Reset Token"
            value={form.token}
            onChange={updateField("token")}
            className="h-16 w-full rounded-2xl bg-slate-50 px-5 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={updateField("newPassword")}
            className="mt-5 h-16 w-full rounded-2xl bg-slate-50 px-5 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
            required
          />

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 h-16 w-full rounded-2xl bg-blue-600 text-xl font-black text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>

          <p className="mt-8 text-center text-lg font-bold text-slate-500">
            Back to{" "}
            <Link to="/login" className="hover:text-blue-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
