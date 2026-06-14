import React, { useEffect, useMemo, useState } from "react";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../../api/user";
import { getStoredUser, saveStoredUser } from "../../utils/auth";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white";

const decimalPreview = {
  IDR: "Rp 10.000",
  USD: "$10.50",
  SGD: "S$10.50",
};

const Profile = () => {
  const [currency, setCurrency] = useState("IDR");
  const [profile, setProfile] = useState(() => getStoredUser());
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(!profile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
    });
  }, [profile]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getUserProfile();
        setProfile(response.data);
        saveStoredUser(response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const initials = useMemo(() => {
    const source = profile?.name || profile?.email || "User";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile?.email, profile?.name]);

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");
    setIsSavingProfile(true);

    try {
      const response = await updateUserProfile({
        name: form.name,
        phoneNumber: form.phoneNumber,
      });
      setProfile(response.data);
      saveStoredUser(response.data);
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(response.data?.message || "Password updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Failed to change password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 md:px-8 xl:px-10">
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-blue-200 bg-blue-50 text-xl font-bold text-blue-700">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">
              {isLoading
                ? "Loading profile..."
                : profile?.name || "Unnamed User"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-700">
                PRO
              </span>
              <span>Joined on {joinedDate}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Change Avatar
        </button>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Preferences</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Display Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={updateField("name")}
              placeholder="Your name"
            />
          </Field>
          <Field label="Email Address">
            <input
              className={inputClass}
              value={form.email}
              placeholder="Your email"
              disabled
            />
          </Field>
          <Field label="Phone Number">
            <input
              className={inputClass}
              value={form.phoneNumber}
              onChange={updateField("phoneNumber")}
              placeholder="Your phone number"
            />
          </Field>
          <Field label="Currency">
            <select
              className={inputClass}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="IDR">IDR (Rp)</option>
              <option value="USD">USD ($)</option>
              <option value="SGD">SGD ($)</option>
            </select>
          </Field>
          <Field label="Language">
            <select className={inputClass} defaultValue="id">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </Field>
          <Field label="Decimal Display">
            <div className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4">
              <button
                type="button"
                className="h-5 w-9 rounded-full bg-slate-200 p-0.5"
                aria-label="Toggle decimal display"
              >
                <span className="block size-4 rounded-full bg-white shadow-sm" />
              </button>
              <span className="text-sm text-slate-500">
                {decimalPreview[currency]}
              </span>
            </div>
          </Field>
        </div>

        <button
          type="button"
          disabled={isSavingProfile}
          onClick={handleSaveProfile}
          className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
        >
          {isSavingProfile ? "Saving..." : "Save Changes"}
        </button>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Security & PIN</h2>

        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Change Password
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <input
              type="password"
              className={inputClass}
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField("currentPassword")}
            />
            <input
              type="password"
              className={inputClass}
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={updatePasswordField("newPassword")}
            />
            <input
              type="password"
              className={inputClass}
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={updatePasswordField("confirmPassword")}
            />
          </div>
          <button
            type="button"
            disabled={isChangingPassword}
            onClick={handleChangePassword}
            className="mt-4 h-10 rounded-xl bg-blue-100 px-5 text-sm font-bold text-blue-700 hover:bg-blue-200"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Change Email
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <input
              type="email"
              className={inputClass}
              placeholder="New Email Address"
            />
            <input
              type="password"
              className={inputClass}
              placeholder="Current Password"
            />
          </div>
          <button
            type="button"
            className="mt-4 h-10 rounded-xl bg-blue-100 px-5 text-sm font-bold text-blue-700 hover:bg-blue-200"
          >
            Change Email
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
