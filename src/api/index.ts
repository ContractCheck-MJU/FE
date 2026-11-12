import { useMockApi } from "./config.ts";
import { httpApi } from "./http.ts";
import { mockApi } from "./mock.ts";

export const api = useMockApi ? mockApi : httpApi;

export { useMockApi } from "./config.ts";
export { ApiError, errorText } from "./errors.ts";
