import React from "react";
import AttendanceHisto from "../Charts/AttendanceHisto";
import { Grid } from "@mui/material";
import BmiChart from "../Charts/BmiChart";
import SexCount from "../Charts/SexCount";

function Dashboard() {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<AttendanceHisto />
			</Grid>
			<Grid item xs={6}>
				<BmiChart />
			</Grid>
			<Grid item xs={6}>
				<SexCount />
			</Grid>
		</Grid>
	);
}

export default Dashboard;
