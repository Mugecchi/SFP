import React, { useState } from "react";
import { WhiteBox } from "../Includes/styledComponents";
import AutoTable from "../Components/AutoTable";
import { addAttendance, fetchAttendance } from "../utils/apiStudents";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";

function DailyRecord() {
	const [openDialog, setOpenDialog] = useState(false);
	const [nameInput, setNameInput] = useState("");
	const [currentRecord, setCurrentRecord] = useState(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const handleDialogClose = () => {
		setOpenDialog(false);
		setNameInput(""); // Reset input on close
	};

	const handleNameChange = (e) => {
		setNameInput(e.target.value);
	};

	const handleAttendanceMarking = async () => {
		const inputId = nameInput.trim();

		try {
			await addAttendance(currentRecord.student_id, {
				student_id: currentRecord.student_id,
				attendance_status: 1,
			});
			alert("Attendance marked as Present");
			setRefreshTrigger((prev) => prev + 1);
			handleDialogClose();
		} catch (err) {
			alert("Error marking attendance");
		}
	};

	const columns = [
		{ label: "Student Name", accessor: (r) => r?.name },
		{ label: "School", accessor: (r) => r?.school_name },
		{
			label: "Actions",
			accessor: (r) => r, // Pass the whole record
			type: "actions",
			render: (record) => (
				<div>
					<Button
						variant="contained"
						size="small"
						disabled={record.attendance_status === 1}
						onClick={() => {
							setCurrentRecord(record); // Set the current record for the dialog
							setOpenDialog(true); // Open the dialog to confirm student name
						}}
					>
						Present
					</Button>
				</div>
			),
		},
	];

	return (
		<WhiteBox>
			<AutoTable
				fetchDataFn={fetchAttendance}
				tableColumns={columns}
				refreshTrigger={refreshTrigger}
			/>

			<Dialog open={openDialog} onClose={handleDialogClose}>
				<DialogTitle>Confirm Attendance</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Enter Student ID"
						fullWidth
						value={nameInput}
						onChange={handleNameChange}
						variant="outlined"
						required
					/>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleDialogClose} color="primary">
						Cancel
					</Button>
					<Button onClick={handleAttendanceMarking} color="primary">
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</WhiteBox>
	);
}

export default DailyRecord;
