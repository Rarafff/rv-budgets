import api from "./client";

export const getMyCouple = () => {
  return api.get("/couple/me");
};

export const createCouple = (couple) => {
  return api.post("/couple", couple);
};

export const joinCouple = ({ inviteCode }) => {
  return api.post("/couple/join", { inviteCode });
};

export const getCoupleSummary = (periodMonth) => {
  return api.get("/couple/summary", {
    params: { periodMonth },
  });
};
