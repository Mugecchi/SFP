import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	FormControl,
	Select,
	InputLabel,
	MenuItem,
	Grid,
	InputAdornment,
	Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addStudent, updateStudent } from "../utils/apiStudents";
import { fetchBarangay } from "../utils/authUser";
import { getSchools } from "../utils/apiSchools";
import differenceInYears from "date-fns/differenceInYears";

const AddStudentForm = ({ onSuccess, student = null }) => {
	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		age: "",
		sex: "",
		gender: "",
		grade_level: "",
		birthday: null,
		barangay_id: "",
		school_id: "",
		address: "",
	});

	const [barangays, setBarangays] = useState([]);
	const [schools, setSchools] = useState([]);
	const [filteredSchools, setFilteredSchools] = useState([]); // For filtered schools based on barangay
	const [error, setError] = useState("");

	useEffect(() => {
		const loadBarangays = async () => {
			try {
				const barangayData = await fetchBarangay();
				setBarangays(barangayData);
			} catch (err) {
				console.error("Error loading barangays:", err);
			}
		};
		const loadSchools = async () => {
			try {
				const schoolData = await getSchools();
				setSchools(schoolData);
				setFilteredSchools(schoolData); // Initially display all schools
			} catch (e) {
				console.error("Error loading schools:", e);
			}
		};
		loadSchools();
		loadBarangays();
	}, []);

	// Filter schools based on the selected barangay
	const handleBarangayChange = (e) => {
		const barangayId = e.target.value;
		setFormData((prev) => ({
			...prev,
			barangay_id: barangayId,
		}));

		// Filter schools by barangay_id (or modify logic depending on your backend or data structure)
		const filtered = schools.filter(
			(school) => school.barangay_id === barangayId
		);
		setFilteredSchools(filtered);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		// If the 'grade' field is being updated, apply the max limit (e.g., 12)
		if (name === "grade" && value > 12) {
			return; // Prevent updating the value if it exceeds 12
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleBirthdayChange = (date) => {
		const calculatedAge = date ? differenceInYears(new Date(), date) : "";
		setFormData((prev) => ({
			...prev,
			birthday: date,
			age: calculatedAge,
		}));
	};
	useEffect(() => {
		if (student) {
			setFormData({
				...student,
				birthday: student.birthday ? new Date(student.birthday) : null,
			});
		}
	}, [student]);
	console.log(student);
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (student) {
				await updateStudent(student.student_id, formData); // 👈 use update
			} else {
				await addStudent(formData);
			}
			setFormData({
				first_name: "",
				middle_name: "",
				last_name: "",
				age: "",
				birthday: null,
				sex: "",
				gender: "",
				grade_level: "",
				barangay_id: "",
				school_id: "",
			});
			if (onSuccess) onSuccess(student ? "Student updated" : "Student added");
		} catch (err) {
			const errMsg = err || "Something went wrong.";
			setError(errMsg);
		}
	};
	return (
		<div>
			{error && (
				<Alert severity="error" onClose={() => setError("")}>
					{error}
				</Alert>
			)}
			<Typography variant="h5" gutterBottom>
				Add New Student
			</Typography>

			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box component="form" onSubmit={handleSubmit} noValidate>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<TextField
								label="First Name"
								name="first_name"
								value={formData.first_name}
								onChange={handleChange}
								required
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Middle Name"
								name="middle_name"
								value={formData.middle_name}
								onChange={handleChange}
								required
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Last Name"
								name="last_name"
								value={formData.last_name}
								onChange={handleChange}
								required
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<DatePicker
								label="Birthday"
								value={formData.birthday}
								onChange={handleBirthdayChange}
								disableFuture={true}
								enableAccessibleFieldDOMStructure={false}
								slotProps={{
									textField: {
										fullWidth: true,
									},
								}}
							/>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel>Sex</InputLabel>
								<Select
									label="Sex"
									name="sex"
									value={formData.sex}
									onChange={handleChange}
									required
								>
									<MenuItem value="Male">Male</MenuItem>
									<MenuItem value="Female">Female</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Gender"
								name="gender"
								type="text"
								value={formData.gender}
								onChange={handleChange}
								required
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Age"
								name="age"
								type="number"
								value={formData.age}
								disabled
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Grade / Year Level"
								name="grade_level"
								type="text"
								placeholder="Kinder - 1 / Grade - 1 "
								value={formData.grade_level}
								onChange={handleChange}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel>Barangay</InputLabel>
								<Select
									label="Barangay"
									name="barangay_id"
									value={formData.barangay_id}
									onChange={handleBarangayChange}
									required
								>
									{barangays.map((barangay) => (
										<MenuItem key={barangay.id} value={barangay.id}>
											{barangay.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth required>
								<InputLabel>Schools</InputLabel>
								<Select
									label="Schools"
									name="school_id"
									value={formData.school_id}
									onChange={handleChange}
								>
									{filteredSchools.length === 0 ? (
										<MenuItem disabled>
											Need to add school record before students
										</MenuItem>
									) : (
										filteredSchools.map((school) => (
											<MenuItem key={school.id} value={school.id}>
												{school.name}
											</MenuItem>
										))
									)}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="House No. / Street"
								name="address"
								value={formData.address}
								onChange={handleChange}
								required
							></TextField>
						</Grid>

						<Grid item xs={6}>
							<Button
								sx={{ height: "100%" }}
								fullWidth
								type="submit"
								variant={student ? "outlined" : "contained"}
								color="primary"
							>
								{student ? "Update Student" : "Add Student"}
							</Button>
						</Grid>
					</Grid>
				</Box>
			</LocalizationProvider>
		</div>
	);
};

export default AddStudentForm;
