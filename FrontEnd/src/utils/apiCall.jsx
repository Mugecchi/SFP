import axios from "axios";
const API_BASE_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:5000/api" // Local development
		: `${window.location.origin}/api`; // Automatically use the Railway domain in production

export default API_BASE_URL;

export const IMG_BASE_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:5000" // Local development
		: `${window.location.origin}`;
export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Ensures cookies (sessions) are sent with requests
});

// Generic API request function
export const apiCall = async (
	method,
	url,
	data = null,
	isFormData = false,
	config = {}
) => {
	try {
		const response = await api({
			method,
			url,
			data,
			...config, // Ensure params are included in the config
		});
		return response.data;
	} catch (error) {
		throw (
			error.response?.data?.error || "Something went wrong. Please try again."
		);
	}
};
