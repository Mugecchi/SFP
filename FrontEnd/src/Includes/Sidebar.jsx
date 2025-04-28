import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Drawer } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import GroupIcon from "@mui/icons-material/Group";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
	SidebarButton,
	SidebarContainer,
	SidebarList,
	SidebarTitle,
	SidebarItemIcon,
	SidebarItemText,
	LogoutButton,
	SidebarItem,
} from "./styledComponents";
import { DescriptionOutlined } from "@mui/icons-material";
import { logout } from "../utils/authUser";
import { useAuth } from "../utils/useAuth";
export default function Sidebar() {
	const [open, setOpen] = useState(false);
	const { user } = useAuth();

	const location = useLocation();

	// ✅ Handle logout
	const handleLogout = async () => {
		setOpen(false);
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	// ✅ Sidebar menu items (conditionally show User Management)
	const menuItems = [
		{ text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
		{ text: "Records", path: "/tables", icon: <TableChartIcon /> },

		{
			text: "Logs",
			path: "/logs",
			icon: <DescriptionOutlined />,
		},
		{ text: "User Management", path: "/users", icon: <GroupIcon /> },
	];

	// ✅ Sidebar Drawer Content
	const DrawerList = (
		<SidebarContainer anchor="left" variant="permanent">
			<Box>
				<SidebarTitle>CAUAYAN CARES</SidebarTitle>
				<SidebarList>
					{menuItems.map((item) => (
						<SidebarItem
							disablePadding
							sx={{ marginBottom: "10px" }}
							key={item.text}
						>
							<SidebarButton
								component={Link}
								to={item.path}
								onClick={() => setOpen(false)}
								sx={{
									border: "1px solid transparent",

									backgroundColor:
										location.pathname === item.path ? "#fbaaff" : "transparent",
									"&:hover": {
										backgroundColor:
											location.pathname === item.path
												? "#fbaaff"
												: "transparent",
										border: "1px solid #fbaaff",
									},
									borderRadius: "5px",
									width: "100%",
									display: "flex",
									alignItems: "center",
									gap: "10px",
									color: "white",
								}}
							>
								<SidebarItemIcon>{item.icon}</SidebarItemIcon>
								<SidebarItemText
									primary={item.text}
									sx={{
										color: "white",
										fontWeight:
											location.pathname === item.path ? "bold" : "normal",
									}}
								/>
							</SidebarButton>
						</SidebarItem>
					))}
				</SidebarList>
			</Box>

			{/* Logout Button */}
			<LogoutButton
				onClick={handleLogout}
				sx={{
					backgroundColor: "transparent",
					color: "white",
					margin: "10px",
					"&:hover": { backgroundColor: "#e06505" },
				}}
				startIcon={<ExitToAppIcon />}
			>
				Logout
			</LogoutButton>
		</SidebarContainer>
	);

	return (
		<>
			{/* ✅ Mobile Sidebar Toggle Button (Fixed Position) */}

			{/* ✅ Desktop Sidebar (Always Visible) */}
			<Box sx={{ display: { xs: "none", sm: "block" }, width: "250px" }}>
				{DrawerList}
			</Box>

			{/* ✅ Mobile Sidebar Drawer (Slides from Left) */}
			<Drawer
				anchor="left" // ✅ Slide in from the left
				open={open}
				onClose={() => setOpen(false)}
				sx={{
					"& .MuiDrawer-paper": {
						backgroundColor: "#2C2C2C", // ✅ Adjust sidebar color
						color: "white",
					},
				}}
			>
				{DrawerList}
			</Drawer>
		</>
	);
}
