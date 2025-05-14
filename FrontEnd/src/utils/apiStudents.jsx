import { apiCall } from "./apiCall";

export const addStudent = (formData) =>
	apiCall("post", "/students", formData, true);
export const getStudents = () => apiCall("get", "/students");

export const updateStudent = (id, data) =>
	apiCall("put", `/students/${id}`, data);

export const fetchAttendance = () => apiCall("get", `/attendance`);
export const addAttendance = (id, formData) =>
	apiCall("post", `/attendance/${id}`, formData, true);
export const fetchAttendanceCount = () => apiCall("get", `/attendance/count`);

export const fetchBmiCounts = () => apiCall("get", `/bmi`);

export const fetchSexCounts = () => apiCall("get", `/sex_counts`);
