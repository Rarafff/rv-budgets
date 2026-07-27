import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./i18n/language-context.jsx";
import Dashboard from "./pages/dashboard/index.jsx";
import Profile from "./pages/profile/profile.jsx";
import Wallet from "./pages/wallet/wallet.jsx";
import Transaction from "./pages/transaction/transaction.jsx";
import ReceiptScanner from "./pages/receipt-scanner/receipt-scanner.jsx";
import Budget from "./pages/budget/budget.jsx";
import Goal from "./pages/goal/goal.jsx";
import Asset from "./pages/asset/asset.jsx";
import Couple from "./pages/couple/couple.jsx";
import Advisor from "./pages/advisor/advisor.jsx";
import Report from "./pages/report/report.jsx";
import Onboarding from "./pages/onboarding/onboarding.jsx";
import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import ForgotPassword from "./pages/forgot-password/forgot-password.jsx";
import ResetPassword from "./pages/reset-password/reset-password.jsx";
import AuthGuard from "./components/auth-guard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
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
              <Route path="/goals" element={<Goal />} />
              <Route path="/assets" element={<Asset />} />
              <Route path="/couple" element={<Couple />} />
              <Route path="/advisor" element={<Advisor />} />
              <Route path="/report" element={<Report />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
);
