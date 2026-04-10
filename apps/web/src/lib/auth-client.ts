import { createAuthClient } from "better-auth/react";

import { getAuthClientBaseUrl } from "./api-base-url";

const baseURL = getAuthClientBaseUrl();

export const authClient = createAuthClient({
  baseURL,
});
