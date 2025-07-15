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
import AddStudentForm from "../Components/AddStudentForm";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import ChartParent from "../Charts/ChartParent";
const StudentIDCard = React.forwardRef(({ student, photo }, ref) => (
	<Box
		ref={ref}
		sx={{
			border: "1px solid #000",
			padding: 2,
			fontFamily: "Arial",
			borderRadius: "20px",
			display: "flex",
			maxHeight: "710px",
			maxWidth: "650px",
			margin: "auto", // center horizontally
		}}
	>
		<Grid container>
			<Grid
				item
				xs={12}
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
						<Box
							alt="Student-No Photo"
							sx={{
								width: 150,
								height: 150,
								objectFit: "cover",
								justifyContent: "center",
								display: "flex",
								alignItems: "center",
								border: "1px solid #333",
							}}
						>
							No Photo
						</Box>
					</Typography>
				)}
			</Grid>
			<Grid item xs={12}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 1,
						justifyContent: "center",
					}}
				>
					<Typography variant="h6">{student.school_name}</Typography>
				</Box>
				<Typography>Student ID: {student.student_id}</Typography>
				<Typography>
					Name:{" "}
					{`${student.first_name} ${student.middle_name} ${student.last_name}`}
				</Typography>
				<Typography>Sex: {student.sex}</Typography>
				<Typography>Age: {student.age}</Typography>
				<Typography>
					Grade: {student.grade_level ? `Grade ${student.grade_level}` : "N/A"}
				</Typography>
				<Typography>
					Address: {student.address} {student.barangay_name}
				</Typography>
			</Grid>
		</Grid>
		<style jsx="true" global>{`
			@media print {
				body {
					display: flex;
					justify-content: center;
					align-items: flex-start;
					padding: 20px;
					height: 100vh;
					margin: 0;
				}

				#root {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100vh;
				}

				.MuiDialog-root,
				.MuiDialog-container {
					display: none !important;
				}
			}
		`}</style>
	</Box>
));
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
	const [openPreview, setOpenPreview] = useState(false);
	const [printStudent, setPrintStudent] = useState(null);

	const componentRef = React.useRef(null);

	const handleAfterPrint = React.useCallback(() => {
		setSelectedStudent(null);
		setStudentPhoto(null);
		setOpenPreview(false);
	}, []);

	const handleBeforePrint = React.useCallback(() => {
		return Promise.resolve(); // Can do async setup here if needed
	}, []);

	const printFn = useReactToPrint({
		contentRef: componentRef,
		documentTitle: "Student_ID",
		onAfterPrint: handleAfterPrint,
		onBeforePrint: handleBeforePrint,
	});

	const handleOpenPrintPreview = (student) => {
		setPrintStudent(student);
		setOpenPreview(true);
	};

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
			accessor: (r) => r?.grade_level,
		},

		{
			label: <>Address</>,
			accessor: (r) => (
				<>
					{r?.address === "N/A" ? "" : r?.address} {r?.barangay_name}
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
			<ChartParent
				title={"Student Profile"}
				slotProps={{
					minHeight: "calc(90vh - 30px)", // Ensures it stretches properly
				}}
			>
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
			</ChartParent>
			<Dialog
				open={openPreview}
				onClose={() => {
					setOpenPreview(false);
				}}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Preview Student ID</DialogTitle>
				<DialogContent>
					{printStudent && (
						<StudentIDCard
							ref={componentRef}
							student={printStudent}
							photo={studentPhoto}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<label htmlFor="upload-photo">
						<input
							accept="image/*"
							id="upload-photo"
							type="file"
							hidden
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
						<Button variant="outlined" component="span">
							Upload Photo
						</Button>
					</label>

					<Button
						onClick={() => {
							setOpenPreview(false);
							setSelectedStudent(null);
							setStudentPhoto(null);
						}}
					>
						Cancel
					</Button>

					<Button onClick={printFn}>Print</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default StudentsTable;
