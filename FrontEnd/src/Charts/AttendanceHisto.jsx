import React, { useEffect, useState } from "react";
import { fetchAttendanceCount } from "../utils/apiStudents";
import { Box, Skeleton, Typography } from "@mui/material";
import ChartParent from "./ChartParent";
import {
	ChartsTooltip,
	ChartsXAxis,
	ChartsYAxis,
	LineHighlightPlot,
	LinePlot,
	MarkPlot,
	ResponsiveChartContainer,
} from "@mui/x-charts";

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

	return (
		<ChartParent title="Attendance History">
			<ResponsiveChartContainer
				xAxis={[
					{
						id: "date",
						data: xAxis,
						scaleType: "point",
						label: "Date",
					},
				]}
				series={[
					{
						type: "line",
						data: yAxis,
						label: "Attendance Count",
						color: "var(--orange)",
					},
				]}
				height={400}
			>
				<ChartsXAxis />
				<ChartsYAxis />
				<LinePlot />
				<ChartsTooltip />
				<MarkPlot />
				<LineHighlightPlot />
			</ResponsiveChartContainer>
		</ChartParent>
	);
}
