import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import logo from "../../assets/logo.svg";
import LanguageToggle from "../../components/language-toggle";
import { useTranslation } from "../../i18n/use-translation";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setResetToken("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email });
      setMessage(response.data?.message || t("auth.resetLinkCreated"));
      setResetToken(response.data?.resetToken || "");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          t("auth.resetLinkFailed"),
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
            {t("auth.forgotTitle")}
          </h1>
          <p className="mt-4 text-xl font-medium text-slate-500">
            {t("auth.forgotSubtitle")}
          </p>
        </div>

        <form
          className="mt-12 rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70 md:p-10"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-16 w-full rounded-2xl bg-slate-50 px-5 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
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

          {resetToken && (
            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
              <p>{t("auth.devResetToken")}</p>
              <p className="mt-2 break-all font-mono text-xs">{resetToken}</p>
              <Link
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="mt-3 inline-block text-blue-700 hover:text-blue-900"
              >
                {t("auth.continueReset")}
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 h-16 w-full rounded-2xl bg-blue-600 text-xl font-black text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? t("auth.creating") : t("auth.createResetToken")}
          </button>

          <p className="mt-8 text-center text-lg font-bold text-slate-500">
            {t("auth.rememberPassword")}{" "}
            <Link to="/login" className="hover:text-blue-700">
              {t("auth.login")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;
