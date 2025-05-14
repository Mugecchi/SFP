import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Collapse, List, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import GroupIcon from "@mui/icons-material/Group";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
	DescriptionOutlined,
	HistoryEduOutlined,
	School,
} from "@mui/icons-material";
import { logout } from "../utils/authUser";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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

const SidebarItemLink = ({ path, icon, text, active, onClick }) => (
	<SidebarItem disablePadding>
		<SidebarButton
			component={Link}
			to={path}
			onClick={onClick}
			sx={{
				border: "1px solid transparent",
				backgroundColor: active ? "#fbaaff" : "transparent",
				"&:hover": {
					backgroundColor: active ? "#fbaaff" : "transparent",
					border: "1px solid #fbaaff",
				},
				borderRadius: "5px",
				width: "100%",
				alignItems: "center",
				gap: "10px",
				color: "white",
			}}
		>
			{icon && <SidebarItemIcon>{icon}</SidebarItemIcon>}
			<SidebarItemText
				primary={text}
				sx={{ color: "white", fontWeight: active ? "bold" : "normal" }}
			/>
		</SidebarButton>
	</SidebarItem>
);

const SidebarDropdown = ({ item, open, onToggle, location }) => (
	<>
		<SidebarItem disablePadding sx={{ marginBottom: "10px" }}>
			<SidebarButton
				onClick={onToggle}
				sx={{
					border: "1px solid transparent",
					backgroundColor: "transparent",
					"&:hover": {
						backgroundColor: "#fbaaff10",
						border: "1px solid #fbaaff",
					},
					borderRadius: "5px",
					maxHeight: "50px",
					width: "100%",
					justifyContent: "space-between",
					color: "white",
				}}
			>
				<Box display="flex" alignItems="center" gap="10px">
					<SidebarItemIcon>{item.icon}</SidebarItemIcon>
					<SidebarItemText primary={item.text} sx={{ color: "white" }} />
				</Box>
				{open ? <ExpandLess /> : <ExpandMore />}
			</SidebarButton>
		</SidebarItem>

		<Collapse in={open}>
			<List
				component="div"
				disablePadding
				sx={{
					float: "right",
					width: "100%",
					"& .MuiTypography-root": { ml: 4, maxHeight: "50px" },
				}}
			>
				{item.children.map((child) => (
					<SidebarItemLink
						sx={{}}
						key={child.text}
						path={child.path}
						text={child.text}
						icon={child.icon}
						active={location.pathname === child.path}
					/>
				))}
			</List>
		</Collapse>
	</>
);

export default function Sidebar() {
	const [open, setOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState({});

	const location = useLocation();
	const toggleDropdown = (key) => {
		setDropdownOpen((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Handle logout
	const handleLogout = async () => {
		setOpen(false);
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	const menuItems = [
		{ text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
		{
			text: "Daily Attendance",
			path: "/dailyattendance",
			icon: <HistoryEduOutlined />,
		},
		{
			text: "Schools",
			path: "/schools",
			icon: <School />,
		},
		{
			text: "Students Profile",
			isDropdown: true,
			icon: <DescriptionOutlined />,
			children: [
				{
					text: "Profiles",
					path: "/studentsbiorecords",
				},
				{
					text: "Health Data",
					path: "/studentshealthdata",
				},
			],
		},

		{ text: "User Management", path: "/users", icon: <GroupIcon /> },
	];

	return (
		<Box
			sx={{
				display: { xs: "none", sm: "block" },
				width: "250px",
				overflow: "auto",
			}}
		>
			<SidebarContainer anchor="left" variant="permanent">
				<Box>
					<Tooltip arrow title="School Feeding Program" placement="right">
						<SidebarTitle>S.F.P</SidebarTitle>
					</Tooltip>
					<SidebarList>
						{menuItems.map((item) => {
							if (item.isDropdown) {
								return (
									<SidebarDropdown
										key={item.text}
										item={item}
										open={!!dropdownOpen[item.text]}
										onToggle={() => toggleDropdown(item.text)}
										location={location}
									/>
								);
							} else {
								return (
									<SidebarItemLink
										key={item.text}
										path={item.path}
										icon={item.icon}
										text={item.text}
										active={location.pathname === item.path}
										onClick={() => setOpen(false)}
									/>
								);
							}
						})}
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
		</Box>
	);
}
