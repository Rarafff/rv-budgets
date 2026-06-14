import api from "./client";

export const getTransactions = () => {
  return api.get("/transactions");
};

export const createTransaction = (transaction) => {
  return api.post("/transactions", transaction);
};

export const createTransactionsBulk = (transactions) => {
  return api.post("/transactions/bulk", transactions);
};

export const updateTransaction = (id, transaction) => {
  return api.patch(`/transactions/${id}`, transaction);
};

export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`);
};
