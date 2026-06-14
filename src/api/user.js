import api from "./client";

export const getUserProfile = () => {
  return api.get("/users/me");
};

export const updateUserProfile = ({ name, phoneNumber }) => {
  return api.patch("/users/me", {
    name,
    phoneNumber,
  });
};

export const changePassword = ({ currentPassword, newPassword }) => {
  return api.patch("/users/me/password", {
    currentPassword,
    newPassword,
  });
};
