import React, { useState, useRef } from "react";
import AutoTable from "../Components/AutoTable";
import { useReactToPrint } from "react-to-print";
import { getStudents } from "../utils/apiStudents";
import FormModal from "../Components/FormModal";
import {
	Button,
	Snackbar,
	Alert,
	IconButton,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Grid,
} from "@mui/material";
import { WhiteBox } from "../Includes/styledComponents";
import AddStudentForm from "../Components/AddStudentForm";
import PrintIcon from "@mui/icons-material/PrintOutlined";
const StudentsTable = () => {
	const [open, setOpen] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [studentPhoto, setStudentPhoto] = useState(null);

	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const [printStudent, setPrintStudent] = useState(null);
	const [openPreview, setOpenPreview] = useState(false);
	const printRef = useRef();
	const handlePrint = useReactToPrint({
		content: () => printRef.current,
	});

	const handleOpenPrintPreview = (student) => {
		setPrintStudent(student);
		setOpenPreview(true);
	};

	const handleConfirmPrint = () => {
		handlePrint();
		setOpenPreview(false);
	};

	const StudentIDCard = React.forwardRef(({ student, photo }, ref) => (
		<Box
			ref={ref}
			sx={{
				border: "1px solid #000",
				padding: 2,
				fontFamily: "Arial",
				display: "flex",
				maxHeight: "210px",
				maxWidth: "550px",
			}}
		>
			<Grid container>
				<Grid item xs={8}>
					<Typography variant="h6">{student.school_name}</Typography>
					<Typography>Student ID: {student.student_id}</Typography>
					<Typography>
						Name:{" "}
						{`${student.first_name} ${student.middle_name} ${student.last_name}`}
					</Typography>
					<Typography>Sex: {student.sex}</Typography>
					<Typography>Age: {student.age}</Typography>
					<Typography>
						Grade:{" "}
						{student.grade_level ? `Grade ${student.grade_level}` : "N/A"}
					</Typography>
					<Typography>
						Address: {student.address} {student.barangay_name}
					</Typography>
				</Grid>
				<Grid
					item
					xs={4}
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{photo ? (
						<Box
							component="img"
							src={photo}
							alt="Student"
							sx={{
								width: 150,
								height: 150,
								objectFit: "cover",
								border: "1px solid #333",
							}}
						/>
					) : (
						<Typography variant="body2" color="textSecondary">
							No Photo
						</Typography>
					)}
				</Grid>
			</Grid>
		</Box>
	));

	const columns = [
		{ label: "Student I.D.", accessor: (r) => r?.student_id },
		{
			label: "Full Name",
			accessor: (r) => `${r?.first_name}  ${r?.middle_name} ${r?.last_name}`,
		},
		{ label: "Sex", accessor: (r) => r?.sex },
		{ label: "Age", accessor: (r) => r?.age },

		{
			label: "Year Level",
			accessor: (r) => (r.grade_level ? `Grade ${r.grade_level}` : "N/A"),
		},

		{
			label: <>Address</>,
			accessor: (r) => (
				<>
					{r?.address} {r?.barangay_name}
				</>
			),
		},
		{ label: "School", accessor: (r) => r?.school_name },
		{
			label: "Actions",
			accessor: (r) => r,
			type: "actions",
			render: (record) => (
				<>
					<IconButton size="small" onClick={() => handleEditStudent(record)}>
						<img src="/edit.svg" alt="Edit" width={20} height={20} />
					</IconButton>
					<IconButton
						size="small"
						onClick={() => handleOpenPrintPreview(record)}
					>
						<PrintIcon sx={{ fill: "var(--eminence)" }} />
					</IconButton>
				</>
			),
		},
	];
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
		<div>
			<WhiteBox>
				<AutoTable
					print
					fetchDataFn={getStudents}
					tableColumns={columns}
					title="Student List"
					searchPlaceholder="Search students"
					onSuccess={handleSuccess}
					refreshTrigger={refreshTrigger}
				>
					<Button variant="contained" onClick={() => setOpen(true)}>
						Add Student
					</Button>
					<FormModal
						open={open}
						onClose={() => {
							setOpen(false);
							setSelectedStudent(null);
						}}
						form={
							<AddStudentForm
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
			<Dialog
				open={openPreview}
				onClose={() => setOpenPreview(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Preview Student ID</DialogTitle>
				<DialogContent>
					{printStudent && (
						<StudentIDCard
							ref={printRef}
							student={printStudent}
							photo={studentPhoto}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" component="label">
						Upload Photo
						<input
							type="file"
							hidden
							accept="image/*"
							onChange={(e) => {
								const file = e.target.files[0];
								if (file) {
									const reader = new FileReader();
									reader.onload = (event) =>
										setStudentPhoto(event.target.result);
									reader.readAsDataURL(file);
								}
							}}
						/>
					</Button>

					<Button onClick={() => setOpenPreview(false)}>Cancel</Button>
					<Button onClick={handleConfirmPrint} variant="contained">
						Print
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default StudentsTable;
