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
import { addHealthData, fetchHealthData } from "../utils/healthApi";

const AddHealthRecord = ({ onSuccess, student }) => {
	const [formData, setFormData] = useState({
		student_id: "",
		height: "",
		weight: "",
		allergies: "",
	});
	const [students, setStudents] = useState([]);
	const [error, setError] = useState("");

	// Load student data on component mount
	useEffect(() => {
		const loadStudents = async () => {
			try {
				const studentData = await fetchHealthData();
				setStudents(studentData || []);
			} catch (err) {
				console.error("Error loading students:", err);
				setError("Failed to load students.");
			}
		};
		loadStudents();
	}, []); // Empty array ensures it runs once on mount.

	// Set form data if a student is passed as a prop
	useEffect(() => {
		if (student) {
			setFormData({
				...student,
			});
		}
	}, [student]); // Dependency array added to run on 'student' prop change.

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(""); // Clear previous error message.

		try {
			await addHealthData(formData);
			setFormData({ student_id: "", height: "", weight: "", allergies: "" });
			if (onSuccess) onSuccess("Health record added successfully.");
		} catch (err) {
			const errMsg = err?.response?.data?.error || "Something went wrong.";
			setError(errMsg);
		}
	};

	return (
		<div>
			<Typography variant="h6" gutterBottom>
				Add Health Record
			</Typography>

			{error && <Alert severity="error">{error}</Alert>}

			<Box component="form" onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<FormControl fullWidth required>
						<InputLabel>Student</InputLabel>
						<Select
							label="Student"
							name="student_id"
							value={formData.student_id}
							onChange={handleChange}
						>
							{students.map((s) => (
								<MenuItem key={s.student_id} value={s.student_id}>
									{s.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						label="Height (cm)"
						variant="outlined"
						name="height"
						type="number"
						value={formData.height}
						onChange={handleChange}
						required
					/>

					<TextField
						label="Weight (kg)"
						variant="outlined"
						name="weight"
						type="number"
						value={formData.weight}
						onChange={handleChange}
						required
					/>

					<TextField
						label="Allergies"
						variant="outlined"
						name="allergies"
						value={formData.allergies}
						onChange={handleChange}
					/>

					<Button type="submit" variant="contained" color="primary" fullWidth>
						Add Health Record
					</Button>
				</Stack>
			</Box>
		</div>
	);
};

export default AddHealthRecord;
