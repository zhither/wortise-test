import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

export const authClient = createAuthClient({
  baseURL,
});
