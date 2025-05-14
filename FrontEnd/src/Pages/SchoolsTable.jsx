import React, { useState } from "react";
import { WhiteBox } from "../Includes/styledComponents";
import AutoTable from "../Components/AutoTable";
import { getSchools } from "../utils/apiSchools";
import { Button, Typography, Snackbar, Alert, IconButton } from "@mui/material";
import FormModal from "../Components/FormModal";
import AddSchoolForm from "../Components/AddSchoolForm";

function SchoolsTable() {
	const [open, setOpen] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [selectedSchool, setSelectedSchool] = useState(null); // For editing a school
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "",
	});

	const columns = [
		{ label: "School Name", accessor: (r) => r?.name },
		{
			label: (
				<>
					School Address{" "}
					<Typography component="span" color="text.secondary">
						(Lot no. / Street)
					</Typography>
				</>
			),
			accessor: (r) => r?.address,
		},
		{
			label: (
				<>
					<Typography component="span" color="text.secondary">
						(Barangay)
					</Typography>
				</>
			),
			accessor: (r) => r?.barangay_name,
		},
		{
			label: "Actions",
			accessor: (r) => r, // Pass the whole record
			type: "actions",
			render: (record) => (
				<IconButton
					variant="outlined"
					size="small"
					onClick={() => handleEditSchool(record)}
				>
					<img src="/edit.svg" alt="Edit" width={20} height={20} />
				</IconButton>
			),
		},
	];
	const handleSuccess = (message) => {
		setAlert({ open: true, message, severity: "success" });
		setOpen(false);
		setRefreshTrigger((prev) => prev + 1);
	};
	const handleEditSchool = (school) => {
		setOpen(true);
		setSelectedSchool(school); // You can show a modal or reuse the AddStudentForm
	};

	return (
		<WhiteBox>
			<AutoTable
				print
				fetchDataFn={getSchools}
				tableColumns={columns}
				title="List of Schools"
				onSuccess={handleSuccess}
				searchPlaceholder="Search School"
				refreshTrigger={refreshTrigger}
			>
				<Button variant="contained" onClick={() => setOpen(true)}>
					Add School
				</Button>
				<FormModal
					open={open}
					onClose={() => {
						setOpen(false);
						setSelectedSchool(null);
					}}
					form={
						<AddSchoolForm onSuccess={handleSuccess} school={selectedSchool} />
					}
				/>
			</AutoTable>

			{/* ✅ Alert Snackbar for success messages */}
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

export default SchoolsTable;
