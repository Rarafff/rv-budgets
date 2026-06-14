import api from "./client";

export const getGoals = () => {
  return api.get("/goals");
};

export const createGoal = (goal) => {
  return api.post("/goals", goal);
};

export const updateGoal = (id, goal) => {
  return api.patch(`/goals/${id}`, goal);
};

export const deleteGoal = (id) => {
  return api.delete(`/goals/${id}`);
};

export const getGoalContributions = (id) => {
  return api.get(`/goals/${id}/contributions`);
};

export const contributeGoal = (id, contribution) => {
  return api.post(`/goals/${id}/contributions`, contribution);
};
