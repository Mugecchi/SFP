import { apiCall } from "./apiCall";

export const fetchHealthData = () => apiCall("get", "/health_records");
export const addHealthData = (formData) =>
	apiCall("post", "/health_records", formData, true);
