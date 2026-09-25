import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./i18n/language-context.jsx";
import AuthGuard from "./components/auth-guard.jsx";

const Dashboard = lazy(() => import("./pages/dashboard/index.jsx"));
const Profile = lazy(() => import("./pages/profile/profile.jsx"));
const Wallet = lazy(() => import("./pages/wallet/wallet.jsx"));
const Transaction = lazy(() => import("./pages/transaction/transaction.jsx"));
const ReceiptScanner = lazy(() => import("./pages/receipt-scanner/receipt-scanner.jsx"));
const Budget = lazy(() => import("./pages/budget/budget.jsx"));
const Category = lazy(() => import("./pages/category/category.jsx"));
const Goal = lazy(() => import("./pages/goal/goal.jsx"));
const Asset = lazy(() => import("./pages/asset/asset.jsx"));
const Couple = lazy(() => import("./pages/couple/couple.jsx"));
const Advisor = lazy(() => import("./pages/advisor/advisor.jsx"));
const Report = lazy(() => import("./pages/report/report.jsx"));
const Onboarding = lazy(() => import("./pages/onboarding/onboarding.jsx"));
const Login = lazy(() => import("./pages/login/login.jsx"));
const Register = lazy(() => import("./pages/register/register.jsx"));
const ForgotPassword = lazy(() => import("./pages/forgot-password/forgot-password.jsx"));
const ResetPassword = lazy(() => import("./pages/reset-password/reset-password.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="grid min-h-[100svh] place-items-center bg-sky-50 text-sm font-medium text-blue-700">
              Loading Budgets…
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<AuthGuard />}>
              <Route element={<App />}>
                <Route index element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/transactions" element={<Transaction />} />
                <Route path="/receipt-scanner" element={<ReceiptScanner />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/categories" element={<Category />} />
                <Route path="/goals" element={<Goal />} />
                <Route path="/assets" element={<Asset />} />
                <Route path="/couple" element={<Couple />} />
                <Route path="/advisor" element={<Advisor />} />
                <Route path="/report" element={<Report />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
);
