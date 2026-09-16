import api from "./client";

export const getPushPublicKey = () => api.get("/push/public-key");
export const savePushSubscription = (subscription) => api.post("/push/subscriptions", subscription);
export const removePushSubscription = (subscription) => api.post("/push/subscriptions/unsubscribe", subscription);
