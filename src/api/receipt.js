import api from "./client";

export const parseReceipt = (file) => {
  const formData = new FormData();
  formData.append("receipt", file);

  return api.post("/receipts/parse", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
