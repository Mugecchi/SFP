import React, { useEffect, useState } from "react";
import ChartParent from "./ChartParent";
import {
	ChartContainer,
	ChartsLegend,
	ChartsTooltip,
	PiePlot,
} from "@mui/x-charts";
import { fetchBmiCounts } from "../utils/apiStudents";
import { Box, Skeleton, Typography } from "@mui/material";

const bmiColors = {
	Underweight: "#7B68EE", // Medium Slate Blue
	"Normal weight": "#6A5ACD", // Slate Blue
	Overweight: "#483D8B", // Dark Slate Blue
	Obese: "#4B0082", // Indigo
};
const BmiChart = () => {
	const [record, setRecord] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetchBmiCounts();
				setRecord(response);
			} catch (error) {
				console.error("Error fetching BMI data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const chartData = record.map((item) => ({
		value: item.count,
		color: bmiColors[item.category],
		label: item.category,
	}));
	if (loading) {
		return (
			<Box sx={{ height: 300, width: "100%", p: 2 }}>
				<Skeleton
					variant="rectangular"
					height="100%"
					width="100%"
					sx={{ borderRadius: "14px" }}
				/>
			</Box>
		);
	}

	if (record.length === 0) {
		return (
			<ChartParent title="Attendance History">
				<Box sx={{ p: 2, textAlign: "center", height: "300px" }}>
					<Typography>No BMI data available.</Typography>
				</Box>
			</ChartParent>
		);
	}

	return (
		<ChartParent title="BMI" barColor="var(--eminence)">
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					width: "100%",
					justifyContent: "center",
				}}
			>
				<ChartContainer
					series={[
						{
							type: "pie",
							data: chartData,
							innerRadius: 40,
							outerRadius: 140,
							paddingAngle: 5,
							cornerRadius: 20,
							startAngle: -45,
							cx: 200,
							label: "BMI Categories",
							highlightScope: { fade: "global", highlight: "item" },
							highlighted: { additionalRadius: 10 },
							faded: { innerRadius: 40, additionalRadius: -30, color: "gray" },
						},
					]}
					height={300}
					width={575}
				>
					<ChartsLegend
						slotProps={{
							legend: {
								direction: "column",
								position: { vertical: "middle", horizontal: "right" },
							},
						}}
					/>
					<ChartsTooltip trigger="item" />
					<PiePlot />
				</ChartContainer>
				<Box sx={{ ml: 4 }}></Box>
			</Box>
		</ChartParent>
	);
};

export default BmiChart;
