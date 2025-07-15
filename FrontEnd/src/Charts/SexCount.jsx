import React, { useEffect, useState } from "react";
import ChartParent from "./ChartParent";
import {
	ChartContainer,
	ChartsLegend,
	ChartsTooltip,
	PiePlot,
} from "@mui/x-charts";
import { fetchSexCounts } from "../utils/apiStudents";
import { Box, Skeleton } from "@mui/material";

const SexCount = () => {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetchSexCounts(); // response = [{ female: 1, male: 1 }]
				const sexData = response[0] || {};

				// Transform object into chart data format
				const transformed = Object.entries(sexData).map(([key, value]) => ({
					label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
					value,
				}));

				setChartData(transformed);
			} catch (error) {
				console.error("Error fetching sex count data:", error);
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
				/>
			</Box>
		);
	}

	return (
		<ChartParent title="Sex" barColor="var(--green)">
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					width: "100%",
					justifyContent: "center",
				}}
			>
				{/* Chart Area */}
				<ChartContainer
					series={[
						{
							type: "pie",
							data: chartData,
							innerRadius: 40,
							outerRadius: 130,
							paddingAngle: 5,
							cornerRadius: 20,
							startAngle: -45,
							cx: 200,
							label: "Sex",
							highlightScope: { fade: "global", highlight: "item" },
							highlighted: { additionalRadius: 10 },
							faded: { innerRadius: 40, additionalRadius: -30, color: "gray" },
						},
					]}
					height={300}
					width={500} // Adjust to keep pie on left side
				>
					<ChartsTooltip trigger="item" />
					<PiePlot />
					<ChartsLegend
						slotProps={{
							legend: {
								direction: "column",
								position: {
									vertical: "middle",
									horizontal: "right",
								},
							},
						}}
					/>
				</ChartContainer>

				{/* Legend manually rendered */}
			</Box>
		</ChartParent>
	);
};

export default SexCount;
