import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { saveAuth } from "../../utils/auth";
import logo from "../../assets/logo-bear.webp";
import LanguageToggle from "../../components/language-toggle";
import { useTranslation } from "../../i18n/use-translation";

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-7"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 7 9-7" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-7"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const updateCheckbox = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await login(form);
      const token = response.data?.token || response.data?.accessToken;

      saveAuth({
        token,
        user: response.data?.user,
        rememberMe: form.rememberMe,
      });

      navigate("/");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          t("auth.loginFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-xl">
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <LanguageToggle />
          </div>
          <img
            src={logo}
            alt="Budgets logo"
            className="mx-auto size-20 rounded-3xl object-cover"
          />
          <h1 className="mt-6 text-4xl font-black tracking-tight">Budgets.</h1>
          <p className="mt-4 text-xl font-medium text-slate-500">
            {t("auth.tagline")}
          </p>
        </div>

        <form
          className="mt-12 rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70 md:p-10"
          onSubmit={handleSubmit}
        >
          <label className="flex h-20 items-center gap-5 rounded-2xl bg-slate-50 px-5 text-slate-400 focus-within:ring-2 focus-within:ring-blue-200">
            <MailIcon />
            <input
              type="email"
              placeholder={t("auth.email")}
              value={form.email}
              onChange={updateField("email")}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </label>

          <label className="mt-5 flex h-20 items-center gap-5 rounded-2xl bg-slate-50 px-5 text-slate-400 focus-within:ring-2 focus-within:ring-blue-200">
            <LockIcon />
            <input
              type="password"
              placeholder={t("auth.password")}
              value={form.password}
              onChange={updateField("password")}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </label>

          <div className="mt-7 flex items-center justify-between gap-4 text-base font-bold text-slate-500">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={updateCheckbox("rememberMe")}
                className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {t("auth.rememberMe")}
            </label>
            <button
              type="button"
              className="text-slate-500 hover:text-blue-700"
              onClick={() => navigate("/forgot-password")}
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 h-16 w-full rounded-2xl bg-blue-600 text-xl font-black text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
          </button>

          <p className="mt-8 text-center text-lg font-bold text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="hover:text-blue-700">
              {t("auth.register")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Login;
