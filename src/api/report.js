import api from "./client";

export const getMonthlyReport = (periodMonth) => {
  return api.get("/reports/monthly", {
    params: { periodMonth },
  });
};
