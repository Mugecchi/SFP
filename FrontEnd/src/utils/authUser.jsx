import { api, apiCall, IMG_BASE_URL } from "./apiCall";
// Authentication endpoints
export const logout = async () => {
	try {
		await api.post("/logout");
		localStorage.clear();
		sessionStorage.clear();
	} catch (error) {
		throw error.response?.data?.error || "Logout failed";
	}
};
export const login = async (credentials) => {
	try {
		const response = await api.post("/login", credentials);
		localStorage.setItem("userToken", response.data.token); // Store token
		return response.data; // Return the response to handle success in Login.jsx
	} catch (error) {
		throw error.response?.data?.error || "Login failed";
	}
};

export const fetchUsers = () => apiCall("get", "/users");
export const createUser = (formData) =>
	apiCall("post", "/users", formData, true);

// 🟢 Update user (with Avatar)
export const updateUser = (id, formData) =>
	apiCall("put", `/users/${id}`, formData, true);

// 🟢 Delete user
export const deleteUser = (id) => apiCall("delete", `/users/${id}`);

// 🟢 Upload Avatar (Profile Picture)
export const uploadAvatar = (userId, file) => {
	const formData = new FormData();
	formData.append("avatar", file);
	return apiCall("post", `/users/${userId}/avatar`, formData, true);
};

export const getAvatarUrl = (filename) => {
	if (!filename) return "/default-avatar.png"; // Fallback avatar
	return `${IMG_BASE_URL}/uploads/profile_pictures/${filename}`;
};
export const fetchUser = () => {
	return apiCall("get", "/user"); // Assuming "/protected" returns user data if logged in
};

export const fetchBarangay = () => {
	return apiCall("get", "/barangay");
};
