import api from "./client";

export const register = ({
  name,
  email,
  phoneNumber,
  password,
  rememberMe = false,
}) => {
  return api.post("/auth/register", {
    name,
    email,
    phoneNumber,
    password,
    rememberMe,
  });
};

export const login = ({ email, password, rememberMe = false }) => {
  return api.post("/auth/login", {
    email,
    password,
    rememberMe,
  });
};

export const forgotPassword = ({ email }) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = ({ token, newPassword }) => {
  return api.post("/auth/reset-password", {
    token,
    newPassword,
  });
};
