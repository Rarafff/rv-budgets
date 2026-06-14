import api from "./client";

export const getBudgets = (periodMonth, options = {}) => {
  return api.get("/budgets", {
    params: { periodMonth, ...options },
  });
};

export const createBudget = (budget) => {
  return api.post("/budgets", budget);
};

export const updateBudget = (id, budget) => {
  return api.patch(`/budgets/${id}`, budget);
};

export const deleteBudget = (id) => {
  return api.delete(`/budgets/${id}`);
};
