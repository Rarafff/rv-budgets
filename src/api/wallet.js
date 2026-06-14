import api from "./client";

export const getWallets = () => {
  return api.get("/wallets");
};

export const createWallet = (wallet) => {
  return api.post("/wallets", wallet);
};

export const updateWallet = (id, wallet) => {
  return api.patch(`/wallets/${id}`, wallet);
};

export const deleteWallet = (id) => {
  return api.delete(`/wallets/${id}`);
};
