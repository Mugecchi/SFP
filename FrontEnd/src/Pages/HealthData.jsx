import React, { useState } from "react";
import { WhiteBox } from "../Includes/styledComponents";
import AutoTable from "../Components/AutoTable";
import { fetchHealthData } from "../utils/healthApi";
import FormModal from "../Components/FormModal";
import { Alert, Button, Chip, Snackbar, Typography } from "@mui/material";
import AddHealthRecord from "../Components/AddHealthRecord";
export default function HealthData() {
	const [open, setOpen] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const renderBmiStatusChip = (bmi) => {
		if (bmi == null) {
			return <Chip label="N/A" color="default" size="small" />;
		}

		if (bmi < 18.5) {
			return <Chip label="Malnourished" color="info" size="small" />;
		} else if (bmi < 25) {
			return <Chip label="Normal" color="success" size="small" />;
		} else if (bmi < 30) {
			return <Chip label="Overweight" color="warning" size="small" />;
		} else {
			return <Chip label="Obese" color="error" size="small" />;
		}
	};

	const columns = [
		{ label: "Student Name", accessor: (r) => r?.name },
		{
			label: (
				<div>
					Height
					<Typography component="span" color="text.secondary">
						(cm)
					</Typography>
				</div>
			),
			accessor: (r) => r?.height,
		},

		{
			label: (
				<div>
					Weight
					<Typography component="span" color="text.secondary">
						(kg)
					</Typography>
				</div>
			),
			accessor: (r) => r?.weight,
		},
		{ label: "BMI", accessor: (r) => <>{r?.bmi}</> },
		{
			label: "BMI Status",
			accessor: (r) => renderBmiStatusChip(r?.bmi),
		},
		{ label: "Allergies", accessor: (r) => r?.allergies },
		{
			label: "Actions",
			accessor: (r) => r, // Pass the whole record
			type: "actions",
			render: (record) => (
				<Button
					variant="outlined"
					size="small"
					onClick={() => handleEditStudent(record)}
				>
					Add Record
				</Button>
			),
		},
	];
	console.log(selectedStudent);

	const handleEditStudent = (student) => {
		setSelectedStudent(student); // You can show a modal or reuse the AddStudentForm
		setOpen(true);
	};

	const handleSuccess = (message) => {
		setAlert({ open: true, message, severity: "success" });
		setOpen(false);
		setRefreshTrigger((prev) => prev + 1);
	};

	return (
		<WhiteBox>
			<AutoTable
				fetchDataFn={fetchHealthData}
				tableColumns={columns}
				refreshTrigger={refreshTrigger}
				searchPlaceholder="Search Health Data"
				title="Health Data List"
				onSuccess={handleSuccess}
			>
				<FormModal
					title="Add Health Record"
					open={open}
					onClose={() => {
						setOpen(false);
						setSelectedStudent(null);
					}}
					form={
						<AddHealthRecord
							onSuccess={handleSuccess}
							student={selectedStudent}
						/>
					}
				/>
			</AutoTable>
			<Snackbar
				open={alert.open}
				autoHideDuration={4000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert
					onClose={() => setAlert({ ...alert, open: false })}
					severity={alert.severity}
					sx={{ width: "100%" }}
				>
					{alert.message}
				</Alert>
			</Snackbar>
		</WhiteBox>
	);
}
