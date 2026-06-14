import api from "./client";

export const askAdvisor = (payload) => {
  return api.post("/ai/advisor", payload);
};

export const getAdvisorThreads = () => {
  return api.get("/ai/advisor/threads");
};

export const getAdvisorMessages = (threadId) => {
  return api.get(`/ai/advisor/threads/${threadId}/messages`);
};
