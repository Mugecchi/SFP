import { apiCall } from "./apiCall";

export const addSchool = (formData) =>
	apiCall("post", "/schools", formData, true);
export const getSchools = () => apiCall("get", "/schools");

export const updateSchool = (id, data) =>
	apiCall("put", `/schools/${id}`, data, true);
