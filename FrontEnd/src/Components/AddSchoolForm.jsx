import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
} from "@mui/material";
import { addSchool, updateSchool } from "../utils/apiSchools";
import { fetchBarangay } from "../utils/authUser";

const AddSchoolForm = ({ onSuccess, school = null }) => {
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		barangay_id: "",
	});
	const [barangays, setBarangays] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadBarangays = async () => {
			try {
				const barangayData = await fetchBarangay();
				setBarangays(barangayData);
			} catch (err) {
				console.error("Error loading barangays:", err);
				setError("Failed to load barangays.");
			}
		};

		loadBarangays();
	}, []);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};
	useEffect(() => {
		if (school) {
			setFormData({
				...school,
			});
		}
	}, [school]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(""); // Clear previous error

		try {
			if (school) {
				await updateSchool(school.id, formData);
			} else {
				await addSchool(formData);
			}
			setFormData({ name: "", address: "", barangay_id: "" });

			if (onSuccess) {
				onSuccess(school ? "School Updated" : "School added successfully.");
			}
		} catch (err) {
			const errMsg = err?.response?.data?.error || "Something went wrong.";
			setError(errMsg);
		}
	};

	return (
		<div>
			<Typography variant="h6" gutterBottom>
				Add New School
			</Typography>

			{error && <Alert severity="error">{error}</Alert>}

			<Box component="form" onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField
						label="School Name"
						variant="outlined"
						name="name"
						fullWidth
						value={formData.name}
						onChange={handleChange}
						required
					/>
					<TextField
						label="School Address"
						placeholder="bldg no. / street"
						variant="outlined"
						name="address"
						fullWidth
						value={formData.address}
						onChange={handleChange}
					/>
					<FormControl fullWidth required>
						<InputLabel>Barangay</InputLabel>
						<Select
							label="Barangay"
							name="barangay_id"
							value={formData.barangay_id}
							onChange={handleChange}
						>
							{barangays.map((barangay) => (
								<MenuItem key={barangay.id} value={barangay.id}>
									{barangay.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Button
						type="submit"
						variant={school ? "outlined" : "contained"}
						color="primary"
						fullWidth
					>
						{school ? "Update School" : "Add School"}
					</Button>
				</Stack>
			</Box>
		</div>
	);
};

export default AddSchoolForm;
