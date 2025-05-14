import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useLocation } from "react-router-dom";
import { getAvatarUrl } from "../utils/authUser";
import { useAuth } from "../utils/useAuth";

const Header = React.memo(() => {
	const { user } = useAuth(); // ✅ Proper usage
	const location = useLocation();

	const pageTitles = {
		"/dashboard": "Dashboard",
		"/dailyattendance": "Attendance",
		"/schools": "Schools",
		"/login": "Login",
		"/studentsbiorecords": "Students Profile",
		"/studentshealthdata": "Health Records",
		"/users": "User Management",
	};
	return (
		<Box
			sx={{
				justifyContent: "space-between",
				alignItems: "center",
				maxWidth: "100vw",
				padding: "20px 25px 0 25px",
				position: "sticky",
				zIndex: 1000,
				display: { xs: "none", md: "none", lg: "flex" },
			}}
		>
			<Typography
				sx={{
					fontSize: "30px",
					fontWeight: "bold",
					color: "#ff7704",
					textTransform: "uppercase",
				}}
			>
				{pageTitles[location.pathname] || "Page"}
			</Typography>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<Typography
					sx={{ marginRight: "15px", fontWeight: "bold", fontSize: "16px" }}
				>
					{user?.username || "Guest"}
				</Typography>
				<Avatar
					src={
						user?.user_image
							? getAvatarUrl(user.user_image)
							: "/default-avatar.png"
					}
					alt={user?.username || "Guest"}
					sx={{ width: 50, height: 50 }}
				/>
			</Box>
		</Box>
	);
});

export default Header;
