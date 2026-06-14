import api from "./client";

export const getAssets = () => {
  return api.get("/assets");
};

export const createAsset = (asset) => {
  return api.post("/assets", asset);
};

export const updateAsset = (id, asset) => {
  return api.patch(`/assets/${id}`, asset);
};

export const deleteAsset = (id) => {
  return api.delete(`/assets/${id}`);
};
