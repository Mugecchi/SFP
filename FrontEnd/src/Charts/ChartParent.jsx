import { Box, Paper, Typography } from "@mui/material";

const ChartParent = ({
	children,
	title,
	barColor = "var(--orange)",
	slotProps,
}) => {
	return (
		<Paper
			elavtion={5}
			sx={{
				p: "10px 8px",
				minHeight: "350px",
				borderRadius: "14px",
				position: "relative",
				overflow: "hidden",
				...(slotProps || []),
			}}
		>
			<Box
				sx={{
					width: "100%",
					alignContent: "center",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						backgroundColor: barColor,
						borderRadius: "13px 13px 5px 5px ",
						p: "10px",
					}}
				>
					<Typography sx={{ fontSize: "15px", color: "white" }}>
						{title || "Chart Title"}
					</Typography>
				</Box>
				{children}
			</Box>
		</Paper>
	);
};

export default ChartParent;
