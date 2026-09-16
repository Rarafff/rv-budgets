import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { saveAuth } from "../../utils/auth";
import logo from "../../assets/logo-bear.webp";
import LanguageToggle from "../../components/language-toggle";
import { useTranslation } from "../../i18n/use-translation";

const UserIcon = () => (
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
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

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

const PhoneIcon = () => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.09 9.63a16 16 0 0 0 6.28 6.28l1.19-1.19a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92Z" />
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

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    rememberMe: false,
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
      const response = await register(form);
      saveAuth({
        token: response.data?.token,
        user: response.data?.user,
        rememberMe: form.rememberMe,
      });
      setMessage(t("auth.accountCreated"));
      setTimeout(() => navigate("/onboarding"), 700);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          t("auth.registrationFailed"),
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
          <h1 className="mt-6 text-4xl font-black tracking-tight">
            {t("auth.createAccount")}
          </h1>
          <p className="mt-4 text-xl font-medium text-slate-500">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        <form
          className="mt-12 rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70 md:p-10"
          onSubmit={handleSubmit}
        >
          <label className="flex h-20 items-center gap-5 rounded-2xl bg-slate-50 px-5 text-slate-400 focus-within:ring-2 focus-within:ring-blue-200">
            <UserIcon />
            <input
              type="text"
              placeholder={t("auth.fullName")}
              value={form.name}
              onChange={updateField("name")}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </label>

          <label className="mt-5 flex items-center gap-3 text-base font-bold text-slate-500">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  rememberMe: event.target.checked,
                }))
              }
              className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            {t("auth.rememberMe")}
          </label>

          <label className="mt-5 flex h-20 items-center gap-5 rounded-2xl bg-slate-50 px-5 text-slate-400 focus-within:ring-2 focus-within:ring-blue-200">
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
            <PhoneIcon />
            <input
              type="tel"
              placeholder={t("auth.phoneNumber")}
              value={form.phoneNumber}
              onChange={updateField("phoneNumber")}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </label>

          <label className="mt-5 flex h-20 items-center gap-5 rounded-2xl bg-slate-50 px-5 text-slate-400 focus-within:ring-2 focus-within:ring-blue-200">
            <LockIcon />
            <input
              type="password"
              placeholder={t("auth.createPassword")}
              value={form.password}
              onChange={updateField("password")}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </label>

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
            {isSubmitting ? t("auth.registering") : t("auth.register")}
          </button>

          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            <p className="text-lg font-bold text-slate-500">
              {t("auth.haveAccount")}{" "}
              <Link to="/login" className="hover:text-blue-700">
                {t("auth.login")}
              </Link>
            </p>
          </div>
        </form>

        <p className="mx-auto mt-8 max-w-md text-center text-sm font-medium leading-6 text-slate-400">
          {t("auth.terms")}
        </p>
      </div>
    </main>
  );
};

export default Register;
