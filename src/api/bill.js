import api from "./client";

export const getBills = () => {
  return api.get("/bills");
};

export const createBill = (bill) => {
  return api.post("/bills", bill);
};

export const updateBill = (id, bill) => {
  return api.patch(`/bills/${id}`, bill);
};

export const deleteBill = (id) => {
  return api.delete(`/bills/${id}`);
};

export const payBill = (id, payment) => {
  return api.post(`/bills/${id}/pay`, payment);
};
