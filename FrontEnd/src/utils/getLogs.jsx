import { apiCall } from "./apiCall";

export const getLogs = () => apiCall("get", "/records/logs");
