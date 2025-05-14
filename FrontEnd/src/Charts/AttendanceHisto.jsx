import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { fetchAttendanceCount } from "../utils/apiStudents";
import { Box, Skeleton, Typography } from "@mui/material";
import ChartParent from "./ChartParent";

export default function AttendanceHisto() {
	const [record, setRecord] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await fetchAttendanceCount();
				if (!data || data.length === 0) throw new Error("No data");
				setRecord(data);
			} catch (error) {
				console.error("Error fetching attendance history:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<Box sx={{ height: 300, width: "100%", p: 2 }}>
				<Skeleton
					variant="rectangular"
					height="100%"
					width="100%"
					sx={{ borderRadius: "14px" }}
					animation="wave"
				/>
			</Box>
		);
	}

	if (record.length === 0) {
		return (
			<ChartParent title="Attendance History">
				<Box sx={{ p: 2, textAlign: "center" }}>
					<Typography>No attendance data available.</Typography>
				</Box>
			</ChartParent>
		);
	}

	// Add a dummy point to make the line visible if only one record exists
	const paddedRecord =
		record.length === 1
			? [
					{
						date: "2025-05-10",
						attendance_count: 0,
					},
					...record,
			  ]
			: record;

	const xAxis = paddedRecord.map((item) => item.date);
	const yAxis = paddedRecord.map((item) => item.attendance_count);
	console.log(paddedRecord);
	return (
		<ChartParent title="Attendance History">
			<LineChart
				xAxis={[
					{ type: "line", data: xAxis, scaleType: "point", label: "Date" },
				]}
				series={[
					{
						data: yAxis,
						label: "Attendance Count",
						color: "var(--orange)",
					},
				]}
				width={1080}
				height={400}
			/>
		</ChartParent>
	);
}
