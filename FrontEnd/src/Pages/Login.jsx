import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	TextField,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Paper,
} from "@mui/material";
import { login } from "../utils/authUser";
import WaveBackground from "../Includes/WaveBackground";
import { motion } from "framer-motion";
const Login = ({ setIsLoggedIn }) => {
	const navigate = useNavigate();

	// State for login form
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");

	// State for forgot password dialog
	const [forgotOpen, setForgotOpen] = useState(false);
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotMessage, setForgotMessage] = useState("");
	const [forgotError, setForgotError] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoginError("");

		try {
			await login({ username, password });
			sessionStorage.setItem("isLoggedIn", "true");
			setIsLoggedIn(true);
			navigate("/dashboard");
			setTimeout(() => window.location.reload(), 100);
		} catch (err) {
			setLoginError(err || "Login failed");
		}
	};

	const handleForgotPassword = async () => {
		setForgotError("");
		setForgotMessage("");

		try {
			const response = await fetch("/api/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: forgotEmail }),
			});

			const data = await response.json();
			if (response.ok) {
				setForgotMessage(data.message || "Reset link sent.");
			} else {
				setForgotError(data.error || "Something went wrong.");
			}
		} catch {
			setForgotError("Network error. Try again later.");
		}
	};

	return (
		<Box
			sx={{
				height: "100vh",
				position: "relative",
				overflow: "hidden", // Required
				display: "flex",
				background: `  radial-gradient(circle at 30% 30%, #5D378C 0%, transparent 100%),radial-gradient(circle at 70% 70%, #FF7704 0%, transparent 40%) 
				`,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<WaveBackground />
			<motion.div
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					scale: { type: "spring", visualDuration: 0.5, bounce: 0.75 },
					duration: 0.5,
				}}
				style={{ position: "absolute", left: "5%", width: "40%" }}
			>
				<Box
					sx={{
						display: { xs: "none", md: "block" },

						color: "white",
					}}
				>
					<Typography variant="h2" color="#FF7704" fontWeight={600}>
						Welcome
					</Typography>
					<Typography variant="h4" fontWeight={600}>
						School Feeding Program Management System
					</Typography>
					<Typography variant="h6">
						Streamlining Data. Supporting Students. Strengthening Communities.
					</Typography>
				</Box>
			</motion.div>

			{/* Login Form */}
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					duration: 0.5,
					delay: 0.5,
					scale: { type: "spring", visualDuration: 0.5, bounce: 0.75 },
				}}
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					width: "30%",
					position: "absolute",
					minWidth: "400px",
					right: "10%",
				}}
			>
				<Paper
					sx={{
						background: "rgba(251, 234, 255, 0.6)", // semi-transparent background
						backdropFilter: "blur(8px)", // blurs the background behind the paper
						p: 4,
						borderRadius: "10px",
						width: "100%",
						minWidth: "300px",
						boxShadow: 3,
						position: { xs: "relative", md: "absolute" },
						right: { md: "10%" },
					}}
					elevation={5}
				>
					<Typography
						variant="h5"
						fontWeight="bold"
						color="#FF7706"
						gutterBottom
					>
						Login
					</Typography>
					<Typography color="textSecondary" mb={2}>
						Please enter your login credentials
					</Typography>

					{loginError && (
						<Typography color="error" mb={2}>
							{loginError}
						</Typography>
					)}

					<form onSubmit={handleLogin}>
						<TextField
							fullWidth
							type="text"
							label="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							variant="outlined"
							margin="normal"
						/>
						<TextField
							fullWidth
							type="password"
							label="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							variant="outlined"
							margin="normal"
						/>
						<Button
							type="submit"
							variant="contained"
							fullWidth
							sx={{
								mt: 2,
								bgcolor: "#5D378C",
								color: "#fff",
								":hover": { bgcolor: "#4B2A6F" },
							}}
						>
							Login
						</Button>
					</form>

					{/* <Typography
						variant="body2"
						sx={{
							mt: 2,
							textAlign: "center",
							cursor: "pointer",
							color: "#5D378C",
						}}
						onClick={() => setForgotOpen(true)}
					>
						Forgot your password?
					</Typography> */}
				</Paper>
			</motion.div>
			{/* Forgot Password Dialog */}
			<Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
				<DialogTitle>Forgot Password</DialogTitle>
				<DialogContent>
					<Typography mb={2}>
						Enter your registered email address to receive a password reset
						link.
					</Typography>

					{forgotError && (
						<Typography color="error" mb={2}>
							{forgotError}
						</Typography>
					)}
					{forgotMessage && (
						<Typography color="primary" mb={2}>
							{forgotMessage}
						</Typography>
					)}

					<TextField
						autoFocus
						margin="dense"
						label="Email Address"
						type="email"
						fullWidth
						variant="outlined"
						value={forgotEmail}
						onChange={(e) => setForgotEmail(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setForgotOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						sx={{ bgcolor: "#5D378C", ":hover": { bgcolor: "#4B2A6F" } }}
						onClick={handleForgotPassword}
					>
						Send Reset Link
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Login;
