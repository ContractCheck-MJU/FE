export const useMockApi = import.meta.env.VITE_USE_MOCK !== "false";

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY ?? "";

export const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";
